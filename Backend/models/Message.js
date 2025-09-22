// models/Message.js
const mongoose = require('mongoose');

// same plugin you’re using elsewhere (freelancers/projects)
const fieldEncryption = require('../utils/mongooseFieldEncryption');
const { encryptString, decryptString } = require('../utils/cryptoVault');

const messageSchema = new mongoose.Schema(
  {
    senderId:      { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole:    { type: String, enum: ['Freelancer', 'Client', 'Admin'], required: true },
    receiverRole:  { type: String, enum: ['Freelancer', 'Client', 'Admin'], required: true },

    // 🔐 encrypted at rest
    content:       { type: String, required: true },

    roomId:        { type: String, required: true },

    // We’ll encrypt attachment URLs, not names
    attachments:   [{ name: String, url: String }],

    timestamp:     { type: Date, default: Date.now }
  },
  { timestamps: false } // timestamp field already present as `timestamp`
);

// ---- Field encryption for the message body ----
messageSchema.plugin(fieldEncryption, {
  fields: ['content'], // plugin handles encrypt on write, decrypt on hydrate
});

// ---- Helpers to encrypt/decrypt attachment URLs (array of subdocs) ----
const safeDec = (b64) => { try { return decryptString(b64); } catch { return b64; } };
const encArr  = (arr) => Array.isArray(arr)
  ? arr.map(x => (x && x.url ? { ...x, url: encryptString(x.url) } : x))
  : arr;

const decArr  = (arr) => Array.isArray(arr)
  ? arr.map(x => (x && x.url ? { ...x, url: safeDec(x.url) } : x))
  : arr;

// Encrypt attachment URLs on writes/updates
messageSchema.pre(['save', 'findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const u = this.getUpdate ? this.getUpdate() : this;

  if (u.attachments)        u.attachments        = encArr(u.attachments);
  if (u.$set?.attachments)  u.$set.attachments   = encArr(u.$set.attachments);

  if (this.setUpdate) this.setUpdate(u);
  next();
});

// Decrypt attachment URLs after reads
function decDoc(doc) {
  if (!doc) return;
  doc.attachments = decArr(doc.attachments);
}
messageSchema.post('init', decDoc);
messageSchema.post('find', (docs) => docs.forEach(decDoc));
messageSchema.post('findOne', decDoc);

// ⭐ Important: also decrypt the in-memory doc right after save,
// so the API/socket can return plaintext immediately without a refetch.
messageSchema.post('save', function (doc, next) {
  try {
    decDoc(doc);
  } catch {}
  next();
});

module.exports = mongoose.model('Message', messageSchema);
