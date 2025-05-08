// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Project = require('../models/Project');
const Freelancer = require('../models/Freelancer');
const Assignment = require('../models/Assignment');

// GET all applications for a client (by authorId)
router.get('/by-author/:authorId', async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const applications = await Application.find({ authorId })
      .populate({ path: 'projectId', select: 'title imageUrl' })
      .populate({ path: 'freelancerId', select: 'fullName' });

    const formatted = applications.map(app => ({
      _id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      project: app.projectId ? {
        id: app.projectId._id,
        title: app.projectId.title,
        imageUrl: app.projectId.imageUrl
      } : null,
      freelancer: app.freelancerId ? {
        id: app.freelancerId._id,
        name: app.freelancerId.fullName
      } : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});
// Approve an application and create an assignment
router.post('/:projectId/approve', async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;

    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: 'Assigned' },
      { new: true }
    );

    if (!updatedApplication) return res.status(404).json({ message: 'Application not found' });

    // Update freelancer's applications array
    await Freelancer.updateOne(
      { _id: freelancerId, "applications.projectId": projectId },
      { $set: { "applications.$.status": "Assigned" } }
    );

    const exists = await Assignment.findOne({ projectId, freelancerId });

    let assignment; // define here so it's accessible below

    if (!exists) {
      const application = await Application.findOne({ projectId, freelancerId });
      if (!application) {
        return res.status(404).json({ message: 'Application not found for assignment creation' });
      }

      assignment = new Assignment({
        projectId,
        freelancerId,
        authorId: application.authorId,
        status: 'Assigned' // ✅ use a valid enum value
      });

      await assignment.save();

      // ✅ update project with assignment ID (only when assignment is created)
      await Project.findByIdAndUpdate(projectId, { assignmentId: assignment._id });
    }

    res.json({ message: 'Application approved and assignment created.', updatedApplication });
  } catch (error) {
    console.error('Error assigning application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Reject an application
router.post('/:projectId/reject', async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;

    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!updatedApplication) return res.status(404).json({ message: 'Application not found' });

    // Update freelancer's applications array
    await Freelancer.updateOne(
      { _id: freelancerId, "applications.projectId": projectId },
      { $set: { "applications.$.status": "Cancelled" } }
    );

    res.json({ message: 'Application cancelled successfully.', updatedApplication });
  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new application
router.post('/create', async (req, res) => {
  try {
    const { projectId, freelancerId, authorId } = req.body;

    if (!projectId || !freelancerId || !authorId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if application already exists (prevent duplicates)
    const existingApplication = await Application.findOne({ projectId, freelancerId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this project.' });
    }

    // Create new Application in 'applications' table
    const newApplication = new Application({
      projectId,
      freelancerId,
      authorId,
      status: 'Under Review', // default
    });
    await newApplication.save();

    // Also update the freelancer's applications array
    await Freelancer.updateOne(
      { _id: freelancerId },
      { $push: { applications: { projectId, status: 'Under Review' } } }
    );

    res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

module.exports = router;
