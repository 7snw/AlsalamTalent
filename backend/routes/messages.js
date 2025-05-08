const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

// Utility to get user from any collection
async function getUserDetails(userId) {
  return await Admin.findById(userId) ||
         await Client.findById(userId) ||
         await Freelancer.findById(userId);
}

// Get full chat for a room
router.get('/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send('Error fetching messages');
  }
});

// Get latest messages per room
router.get('/latest/:userId', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: ["$senderId", "$receiverId"] },
              { $concat: [{ $toString: "$receiverId" }, "-", { $toString: "$senderId" }] },
              { $concat: [{ $toString: "$senderId" }, "-", { $toString: "$receiverId" }] }
            ]
          },
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);

    const populatedMessages = await Promise.all(messages.map(async (msg) => {
      const sender = await getUserDetails(msg.senderId);
      const receiver = await getUserDetails(msg.receiverId);
      return {
        ...msg,
        senderName: sender?.fullName || 'Unknown',
        receiverName: receiver?.fullName || 'Unknown'
      };
    }));

    res.json(populatedMessages);
  } catch (err) {
    console.error("Error in latest messages:", err);
    res.status(500).json({ message: "Failed to load latest messages." });
  }
});

// Delete all messages in a room
router.delete('/room/:roomId', async (req, res) => {
  try {
    await Message.deleteMany({ roomId: req.params.roomId });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting messages:', err);
    res.status(500).json({ message: 'Failed to delete chat.' });
  }
});


module.exports = router;
