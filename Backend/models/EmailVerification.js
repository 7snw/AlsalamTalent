const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  code: String,
  role: String,
  userId: mongoose.Schema.Types.ObjectId,
  expiresAt: Date,
});

emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);
