// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  status: {
    type: String,
    enum: ['Under Review', 'Assigned', 'Cancelled'],
    default: 'Under Review'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  paymentInfo: {
    subject: String,
    iban: String,
    accountNumber: String,
    description: String,
    amount: String,
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
