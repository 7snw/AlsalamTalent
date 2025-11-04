
const mongoose = require('mongoose');

const SECTION_ENUM = ['platform', 'resources', 'bank']; 


const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    section: { type: String, enum: SECTION_ENUM, required: true, index: true },

    description: { type: String, default: '' },

   
    externalUrl: { type: String, default: '' },

    order: { type: Number, default: 0, index: true },

  
    imageUrl: { type: String, default: '' },

 
    files: [{ name: String, url: String }],
    docs: [{ name: String, url: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
module.exports.SECTION_ENUM = SECTION_ENUM;
