const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

  title: { type: String, required: true },
  description: { type: String },

  skills: { type: [String], default: [] },

 
  category: { type: String },


  imageUrls: { type: [String], default: [] },

 
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
