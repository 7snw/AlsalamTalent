const express = require('express');
const router = express.Router();

const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

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

module.exports = router;
