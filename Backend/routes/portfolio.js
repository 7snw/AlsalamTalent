const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Freelancer = require('../models/Freelancer');
const Portfolio = require('../models/Portfolio');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Folder to store the uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or JPG files are allowed.'));
    }
  }
}).single('image');  // This will handle the image upload as a single file.


router.post('/portfolio/:id', upload, async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const { title, description, projectType } = req.body;
    
    // Ensure the image URL is stored correctly
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newPortfolio = new Portfolio({
      freelancerId,
      title,
      description,
      category: projectType,
      imageUrl,  // Save the image path in the database
    });

    // Save the portfolio data in the database
    await newPortfolio.save();

    res.status(201).json(newPortfolio);  // Return the newly created portfolio
  } catch (err) {
    console.error('Error adding project to portfolio:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});


module.exports = router;
