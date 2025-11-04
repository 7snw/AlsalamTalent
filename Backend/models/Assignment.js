const mongoose = require('mongoose');


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

    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'reviewed', 'declined', 'completed', 'submitted'],
      default: 'not_submitted',
    },
    
    docs: [StageFileSchema],
    feedback: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    terminal: { type: Boolean, default: false },


    stages: {
      initial: { type: StageSchema, default: () => ({}) },
      half: { type: StageSchema, default: () => ({}) },
      final: { type: StageSchema, default: () => ({}) },
    },

    progressPercentage: { type: Number, default: 0 },
    docs: [{ name: String, url: String }],       
    submitted: { type: Boolean, default: false },
    feedback: { type: String },                   
    rating: { type: Number },                 

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


function recomputeAggregate(a) {
  const s = a.stages || {};
  const ok = (x) => ['reviewed', 'completed'].includes(x);
  let done = 0;
  if (ok(s.initial?.status)) done += 1;
  if (ok(s.half?.status)) done += 1;
  if (ok(s.final?.status)) done += 1;

  a.progressPercentage = Math.round((done / 3) * 100);


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


  const lastFb =
    (s.final?.feedback || '').trim() ||
    (s.half?.feedback || '').trim() ||
    (s.initial?.feedback || '').trim();
  if (lastFb) a.feedback = lastFb;
}

assignmentSchema.pre('save', function (next) {
  recomputeAggregate(this);
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
