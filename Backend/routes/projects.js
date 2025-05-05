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

// Multer Storage
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

// ========== ROUTES ==========

// GET all projects (with author name)
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

// GET one project by ID (with author name)
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

// GET projects for a client (with author name)
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
  { name: 'projectFile', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, brief, budget, category, authorId, status, durationFrom, durationTo } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const projectImage = req.files['projectImage']
      ? `${baseUrl}/${req.files['projectImage'][0].path}`
      : '';

    const projectFiles = req.files['projectFile']
      ? req.files['projectFile'].map(file => ({
          name: file.originalname,
          url: `${baseUrl}/${file.path}`
        }))
      : [];

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
      files: projectFiles
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error saving project:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// PUT update existing project with optional files
router.put('/:id', upload.fields([
  { name: 'projectImage', maxCount: 1 },
  { name: 'projectFile', maxCount: 10 }
]), async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const updates = { ...req.body };

    if (req.files['projectImage']) {
      updates.imageUrl = `${baseUrl}/${req.files['projectImage'][0].path}`;
    }

    if (req.files['projectFile']) {
      updates.files = req.files['projectFile'].map(file => ({
        name: file.originalname,
        url: `${baseUrl}/${file.path}`
      }));
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true
    });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error.message);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

module.exports = router;
