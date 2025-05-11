const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

// Temporary storage (use DB in production)
let emailVerifications = {}; // { email: { code, expiresAt } }

// Send verification code
router.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;

  // Optional: enforce Bahrain Polytechnic domain again
  // if (!email.endsWith('@student.polytechnic.bh')) {
  //   return res.status(400).json({ message: 'Only Bahrain Polytechnic student emails are allowed.' });
  // }

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins from now

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

  console.log('Sending mail to:', mailOptions.to);
  console.log('Mail content:', mailOptions.text);

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

// Verify submitted code
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = emailVerifications[email];

  if (!record) {
    return res.status(400).json({ message: 'No verification code found for this email.' });
  }

  if (Date.now() > record.expiresAt) {
    delete emailVerifications[email];
    return res.status(400).json({ message: 'Verification code has expired. Please resend.' });
  }

  if (record.code !== code) {
    return res.status(400).json({ message: 'Incorrect verification code.' });
  }

  delete emailVerifications[email];
  return res.json({ verified: true });
});

// Manual test route
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

    console.log('✅ Email sent:', info.response);
    res.send('Test email sent!');
  } catch (err) {
    console.error('❌ Email test error:', err);
    res.status(500).send('Email failed to send.');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

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

    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      id: user._id,
      name: user.fullName,
      role: role,
      email: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Return all users
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
