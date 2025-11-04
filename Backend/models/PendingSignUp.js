const mongoose = require('mongoose');

const PendingSignupSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['Student', 'Graduate'], required: true },
    data: { type: Object, required: true },    
    otpHash: { type: String, required: true },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true }
);


PendingSignupSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }); 

module.exports = mongoose.model('PendingSignup', PendingSignupSchema);
