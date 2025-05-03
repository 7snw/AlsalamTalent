const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  imageUrl: { type: String }, // Path to the image (URL for the image)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
