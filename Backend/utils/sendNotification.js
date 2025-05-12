// utils/sendNotification.js
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

// 🔁 Utility to resolve user email by ID and role
async function resolveUser(userId, role) {
  let user;
  switch (role.toLowerCase()) {
    case 'freelancer':
      user = await Freelancer.findById(userId);
      break;
    case 'client':
      user = await Client.findById(userId);
      break;
    case 'admin':
      user = await Admin.findById(userId);
      break;
    default:
      user = null;
  }
  return user;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendNotification = async ({ userId, userType, subject, message, type = 'info' }) => {
  try {
    const user = await resolveUser(userId, userType);
    const email = user?.email || null;

    // Save in DB
 await Notification.create({
  userId,
  userType: userType.toLowerCase(), // ✅ Ensure this is lowercase
  email,
  subject,
  message,
  type,
});


    // Send email
    if (email) {
      await transporter.sendMail({
        from: `"Al Salam Talents" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text: message,
      });
    }
  } catch (err) {
    console.error('❌ Notification error:', err);
  }
};

module.exports = sendNotification;
