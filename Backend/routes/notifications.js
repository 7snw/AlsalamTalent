// routes/notifications.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const { sendNotification } = require('../utils/sendNotification');

async function getUserDetails(userId, role) {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return Admin.findById(userId);
  if (r === 'client') return Client.findById(userId);
  if (r === 'freelancer') return Freelancer.findById(userId);
  return null;
}

// List notifications for a user
// GET /api/notifications/:userId/:role
router.get("/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }
    const items = await Notification
      .find({ userId, userType: String(role || "").toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json(items);
  } catch (err) {
    console.error("GET /api/notifications/:userId/:role error:", err);
    return res.status(500).json([]);
  }
});


// PATCH /api/notifications/:id/read  -> mark one as read
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ ok: false });
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/notifications/:id/read error:", err);
    return res.status(500).json({ ok: false });
  }
});

// PATCH /api/notifications/read-all/:userId/:role  -> mark all as read for user
router.patch("/read-all/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ ok: false });
    await Notification.updateMany(
      { userId, userType: String(role || "").toLowerCase() },
      { $set: { isRead: true } }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/notifications/read-all error:", err);
    return res.status(500).json({ ok: false });
  }
});

// Send an arbitrary notification (kept)
router.post('/', async (req, res) => {
  try {
    const note = await Notification.create({
      ...req.body,
      userType: String(req.body.userType || '').toLowerCase(),
    });
    res.status(201).json(note);
  } catch (err) {
    console.error('POST /notifications error:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Broadcast to freelancers (kept)
router.post('/broadcast', async (req, res) => {
  const { role, subject, message, type = 'info' } = req.body;
  if (String(role || '').toLowerCase() !== 'freelancer') {
    return res.status(400).json({ message: 'Broadcast is supported only for freelancers.' });
  }
  try {
    const freelancers = await Freelancer.find({}, '_id email');
    await Promise.all(
      freelancers.map(f =>
        sendNotification({
          userId: f._id,
          userType: 'freelancer',
          subject,
          message,
          type,
          email: f.email,
        })
      )
    );
    res.json({ message: 'Broadcast sent to freelancers.' });
  } catch (e) {
    console.error('Broadcast error:', e);
    res.status(500).json({ message: 'Failed to broadcast notification.' });
  }
});

module.exports = router;
