const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
