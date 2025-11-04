const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const fieldEncryption = require('../utils/mongooseFieldEncryption');



const portfolioSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

  
    skills: { type: [String], default: [] },


    category: String,

    imageUrls: [String],


    collaborators: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
        fullName: String,
        email: String,
      },
    ],

 
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
    sourceOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
    createdAt:   { type: Date, default: Date.now },
  },
  { _id: true, _subdoc: true }
);

const projectSchema = new mongoose.Schema(
  {
    projectTitle:  String,
    projectStatus: { type: String, default: 'Assigned' },
    projectFiles:  { type: [String], default: [] },
    projectImage:  { type: String, default: '' },
    details:       String,
    assignedBy:    String,
  },
  { _id: true, _subdoc: true }
);


const freelancerSchema = new mongoose.Schema(
  {
    userType: String,

    studentId: { type: String, trim: true, index: true, unique: true, sparse: true },

   
    fullName: { type: String, trim: true },

  
    major: { type: String, trim: true },

  
    email:    { type: String, trim: true },          
    phone:    { type: String, trim: true },   
    cpr:      { type: String, trim: true },         
    dateOfBirth: { type: Date },                  
    iban:     { type: String, default: '' },         
    ibanLast4:{ type: String, index: true, sparse: true },  
    cvUrl:    { type: String, default: '' },

  
    emailHash: { type: String, index: true, unique: true, sparse: true },
    phoneHash: { type: String, index: true, sparse: true },
    cprHash:   { type: String, index: true, sparse: true },


    password:        String,
    emailVerified:   { type: Boolean, default: false },
    emailOtpHash:    { type: String, select: false },
    emailOtpExpiresAt: { type: Date },

    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    rating:     { type: Number, default: 0 },


    expertise:       [String],
    bio:             String,
    skills:          [String],
    profileImageUrl: { type: String },


    portfolio: [portfolioSchema],
    projects:  [projectSchema],

  
    savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    applications: [{
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      status: { type: String, enum: ['Under Review', 'Assigned', 'Cancelled', 'Submitted'], default: 'Pending' }
    }],

    role: { type: String, default: 'freelancer' },

 
    otpHash:    { type: String, select: false, default: null },
    otpExpires: { type: Date,   select: false, default: null },

   
    lastPasswordChange: { type: Date, default: Date.now }, 
    passwordHistory: [{ type: String }],  
    
    resetOtp: { type: String, select: false },
resetOtpExpiry: { type: Date },

  },

  
  { timestamps: true, strict: true }
);

freelancerSchema.pre('save', async function (next) {
  try {
 
    if (this.isModified('password') && this.password) {
      const newPassword = String(this.password).trim();
      const newHash = await bcrypt.hash(newPassword, 10);

      if (Array.isArray(this.passwordHistory)) {
    
        if (!this.passwordHistory.includes(newHash)) {
          this.passwordHistory.unshift(newHash);
        }
      } else {
        this.passwordHistory = [newHash];
      }

  
      this.passwordHistory = this.passwordHistory.slice(0, 13);

      this.lastPasswordChange = Date.now();

      this.password = newHash;
    }


    if (this.isModified('iban') && typeof this.iban === 'string') {
      const clean = this.iban.replace(/\s+/g, '').toUpperCase();
      this.iban = clean;
      this.ibanLast4 = clean ? clean.slice(-4) : undefined;
    }
    if (this.isModified('email') && this.email) {
      this.email = String(this.email).trim().toLowerCase();
    }
    if (this.isModified('phone') && this.phone) {
      this.phone = String(this.phone).replace(/\s+/g, '').trim();
    }
    if (this.isModified('studentId') && this.studentId) {
      this.studentId = String(this.studentId).trim();
    }
    if (this.isModified('cpr') && this.cpr) {
      this.cpr = String(this.cpr).replace(/\s+/g, '').trim();
    }

    

    next();
  } catch (err) {
    next(err);
  }
});

freelancerSchema.plugin(fieldEncryption, {
  fields: ['cpr', 'fullName', 'dateOfBirth', 'phone', 'email', 'iban'],
  hashedFields: {
    emailHash: 'email',
    phoneHash: 'phone',
    cprHash:   'cpr',
  },
  dateAsISO: ['dateOfBirth'],
});



const transform = (_doc, ret) => {
  delete ret.password;
  delete ret.otpHash;
  delete ret.otpExpires;
  delete ret.emailOtpHash;
  delete ret.emailOtpExpiresAt;

  delete ret.emailHash;
  delete ret.phoneHash;
  delete ret.cprHash;
  return ret;
};
freelancerSchema.set('toObject', { transform, virtuals: true });
freelancerSchema.set('toJSON',   { transform, virtuals: true });



const FreelancerModel = mongoose.model('Freelancer', freelancerSchema);
module.exports = FreelancerModel;
module.exports.Freelancer = FreelancerModel;
