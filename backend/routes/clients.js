const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

router.post('/register', async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ message: 'Client registration failed', error: err });
  }
});

module.exports = router;
