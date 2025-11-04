const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });

   
    const userIds = logs.map(log => log.userId.toString());


    const [admins, clients, freelancers] = await Promise.all([
      Admin.find({ _id: { $in: userIds } }),
      Client.find({ _id: { $in: userIds } }),
      Freelancer.find({ _id: { $in: userIds } })
    ]);

  
    const userMap = new Map();

    admins.forEach(user => userMap.set(user._id.toString(), { name: user.fullName, role: 'Admin' }));
    clients.forEach(user => userMap.set(user._id.toString(), { name: user.fullName, role: 'Client' }));
    freelancers.forEach(user => userMap.set(user._id.toString(), { name: user.fullName, role: 'Freelancer' }));

 
    const enhancedLogs = logs.map(log => {
      const userInfo = userMap.get(log.userId.toString()) || { name: 'Unknown User', role: 'Unknown' };
      return {
        _id: log._id,
        action: log.action,
        details: log.details || '', 
        timestamp: log.timestamp,
        userName: userInfo.name,
        role: userInfo.role
      };
    });

    res.json(enhancedLogs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ message: 'Failed to load audit logs.' });
  }
});

module.exports = router;
