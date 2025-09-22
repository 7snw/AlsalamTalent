// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  files: [{ name: String, url: String }],
  comment: { type: String },
  submittedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Approved', 'Declined'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
