const Notification = require("../models/Notification");
const Admin       = require("../models/Admin");
const Client      = require("../models/Client");
const Freelancer  = require("../models/Freelancer");
const sendEmail   = require("./sendEmail"); 

async function resolveUser(userId, role) {
  try {
    switch ((role || "").toLowerCase()) {
      case "freelancer": return await Freelancer.findById(userId);
      case "client":     return await Client.findById(userId);
      case "admin":      return await Admin.findById(userId);
      default:           return null;
    }
  } catch (error) {
    console.error(" resolveUser failed:", error?.message || error);
    return null;
  }
}


const sendNotification = async ({
  userId,
  userType,
  subject,
  message,
  type = "info",
  html,
  meta,
  alsoEmail = false,   
}) => {
  try {
    const user = await resolveUser(userId, userType);
    const email = user?.email || null;

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

  
    if (alsoEmail && email) {
      await sendEmail({
        to: email,
        subject: subject || "Notification",
        text: message || "",
        html, 
      });
    }

    return doc;
  } catch (err) {
    console.error("sendNotification error:", err?.message || err);
    return null;
  }
};

module.exports = { sendNotification };
