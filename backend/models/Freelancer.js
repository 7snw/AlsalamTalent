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
  dateOfBirth: { type: Date },
  profileImageUrl: { type: String },
  portfolio: [
    {
      title: String,
      description: String,
      imageUrl: String,
      type: String
    }
  ],
  projects: [
    {
      projectTitle: String,
      projectStatus: String,
      projectFiles: [String],
      projectImage: String
    }
  ],
  savedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  applications: [
    {
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Canceled'],
        default: 'Pending'
      }
    }
  ],
  role: { type: String, default: 'freelancer' }
}, { timestamps: true });

module.exports = mongoose.model('Freelancer', freelancerSchema);
