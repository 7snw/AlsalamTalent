// utils/sendNotification.js
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

// 🔁 Utility to resolve user email by ID and role
async function resolveUser(userId, role) {
  try {
    switch (role.toLowerCase()) {
      case 'freelancer':
        return await Freelancer.findById(userId);
      case 'client':
        return await Client.findById(userId);
      case 'admin':
        return await Admin.findById(userId);
      default:
        return null;
    }
  } catch (error) {
    console.error('❌ Failed to resolve user:', error);
    return null;
  }
}

// 📧 Nodemailer config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send and save notification
 * @param {Object} options
 * @param {ObjectId} options.userId - Mongoose user ID
 * @param {string} options.userType - 'freelancer' | 'admin' | 'client'
 * @param {string} options.subject - Notification subject
 * @param {string} options.message - Notification content
 * @param {string} [options.type='info'] - Type: 'info' | 'warning' | 'reminder'
 */
const sendNotification = async ({ userId, userType, subject, message, type = 'info' }) => {
  try {
    const user = await resolveUser(userId, userType);
    const email = user?.email || null;

    // Save in MongoDB
    await Notification.create({
      userId,
      userType: userType.toLowerCase(),
      email,
      subject,
      message,
      type,
      isRead: false,
      createdAt: new Date()
    });

    // Optional: Send Email
    if (email) {
      await transporter.sendMail({
        from: `"Ctrl-Z | AlSalam Bank" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text: message
      });
    }

  } catch (err) {
    console.error('sendNotification error:', err.message || err);
  }
};

module.exports = sendNotification;
