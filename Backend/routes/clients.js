
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');

const Client  = require('../models/Client');
const logAction = require('../utils/logAction');
const { lookupHash } = require('../utils/cryptoVault');
const sendEmail = require('../utils/sendEmail');
const { verificationCode } = require('../utils/emailTemplates');


const normEmail = (v='') => String(v).trim().toLowerCase();
const normPhone = (v='') => String(v).replace(/\s+/g, '').trim();

function parseDOB(input) {
  if (!input) return undefined;
  const s = String(input).trim();
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00Z`);
  const m = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  }
  return undefined;
}

/* ---------------- Admin registers a new client ---------------- */
router.post('/register', async (req, res) => {
  try {
    const { authorId, ...clientData } = req.body;
    const email = normEmail(clientData.email || '');
    const phone = normPhone(clientData.phone || '');

    const dup = await Client.findOne({
      $or: [
        email ? { emailHash: lookupHash(email) } : null,
        phone ? { phoneHash: lookupHash(phone) } : null
      ].filter(Boolean)
    });
    if (dup) return res.status(400).json({ message: 'Email or phone already exists.' });

    const newClient = await Client.create({
      ...clientData,
      email,
      phone,
      dateOfBirth: parseDOB(clientData.dateOfBirth),
      role: 'client',
    });

    if (authorId) {
      await logAction({
        userId: authorId,
        action: 'Added New Client',
        details: `Client: ${newClient.fullName || newClient._id}`
      });
    }

    res.status(201).json(newClient);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Email or phone already exists.' });
    }
    res.status(500).json({ message: 'Client registration failed', error: err.message || err });
  }
});

/* ---------------- Get all clients (no .lean so fields decrypt) ---------------- */
router.get('/', async (_req, res) => {
  try {
    const clients = await Client.find({});
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Fetching clients failed', error: err.message || err });
  }
});

/* ---------------- Get client by ID ---------------- */
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ message: 'Fetching client failed', error: err.message || err });
  }
});

/* ---------------- Update client profile ---------------- */
/* ---------------- Update client profile ---------------- */
router.put('/:id', async (req, res) => {
  try {
    const { authorId, ...updates } = req.body;

    if (typeof updates.email === 'string') updates.email = normEmail(updates.email);
    if (typeof updates.phone === 'string') updates.phone = normPhone(updates.phone);

    const set = {};
    const add = (k, v) => { if (v !== undefined) set[k] = v; };

    add('fullName',    updates.fullName);
    add('email',       updates.email);
    add('occupation',  updates.occupation);
    add('phone',       updates.phone);
    add('companyName', updates.companyName);

    if (updates.dateOfBirth !== undefined) {
      add('dateOfBirth', updates.dateOfBirth === '' ? undefined : parseDOB(updates.dateOfBirth));
    }

    // ✅ Recompute deterministic hashes when using findByIdAndUpdate
    if ('email' in set) {
      set.emailHash = set.email ? lookupHash(set.email) : undefined;
    }
    if ('phone' in set) {
      set.phoneHash = set.phone ? lookupHash(set.phone) : undefined;
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: set },
      { new: true, runValidators: true }
    );

    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });

    if (authorId) {
      await logAction({
        userId: authorId,
        action: 'Edited Client Profile',
        details: `Client: ${updatedClient.fullName || updatedClient._id}`
      });
    }

    res.status(200).json(updatedClient);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Email or phone already exists.' });
    }
    res.status(500).json({ message: 'Updating client failed', error: err.message || err });
  }
});


/* ---------------- Change password (authenticated flow) ---------------- */
router.put('/changepassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const ok = await bcrypt.compare(String(oldPassword || ''), client.password || '');
    if (!ok) return res.status(400).json({ message: 'Old password is incorrect' });

    client.password = String(newPassword || '').trim();
    await client.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message || err });
  }
});

module.exports = router;
