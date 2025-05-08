const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  occupation: String,
  phone: String,
  companyName: String,
  dateOfBirth: Date,
  role: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema, 'admin'); 

