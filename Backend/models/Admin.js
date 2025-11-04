const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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


adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Admin', adminSchema, 'admin');
