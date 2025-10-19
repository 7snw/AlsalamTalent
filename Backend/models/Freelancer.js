// models/Freelancer.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

//  field-encryption plugin
const fieldEncryption = require('../utils/mongooseFieldEncryption');

/* ------------------------------------------------------------------ */
/* Subdocs                                                            */
/* ------------------------------------------------------------------ */

const portfolioSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    // NEW: preferred going forward
    skills: { type: [String], default: [] },

    // Legacy (kept so old entries still render)
    category: String,

    imageUrls: [String],

    // collaborators stored inline for fast render
    collaborators: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
        fullName: String,
        email: String,
      },
    ],

    // ownership / mirroring
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

/* ------------------------------------------------------------------ */
/* Main schema                                                        */
/* ------------------------------------------------------------------ */

const freelancerSchema = new mongoose.Schema(
  {
    userType: String,

    // Keep studentId plain (operational ID)
    studentId: { type: String, trim: true, index: true, unique: true, sparse: true },

    // These will be ENCRYPTED at rest; keep non-unique on plaintext columns
    fullName: { type: String, trim: true },

    // added: major (kept plain)
    major: { type: String, trim: true },

    // IMPORTANT: do NOT put `lowercase: true` on encrypted fields
    email:    { type: String, trim: true },          // encrypted; unique via emailHash
    phone:    { type: String, trim: true },          // encrypted; searchable via phoneHash
    cpr:      { type: String, trim: true },          // encrypted; searchable via cprHash
    dateOfBirth: { type: Date },                     // encrypted as ISO string
    iban:     { type: String, default: '' },         // encrypted; keep last4 separately
    ibanLast4:{ type: String, index: true, sparse: true },   // helper for ops (not sensitive)
    cvUrl:    { type: String, default: '' },

    // Shadow lookup hashes (deterministic, non-reversible)
    emailHash: { type: String, index: true, unique: true, sparse: true },
    phoneHash: { type: String, index: true, sparse: true },
    cprHash:   { type: String, index: true, sparse: true },

    // Auth / flags
    password:        String,
    emailVerified:   { type: Boolean, default: false },
    emailOtpHash:    { type: String, select: false },
    emailOtpExpiresAt: { type: Date },

    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    rating:     { type: Number, default: 0 },

    // Profile
    expertise:       [String],
    bio:             String,
    skills:          [String],
    profileImageUrl: { type: String },

    // Collections
    portfolio: [portfolioSchema],
    projects:  [projectSchema],

    // Relations
    savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    applications: [{
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      status: { type: String, enum: ['Under Review', 'Assigned', 'Cancelled', 'Submitted'], default: 'Pending' }
    }],

    role: { type: String, default: 'freelancer' },

    // OTP for sign-up (kept)
    otpHash:    { type: String, select: false, default: null },
    otpExpires: { type: Date,   select: false, default: null },

    // --- Security Policy Fields (Al Salam Bank InfoSec) ---
    lastPasswordChange: { type: Date, default: Date.now },      // 4.4 expiry
    passwordHistory: [{ type: String }],  
    
    resetOtp: { type: String, select: false },
resetOtpExpiry: { type: Date },
// 4.6 reuse check (keep last 13)
  },
  { timestamps: true, strict: true }
);

/* ------------------------------------------------------------------ */
/* Normalizers & password hashing                                     */
/* ------------------------------------------------------------------ */
freelancerSchema.pre('save', async function (next) {
  try {
    // --- Password hashing ---
    if (this.isModified('password') && this.password) {
      const newPassword = String(this.password).trim();
      const newHash = await bcrypt.hash(newPassword, 10);

      // Load password history (on current doc)
      if (Array.isArray(this.passwordHistory)) {
        // Prevent duplicates if same hash somehow re-hashed
        if (!this.passwordHistory.includes(newHash)) {
          this.passwordHistory.unshift(newHash);
        }
      } else {
        this.passwordHistory = [newHash];
      }

      // Limit to last 13
      this.passwordHistory = this.passwordHistory.slice(0, 13);

      // Update last change timestamp
      this.lastPasswordChange = Date.now();

      // Replace plaintext with bcrypt hash
      this.password = newHash;
    }

    // --- Normalizations ---
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

/* ------------------------------------------------------------------ */
/* Field-level encryption + deterministic lookup hashes               */
/* ------------------------------------------------------------------ */

freelancerSchema.plugin(fieldEncryption, {
  fields: ['cpr', 'fullName', 'dateOfBirth', 'phone', 'email', 'iban'],
  hashedFields: {
    emailHash: 'email',
    phoneHash: 'phone',
    cprHash:   'cpr',
  },
  dateAsISO: ['dateOfBirth'],
});

/* ------------------------------------------------------------------ */
/* Hide secrets in JSON                                               */
/* ------------------------------------------------------------------ */

const transform = (_doc, ret) => {
  delete ret.password;
  delete ret.otpHash;
  delete ret.otpExpires;
  delete ret.emailOtpHash;
  delete ret.emailOtpExpiresAt;
  // hashes are internal-only
  delete ret.emailHash;
  delete ret.phoneHash;
  delete ret.cprHash;
  return ret;
};
freelancerSchema.set('toObject', { transform, virtuals: true });
freelancerSchema.set('toJSON',   { transform, virtuals: true });

/* ------------------------------------------------------------------ */

const FreelancerModel = mongoose.model('Freelancer', freelancerSchema);
module.exports = FreelancerModel;
module.exports.Freelancer = FreelancerModel;
