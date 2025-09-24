// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },

    brief: { type: String, required: true },
    category: { type: String, required: true },

    //  NEW: project type (project | campaign)
    projectType: {
      type: String,
      enum: ['project', 'campaign'],
      default: 'project',
      index: true,
    },

    //  Skills/tags
    skills: { type: [String], default: [] },

    // Reward amount
    budget: { type: Number, required: true },

    // Legacy (kept so old code doesn’t break). We populate from initial/half.
    duration: {
      from: { type: Date },
      to: { type: Date },
    },

    // Three-stage deadlines
    deadlines: {
      initial: { type: Date, required: true },
      half: { type: Date, required: true },
      final: { type: Date, required: true },
    },

    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
    },

    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },

    imageUrl: { type: String },
    files: [{ name: String, url: String }],
    docs: [{ name: String, url: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
