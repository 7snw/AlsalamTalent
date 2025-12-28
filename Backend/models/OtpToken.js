const mongoose = require("mongoose");

const otpTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      index: true,
      required: false,
    },
    email: { type: String, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    channel: { type: String, default: "email" },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false },
    purpose: { type: String, enum: ["LOGIN", "RESET", "VERIFY"], default: "LOGIN" },
  },
  { timestamps: true }
);

otpTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
module.exports = mongoose.model("OtpToken", otpTokenSchema);
