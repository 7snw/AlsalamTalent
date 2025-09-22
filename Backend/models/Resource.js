// models/Resource.js
const mongoose = require('mongoose');

const SECTION_ENUM = ['platform', 'resources', 'bank']; 
// platform = Platform Tutorial (optional future use)
// resources = Freelancers Resources
// bank = AlSalam Bank Guidelines

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    section: { type: String, enum: SECTION_ENUM, required: true, index: true },

    description: { type: String, default: '' },

    // Optional link (YouTube, PDF on CDN, Notion, etc.)
    externalUrl: { type: String, default: '' },

    // Optional display ordering (lower first)
    order: { type: Number, default: 0, index: true },

    // Optional thumbnail/cover
    imageUrl: { type: String, default: '' },

    // Optional attachments (kept consistent with Projects)
    files: [{ name: String, url: String }],
    docs: [{ name: String, url: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
module.exports.SECTION_ENUM = SECTION_ENUM;
