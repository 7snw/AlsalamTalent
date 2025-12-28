// scripts/encrypt-existing-payments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const cursor = Payment.find({}).cursor();

    let count = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      // Heuristic: if amount is a number and iban looks like raw IBAN, just re-save.
      const looksPlainIban = /^[A-Z]{2}\d{2}[A-Z0-9]{10,}$/.test((doc.iban || '').replace(/\s+/g, ''));
      const needsResave = looksPlainIban || typeof doc.amount === 'number';

      if (needsResave) {
        // reassign to trigger setters; plugin will encrypt on save
        if (doc.iban) doc.iban = String(doc.iban);
        if (typeof doc.amount === 'number') doc.amount = Number(doc.amount);
        if (doc.currency) doc.currency = String(doc.currency);
        if (doc.method) doc.method = String(doc.method);

        await doc.save();
        count++;
      }
    }
    console.log(`Re-saved ${count} payments with encryption.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
