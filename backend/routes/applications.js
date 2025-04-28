const express = require('express');
const router = express.Router();
const Application = require('../models/Application'); // Assuming you've defined the Application model
const Project = require('../models/Project');  // If you need to reference the project for status updates

// Approve an application
router.post('/:projectId/approve', async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const projectId = req.params.projectId;

    // Update the application status to "Assigned"
    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: 'Assigned' },
      { new: true }
    );

    // Optionally, you can also update the project's data or any other related fields
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $push: { assignedFreelancers: freelancerId } },
      { new: true }
    );

    res.json(project); // Return the updated project or application
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Error approving applicant' });
  }
});

// Reject an application
router.post('/:projectId/reject', async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const projectId = req.params.projectId;

    // Update the application status to "Cancelled"
    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: 'Cancelled' },
      { new: true }
    );

    res.json(updatedApplication); // Return the updated application status
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Error rejecting applicant' });
  }
});

module.exports = router;
