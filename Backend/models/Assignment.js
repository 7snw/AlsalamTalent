// models/Assignment.js
const mongoose = require('mongoose');

// ---------- Sub-schemas ----------
const StageFileSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StageSchema = new mongoose.Schema(
  {
    // not_submitted (default), pending (submitted & waiting),
    // reviewed (approved for this stage), declined (needs revision),
    // completed (final approved)
    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'reviewed', 'declined', 'completed', 'submitted'],
      default: 'not_submitted',
    },
    
    docs: [StageFileSchema],
    feedback: { type: String, default: '' },
    // only used on the "final" stage
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

// ---------- Main schema ----------
const assignmentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
 // If true, this assignment is closed (no further uploads/submissions)
    terminal: { type: Boolean, default: false },

    // New 3-stage structure
    stages: {
      initial: { type: StageSchema, default: () => ({}) },
      half: { type: StageSchema, default: () => ({}) },
      final: { type: StageSchema, default: () => ({}) },
    },

    // Aggregate/legacy fields (kept for compatibility)
    progressPercentage: { type: Number, default: 0 },
    docs: [{ name: String, url: String }],        // legacy, not used by new UI
    submitted: { type: Boolean, default: false }, // legacy
    feedback: { type: String },                   // last feedback copy for convenience
    rating: { type: Number },                     // copy of final.rating for convenience

    status: {
      type: String,
      enum: [
        'Assigned',
        'Submitted',
        'Re-submitted',
        'Requested Revision',
        'Completed',
        'Declined',
      ],
      default: 'Assigned',
    },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

// ---------- Helpers ----------
function recomputeAggregate(a) {
  const s = a.stages || {};
  const ok = (x) => ['reviewed', 'completed'].includes(x);
  let done = 0;
  if (ok(s.initial?.status)) done += 1;
  if (ok(s.half?.status)) done += 1;
  if (ok(s.final?.status)) done += 1;

  a.progressPercentage = Math.round((done / 3) * 100);

  // Don't override explicit flow states
  const locked = ['Requested Revision', 'Re-submitted', 'Declined'].includes(a.status);

  if (!locked) {
    if (s.final?.status === 'completed') {
      a.status = 'Completed';
    } else if (
      ['pending', 'submitted'].includes(s.initial?.status) ||
      ['pending', 'submitted'].includes(s.half?.status) ||
      ['pending', 'submitted'].includes(s.final?.status)
    ) {
      if (a.status !== 'Re-submitted') a.status = 'Submitted';
    } else {
      a.status = 'Assigned';
    }
  }

  if (typeof s.final?.rating === 'number') a.rating = s.final.rating;

  // copy the most recent non-empty feedback to top-level (final > half > initial)
  const lastFb =
    (s.final?.feedback || '').trim() ||
    (s.half?.feedback || '').trim() ||
    (s.initial?.feedback || '').trim();
  if (lastFb) a.feedback = lastFb;
}

// keep aggregates fresh whenever we save the doc directly
assignmentSchema.pre('save', function (next) {
  recomputeAggregate(this);
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
