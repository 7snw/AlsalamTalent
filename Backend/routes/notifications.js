const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

// ✅ Utility to get user details from their role
async function getUserDetails(userId, role) {
  switch (role.toLowerCase()) {
    case 'admin':
      return await Admin.findById(userId);
    case 'client':
      return await Client.findById(userId);
    case 'freelancer':
      return await Freelancer.findById(userId);
    default:
      return null;
  }
}
router.get('/:userId/:userType', async (req, res) => { 
  const { userId, userType } = req.params;
  console.log("📩 [GET /notifications] Params:", { userId, userType });

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("❌ Invalid ObjectId");
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const query = {
      userId: new mongoose.Types.ObjectId(userId),
      userType: userType.toLowerCase()
    };

    console.log("🔍 Querying DB with:", query);

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    console.log("✅ Fetched notifications:", notifications.length);

    const user = await getUserDetails(userId, userType);

    const enriched = notifications.map((n) => ({
      _id: n._id,
      userId: n.userId,
      userType: n.userType,
      email: n.email,
      subject: n.subject,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      fullName: user?.fullName || 'Unknown',
    }));

    return res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ Backend error in /notifications:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});



module.exports = router;
