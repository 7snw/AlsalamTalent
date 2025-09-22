// scripts/reencrypt-freelancers.js
require('dotenv').config();              // if you use a .env
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ctrlz';
const { Freelancer } = require('../models/Freelancer'); // uses your plugin

// fields your plugin encrypts on Freelancer
const FIELDS = ['cpr', 'fullName', 'dateOfBirth', 'phone', 'email', 'iban'];

(async () => {
  try {
    await mongoose.connect(uri, { autoIndex: false });
    console.log('Connected. Scanning freelancers…');

    const docs = await Freelancer.find({}); // decrypted in-memory (no .lean())
    console.log(`Found ${docs.length} freelancer docs`);

    let done = 0;
    for (const d of docs) {
      // Push plaintext back through an update so the plugin encrypts $set
      const $set = {};
      for (const f of FIELDS) $set[f] = d[f] ?? undefined;
      await Freelancer.updateOne({ _id: d._id }, { $set });
      if (++done % 50 === 0) console.log(`Updated ${done}/${docs.length}`);
    }

    console.log(`Done. Updated ${done} docs.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Re-encrypt error:', err);
    process.exit(1);
  }
})();
