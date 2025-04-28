const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');

// setup multer
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

router.get('/all', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET a specific project by id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ FIRST: GET projects by client
router.get('/client/:authorId', async (req, res) => {
  try {
    const { authorId } = req.params;
    const projects = await Project.find({ authorId: authorId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ SECOND: POST upload new project
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
    console.error('Full error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
