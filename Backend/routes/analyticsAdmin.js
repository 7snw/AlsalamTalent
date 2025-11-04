const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalFreelancers = await Freelancer.countDocuments();
    const totalProjects = await Project.countDocuments();


    const projectsProgress = [
      { month: 'Jan', progress: 20 },
      { month: 'Feb', progress: 40 },
      { month: 'Mar', progress: 60 },
      { month: 'Apr', progress: 80 }
    ];

    res.json({ totalClients, totalFreelancers, totalProjects, projectsProgress });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ message: 'Error fetching admin analytics' });
  }
});

module.exports = router;
