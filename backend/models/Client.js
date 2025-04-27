const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  occupation: String,
  phone: String,
  companyName: String,
  dateOfBirth: Date,
  role: { type: String, default: 'client' },
  createdByAdminId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
