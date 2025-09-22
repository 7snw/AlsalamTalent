// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userType: { type: String, enum: ["freelancer", "client", "admin"], required: true, index: true },
    email:    { type: String }, // optional, for reference
    subject:  { type: String },
    message:  { type: String },
    type:     { type: String, default: "info" }, // e.g., info, booking, payment, etc.
    isRead:   { type: Boolean, default: false },
    meta:     { type: mongoose.Schema.Types.Mixed }, // any extra JSON
  },
  { timestamps: true, collection: "notifications" }
);

module.exports = mongoose.model("Notification", NotificationSchema);
