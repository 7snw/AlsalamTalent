const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Client = require('../models/Client'); // Client model for listing clients

// ADMIN PROFILE ROUTES

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

// Change admin password
router.put('/changepassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (admin.password !== oldPassword) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    admin.password = newPassword;
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
