const express = require('express');
const multer = require('multer');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Freelancer = require('../models/Freelancer');
const logAction = require('../utils/logAction'); 
  const Project = require('../models/Project');


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

//  Utility to update average freelancer rating
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

      // ✅ Update project status to Completed
      await Project.findByIdAndUpdate(updated.projectId, { status: "Completed" });
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

const BASE_URL = 'http://localhost:5000';

router.post('/:id/update-docs', upload.array('docs'), async (req, res) => {
  try {
    const files = req.files.map(file => ({
      name: file.originalname,
      url: `${BASE_URL}/uploads/${file.filename}`
    }));

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          docs: { $each: files },
          files: { $each: files }
        },
        submitted: true
      },
      { new: true }
    ).populate('projectId');

    if (!updated) return res.status(404).json({ message: 'Assignment not found' });

    const freelancerId = updated.freelancerId;
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const existingProject = freelancer.projects.find(
      p => p.projectTitle === updated.projectId.title
    );

    const projectData = {
      projectTitle: updated.projectId.title,
      projectStatus: updated.status,
      projectFiles: files.map(f => f.url),
      projectImage: updated.projectId.imageUrl || ''
    };

    if (existingProject) {
      // Update the existing project's files/status
      existingProject.projectFiles.push(...projectData.projectFiles);
      existingProject.projectStatus = projectData.projectStatus;
      existingProject.projectImage = projectData.projectImage;
    } else {
      // Add new project
      freelancer.projects.push(projectData);
    }

    await freelancer.save();

    await logAction({
      userId: freelancerId,
      action: 'Submitted Work',
      projectId: updated.projectId._id
    });

    res.json({ message: 'Docs saved to assignment and freelancer profile', updated });
  } catch (err) {
    console.error('Error uploading docs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Replace assignment docs (used to remove a file)
router.put('/:id/update-docs', async (req, res) => {
  try {
    const { docs } = req.body; // Expecting an array of { name, url }

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { docs, submitted: docs.length > 0 },
      { new: true }
    ).populate('projectId');

    if (!updated) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // ✅ Update freelancer's corresponding project
    const freelancer = await Freelancer.findById(updated.freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    const targetProject = freelancer.projects.find(
      (p) => p.projectTitle === updated.projectId.title
    );

    if (targetProject) {
      const newFileUrls = docs.map((d) => d.url);
      targetProject.projectFiles = newFileUrls;
      await freelancer.save();
    }

    res.json({ message: 'Assignment and freelancer project docs updated', updated });
  } catch (error) {
    console.error('Error updating docs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Get assignments by freelancerId (for MyProjects.js)
router.get('/by-freelancer/:freelancerId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ freelancerId: req.params.freelancerId })
      .populate('projectId', 'title imageUrl')
      .populate('authorId', 'fullName');
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching freelancer assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

