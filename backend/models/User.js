const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: String,
  name: String,
  email: String,
  password: String,
  student_id: String,
  major: String,
  phone_number: String,
  cpr_number: String,
  cpr_image: String,
  date_of_birth: Date,
  company_name: String,
  profile_image_url: String,
  bio: String,
  skills: [String],
  specialties: [String],
  rating: Number,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
