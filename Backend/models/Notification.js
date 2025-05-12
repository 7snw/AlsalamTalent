const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['admin', 'client', 'freelancer'], required: true },
  email: { type: String, required: true }, 
  subject: { type: String, required: true }, 
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'reminder'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
