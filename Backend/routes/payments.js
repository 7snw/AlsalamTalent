const express = require('express');
const router = express.Router();

const Payment    = require('../models/Payment');
const Freelancer = require('../models/Freelancer');
const Client     = require('../models/Client');   
const sendEmail  = require('../utils/sendEmail');
const { paymentApproved, invoiceForClient } = require('../utils/emailTemplates'); 

let Notification, sendNotification;

// Optional deps (don’t crash if not present)
try { Notification = require('../models/Notification'); } catch { /* noop */ }
try { ({ sendNotification } = require('../utils/sendNotification')); } catch { sendNotification = async () => {}; }

router.use(express.json());

// (optional) simple request logger
router.use((req, _res, next) => {
  console.log('[payments]', req.method, req.originalUrl);
  if (req.method !== 'GET') console.log('[payments] body:', req.body);
  next();
});

// Utility: normalize status for UI filters
const normalizeStatusForUI = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'pending') return 'Pending';
  if (s === 'failed' || s === 'cancelled') return 'Pending';
  if (s === 'processing' || s === 'paid' || s === 'completed') return 'Completed';
  return 'Pending';
};

// Preflight
router.options('/record', (_req, res) => res.sendStatus(204));

/**
 * POST /api/payments/record
 * Creates a payment record, pushes an IN-APP notification ONLY,
 * and sends the single branded email “Your payment was approved”.
 */
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

    // ---- validate
    if (!clientId || !freelancerId || !assignmentId || !projectId) {
      return res.status(400).json({ message: 'Missing required ids.' });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) {
      return res.status(400).json({ message: 'Missing/invalid amount.' });
    }

    // ---- fetch freelancer (name/email)
    const fl = await Freelancer.findById(freelancerId).select('fullName email');
    const flName  = (freelancerName || fl?.fullName || '').trim();
    const flEmail = (fl?.email || '').trim();

    //  fetch client (name/email) to email invoice details
    const cl = await Client.findById(clientId).select('fullName name email companyName');
    const clName  = (cl?.fullName || cl?.name || cl?.companyName || '').trim();
    const clEmail = (cl?.email || '').trim();

    // ---- create payment
    const payment = await Payment.create({
      clientId,
      freelancerId,
      assignmentId,
      projectId,
      projectTitle: projectTitle || '',
      freelancerName: flName,
      iban: (iban || '').trim(),
      amount: amt,
      method: method || 'Bank Transfer',
      status: 'Pending',
    });

    // ---- IN-APP notification to freelancer ONLY (no email via sendNotification)
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

    // ---- Email freelancer: "Your payment was approved"
    if (flEmail) {
      try {
        const html = paymentApproved({
          name: flName || 'there',
          projectTitle,
          amountBHD: amt,
          method: method || 'Bank Transfer',
          iban: (iban || '').trim(),
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
            `IBAN: ${iban || '—'}\n\n` +
            `You’ll receive the payment soon.`,
        });
      } catch (e) {
        console.warn('[payments] freelancer mail failed:', e?.message || e);
      }
    }

    // Email client: Invoice details (subject, amount, IBAN, method)
    if (clEmail) {
      try {
        const html = invoiceForClient({
          name: clName || 'there',
          projectTitle,
          freelancerName: flName,
          amountBHD: amt,
          iban: (iban || '').trim(),
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
            `IBAN: ${iban || '—'}\n\n` +
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

router.put('/:id/complete', async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', completedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Payment not found' });

    // Optional: in-app notify on completion (no email)
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

    res.json(updated);
  } catch (e) {
    console.error('PAYMENTS /:id/complete error:', e?.message);
    res.status(500).json({ message: 'Failed to mark payment completed.' });
  }
});

/**
 * GET /api/payments/freelancer/:fid
 */
router.get('/freelancer/:fid', async (req, res) => {
  try {
    const { fid } = req.params;

    const rows = await Payment.find({ freelancerId: fid })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const includeInTotal = new Set(['Pending', 'Processing', 'Paid', 'Completed']);
    const total = rows.reduce((sum, r) => {
      return includeInTotal.has(String(r.status)) ? sum + Number(r.amount || 0) : sum;
    }, 0);

    const transactions = rows.map(r => ({
      _id: r._id,
      projectTitle: r.projectTitle || '',
      date: r.date || r.createdAt,
      amount: r.amount || 0,
      currency: r.currency || 'BHD',
      status: normalizeStatusForUI(r.status),
      paymentId: r.paymentId || '',
    }));

    res.json({
      currency: 'BHD',
      totalEarnings: total,
      transactions,
    });
  } catch (e) {
    console.error('PAYMENTS /freelancer error:', e?.message);
    res.status(500).json({ message: 'Failed to load payment history.' });
  }
});


// GET /api/payments/by-client/:clientId?q=isa or q=PAY-20250916-0001
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

    // optional text search by freelancerName or paymentId (and projectTitle for convenience)
    if (q && String(q).trim()) {
      const needle = String(q).trim();
      query.$or = [
        { freelancerName: { $regex: needle, $options: 'i' } },
        { paymentId:      { $regex: needle, $options: 'i' } },
        { projectTitle:   { $regex: needle, $options: 'i' } },
      ];
    }

    const rows = await Payment.find(query).sort({ createdAt: -1 }).lean();

    const shaped = rows.map(r => ({
      ...r,
      uiStatus: normalizeStatusForUI(r.status),
      paymentId: r.paymentId || '',
    }));

    res.json(shaped);
  } catch (e) {
    console.error('PAYMENTS /by-client error:', e?.message);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});


router.get('/_health', (_req, res) => res.json({ ok: true }));

module.exports = router;
