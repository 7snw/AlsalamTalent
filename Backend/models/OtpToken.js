const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', index: true, required: true },
  codeHash: { type: String, required: true },
  channel: { type: String, default: 'email' },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

// Optional: auto-delete after 1 day
otpTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('OtpToken', otpTokenSchema);
