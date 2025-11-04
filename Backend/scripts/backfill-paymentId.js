// scripts/backfill-paymentId.js
require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

function pad(n, w=4) { return String(n).padStart(w, '0'); }

function ymd(dt) {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Get all docs missing a paymentId, ordered by createdAt
    const docs = await Payment.find({ $or: [{ paymentId: { $exists: false } }, { paymentId: '' }, { paymentId: null }] })
      .sort({ createdAt: 1 });

    if (!docs.length) {
      console.log('No payments need backfilling.');
      return process.exit(0);
    }

    // Build per-day counters so numbering is stable within each day
    const counters = new Map(); // key: yyyymmdd, value: current max index

    // First, find the current max per day from existing docs that DO have paymentId
    const existing = await Payment.find({ paymentId: { $exists: true, $ne: '' } }, { paymentId: 1, createdAt: 1 }).lean();
    for (const p of existing) {
      const key = ymd(new Date(p.createdAt));
      const m = String(p.paymentId || '').match(/PAY-(\d{8})-(\d{4})/);
      if (m && m[1] === key) {
        const idx = parseInt(m[2], 10);
        counters.set(key, Math.max(counters.get(key) || 0, idx));
      }
    }

    let updated = 0;
    for (const doc of docs) {
      const key = ymd(new Date(doc.createdAt || doc.date || new Date()));
      const next = (counters.get(key) || 0) + 1;
      counters.set(key, next);
      doc.paymentId = `PAY-${key}-${pad(next, 4)}`;
      await doc.save();
      updated++;
    }

    console.log(`Backfilled ${updated} paymentId values.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
