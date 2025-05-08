const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Register a new client
router.post('/register', async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
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

// Update client profile by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        fullName: req.body.fullName,
        email: req.body.email,
        occupation: req.body.occupation,
        phone: req.body.phone,
        companyName: req.body.companyName, // renamed field
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined
      },
      { new: true }
    );

    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(updatedClient);
  } catch (err) {
    res.status(500).json({ message: 'Updating client failed', error: err });
  }
});


// PUT: Change client password
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
