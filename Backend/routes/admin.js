const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const bcrypt = require('bcryptjs');

const { sendNotification } = require('../utils/sendNotification');     // ✅
const { accountVerified } = require('../utils/emailTemplates');        // ✅
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ctrlz.bh';   // ✅


// Verify student or graduate dynamically
router.post('/verify', async (req, res) => {
  const { freelancerId } = req.body;

  try {
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found.' });

    freelancer.isVerified = true;
    await freelancer.save();

    const html = accountVerified({
      name: freelancer.fullName,
      userType: freelancer.userType, // 'Student' | 'Graduate'
      dashboardLink: `${FRONTEND_URL}/freelancer-dashboard`,
    });

    await sendNotification({
      userId: freelancer._id,
      userType: 'freelancer',
      subject: 'Your account has been verified!',
      message: `Your ${freelancer.userType} account has been verified. You can now sign in and start using ctrlZ.`,
      type: 'success',
      meta: { role: freelancer.userType },
      alsoEmail: true,  
      html,              
    });

    res.json({
      message:
        `${freelancer.userType.charAt(0).toUpperCase() + freelancer.userType.slice(1)} verified and email sent.`,
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
});




// Get admin profile by ID
router.get('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Normalize field for frontend
    const formatted = {
      ...admin.toObject(),
      company: admin.companyName || ''
    };

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin profile', error: err });
  }
});

// Update admin profile
router.put('/:id', async (req, res) => {
  try {
    const updates = {
      ...req.body,
      companyName: req.body.company
    };
    delete updates.company;

    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });

    res.status(200).json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

router.put('/changepassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err.message });
  }
});

// CLIENT LIST ROUTE
router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching clients', error: err });
  }
});

module.exports = router;
