// routes/users.js
const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs'); 
const User = require('../models/users');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // 🔁 We're not using hashed password, do a simple check
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
