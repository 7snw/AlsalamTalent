const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project',    required: true },

    projectTitle:   String,
    freelancerName: String,

    iban:     String,
    amount:   { type: Number, default: 0 },
    currency: { type: String, default: 'BHD' },
    method:   { type: String, default: 'Bank Transfer' },

    // Lifecycle
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Cancelled'],
      default: 'Pending',
    },

    // Nice-to-have metadata shown in UI
    paymentId:   String,          // e.g., PAY-20250829-0001
    date:        { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate a short sequential ID per day
paymentSchema.pre('save', async function (next) {
  if (this.paymentId) return next();

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');

  const start = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  const end   = new Date(`${y}-${m}-${d}T23:59:59.999Z`);
  const countToday = await mongoose.model('Payment').countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  this.paymentId = `PAY-${y}${m}${d}-${String(countToday + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
