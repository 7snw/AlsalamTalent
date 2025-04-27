const mongoose = require('mongoose');

const freelancerSchema = new mongoose.Schema({
  userType: String, // student or graduate
  studentId: String,
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  major: String,
  phone: String,
  expertise: [String],
  cprImageUrl: { type: String, required: function () { return this.userType === 'graduate'; } },
  bio: String,
  skills: [String],
  specialties: [String],
  dateOfBirth: Date, // 📅 (already added correctly!)
  profileImageUrl: { type: String }, // 🌟 NEW FIELD (Profile Picture URL/Base64)
  portfolio: [
    {
      title: String,
      description: String,
      imageUrl: String,
      fileUrl: String,
      type: String
    }
  ],
  role: { type: String, default: 'freelancer' }
}, { timestamps: true });

module.exports = mongoose.model('Freelancer', freelancerSchema);
