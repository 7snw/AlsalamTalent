const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Client = require('../models/Client'); // Client model for listing clients
const Freelancer = require('../models/Freelancer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');




// Verify student or graduate dynamically
router.post('/verify', async (req, res) => {
  const { freelancerId } = req.body;

  try {
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found.' });

    freelancer.isVerified = true;
    await freelancer.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Alsalam Bank | CTRL-Z" <${process.env.EMAIL_USER}>`,
      to: freelancer.email,
      subject: 'Your Account Has Been Verified!',
      text: `Dear ${freelancer.fullName},\n\nYour ${freelancer.userType} account has been verified. You can now sign in and start using CTRL-Z.\n\nBest regards,\nAlsalam Bank Team`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: `${freelancer.userType.charAt(0).toUpperCase() + freelancer.userType.slice(1)} verified and email sent.` });
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
