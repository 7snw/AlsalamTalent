const express = require('express');
const router = express.Router();
const multer = require('multer');
const Project = require('../models/Project');

// setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder inside backend
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST route to handle FormData
router.post('/upload', upload.fields([
  { name: 'projectImage', maxCount: 1 },
  { name: 'projectFile', maxCount: 1 },
  { name: 'contractDoc', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, brief, budget, category, authorId, status, durationFrom, durationTo } = req.body;
    const projectImage = req.files['projectImage'] ? req.files['projectImage'][0].path : '';
    const projectFile = req.files['projectFile'] ? [{ name: req.files['projectFile'][0].originalname, url: req.files['projectFile'][0].path }] : [];
    const contractDoc = req.files['contractDoc'] ? [{ name: req.files['contractDoc'][0].originalname, url: req.files['contractDoc'][0].path }] : [];

    const newProject = new Project({
      title,
      brief,
      budget: Number(budget),
      category,
      authorId,
      status,
      duration: {
        from: new Date(durationFrom),
        to: new Date(durationTo)
      },
      imageUrl: projectImage,
      files: projectFile,
      docs: contractDoc
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
