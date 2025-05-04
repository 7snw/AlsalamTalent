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

// ✅ Get a single client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ message: 'Fetching client failed', error: err });
  }
});

// ✅ Update a client by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(updatedClient);
  } catch (err) {
    res.status(500).json({ message: 'Updating client failed', error: err });
  }
});

module.exports = router;
