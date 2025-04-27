const express = require('express');
const router = express.Router();
const Freelancer = require('../models/Freelancer');

// Route to register a new freelancer
router.post('/register', async (req, res) => {
  try {
    // If the userType is graduate, include cprImageUrl
    const data = {
      ...req.body,
      cprImageUrl: req.body.userType === 'graduate' ? req.body.cprImageUrl : undefined
    };

    const newFreelancer = await Freelancer.create(data);
    res.status(201).json(newFreelancer);
  } catch (err) {
    console.error('Freelancer registration failed:', err);
    res.status(500).json({ message: 'Registration failed', error: err });
  }
});

// Route to fetch all freelancers (for listing)
router.get('/list', async (req, res) => {
  try {
    const freelancers = await Freelancer.find({}, 'fullName expertise'); // Only send necessary fields
    res.json(freelancers);
  } catch (err) {
    console.error('Error fetching freelancers:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Route to fetch graduates with CPR for admin verification
router.get('/graduates', async (req, res) => {
  try {
    const graduates = await Freelancer.find({ userType: 'graduate' }, 'fullName studentId cprImageUrl');
    res.json(graduates);
  } catch (err) {
    console.error('Error fetching graduates:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
