const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  progressPercentage: { type: Number, default: 0 },
  files: [{ name: String, url: String }],
  submitted: { type: Boolean, default: false },
  feedback: { type: String },
  rating: { type: Number },
  status: { type: String, enum: ['In Progress', 'Submitted', 'Approved', 'Revision Needed', 'Rejected'], default: 'In Progress' },
  submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
