// models/PendingSignup.js
const mongoose = require('mongoose');

const PendingSignupSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['Student', 'Graduate'], required: true },
    data: { type: Object, required: true },    // studentId, fullName, email, password, major, phone, expertise, iban, cpr, cvUrl...
    otpHash: { type: String, required: true },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

// Optional: auto-clean after some hours (requires MongoDB TTL index support)
PendingSignupSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }); // 24h TTL

module.exports = mongoose.model('PendingSignup', PendingSignupSchema);
