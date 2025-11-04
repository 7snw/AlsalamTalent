
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

  
    projectType: {
      type: String,
      enum: ['project', 'campaign'],
      default: 'project',
      index: true,
    },

 
    skills: { type: [String], default: [] },


    budget: { type: Number, required: true },

    duration: {
      from: { type: Date },
      to: { type: Date },
    },

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
