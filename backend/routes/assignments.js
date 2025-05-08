const express = require('express');
const multer = require('multer');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Freelancer = require('../models/Freelancer');
const logAction = require('../utils/logAction'); // ✅ Logging utility

// ✅ Get assignments by authorId (client)
router.get('/by-author/:authorId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ authorId: req.params.authorId })
      .populate('projectId', 'title imageUrl')
      .populate('freelancerId', 'fullName');
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get a single assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('projectId')
      .populate('freelancerId');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Utility to update average freelancer rating
const updateFreelancerRating = async (freelancerId) => {
  const assignments = await Assignment.find({
    freelancerId,
    status: 'Completed',
    rating: { $ne: null }
  });

  if (assignments.length > 0) {
    const total = assignments.reduce((sum, a) => sum + a.rating, 0);
    const avgRating = total / assignments.length;
    await Freelancer.findByIdAndUpdate(freelancerId, { rating: avgRating.toFixed(2) });
  }
};

// ✅ Update assignment status + rating + feedback (with logging for rejection/completion)
router.put('/:id/update-status', async (req, res) => {
  try {
    const { status, feedback } = req.body;
    let rating = Number(req.body.rating) || 1;
    rating = Math.min(5, Math.max(1, Math.round(rating))); // clamp and round

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rating,
        feedback: feedback || '',
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const freelancerId = updated.freelancerId;

    if (status === 'Completed') {
      await Freelancer.findByIdAndUpdate(freelancerId, { rating });
    }

    // ✅ Log based on status
    let actionLabel = 'Updated Assignment Status';
    if (status === 'Rejected') {
      actionLabel = 'Rejected Submitted Work';
    } else if (status === 'Completed') {
      actionLabel = 'Approved Submitted Work';
    }

    await logAction({
      userId: updated.authorId,
      action: actionLabel,
      projectId: updated.projectId
    });

    res.json({ message: 'Assignment updated successfully', updated });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ File upload storage for docs
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ✅ Upload docs to assignment (freelancer)
router.post('/:id/update-docs', upload.array('docs'), async (req, res) => {
  try {
    const files = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`
    }));

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $push: { docs: { $each: files } } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Assignment not found' });

    // ✅ Log freelancer doc upload
    await logAction({
      userId: updated.freelancerId,
      action: 'Submitted Work',
      projectId: updated.projectId
    });

    res.json({ message: 'Docs uploaded successfully', updated });
  } catch (err) {
    console.error('Error uploading docs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
