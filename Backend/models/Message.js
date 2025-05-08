const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderRole: { type: String, enum: ['Freelancer', 'Client', 'Admin'], required: true },
  receiverRole: { type: String, enum: ['Freelancer', 'Client', 'Admin'], required: true },
  
  content: { type: String, required: true },
  roomId: { type: String, required: true },
  attachments: [{ name: String, url: String }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
