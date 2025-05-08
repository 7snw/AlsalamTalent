const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const logAction = require('../utils/logAction'); // ✅ Logging utility

// ✅ Admin registers a new client
router.post('/register', async (req, res) => {
  try {
    const { authorId, ...clientData } = req.body;

    const newClient = await Client.create(clientData);

    // ✅ Log the action only if an Admin (authorId) is provided
    if (authorId) {
      await logAction({
        userId: authorId,
        action: 'Added New Client',
        details: `Client: ${newClient.fullName}`
      });
    }

    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ message: 'Client registration failed', error: err });
  }
});

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find({});
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Fetching clients failed', error: err });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ message: 'Fetching client failed', error: err });
  }
});

// ✅ Update client profile by ID (with optional admin logging)
router.put('/:id', async (req, res) => {
  try {
    const { authorId, ...updates } = req.body;

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        fullName: updates.fullName,
        email: updates.email,
        occupation: updates.occupation,
        phone: updates.phone,
        companyName: updates.companyName,
        dateOfBirth: updates.dateOfBirth ? new Date(updates.dateOfBirth) : undefined
      },
      { new: true }
    );

    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });

    // ✅ Log only if performed by admin (authorId provided)
    if (authorId) {
      await logAction({
        userId: authorId,
        action: 'Edited Client Profile',
        details: `Client: ${updatedClient.fullName}`
      });
    }

    res.status(200).json(updatedClient);
  } catch (err) {
    res.status(500).json({ message: 'Updating client failed', error: err });
  }
});

// Change client password
router.put('/changepassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (client.password !== oldPassword) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    client.password = newPassword;
    await client.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
