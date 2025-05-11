// routes/analyticsClient.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Freelancer = require('../models/Freelancer');

router.get('/', async (req, res) => {
  try {
    // Count by status
    const openCount = await Project.countDocuments({ status: 'Open' });
    const assignedCount = await Project.countDocuments({ status: 'Assigned' });
    const completedCount = await Project.countDocuments({ status: 'Completed' });

    // Sample projectsProgress (replace with real aggregation if needed)
    const projectsProgress = [
      { month: 'Jan', progress: 50 },
      { month: 'Feb', progress: 60 },
      { month: 'Mar', progress: 70 },
      { month: 'Apr', progress: 80 }
    ];

    // List of all client projects (simplified version)
    const allProjects = await Project.find({}, 'title status budget');

    res.json({
      openCount,
      assignedCount,
      completedCount,
      projectsProgress,
      allProjects
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

module.exports = router;
