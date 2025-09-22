const Notification = require("../models/Notification");
const Admin       = require("../models/Admin");
const Client      = require("../models/Client");
const Freelancer  = require("../models/Freelancer");
const sendEmail   = require("./sendEmail"); // unified transporter

async function resolveUser(userId, role) {
  try {
    switch ((role || "").toLowerCase()) {
      case "freelancer": return await Freelancer.findById(userId);
      case "client":     return await Client.findById(userId);
      case "admin":      return await Admin.findById(userId);
      default:           return null;
    }
  } catch (error) {
    console.error("❌ resolveUser failed:", error?.message || error);
    return null;
  }
}

/**
 * Create in-app notification; email is OPTIONAL.
 * Pass { alsoEmail: true } to send an email. Default is false (no email).
 */
const sendNotification = async ({
  userId,
  userType,
  subject,
  message,
  type = "info",
  html,
  meta,
  alsoEmail = false,   // <— NEW: gate email sending
}) => {
  try {
    const user = await resolveUser(userId, userType);
    const email = user?.email || null;

    // 1) Save in DB (in-app notification)
    const doc = await Notification.create({
      userId,
      userType: String(userType || "").toLowerCase(),
      email,
      subject: subject || "",
      message: message || "",
      type: type || "info",
      isRead: false,
      meta: meta || undefined,
    });

    // 2) Optional email — only when explicitly requested
    if (alsoEmail && email) {
      await sendEmail({
        to: email,
        subject: subject || "Notification",
        text: message || "",
        html, // use if provided
      });
    }

    return doc;
  } catch (err) {
    console.error("sendNotification error:", err?.message || err);
    return null;
  }
};

module.exports = { sendNotification };
