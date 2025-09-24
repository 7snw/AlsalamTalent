// routes/users.js
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

// -------- helpers (no dataCrypto dependency) ----------
const normalizeEmail = (v = '') => String(v).trim().toLowerCase();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const emailCIQuery = (email) => ({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });

// ---- Temporary email verification store ----
let emailVerifications = {};

// Send verification code
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

// Verify submitted code
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

    // Admin (plain)
    user = await Admin.findOne(emailCIQuery(email));
    if (user) role = 'admin';

  
    // Client (encrypted email → deterministic hash)
if (!user) {
   user = await Client.findOne({ emailHash: lookupHash(email) }).select('+password');
   if (user) role = 'client';
 }

    // Freelancer ( encrypted email: look up by hash and avoid .lean() so fields decrypt)
    if (!user) {
      user = await FreelancerModel
        .findOne({ emailHash: lookupHash(email) })
        .select('+password'); // ensure password is present for bcrypt
      if (user) role = 'freelancer';
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(400).json({ message: 'Invalid password' });

    if (role === 'freelancer') {
      if (user.isActive === false) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      if (user.userType === 'Graduate' && !user.isVerified) {
        return res.status(403).json({ message: 'Account pending admin verification' });
      }
    }

    res.json({
      id: user._id,
      name: user.fullName,
      email: user.email || '',
      role,
      userType: role === 'freelancer' ? user.userType : undefined,
      isVerified: role === 'freelancer' ? user.isVerified : undefined,
      profileImageUrl: user.profileImageUrl || ''
      // TODO: add a JWT here if you plan to use tokens
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------- ALL USERS (basic) -----------------------------
router.get('/all', async (_req, res) => {
  try {
   const admins = await Admin.find({}, '_id fullName email profileImageUrl').lean(); // Admin is fine
const clientsDocs = await Client.find({}, '_id fullName email profileImageUrl');  // NO .lean()
 const clients = clientsDocs.map(d => d.toObject());

 const freelancersDocs = await FreelancerModel.find({}, '_id fullName email profileImageUrl'); // NO .lean()
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
// SINGLE USER
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let user =
     (await Admin.findById(id, '_id fullName email role profileImageUrl').lean()) ||
 (await (async () => {
   const c = await Client.findById(id, '_id fullName email role profileImageUrl'); // NO .lean()
   return c ? c.toObject() : null;
 })()) ||
      (await (async () => {
        const f = await FreelancerModel.findById(id, '_id fullName email role profileImageUrl');
        return f ? f.toObject() : null; // ← no .lean(); this decrypts
      })());

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.role) user.role = 'freelancer';
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Failed to fetch user profile.', error: err });
  }
});


module.exports = router;
