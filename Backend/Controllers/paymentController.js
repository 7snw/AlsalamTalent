const Payment = require('../models/Payment');


exports.getFreelancerSummary = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const PLATFORM_FEE = 0.10;

    const tx = await Payment.find({ freelancer: freelancerId }).lean();

    const totalEarnings = tx.reduce((sum, t) => {
      const gross = Number(t.amount || 0);
      const net = gross * (1 - PLATFORM_FEE);
      return t.status === 'completed' ? sum + net : sum;
    }, 0);

    res.json({ currency: 'BHD', totalEarnings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get summary' });
  }
};


exports.listFreelancerTransactions = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { status } = req.query;

    const query = { freelancer: freelancerId };
    if (status) query.status = status;

    const tx = await Payment.find(query).sort({ createdAt: -1 }).lean();
    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list transactions' });
  }
};
