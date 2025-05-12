const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Hash password before saving
clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Client', clientSchema);
