const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Portfolio = require('../models/Portfolio');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPEG/PNG/JPG files are allowed.'), ok);
  }
}).array('images', 12);


const toArray = (v) => (Array.isArray(v) ? v : (v ? [v] : []));
const parseSkills = (raw) => {
  if (!raw) return [];
  try {

    const parsed = JSON.parse(raw);
    return toArray(parsed).map(s => String(s).trim()).filter(Boolean);
  } catch {
    return String(raw)
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
};

router.post('/portfolio/:id', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload failed:', err);
      return res.status(400).json({ message: err.message || 'Upload error' });
    }
    try {
      const freelancerId = req.params.id;
      const { title, description, projectType, skills, collaborators } = req.body;

      const imageUrls = (req.files || []).map(f => `/uploads/${f.filename}`);

      const skillsArr = parseSkills(skills).length
        ? parseSkills(skills)
        : parseSkills(projectType); 

      const collabIds = (() => {
        if (!collaborators) return [];
        try { return JSON.parse(collaborators); } catch { return []; }
      })();

      const doc = await Portfolio.create({
        freelancerId,
        title,
        description,
        skills: skillsArr,
     
        category: projectType || (skillsArr[0] || undefined),
        imageUrls,
        collaborators: collabIds,
      });

      res.status(201).json(doc);
    } catch (e) {
      console.error('Error adding project to portfolio:', e);
      res.status(500).json({ message: 'Server error', error: e });
    }
  });
});

module.exports = router;
