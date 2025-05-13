const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

// Temporary email verification store
let emailVerifications = {}; // { email: { code, expiresAt } }

// ✅ Send email verification code
router.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  emailVerifications[email] = { code, expiresAt };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Al Salam Talents <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    text: `Your code is: ${code}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});


// ✅ Verify submitted code
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = emailVerifications[email];

  if (!record) return res.status(400).json({ message: 'No verification code found.' });
  if (Date.now() > record.expiresAt) {
    delete emailVerifications[email];
    return res.status(400).json({ message: 'Verification code expired.' });
  }
  if (record.code !== code) return res.status(400).json({ message: 'Incorrect verification code.' });

  delete emailVerifications[email];
  return res.json({ verified: true });
});

// ✅ Test mail
router.get('/test-mail', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: '1maryiem363@gmail.com',
      subject: 'Test Email from Al Salam Talents',
      text: '✅ This is a test email to verify Gmail SMTP config is working.'
    });

    res.send('Test email sent!');
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).send('Email failed to send.');
  }
});

// ✅ LOGIN with bcrypt password check
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("🧠 Login request:", email, password); // Log input

  try {
    let user = await Admin.findOne({ email });
    let role = 'admin';

    if (!user) {
      user = await Client.findOne({ email });
      role = 'client';
    }

    if (!user) {
      user = await Freelancer.findOne({ email });
      role = 'freelancer';
      if (user && !user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    console.log("🔐 Stored password hash:", user.password); // Log hashed value

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("✅ Password match:", isMatch); // Log result

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      id: user._id,
      name: user.fullName,
      role,
      email: user.email
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Return all users
router.get('/all', async (req, res) => {
  try {
    const admins = await Admin.find({}, '_id fullName email').lean();
    const clients = await Client.find({}, '_id fullName email').lean();
    const freelancers = await Freelancer.find({}, '_id fullName email').lean();

    const allUsers = [
      ...admins.map(u => ({ ...u, role: 'admin' })),
      ...clients.map(u => ({ ...u, role: 'client' })),
      ...freelancers.map(u => ({ ...u, role: 'freelancer' }))
    ];

    res.json(allUsers);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Failed to fetch users.', error: err });
  }
});

module.exports = router;
