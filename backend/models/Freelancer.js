const mongoose = require('mongoose');

const freelancerSchema = new mongoose.Schema({
  userType: String,
  studentId: String,
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  major: String,
  phone: String,
  rating: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
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
      category: String
    }
  ],
  projects: [
    {
      projectTitle: String,
      projectStatus: { type: String, default: 'Assigned' },
      projectFiles: { type: [String], default: [] },
      projectImage: { type: String, default: '' }
    }
  ],
  savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  applications: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      status: { type: String, enum: ['Under Review', 'Assigned', 'Cancelled', 'Submitted'], default: 'Pending' }
    }
  ],
  role: { type: String, default: 'freelancer' }
}, { timestamps: true });

module.exports = mongoose.model('Freelancer', freelancerSchema);
