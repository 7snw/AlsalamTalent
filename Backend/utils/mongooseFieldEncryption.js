// utils/mongooseFieldEncryption.js
const { encryptString, decryptString, lookupHash } = require('./cryptoVault');

module.exports = function fieldEncryptionPlugin(schema, opts) {
  const {
    fields = [],             // ['email','phone',...]
    hashedFields = {},       // { emailHash: 'email', phoneHash: 'phone' }
    dateAsISO = []           // fields that are Date but should be encrypted as ISO string
  } = opts || {};

  const needsISO = new Set(dateAsISO);

  // prepare shadow hash paths & indexes if not present
  for (const [hashField, sourceField] of Object.entries(hashedFields)) {
    if (!schema.path(hashField)) schema.add({ [hashField]: { type: String, index: true, unique: hashField.toLowerCase().includes('email') } });
  }

  // helper: take a POJO and encrypt in-place
  function encryptDoc(obj) {
    if (!obj) return;
    for (const f of fields) {
      if (obj[f] == null || obj[f] === '') continue;
      const raw = needsISO.has(f) ? new Date(obj[f]).toISOString() : String(obj[f]);
      obj[f] = encryptString(raw);
    }
    for (const [hashField, sourceField] of Object.entries(hashedFields)) {
      const v = obj[sourceField];
      obj[hashField] = v ? lookupHash(v) : undefined;
    }
  }

  // helper: decrypt paths on a hydrated document (not mutating _doc persisted values)
  function decryptDoc(doc) {
    if (!doc) return;
    for (const f of fields) {
      const blob = doc.get(f);
      if (!blob) continue;
      try {
        const plain = decryptString(blob);
        doc.set(f, needsISO.has(f) ? new Date(plain) : plain, { strict: false });
      } catch { /* leave as-is if tampered */ }
    }
  }

  // On new/save
  schema.pre('save', function(next) {
    // compute lookup hashes BEFORE encrypting
    for (const [hashField, sourceField] of Object.entries(hashedFields)) {
      if (this.isModified(sourceField)) {
        const v = this.get(sourceField);
        this.set(hashField, v ? lookupHash(v) : undefined);
      }
    }

    for (const f of fields) {
      if (this.isModified(f)) {
        const v = this.get(f);
        if (v == null || v === '') continue;
        const plain = needsISO.has(f) ? new Date(v).toISOString() : String(v);
        this.set(f, encryptString(plain));
      }
    }
    next();
  });

  // On findOneAndUpdate / updateOne
  schema.pre(['findOneAndUpdate','updateOne','updateMany'], function(next) {
    const u = this.getUpdate() || {};
    const $set = u.$set || u;
    // hashes
    for (const [hashField, sourceField] of Object.entries(hashedFields)) {
      if ($set[sourceField] != null) $set[hashField] = lookupHash($set[sourceField]);
    }
    // fields
    for (const f of fields) {
      if ($set[f] != null) {
        const v = $set[f];
        const plain = needsISO.has(f) ? new Date(v).toISOString() : String(v);
        $set[f] = encryptString(plain);
      }
    }
    if (u.$set) this.setUpdate({ ...u, $set });
    else this.setUpdate($set);
    next();
  });

  // Decrypt after query hydration
  schema.post('init', decryptDoc);
  schema.post('find', docs => docs.forEach(decryptDoc));
  schema.post('findOne', decryptDoc);

  // Make sure JSON/Objects expose decrypted values
  const addGetters = { getters: true, virtuals: true };
  schema.set('toJSON',  { ...(schema.get('toJSON')  || {}), ...addGetters });
  schema.set('toObject',{ ...(schema.get('toObject')|| {}), ...addGetters });
};
