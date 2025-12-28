
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const openCount = await Project.countDocuments({ authorId: clientId, status: 'Open' });
    const inProgressStatuses = ['Assigned', 'Submitted', 'Re-submit'];
    const assignedCount = await Project.countDocuments({ authorId: clientId, status: { $in: inProgressStatuses } });
    const completedCount = await Project.countDocuments({ authorId: clientId, status: 'Completed' });

    const projectsProgress = [
      { month: 'Jan', progress: 50 },
      { month: 'Feb', progress: 60 },
      { month: 'Mar', progress: 70 },
      { month: 'Apr', progress: 80 }
    ];

    const allProjects = await Project.find({ authorId: clientId }, 'title status budget');

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
