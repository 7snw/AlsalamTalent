const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];


    const ALL_CATEGORIES = [
       "Marketing",
  "Graphic Design",
  "Content Creation",
  "Product Design",
  "Web Design",
  "Photography",
  "Video & Motion",
  "Reports & Presentations"
    ];


    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

   
    const [
      totalClients,
      totalFreelancers,
      totalProjects,
      rawProjectsProgress,
      rawClientsByMonth,
      rawFreelancersByMonth,
      rawProjectsByStatus,
      rawProjectsByCategory,
      activeFreelancersCount,
    ] = await Promise.all([
      Client.countDocuments(),
      Freelancer.countDocuments(),
      Project.countDocuments(),

      Project.aggregate([
        {
          $group: {
            _id: { $month: '$createdAt' }, // 1–12
            projects: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
      ]),

   
      Client.aggregate([
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
      ]),

  
      Freelancer.aggregate([
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
      ]),

   
      Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),


      Project.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      Freelancer.countDocuments({

        lastLogin: { $gte: THIRTY_DAYS_AGO },
      }),
    ]);


    const projectsProgress = monthNames.map((name, index) => {
      const monthNumber = index + 1;
      const found = rawProjectsProgress.find((m) => m._id === monthNumber);

      return {
        month: name,
        projects: found ? found.projects : 0,
      };
    });


    const allNewUsersByMonth = monthNames.map((name, index) => {
      const monthNumber = index + 1;

      const clients = rawClientsByMonth.find((m) => m._id === monthNumber);
      const freelancers = rawFreelancersByMonth.find(
        (m) => m._id === monthNumber
      );

      return {
        month: name,
        clients: clients ? clients.count : 0,
        freelancers: freelancers ? freelancers.count : 0,
      };
    });

    const newUsersByMonth = allNewUsersByMonth.slice(8);

  
    const projectsByStatus = rawProjectsByStatus.map((item) => ({
      status: item._id || 'Unknown',
      count: item.count,
    }));

   
    const projectsByCategory = ALL_CATEGORIES.map((catName) => {
      const found = rawProjectsByCategory.find((item) => item._id === catName);
      return {
        category: catName,
        count: found ? found.count : 0,
      };
    });

    let topProjectCategory = null;
    if (projectsByCategory.length > 0) {
      topProjectCategory = projectsByCategory.reduce((top, current) =>
        !top || current.count > top.count ? current : top
      );
    }

 
    const activeFreelancers = activeFreelancersCount;
    const inactiveFreelancers = Math.max(
      totalFreelancers - activeFreelancers,
      0
    );

    const freelancerActivity = [
      { name: 'Active (last 30 days)', value: activeFreelancers },
      { name: 'Inactive (30+ days)', value: inactiveFreelancers },
    ];

    res.json({
      totalClients,
      totalFreelancers,
      totalProjects,
      projectsProgress,     
      newUsersByMonth,      
      projectsByStatus,     
      projectsByCategory,   
      topProjectCategory,    
      freelancerActivity,    
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ message: 'Error fetching admin analytics' });
  }
});

module.exports = router;
