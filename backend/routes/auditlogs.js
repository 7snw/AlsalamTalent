// routes/auditLogs.js
const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });

    const enhancedLogs = await Promise.all(
      logs.map(async (log) => {
        let user = null;
        let role = 'Unknown';

        user = await Admin.findById(log.userId);
        if (user) role = 'Admin';

        if (!user) {
          user = await Client.findById(log.userId);
          if (user) role = 'Client';
        }

        if (!user) {
          user = await Freelancer.findById(log.userId);
          if (user) role = 'Freelancer';
        }

        return {
          _id: log._id,
          action: log.action,
          timestamp: log.timestamp,
          userName: user ? user.fullName : 'Unknown User',
          role: role
        };
      })
    );

    res.json(enhancedLogs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ message: 'Failed to load audit logs.' });
  }
});

module.exports = router;
