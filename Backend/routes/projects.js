const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Setup Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage });


// GET all projects — include authorName
router.get('/all', async (req, res) => {
  try {
    const projects = await Project.find().populate('authorId', 'fullName');
    const withNames = projects.map(p => ({
      ...p.toObject(),
      authorName: p.authorId?.fullName || 'Unknown'
    }));
    res.json(withNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET project by id 
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('authorId', 'fullName');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const projectWithAuthor = {
      ...project.toObject(),
      authorName: project.authorId?.fullName || 'Unknown'
    };

    res.json(projectWithAuthor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET projects by client (authorId) — include authorName
router.get('/client/:authorId', async (req, res) => {
  try {
    const projects = await Project.find({ authorId: req.params.authorId }).populate('authorId', 'fullName');
    const withNames = projects.map(p => ({
      ...p.toObject(),
      authorName: p.authorId?.fullName || 'Unknown'
    }));
    res.json(withNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST upload new project
router.post('/upload', upload.fields([
  { name: 'projectImage', maxCount: 1 },
  { name: 'projectFile', maxCount: 1 },
  { name: 'contractDoc', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, brief, budget, category, authorId, status, durationFrom, durationTo } = req.body;

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const projectImage = req.files['projectImage'] ? `${baseUrl}/${req.files['projectImage'][0].path}` : '';
    const projectFile = req.files['projectFile'] ? [{
      name: req.files['projectFile'][0].originalname,
      url: `${baseUrl}/${req.files['projectFile'][0].path}`
    }] : [];
    const contractDoc = req.files['contractDoc'] ? [{
      name: req.files['contractDoc'][0].originalname,
      url: `${baseUrl}/${req.files['contractDoc'][0].path}`
    }] : [];

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
    console.error('Error saving project:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/projects/:id — Update project by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

module.exports = router;
