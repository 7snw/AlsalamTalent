const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');
const Client = require('../models/Client');
const FreelancerModel = require('../models/Freelancer');
const { lookupHash } = require('../utils/cryptoVault'); // 🔐 deterministic hash for lookups
const sendEmail = require('../utils/sendEmail');
const { verificationCode } = require('../utils/emailTemplates');
const EmailVerification = require('../models/EmailVerification');


// -------- helpers ----------
const normalizeEmail = (v = '') => String(v).trim().toLowerCase();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const emailCIQuery = (email) => ({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });

// ---- Old in-memory store (kept only for /send-verification-code route) ----
let emailVerifications = {};

// Send verification code (generic, not login)
router.post('/send-verification-code', async (req, res) => {
  const { email, name } = req.body;
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return res.status(400).json({ message: 'Email is required.' });

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  emailVerifications[cleanEmail] = { code, expiresAt };

  try {
    const html = verificationCode({ name: name || 'there', code });
    await sendEmail({
      to: cleanEmail,
      subject: 'Your verification code',
      html,
      text: `Your ctrlZ verification code is: ${code}. It expires in 10 minutes.`,
    });
    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

// GET /test-mail
router.get('/test-mail', async (_req, res) => {
  try {
    const html = verificationCode({ name: 'Test User', code: '123456' });
    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: 'Test: ctrlZ template',
      html,
      text: 'Test template email',
    });
    res.send('Test email sent!');
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).send('Email failed to send.');
  }
});

// Verify submitted code (generic verification)
router.post('/verify-code', (req, res) => {
  const cleanEmail = normalizeEmail(req.body.email || '');
  const code = String(req.body.code || '').trim();
  const record = emailVerifications[cleanEmail];

  if (!record) return res.status(400).json({ message: 'No verification code found.' });
  if (Date.now() > record.expiresAt) {
    delete emailVerifications[cleanEmail];
    return res.status(400).json({ message: 'Verification code expired.' });
  }
  if (record.code !== code) return res.status(400).json({ message: 'Incorrect verification code.' });

  delete emailVerifications[cleanEmail];
  return res.json({ verified: true });
});


// ----------------------------- LOGIN -----------------------------
router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = null;
    let role = null;

    // Admin
    user = await Admin.findOne(emailCIQuery(email));
    if (user) role = 'admin';

    // Client
    if (!user) {
      user = await Client.findOne({ emailHash: lookupHash(email) }).select('+password');
      if (user) role = 'client';
    }

    // Freelancer
    if (!user) {
      user = await FreelancerModel.findOne({ emailHash: lookupHash(email) }).select('+password');
      if (user) role = 'freelancer';
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(400).json({ message: 'Invalid password' });

    if (role === 'freelancer') {
      if (user.isActive === false) return res.status(403).json({ message: 'Account is deactivated' });
      if (user.userType === 'Graduate' && !user.isVerified)
        return res.status(403).json({ message: 'Account pending admin verification' });
    }

    // ---- MFA: Send OTP after successful password validation ----
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP in MongoDB
    await EmailVerification.findOneAndUpdate(
      { email },
      {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        userId: user._id,
        role
      },
      { upsert: true }
    );

    // Send OTP via email
    const html = verificationCode({ name: user.fullName || 'there', code: otp });
    await sendEmail({
      to: email,
      subject: 'Your ctrlZ login verification code',
      html,
      text: `Your ctrlZ login verification code is: ${otp}. It expires in 10 minutes.`,
    });

  


    return res.json({ step: 'otp_required', message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ----------------------------- VERIFY LOGIN OTP -----------------------------
router.post('/verify-login-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    const code = String(req.body.code || '').trim();

    // Fetch OTP record from MongoDB
    const record = await EmailVerification.findOne({ email });
    if (!record) return res.status(400).json({ message: 'No OTP found.' });

    if (Date.now() > record.expiresAt.getTime()) {
      await EmailVerification.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired.' });
    }

    if (record.code !== code)
      return res.status(400).json({ message: 'Incorrect OTP.' });

    // OTP verified — fetch user and delete OTP record
    const role = record.role;
    let user = null;

    if (role === 'admin') user = await Admin.findById(record.userId);
    if (role === 'client') user = await Client.findById(record.userId);
    if (role === 'freelancer') user = await FreelancerModel.findById(record.userId);

    await EmailVerification.deleteOne({ email });

    //  Activate and persist session after OTP success
    if (req.session) {
      req.session.userId = user._id;
      req.session.role = role;
      req.session.email = user.email;
      req.session.lastActivity = Date.now();

      // Ensure session is saved before responding
      await new Promise(resolve => req.session.save(resolve));
      console.log(` Session saved for user ${user._id} with ID ${req.sessionID}`);



    }

    // ✅ Respond with user info
    res.json({
      _id: user._id,
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role,
      verified: true,
      message: 'Login successful.',
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
});



// ----------------------------- LOGOUT -----------------------------
router.post('/logout', async (req, res) => {
  try {
    if (req.session?.userId) {
      await logAction(req.session.userId, "SESSION_LOGOUT", {
        sessionId: req.sessionID,
        role: req.session.role,
      });
    }
    req.session.destroy(err => {
      if (err) console.error("Session destroy error:", err);
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    }
  
  );
 

  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ----------------------------- ALL USERS -----------------------------
router.get('/all', async (_req, res) => {
  try {
    const admins = await Admin.find({}, '_id fullName email profileImageUrl').lean();
    const clientsDocs = await Client.find({}, '_id fullName email profileImageUrl');
    const clients = clientsDocs.map(d => d.toObject());
    const freelancersDocs = await FreelancerModel.find({}, '_id fullName email profileImageUrl');
    const freelancers = freelancersDocs.map(d => d.toObject());

    const allUsers = [
      ...admins.map(u => ({ ...u, role: 'admin' })),
      ...clients.map(u => ({ ...u, role: 'client' })),
      ...freelancers.map(u => ({ ...u, role: 'freelancer' })),
    ];

    res.json(allUsers);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Failed to fetch users.', error: err });
  }
});


// ----------------------------- GET SINGLE USER -----------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let user =
      (await Admin.findById(id, '_id fullName email role profileImageUrl').lean()) ||
      (await (async () => {
        const c = await Client.findById(id, '_id fullName email role profileImageUrl');
        return c ? c.toObject() : null;
      })()) ||
      (await (async () => {
        const f = await FreelancerModel.findById(id, '_id fullName email role profileImageUrl');
        return f ? f.toObject() : null;
      })());

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.role) user.role = 'freelancer';
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Failed to fetch user profile.', error: err });
  }
});

/* ---------------------- FORGOT PASSWORD (RESET FLOW) ---------------------- */



// Step 1: Send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const freelancer = await Freelancer.findOne({ emailHash: lookupHash(cleanEmail) });
    if (!freelancer) return res.status(404).json({ message: 'No account found with this email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    freelancer.resetOtp = otpHash;
    freelancer.resetOtpExpiry = expiresAt;
    await freelancer.save();

    const html = `
      <p>Use this code to reset your password:</p>
      <h2 style="letter-spacing:6px;">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
    `;
    await sendEmail({
      to: cleanEmail,
      subject: 'ctrlZ Password Reset Code',
      html,
      text: `Your ctrlZ password reset code is ${otp} (expires in 10 minutes).`,
    });

    return res.json({ message: 'Reset code sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset code.' });
  }
});



// Step 2: Verify OTP and change password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, oldPassword, newPassword } = req.body;
    if (!email || !code || !oldPassword || !newPassword)
      return res.status(400).json({ message: 'All fields are required.' });

    const cleanEmail = email.trim().toLowerCase();
    const freelancer = await Freelancer.findOne({ emailHash: lookupHash(cleanEmail) });
    if (!freelancer) return res.status(404).json({ message: 'Account not found.' });

    if (!freelancer.resetOtp || new Date() > new Date(freelancer.resetOtpExpiry))
      return res.status(400).json({ message: 'Reset code expired or invalid.' });

    const ok = await bcrypt.compare(code, freelancer.resetOtp);
    if (!ok) return res.status(400).json({ message: 'Invalid reset code.' });

    // --- Validate old password ---
    const oldOk = await bcrypt.compare(oldPassword.trim(), freelancer.password);
    if (!oldOk) return res.status(400).json({ message: 'Old password is incorrect.' });

    // --- Enforce password policy ---
    const isStrongPassword = (pwd) => {
      if (!pwd || pwd.length < 12) return false;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNumber = /\d/.test(pwd);
      const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
      const hasSpace = /\s/.test(pwd);
      const weakList = ["Password123!", "Admin@123", "Welcome@123", "Qwerty@123"];
      const isWeak = weakList.some((w) => pwd.toLowerCase() === w.toLowerCase());
      return hasUpper && hasLower && hasNumber && hasSpecial && !hasSpace && !isWeak;
    };
    if (!isStrongPassword(newPassword))
      return res.status(400).json({ message: 'Password does not meet policy requirements.' });

    // --- Prevent reuse of last 13 passwords ---
    for (const oldHash of freelancer.passwordHistory || []) {
      if (await bcrypt.compare(newPassword.trim(), oldHash))
        return res.status(400).json({ message: 'Cannot reuse any of your last 13 passwords.' });
    }

    // --- Update password ---
    freelancer.password = newPassword.trim();
    freelancer.lastPasswordChange = Date.now();
    freelancer.passwordHistory = [
      ...(freelancer.passwordHistory || []),
      freelancer.password,
    ].slice(-13);
    freelancer.resetOtp = undefined;
    freelancer.resetOtpExpiry = undefined;
    await freelancer.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
});



module.exports = router;
