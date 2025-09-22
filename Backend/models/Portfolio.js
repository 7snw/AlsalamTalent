// models/Portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

  title: { type: String, required: true },
  description: { type: String },

  // NEW: skills/types (preferred going forward)
  skills: { type: [String], default: [] },

  // (Legacy) category – kept only so old records still read fine
  category: { type: String },

  // support multiple images
  imageUrls: { type: [String], default: [] },

  // optional if you keep collaborators in the popup
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
