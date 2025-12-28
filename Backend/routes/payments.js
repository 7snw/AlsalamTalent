// routes/payments.js
const express = require('express');
const router = express.Router();

const logAction   = require('../utils/logAction');
const Payment     = require('../models/Payment');
const Freelancer  = require('../models/Freelancer');
const Client      = require('../models/Client');
const sendEmail   = require('../utils/sendEmail');
const { paymentApproved, invoiceForClient } = require('../utils/emailTemplates');

let Notification, sendNotification;
try { Notification = require('../models/Notification'); } catch { /* noop */ }
try { ({ sendNotification } = require('../utils/sendNotification')); } catch { sendNotification = async () => {}; }

router.use(express.json());

// -------- helpers --------
const maskIban = (iban = '') => {
  const s = String(iban).replace(/\s+/g, '');
  if (!s) return '—';
  return s.length <= 8 ? '****' : `${s.slice(0,4)} **** **** ${s.slice(-4)}`;
};

const normalizeStatusForUI = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'pending') return 'Pending';
  if (s === 'failed' || s === 'cancelled') return 'Pending';
  if (s === 'processing' || s === 'paid' || s === 'completed') return 'Completed';
  return 'Pending';
};

// Redact sensitive fields from logs
router.use((req, _res, next) => {
  const safeBody = { ...(req.body || {}) };
  if (safeBody.iban) safeBody.iban = '***REDACTED***';
  console.log('[payments]', req.method, req.originalUrl);
  if (req.method !== 'GET') console.log('[payments] body:', safeBody);
  next();
});

// -------- CORS preflight (optional) --------
router.options('/record', (_req, res) => res.sendStatus(204));

// -------- Create / Record payment --------
router.post('/record', async (req, res) => {
  try {
    const {
      clientId,
      freelancerId,
      assignmentId,
      projectId,
      projectTitle,
      freelancerName,
      iban,
      amount,
      method,
    } = req.body;

    if (!clientId || !freelancerId || !assignmentId || !projectId) {
      return res.status(400).json({ message: 'Missing required ids.' });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) {
      return res.status(400).json({ message: 'Missing/invalid amount.' });
    }

    const fl = await Freelancer.findById(freelancerId).select('fullName email');
    const flName  = (freelancerName || fl?.fullName || '').trim();
    const flEmail = (fl?.email || '').trim();

    const cl = await Client.findById(clientId).select('fullName name email companyName');
    const clName  = (cl?.fullName || cl?.name || cl?.companyName || '').trim();
    const clEmail = (cl?.email || '').trim();

    // Create (encryption happens in model plugin)
    const payment = await Payment.create({
      clientId,
      freelancerId,
      assignmentId,
      projectId,
      projectTitle: projectTitle || '',
      freelancerName: flName,
      iban: (iban || '').trim(),
      amount: String(amt),
      method: method || 'Bank Transfer',
      status: 'Pending',
    });

    // Audit log
    await logAction({
      userId: clientId,
      action: 'Recorded Payment',
      projectId,
      meta: { amount: amt },
    });

    // Notify freelancer in-app
    try {
      const subject = 'Payment approved';
      const message =
        `Great news! Your client approved the payment for “${projectTitle || 'your project'}”. ` +
        `You’ll receive the funds soon.`;

      await sendNotification({
        userId: freelancerId,
        userType: 'freelancer',
        subject,
        message,
        type: 'success',
        meta: {
          projectId,
          assignmentId,
          amount: amt,
          method: method || 'Bank Transfer',
        },
        alsoEmail: false,
      });
    } catch (e) {
      console.warn('[payments] sendNotification failed:', e?.message || e);
    }

    // Email freelancer (masked IBAN)
    if (flEmail) {
      try {
        const html = paymentApproved({
          name: flName || 'there',
          projectTitle,
          amountBHD: amt,
          method: method || 'Bank Transfer',
          iban: maskIban(iban),
        });

        await sendEmail({
          to: flEmail,
          subject: 'Your payment was approved',
          html,
          text:
            `Hi ${flName || 'there'},\n\n` +
            `Your client has approved the payment for the project "${projectTitle || ''}".\n` +
            `Amount: BHD ${amt}\n` +
            `Method: ${method || 'Bank Transfer'}\n` +
            `IBAN: ${maskIban(iban)}\n\n` +
            `You’ll receive the payment soon.`,
        });
      } catch (e) {
        console.warn('[payments] freelancer mail failed:', e?.message || e);
      }
    }

    // Email client (masked IBAN)
    if (clEmail) {
      try {
        const html = invoiceForClient({
          name: clName || 'there',
          projectTitle,
          freelancerName: flName,
          amountBHD: amt,
          iban: maskIban(iban),
          method: method || 'Bank Transfer',
        });

        await sendEmail({
          to: clEmail,
          subject: `Invoice details – ${projectTitle || 'Project'}`,
          html,
          text:
            `Hi ${clName || 'there'},\n\n` +
            `Invoice details for "${projectTitle || 'your project'}":\n` +
            `Freelancer: ${flName || '—'}\n` +
            `Amount: BHD ${amt}\n` +
            `Method: ${method || 'Bank Transfer'}\n` +
            `IBAN: ${maskIban(iban)}\n\n` +
            `You can view this payment in Payments -> History`,
        });
      } catch (e) {
        console.warn('[payments] client invoice mail failed:', e?.message || e);
      }
    }

    res.status(201).json(payment);
  } catch (e) {
    console.error('PAYMENTS /record error:', e?.message, e?.stack);
    res.status(500).json({ message: 'Failed to record payment' });
  }
});

// -------- Mark payment completed --------
router.put('/:id/complete', async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', completedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Payment not found' });

    try {
      await sendNotification({
        userId: updated.freelancerId,
        userType: 'freelancer',
        subject: 'Payment completed',
        message: `Your payment for “${updated.projectTitle || 'your project'}” has been completed.`,
        type: 'success',
        meta: { paymentId: updated._id },
        alsoEmail: false,
      });
    } catch (e) {
      console.warn('[payments] completion notify failed:', e?.message || e);
    }

    await logAction({
      userId: req.user?.id || updated.clientId,
      action: 'Marked Payment as Completed',
      projectId: updated.projectId,
      meta: { amount: Number(updated.amount || 0) },
    });

    res.json(updated);
  } catch (e) {
    console.error('PAYMENTS /:id/complete error:', e?.message);
    res.status(500).json({ message: 'Failed to mark payment completed.' });
  }
});

// -------- Freelancer history (returns plaintext IBAN too) --------
router.get('/freelancer/:fid', async (req, res) => {
  try {
    const { fid } = req.params;

    // IMPORTANT: no .lean() so decrypted fields are available
    const rows = await Payment.find({ freelancerId: fid })
      .sort({ date: -1, createdAt: -1 });

    const includeInTotal = new Set(['Pending', 'Processing', 'Paid', 'Completed']);
    const total = rows.reduce((sum, r) => {
      const amt = Number(r.amount || 0);
      return includeInTotal.has(String(r.status)) ? sum + (Number.isFinite(amt) ? amt : 0) : sum;
    }, 0);

    const transactions = rows.map(r => ({
      _id: r._id,
      projectTitle: r.projectTitle || '',
      date: r.date || r.createdAt,
      amount: Number(r.amount || 0),         // decrypted String -> Number
      currency: r.currency || 'BHD',         // decrypted
      status: normalizeStatusForUI(r.status),
      paymentId: r.paymentId || '',
      // plaintext IBAN (decrypted)
      iban: r.iban || '',
      // optional masked copy
      ibanMasked: maskIban(r.iban),
    }));

    res.json({ currency: 'BHD', totalEarnings: total, transactions });
  } catch (e) {
    console.error('PAYMENTS /freelancer error:', e?.message);
    res.status(500).json({ message: 'Failed to load payment history.' });
  }
});

// -------- Client payments (returns plaintext IBAN) --------
router.get('/by-client/:clientId', async (req, res) => {
  try {
    const { from, to, q } = req.query;
    const query = { clientId: req.params.clientId };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (q && String(q).trim()) {
      const needle = String(q).trim();
      query.$or = [
        { freelancerName: { $regex: needle, $options: 'i' } },
        { paymentId:      { $regex: needle, $options: 'i' } },
        { projectTitle:   { $regex: needle, $options: 'i' } },
      ];
    }

    // no .lean() so plugin decrypts
    const rows = await Payment.find(query).sort({ createdAt: -1 });

    const shaped = rows.map(r => ({
      _id: r._id,
      clientId: r.clientId,
      freelancerId: r.freelancerId,
      assignmentId: r.assignmentId,
      projectId: r.projectId,
      projectTitle: r.projectTitle || '',
      freelancerName: r.freelancerName || '',
      amount: Number(r.amount || 0),                 // decrypted
      currency: r.currency || 'BHD',                 // decrypted
      method: r.method || 'Bank Transfer',           // decrypted
      // return PLAINTEXT IBAN
      iban: r.iban || '',
      // keep a masked copy if you want to render safely by default
      ibanMasked: maskIban(r.iban),
      status: r.status,
      uiStatus: normalizeStatusForUI(r.status),
      paymentId: r.paymentId || '',
      date: r.date || r.createdAt,
      createdAt: r.createdAt,
      completedAt: r.completedAt || null,
    }));

    res.json(shaped);
  } catch (e) {
    console.error('PAYMENTS /by-client error:', e?.message);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// -------- health --------
router.get('/_health', (_req, res) => res.json({ ok: true }));

module.exports = router;
