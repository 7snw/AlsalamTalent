// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  progressPercentage: { type: Number, default: 0 },
  docs: [{ name: String, url: String }],
  submitted: { type: Boolean, default: false },
  feedback: { type: String },
  rating: { type: Number },
  status: {
    type: String,
    enum: ['Assigned', 'Submitted', 'Completed', 'Re-submit', 'Declined'],
    default: 'Assigned'
  },
  submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
