const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Freelancer = require('../models/Freelancer');

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
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

const BASE_URL = 'http://localhost:5000'; // update to your domain when deployed

// ---------------------------- ROUTES ----------------------------

// Register new freelancer
router.post('/register', async (req, res) => {
  try {
    const data = {
      ...req.body,
      cprImageUrl: req.body.userType === 'graduate' ? req.body.cprImageUrl : undefined,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
    };

    const newFreelancer = await Freelancer.create(data);
    res.status(201).json(newFreelancer);
  } catch (err) {
    console.error('Freelancer registration failed:', err);
    res.status(500).json({ message: 'Registration failed', error: err });
  }
});

// Get freelancer list (basic)
router.get('/list', async (req, res) => {
  try {
    const freelancers = await Freelancer.find({}, 'fullName expertise profileImageUrl');
    res.json(freelancers);
  } catch (err) {
    console.error('Error fetching freelancers:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get only graduates list
router.get('/graduates', async (req, res) => {
  try {
    const graduates = await Freelancer.find({ userType: 'graduate' }, 'fullName studentId cprImageUrl');
    res.json(graduates);
  } catch (err) {
    console.error('Error fetching graduates:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get full freelancer profile
router.get('/profile/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).select(
      'fullName email studentId major phone dateOfBirth bio skills specialties expertise portfolio role cprImageUrl profileImageUrl projects'
    );
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });
    res.json(freelancer);
  } catch (err) {
    console.error('Error fetching freelancer profile:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Update freelancer profile
router.put('/profile/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const parsedData = JSON.parse(req.body.data);
    const updates = { ...parsedData };

    if (updates.dateOfBirth) updates.dateOfBirth = new Date(updates.dateOfBirth);
    if (req.file) updates.profileImageUrl = `${BASE_URL}/uploads/${req.file.filename}`;

    const updatedFreelancer = await Freelancer.findByIdAndUpdate(freelancerId, updates, { new: true });
    if (!updatedFreelancer) return res.status(404).json({ message: 'Freelancer not found' });

    res.json(updatedFreelancer);
  } catch (err) {
    console.error('Error updating freelancer profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message || err });
  }
});

// Change freelancer password
router.put('/changepassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    if (freelancer.password !== oldPassword) return res.status(400).json({ message: 'Old password is incorrect' });

    freelancer.password = newPassword;
    await freelancer.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error', error: err });
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

    res.json({ message: 'Project added successfully', project: newProject });
  } catch (err) {
    console.error('Error adding project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get my projects
router.get('/:id/my-projects', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).select('projects');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });
    res.json(freelancer.projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
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
    res.json({ message: 'Project updated successfully', project });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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

    res.json({ message: 'Applied successfully', applications: freelancer.applications });
  } catch (err) {
    console.error('Error applying to project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get applications
router.get('/:id/applications', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate('applications.projectId');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const apps = freelancer.applications.map(a => ({ project: a.projectId, status: a.status }));
    res.json(apps);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Save/Unsave project
router.put('/:id/save-project', async (req, res) => {
  try {
    const { projectId } = req.body;
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const projectIndex = freelancer.savedProjects.findIndex(id => id.toString() === projectId);

    if (projectIndex > -1) {
      freelancer.savedProjects.splice(projectIndex, 1);
    } else {
      freelancer.savedProjects.push(projectId);
    }

    await freelancer.save();
    res.json({ message: 'Saved projects updated successfully', savedProjects: freelancer.savedProjects });
  } catch (error) {
    console.error('Error saving/unsaving project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get saved projects
router.get('/:id/saved-projects', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate('savedProjects');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    res.json(freelancer.savedProjects);
  } catch (error) {
    console.error('Error fetching saved projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

    res.status(201).json(newPortfolio);
  } catch (error) {
    console.error('Error adding portfolio project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get freelancer's portfolio
router.get('/portfolio/:freelancerId', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.freelancerId).select('portfolio');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found.' });

    res.json(freelancer.portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
