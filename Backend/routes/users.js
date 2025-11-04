const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');
const Client = require('../models/Client');
const FreelancerModel = require('../models/Freelancer');
const { lookupHash } = require('../utils/cryptoVault'); 
const sendEmail = require('../utils/sendEmail');
const { verificationCode } = require('../utils/emailTemplates');
const EmailVerification = require('../models/EmailVerification');



const normalizeEmail = (v='') => String(v).trim().toLowerCase();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const emailCIQuery = (email) => ({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });

// put near the top of the file
function getDisplayName(doc) {
  if (!doc) return 'there';
  try {
    // If the mongoose-field-encryption plugin is on this model,
    // this will populate decrypted fields on the doc instance.
    if (typeof doc.decryptFieldsSync === 'function') doc.decryptFieldsSync();
  } catch {}
  const name = String(doc.fullName || doc.name || '').trim();
  return name || 'there';
}

async function findAccountByEmail(cleanEmail) {
  const [freelancer, client] = await Promise.all([
    FreelancerModel.findOne({ emailHash: lookupHash(cleanEmail) })
      .select('+resetOtp +resetOtpExpiry +password +passwordHistory +lastPasswordChange'),
    Client.findOne({ emailHash: lookupHash(cleanEmail) })
      .select('+pwResetOtpHash +pwResetExpiresAt +password')
  ]);

  if (freelancer) return { role: 'freelancer', user: freelancer };
  if (client)     return { role: 'client',     user: client };
  return null;
}
let emailVerifications = {};


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


router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Fetch possible matches from all roles
    const [admin, client, freelancer] = await Promise.all([
      Admin.findOne(emailCIQuery(email)).select('+password'),
      Client.findOne({ emailHash: lookupHash(email) }).select('+password'),
      FreelancerModel.findOne({ emailHash: lookupHash(email) }).select('+password'),
    ]);

    // Build candidates list in your desired priority order
    const candidates = [
      admin && { role: 'admin', user: admin },
      client && { role: 'client', user: client },
      freelancer && { role: 'freelancer', user: freelancer },
    ].filter(Boolean);

    if (candidates.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Try password against each candidate before failing
    let authed = null;
    for (const c of candidates) {
      const ok = await bcrypt.compare(password, c.user.password || '');
      if (ok) { authed = c; break; }
    }

    if (!authed) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Extra role-specific checks
    if (authed.role === 'freelancer') {
      if (authed.user.isActive === false) return res.status(403).json({ message: 'Account is deactivated' });
      if (authed.user.userType === 'Graduate' && !authed.user.isVerified)
        return res.status(403).json({ message: 'Account pending admin verification' });
    }

    // MFA – unchanged
    const otp = crypto.randomInt(100000, 999999).toString();
    await EmailVerification.findOneAndUpdate(
      { email },
      {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        userId: authed.user._id,
        role: authed.role
      },
      { upsert: true }
    );

    const html = verificationCode({ name: authed.user.fullName || 'there', code: otp });
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


// VERIFY LOGIN OTP 
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

  
    const role = record.role;
    let user = null;

    if (role === 'admin') user = await Admin.findById(record.userId);
    if (role === 'client') user = await Client.findById(record.userId);
    if (role === 'freelancer') user = await FreelancerModel.findById(record.userId);

    await EmailVerification.deleteOne({ email });

  
    if (req.session) {
      req.session.userId = user._id;
      req.session.role = role;
      req.session.email = user.email;
      req.session.lastActivity = Date.now();

      // Ensure session is saved before responding
      await new Promise(resolve => req.session.save(resolve));
      console.log(` Session saved for user ${user._id} with ID ${req.sessionID}`);



    }

  
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



//  LOGOUT
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


// ALL USERS 
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


// GET SINGLE USER 
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

// AUTH: Forgot password (unified for client + freelancer)
router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    // Try client, then freelancer
    const [client, freelancer] = await Promise.all([
      Client.findOne({ emailHash: lookupHash(email) }),
      FreelancerModel.findOne({ emailHash: lookupHash(email) })
    ]);

    // Always behave the same even if not found (anti-enumeration)
    if (!client && !freelancer) {
      return res.json({ message: 'A code was sent.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (client) {
      client.pwResetOtpHash = otpHash;
      client.pwResetExpiresAt = expiresAt;
      await client.save();
    } else if (freelancer) {
      freelancer.resetOtp = otpHash;
      freelancer.resetOtpExpiry = expiresAt;
      await freelancer.save();
    }

    const html = verificationCode({code: otp });
    await sendEmail({
      to: email,
      subject: 'Your ctrlZ password reset code',
      html,
      text: `Your password reset code is ${otp}. It expires in 10 minutes.`
    });

    return res.json({ message: 'A code was sent.' });
  } catch (err) {
    console.error('Auth forgot-password error:', err);
    return res.status(500).json({ message: 'Failed to start reset.' });
  }
});



// AUTH: Reset password (unified, OTP + new password) – NO old password
router.post('/reset-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    const code  = String(req.body.code || '').trim();
    const newPassword = String(req.body.newPassword || '').trim();

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and newPassword are required.' });
    }

    // Try client first (since we just added client support), then freelancer
    let user = await Client.findOne({ emailHash: lookupHash(email) }).select('+pwResetOtpHash +pwResetExpiresAt +password');
    let role = 'client';

    if (!user) {
      user = await FreelancerModel.findOne({ emailHash: lookupHash(email) }).select('+resetOtp +resetOtpExpiry +password +passwordHistory +lastPasswordChange');
      role = 'freelancer';
    }
    if (!user) return res.status(400).json({ message: 'Invalid or expired code.' });

    // Pull the correct OTP fields by role
    let otpHash, otpExpiresAt;
    if (role === 'client') {
      otpHash = user.pwResetOtpHash;
      otpExpiresAt = user.pwResetExpiresAt;
    } else {
      otpHash = user.resetOtp;
      otpExpiresAt = user.resetOtpExpiry;
    }
    if (!otpHash || !otpExpiresAt) return res.status(400).json({ message: 'Invalid or expired code.' });
    if (Date.now() > new Date(otpExpiresAt).getTime()) {
      // clear & fail
      if (role === 'client') {
        user.pwResetOtpHash = undefined;
        user.pwResetExpiresAt = undefined;
      } else {
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
      }
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    const ok = await bcrypt.compare(code, otpHash);
    if (!ok) return res.status(400).json({ message: 'Invalid or expired code.' });

    // Password policy (same across roles)
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
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'Password does not meet policy requirements.' });
    }

    // Optional history check for freelancers (you already track this on freelancer)
    if (role === 'freelancer' && Array.isArray(user.passwordHistory)) {
      for (const oldHash of user.passwordHistory) {
        if (await bcrypt.compare(newPassword, oldHash)) {
          return res.status(400).json({ message: 'Cannot reuse any of your last 13 passwords.' });
        }
      }
      user.lastPasswordChange = Date.now();
      user.passwordHistory = [...(user.passwordHistory || []), user.password].slice(-13);
    }

    // Set new password (your schema pre-save will hash)
    user.password = newPassword;

    // Clear OTP fields
    if (role === 'client') {
      user.pwResetOtpHash = undefined;
      user.pwResetExpiresAt = undefined;
    } else {
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
    }

    await user.save();
    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Auth reset-password error:', err);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
});




module.exports = router;
