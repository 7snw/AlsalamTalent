const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');


const fieldEncryption = require('../utils/mongooseFieldEncryption');
const { lookupHash }  = require('../utils/cryptoVault');

const clientSchema = new mongoose.Schema(
  {
   
    fullName: { type: String, trim: true },       
    email:    { type: String, trim: true },       
    phone:    { type: String, trim: true },      
    dateOfBirth: { type: Date },               
    occupation:  { type: String, trim: true, default: '' },
    companyName: { type: String, trim: true, default: '' },

  
    emailHash: { type: String, index: true, unique: true, sparse: true },
    phoneHash: { type: String, index: true, sparse: true },

  
    password: { type: String, default: '' },
    role:     { type: String, default: 'client' },

 
    createdByAdminId: { type: mongoose.Schema.Types.ObjectId },

   
    pwResetOtpHash:   { type: String, select: false },
    pwResetExpiresAt: { type: Date,   select: false },
    mfaSecret: { type: String, select: false },
mfaEnabled: { type: Boolean, default: false },
encryptedFields: ["email", "phone", "iban", "mfaSecret"]


  },
  { timestamps: true, strict: true }
);


clientSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(String(this.password).trim(), 10);
  }
  if (this.isModified('email') && this.email) {
    this.email = String(this.email).trim().toLowerCase();
  }
  if (this.isModified('phone') && this.phone) {
    this.phone = String(this.phone).replace(/\s+/g, '').trim();
  }
  next();
});


clientSchema.plugin(fieldEncryption, {
  fields: ['fullName', 'email', 'phone', 'dateOfBirth'],
  hashedFields: {
    emailHash: 'email',
    phoneHash: 'phone',
  },
  dateAsISO: ['dateOfBirth'],
});


const transform = (_doc, ret) => {
  delete ret.password;
  delete ret.pwResetOtpHash;
  delete ret.pwResetExpiresAt;
  delete ret.emailHash;
  delete ret.phoneHash;
  return ret;
};
clientSchema.set('toObject', { transform, virtuals: true });
clientSchema.set('toJSON',   { transform, virtuals: true });

module.exports = mongoose.model('Client', clientSchema);
