// models/Payment.js
const mongoose = require('mongoose');
const fieldEncryption = require('../utils/mongooseFieldEncryption');

// ---------- helpers ----------
function pad4(n) { return String(n).padStart(4, '0'); }
function ymdUTC(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return { y, m, day, key: `${y}${m}${day}` };
}
function dayRangeUTC(d) {
  const { y, m, day } = ymdUTC(d);
  return {
    start: new Date(`${y}-${m}-${day}T00:00:00.000Z`),
    end:   new Date(`${y}-${m}-${day}T23:59:59.999Z`),
    key:   `${y}${m}${day}`,
  };
}

// ---------- schema ----------
const paymentSchema = new mongoose.Schema(
  {
    clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project',    required: true },

    projectTitle:   String,
    freelancerName: String,

    // encrypted-at-rest (stored as base64 strings)
    iban:     { type: String, default: '' },
    amount:   { type: String, default: '0' },                 // ciphertext is text, keep as String
    currency: { type: String, default: 'BHD' },
    method:   { type: String, default: 'Bank Transfer' },

    // deterministic hash for exact-match lookups on IBAN (not returned by default)
    ibanHash: { type: String, index: true, select: false },

    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Cancelled'],
      default: 'Pending',
    },

    paymentId:   { type: String, index: true, unique: true, sparse: true },
    date:        { type: Date, default: Date.now },           // display date (can differ from createdAt)
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// ---------- indexes you may find useful ----------
paymentSchema.index({ clientId: 1, createdAt: -1 });
paymentSchema.index({ freelancerId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// ---------- human-readable paymentId generation ----------
// Runs for create/save
paymentSchema.pre('save', async function generatePaymentId(next) {
  try {
    if (this.paymentId) return next();

    const now = new Date();
    const { start, end, key } = dayRangeUTC(now);

    // Count how many payments already exist today to get the next sequence
    const countToday = await mongoose.model('Payment').countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    this.paymentId = `PAY-${key}-${pad4(countToday + 1)}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Also guard batch inserts (insertMany does NOT run 'save' middleware)
paymentSchema.pre('insertMany', async function (next, docs) {
  try {
    if (!Array.isArray(docs) || docs.length === 0) return next();

    const now = new Date();
    const { start, end, key } = dayRangeUTC(now);

    // Start from current count in DB
    let counter = await mongoose.model('Payment').countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    for (const d of docs) {
      if (!d.paymentId) {
        counter += 1;
        d.paymentId = `PAY-${key}-${pad4(counter)}`;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// ---------- encryption plugin ----------
paymentSchema.plugin(fieldEncryption, {
  fields: ['iban', 'amount', 'currency', 'method'],
  // plugin expects "hashedFields" mapping: { hashField : sourceField }
  hashedFields: { ibanHash: 'iban' },
});

// ---------- export ----------
module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
