const express = require('express');
const router = express.Router();
const Freelancer = require('../models/Freelancer');

router.get('/check/:id', async (req, res) => {
  const studentId = req.params.id;

  const validFormat = /^\d{9}$/.test(studentId);
  const startYear = parseInt(studentId.substring(0, 4), 10);

  if (!validFormat || startYear < 2008 || startYear > new Date().getFullYear()) {
    return res.json({ exists: false, reason: 'Invalid format or year' });
  }

  // No need to check in database anymore; any ID from 2008+ is considered valid format
  return res.json({ exists: true });
});

module.exports = router;
