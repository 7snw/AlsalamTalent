const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Notification = require("../models/Notification");
const Admin = require("../models/Admin");
const Client = require("../models/Client");
const Freelancer = require("../models/Freelancer");
const sendNotification = require("../utils/sendNotification");

// Utility to get user details
async function getUserDetails(userId, role) {
  switch (role.toLowerCase()) {
    case "admin":
      return await Admin.findById(userId);
    case "client":
      return await Client.findById(userId);
    case "freelancer":
      return await Freelancer.findById(userId);
    default:
      return null;
  }
}

//  GET Notifications for user
router.get("/:userId/:userType", async (req, res) => {
  const { userId, userType } = req.params;

  console.log("📩 [GET /notifications] Params:", { userId, userType });

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const query = {
      userId: new mongoose.Types.ObjectId(userId),
      userType: userType.toLowerCase(),
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    const user = await getUserDetails(userId, userType);

    const enriched = notifications.map((n) => ({
      _id: n._id,
      userId: n.userId,
      userType: n.userType,
      email: n.email,
      subject: n.subject,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      fullName: user?.fullName || "Unknown",
    }));

    return res.status(200).json(enriched);
  } catch (err) {
    console.error("❌ Backend error in /notifications:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// POST direct notification (admin only)
router.post("/send", async (req, res) => {
  try {
    let { userId, userType, subject, message, type } = req.body;

    //  Enforce admin-only notifications via this route
    if (userType.toLowerCase() !== "admin") {
      return res.status(400).json({ message: "This endpoint is restricted to admin notifications only." });
    }

    if (!userId) {
      const admin = await Admin.findOne();
      if (!admin) return res.status(404).json({ message: "No admin found" });
      userId = admin._id;
    } else {
      const admin = await Admin.findById(userId);
      if (!admin) return res.status(404).json({ message: "Provided userId is not an admin." });
    }

    await sendNotification({
      userId,
      userType: "admin",
      subject,
      message,
      type: type || "info",
    });

    res.status(200).json({ message: "Notification sent to admin." });
  } catch (err) {
    console.error("❌ Error in /send:", err.message);
    res.status(500).json({ error: "Failed to send admin notification" });
  }
});

//  POST broadcast to freelancers only
router.post("/broadcast", async (req, res) => {
  const { role, subject, message, type } = req.body;

  if (!role || !subject || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Restrict broadcast to freelancers only
  if (role.toLowerCase() !== "freelancer") {
    return res.status(400).json({ message: "Broadcast is supported only for freelancers." });
  }

  try {
    const freelancers = await Freelancer.find({}, "_id");

    for (const freelancer of freelancers) {
      await sendNotification({
        userId: freelancer._id,
        userType: "freelancer",
        subject,
        message,
        type: type || "info",
      });
    }

    res.status(200).json({ message: "Broadcast sent to freelancers." });
  } catch (error) {
    console.error("❌ Broadcast error:", error);
    res.status(500).json({ message: "Failed to broadcast notification." });
  }
});

//  POST create raw notification (no role filter)
router.post("/", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("❌ Failed to save notification:", err.message);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

module.exports = router;
