// backend/routes/analyticsClient.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Freelancer = require('../models/Freelancer');

router.get('/analytics', async (req, res) => {
  try {
    // Get the number of projects
    const projectCount = await Project.countDocuments();

    // Get the number of freelancers
    const freelancerCount = await Freelancer.countDocuments();

    // Get the number of active projects
    const activeProjectsCount = await Project.countDocuments({
      status: { $ne: 'Completed' }
    });

    // Dummy data for progress (use real data if needed)
    const projectsProgress = [
      { month: 'Jan', progress: 50 },
      { month: 'Feb', progress: 60 },
      { month: 'Mar', progress: 70 },
      { month: 'Apr', progress: 80 },
    ];

    res.json({
      projectCount,
      freelancerCount,
      activeProjectsCount,
      projectsProgress
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

module.exports = router;
