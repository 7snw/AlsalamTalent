const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Freelancer = require('../models/Freelancer');

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Register new freelancer
router.post('/register', async (req, res) => {
  try {
    const data = {
      ...req.body,
      cprImageUrl: req.body.userType === 'graduate' ? req.body.cprImageUrl : undefined,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
    };

    const newFreelancer = await Freelancer.create(data);
    res.status(201).json(newFreelancer);
  } catch (err) {
    console.error('Freelancer registration failed:', err);
    res.status(500).json({ message: 'Registration failed', error: err });
  }
});

// Get freelancer list (brief)
router.get('/list', async (req, res) => {
  try {
    const freelancers = await Freelancer.find({}, 'fullName expertise profileImageUrl');
    res.json(freelancers);
  } catch (err) {
    console.error('Error fetching freelancers:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get graduates list
router.get('/graduates', async (req, res) => {
  try {
    const graduates = await Freelancer.find(
      { userType: 'graduate' },
      'fullName studentId cprImageUrl'
    );
    res.json(graduates);
  } catch (err) {
    console.error('Error fetching graduates:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get full freelancer profile
router.get('/profile/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).select(
      'fullName email studentId major phone dateOfBirth bio skills specialties expertise portfolio role cprImageUrl profileImageUrl'
    );

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    res.json(freelancer);
  } catch (err) {
    console.error('Error fetching freelancer profile:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// ✅ Update freelancer profile with support for image upload
router.put('/profile/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const parsedData = JSON.parse(req.body.data); // data was sent as JSON string
    const updates = { ...parsedData };

    if (updates.dateOfBirth) {
      updates.dateOfBirth = new Date(updates.dateOfBirth);
    }

    if (req.file) {
      updates.profileImageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      freelancerId,
      updates,
      { new: true }
    );

    if (!updatedFreelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    res.json(updatedFreelancer);
  } catch (err) {
    console.error('Error updating freelancer profile:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Change freelancer password
router.put('/changepassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const freelancerId = req.params.id;

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    if (freelancer.password !== oldPassword) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    freelancer.password = newPassword;
    await freelancer.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
