// routes/bookings.js
"use strict";

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const router = express.Router();
const logAction = require('../utils/logAction');
const Booking = require("../models/Booking");
const Freelancer = require("../models/Freelancer");
const Client = require("../models/Client");
const sendEmail = require("../utils/sendEmail");
const { sendNotification } = require("../utils/sendNotification");

const {
  bookingConfirmedFreelancer,
  bookingNewForClient,
} = require("../utils/emailTemplates");

/* ---------- email helper (SMTP first, Gmail fallback) ---------- */
const FROM_FALLBACK = () =>
  process.env.FROM_EMAIL ||
  (process.env.EMAIL_USER
    ? `"ctrlZ" <${process.env.EMAIL_USER}>`
    : '"ctrlZ" <no-reply@ctrlz.bh>');

async function mail({ to, subject, text, html }) {
  if (!to) return;
  try {
    await sendEmail({ to, subject, text, html });
  } catch (err) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) throw err;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({ from: FROM_FALLBACK(), to, subject, text, html });
  }
}

/* ---------- who to notify on client side ---------- */
async function getClientRecipients() {
  const recipients = [];

  if (
    process.env.BOOKINGS_CLIENT_ID &&
    mongoose.Types.ObjectId.isValid(process.env.BOOKINGS_CLIENT_ID)
  ) {
    try {
      const c = await Client.findById(process.env.BOOKINGS_CLIENT_ID); // NO .lean()
      if (c)
        recipients.push({
          _id: c._id,
          email: c.email,
          userType: "client",
          name: c.fullName || "Client",
        });
    } catch (e) {
      console.error(
        "getClientRecipients(): BOOKING_CLIENT_ID lookup failed:",
        e?.message || e
      );
    }
  }

  const raw =
    process.env.BOOKINGS_NOTIFY_EMAILS ||
    process.env.BOOKINGS_NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "";
  String(raw)
    .split(/[;,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((email) =>
      recipients.push({ _id: null, email, userType: "client", name: "Client" })
    );

  const seen = new Set();
  return recipients.filter(
    (r) => (r.email && !seen.has(r.email) && seen.add(r.email)) || r._id
  );
}

/* ---------- availability ---------- */
router.get("/check", async (req, res) => {
  try {
    const { space, date, time } = req.query;
    if (!space || !date || !time) return res.json({ available: false });

    const exists = await Booking.exists({
      spaceType: String(space).toLowerCase(),
      dateISO: String(date),
      timeRange: String(time),
    });

    return res.json({ available: !exists });
  } catch (e) {
    console.error("GET /bookings/check error:", e);
    return res.status(200).json({ available: false });
  }
});

/* ---------- create booking (return & emit studentId) ---------- */
router.post("/", async (req, res) => {
  try {
    const { freelancerId, spaceType, dateISO, timeRange, space, date, time, notes } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      return res.status(400).json({ message: "Invalid freelancerId" });
    }

    const _space = String(spaceType || space || "").toLowerCase().trim();
    const _date = String(dateISO || date || "").trim();
    const _time = String(timeRange || time || "").trim();
    if (!_space || !_date || !_time) {
      return res.status(400).json({ message: "space/date/time are required" });
    }

    // pull studentId too (NO .lean())
    const freelancer = await Freelancer.findById(
      freelancerId,
      "fullName email studentId"
    );
    if (!freelancer)
      return res.status(404).json({ message: "Freelancer not found" });

    const booking = await Booking.create({
      freelancerId, // keep ObjectId in DB
      freelancerName: freelancer.fullName || "Unknown",
      freelancerEmail: freelancer.email,
      spaceType: _space,
      dateISO: _date,
      timeRange: _time,
      notes,
    });

    
    // refresh with NON-lean populate so the encryption plugin can decrypt
    const enrichedDoc = await Booking.findById(booking._id).populate({
      path: "freelancerId",
      select: "studentId",
      options: { lean: false }, // <-- critical
    });

    const enriched = enrichedDoc ? enrichedDoc.toObject() : booking.toObject();

    const payload = {
      ...enriched,
      // expose studentId under the same field name expected by the table
      freelancerId:
        enriched?.freelancerId?.studentId || String(booking.freelancerId),
    };

    // broadcast
    const io = req.app.get("io");
    if (io) io.emit("booking:created", payload);

    // -------------------- EMAILS + NOTIFICATIONS --------------------
    const frHtml = bookingConfirmedFreelancer({
      name: freelancer.fullName,
      space: _space,
      dateISO: _date,
      timeRange: _time,
      studentId: freelancer.studentId || freelancerId,
      notes,
    });
    const frText =
      `Hi ${freelancer.fullName},\n\n` +
      `Your ${_space} booking is confirmed.\n\n` +
      `• Date: ${_date}\n• Time: ${_time}\n• Freelancer ID: ${freelancer.studentId || freelancerId}\n` +
      `${notes ? `• Notes: ${notes}\n` : ""}\n\n— Team ctrlZ`;

    const clients = await getClientRecipients();

    const tasks = [
      mail({
        to: freelancer.email,
        subject: `Your ${_space} booking is confirmed`,
        text: frText,
        html: frHtml,
      }),
      sendNotification({
        userId: freelancer._id,
        userType: "freelancer",
        subject: "Booking confirmed",
        message: `Booked ${_space} on ${_date}, ${_time}.`,
        type: "booking",
        html: frHtml,
      }),
      ...clients.flatMap((c) => {
        const clHtml = bookingNewForClient({
          name: c.name || "Client",
          space: _space,
          dateISO: _date,
          timeRange: _time,
          freelancerName: freelancer.fullName,
          freelancerEmail: freelancer.email,
          studentId: freelancer.studentId || freelancerId,
          notes,
        });

        const clText =
          `A new booking has been made.\n\n` +
          `• Space: ${_space}\n• Date: ${_date}\n• Time: ${_time}\n` +
          `• Freelancer: ${freelancer.fullName}\n• Freelancer Email: ${freelancer.email}\n` +
          `• Freelancer ID: ${freelancer.studentId || freelancerId}\n` +
          `${notes ? `• Notes: ${notes}\n` : ""}\n\n— ctrlZ`;

        const arr = [];
        if (c.email)
          arr.push(
            mail({
              to: c.email,
              subject: `New space booking`,
              text: clText,
              html: clHtml,
            })
          );
        if (c._id) {
          arr.push(
            sendNotification({
              userId: c._id,
              userType: "client",
              subject: "New Booking",
              message: `Booked ${_space} on ${_date}, ${_time} by ${freelancer.fullName} (${
                freelancer.studentId || freelancerId
              }).`,
              type: "info",
              html: clHtml,
            })
          );
        }
        return arr;
      }),
    ];

    Promise.allSettled(tasks).then((rs) =>
      rs.forEach(
        (r, i) =>
          r.status === "rejected" &&
          console.error("Notification task failed:", i, r.reason)
      )
    );

     await logAction({
      userId: freelancerId,
      action: `Booked Space (${spaceType})`,
      meta: { dateISO, timeRange },
    });

    return res.status(201).json(payload);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "This slot is already booked." });
    }
    console.error("POST /api/bookings error:", err);
    return res.status(500).json({ message: "Failed to create booking" });
  }
});

/* ---------- list bookings (table shows studentId) ---------- */
router.get("/", async (req, res) => {
  try {
    const { q = "", spaceType, dateISO, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (spaceType) filter.spaceType = String(spaceType).toLowerCase();
    if (dateISO) filter.dateISO = String(dateISO);
    if (q) {
      filter.$or = [
        { freelancerName: { $regex: q, $options: "i" } },
        { freelancerEmail: { $regex: q, $options: "i" } },
      ];
    }

    const lim = Math.max(1, Math.min(500, Number(limit)));
    const pg = Math.max(1, Number(page));
    const skip = (pg - 1) * lim;

    // NO .lean() here, because we populate an encrypted model
    const docs = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate({
        path: "freelancerId",
        select: "studentId",
        options: { lean: false }, // important
      });

    const items = docs.map((d) => {
      const b = d.toObject();
      return {
        ...b,
        freelancerId:
          b.freelancerId && b.freelancerId.studentId
            ? b.freelancerId.studentId
            : String(b.freelancerId),
      };
    });

    const total = await Booking.countDocuments(filter);

    return res.json({ items, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return res.status(500).json({ message: "Failed to list bookings" });
  }
});

module.exports = router;
