const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Message = require('../models/Message');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

async function getUserDetails(userId) {
  return (
    (await Admin.findById(userId)) ||
    (await Client.findById(userId)) ||
    (await Freelancer.findById(userId))
  );
}

/* -------------------- Create / send a message -------------------- */

router.post('/', async (req, res) => {
  try {
    const payload = {
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
      senderRole: req.body.senderRole,
      receiverRole: req.body.receiverRole,
      content: req.body.content,
      roomId: req.body.roomId,
      attachments: req.body.attachments || [],
      timestamp: new Date()
    };

    
  const saved = await Message.create(payload);
const fresh = await Message.findById(saved._id); 
io.to(payload.roomId).emit('new-message', fresh);


    res.json(saved);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

/* -------------------- Get full chat for a room -------------------- */
router.get('/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.json(messages); 
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Error fetching messages');
  }
});

/* -------------------- Get latest messages per room -------------------- */
router.get('/latest/:userId', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: ['$senderId', '$receiverId'] },
              { $concat: [{ $toString: '$receiverId' }, '-', { $toString: '$senderId' }] },
              { $concat: [{ $toString: '$senderId' }, '-', { $toString: '$receiverId' }] }
            ]
          },
          doc: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$doc' } }
    ]);


    const ids = messages.map(m => m._id);
    const hydrated = await Message.find({ _id: { $in: ids } });


    const byId = new Map(hydrated.map(d => [String(d._id), d]));
    const ordered = messages.map(m => byId.get(String(m._id))).filter(Boolean);


    const populated = await Promise.all(
      ordered.map(async (msg) => {
        const sender = await getUserDetails(msg.senderId);
        const receiver = await getUserDetails(msg.receiverId);
        return {
          ...msg.toObject(),
          senderName: sender?.fullName || 'Unknown',
          senderProfileImage: sender?.profileImageUrl || '',
          receiverName: receiver?.fullName || 'Unknown',
          receiverProfileImage: receiver?.profileImageUrl || ''
        };
      })
    );

    res.json(populated);
  } catch (err) {
    console.error('Error in latest messages:', err);
    res.status(500).json({ message: 'Failed to load latest messages.' });
  }
});


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
