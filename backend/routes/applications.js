const express = require('express');
const router = express.Router();
const Application = require('../models/Application'); // Application model
const Project = require('../models/Project');          // Project model

// Approve an application
router.post('/:projectId/approve', async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;

    if (!freelancerId) {
      return res.status(400).json({ message: 'Freelancer ID is required' });
    }

    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: 'Assigned' },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $push: { assignedFreelancers: freelancerId } },
      { new: true }
    );

    res.json({ message: 'Application approved', application: updatedApplication, project: updatedProject });

  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Error approving applicant' });
  }
});

// Reject an application
router.post('/:projectId/reject', async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;

    if (!freelancerId) {
      return res.status(400).json({ message: 'Freelancer ID is required' });
    }

    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Application rejected', application: updatedApplication });

  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Error rejecting applicant' });
  }
});

module.exports = router;
