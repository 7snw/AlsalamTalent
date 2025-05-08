const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Freelancer = require('../models/Freelancer');
const Project = require('../models/Project');
const logAction = require('../utils/logAction'); // ✅ Logging utility

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, JPG, or WEBP images are allowed.'));
};

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: imageFileFilter });
const uploadAnyFile = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadImage = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

const BASE_URL = 'http://localhost:5000';

// Register new freelancer
router.post('/register', async (req, res) => {
  try {
    const data = {
      ...req.body,
      cprImageUrl: req.body.userType === 'graduate' ? req.body.cprImageUrl : undefined,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
    };

    const newFreelancer = await Freelancer.create(data);

    await logAction({
      userId: newFreelancer._id,
      action: 'Registered as Freelancer'
    });

    res.status(201).json(newFreelancer);
  } catch (err) {
    console.error('Freelancer registration failed:', err);
    res.status(500).json({ message: 'Registration failed', error: err });
  }
});

// Apply to project
router.put('/:id/apply-project', async (req, res) => {
  try {
    const { projectId } = req.body;
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const alreadyApplied = freelancer.applications.find((a) => a.projectId.toString() === projectId);
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied to this project' });

    freelancer.applications.push({ projectId });
    await freelancer.save();

    const project = await Project.findById(projectId).select('title');

    await logAction({
      userId: freelancer._id,
      action: 'Applied to Project',
      details: `Project: ${project?.title || projectId}`
    });

    res.json({ message: 'Applied successfully', applications: freelancer.applications });
  } catch (err) {
    console.error('Error applying to project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a project
router.post('/:id/add-project', uploadAnyFile.fields([
  { name: 'projectFiles', maxCount: 10 },
  { name: 'projectImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { projectTitle, projectStatus } = req.body;
    const freelancerId = req.params.id;

    const projectFiles = req.files?.projectFiles?.map(file => `${BASE_URL}/uploads/${file.filename}`) || [];
    const projectImage = req.files?.projectImage?.[0] ? `${BASE_URL}/uploads/${req.files.projectImage[0].filename}` : '';

    const newProject = { projectTitle, projectStatus, projectFiles, projectImage };
    const freelancer = await Freelancer.findByIdAndUpdate(freelancerId, { $push: { projects: newProject } }, { new: true });

    await logAction({
      userId: freelancerId,
      action: 'Added Project to Profile',
      details: `Project: ${projectTitle}`
    });

    res.json({ message: 'Project added successfully', project: newProject });
  } catch (err) {
    console.error('Error adding project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a project
router.put('/:freelancerId/update-project/:projectId', uploadAnyFile.fields([
  { name: 'projectFiles', maxCount: 10 },
  { name: 'projectImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { freelancerId, projectId } = req.params;
    const { projectTitle, projectStatus, existingFiles = [] } = req.body;

    const newProjectFiles = req.files?.projectFiles?.map(file => `${BASE_URL}/uploads/${file.filename}`) || [];
    const allFiles = [...(Array.isArray(existingFiles) ? existingFiles : [existingFiles]), ...newProjectFiles];
    const projectImage = req.files?.projectImage?.[0] ? `${BASE_URL}/uploads/${req.files.projectImage[0].filename}` : undefined;

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const project = freelancer.projects.id(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.projectTitle = projectTitle || project.projectTitle;
    project.projectStatus = projectStatus || project.projectStatus;
    project.projectFiles = allFiles;
    if (projectImage) project.projectImage = projectImage;

    await freelancer.save();

    await logAction({
      userId: freelancerId,
      action: 'Updated Project',
      details: `Project: ${project.projectTitle}`
    });

    res.json({ message: 'Project updated successfully', project });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add portfolio project
router.post('/portfolio/:freelancerId', uploadImage.single('image'), async (req, res) => {
  try {
    const { title, description, projectType } = req.body;
    const freelancerId = req.params.freelancerId;

    if (!req.file) return res.status(400).json({ message: 'Image file is required.' });

    const newPortfolio = {
      title,
      description,
      category: projectType,
      imageUrl: `${BASE_URL}/uploads/${req.file.filename}`
    };

    const freelancer = await Freelancer.findByIdAndUpdate(
      freelancerId,
      { $push: { portfolio: newPortfolio } },
      { new: true }
    );

    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found.' });

    await logAction({
      userId: freelancerId,
      action: 'Added Portfolio Project',
      details: `Project: ${title}`
    });

    res.status(201).json(newPortfolio);
  } catch (error) {
    console.error('Error adding portfolio project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
