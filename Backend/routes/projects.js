const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const Admin = require('../models/Admin');
const Freelancer = require('../models/Freelancer');
const logAction = require('../utils/logAction');
const { sendNotification } = require('../utils/sendNotification');

const sendEmail = require('../utils/sendEmail');                     
const { newProjectAvailable } = require('../utils/emailTemplates');     
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ctrlz.bh'; 

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });


const sanitizeSkills = (raw) => {
  if (!raw) return [];
  let arr = [];
  if (Array.isArray(raw)) arr = raw;
  else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      arr = Array.isArray(parsed) ? parsed : String(raw).split(/[,\n]/);
    } catch {
      arr = String(raw).split(/[,\n]/);
    }
  } else arr = [];

  const out = [];
  const seen = new Set();
  for (const s of arr) {
    const v = String(s || '').trim();
    if (v && !seen.has(v.toLowerCase())) {
      seen.add(v.toLowerCase());
      out.push(v);
      if (out.length >= 20) break;
    }
  }
  return out;
};

const nameFromUrl = (u = '') =>
  decodeURIComponent(String(u).split('/').pop() || 'file');

const normList = (arr = []) =>
  (Array.isArray(arr) ? arr : [])
    .map((s) => String(s || '').trim().toLowerCase())
    .filter(Boolean);


const tokensFromProject = (p = {}) => {
  const bag = new Set();


  for (const t of normList([
    ...(p.skills || []),
    ...(p.requiredSkills || []),
    ...(p.skillTags || []),
    ...(p.tags || []),
  ])) bag.add(t);

  for (const t of normList(p.categories || [])) bag.add(t);


  for (const t of normList([p.category])) bag.add(t);


  return bag;
};

const overlapScore = (freelancerTokens, projectTokens) => {
  let score = 0;
  for (const t of freelancerTokens) if (projectTokens.has(t)) score++;
  return score;
};

const typeFilterFromReq = (req) => {
  const t = String(req.query.type || req.query.projectType || '').toLowerCase();
  return t === 'project' || t === 'campaign' ? { projectType: t } : {};
};


router.post('/match', async (req, res) => {
  try {
    const { freelancerId } = req.body;
    let pool = [];

    if (freelancerId) {
      const f = await Freelancer.findById(freelancerId);
      if (!f) return res.status(404).json({ message: 'Freelancer not found' });
      pool = normList([...(f.expertise || []), ...(f.skills || [])]);
    } else {
      const { expertise = [], skills = [] } = req.body || {};
      pool = normList([...(expertise || []), ...(skills || [])]);
    }

    if (!pool.length) {
      return res.status(400).json({ message: 'No expertise/skills provided.' });
    }

    const filter = { status: 'Open', ...typeFilterFromReq(req) };
    const all = await Project.find(filter);

    const scored = all
      .map((p) => {
        const score = overlapScore(new Set(pool), tokensFromProject(p));
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);

    const limit = Number(req.query.limit || 0);
    res.json(limit > 0 ? scored.slice(0, limit) : scored);
  } catch (error) {
    console.error('Error matching projects:', error);
    res.status(500).json({ message: 'Server error while matching projects.' });
  }
});


router.get('/match/:freelancerId', async (req, res) => {
  try {
    const f = await Freelancer.findById(req.params.freelancerId);
    if (!f) return res.status(404).json({ message: 'Freelancer not found' });

    const pool = normList([...(f.expertise || []), ...(f.skills || [])]);
    if (!pool.length) return res.json([]);

    const filter = { status: 'Open', ...typeFilterFromReq(req) };
    const all = await Project.find(filter);

    const scored = all
      .map((p) => {
        const score = overlapScore(new Set(pool), tokensFromProject(p));
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);

    const limit = Number(req.query.limit || 0);
    res.json(limit > 0 ? scored.slice(0, limit) : scored);
  } catch (err) {
    console.error('Match route error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/all', async (req, res) => {
  try {
    const typeRaw  = String(req.query.type || req.query.projectType || '').toLowerCase();
    const audience = String(req.query.audience || '').toLowerCase();

    const filter = {};

    if (typeRaw === 'project' || typeRaw === 'campaign') {
      filter.projectType = typeRaw;
    }

    if (audience === 'freelancer') {
      filter.status = { $ne: 'Completed' };
    }

    const projects = await Project.find(filter).populate('authorId', 'fullName');

    const withNames = projects.map((p) => ({
      ...p.toObject(),
      authorName: p.authorId?.fullName || 'Unknown',
    }));

    res.json(withNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.get('/client/:authorId', async (req, res) => {
  try {
    const projects = await Project.find({ authorId: req.params.authorId }).populate(
      'authorId',
      'fullName'
    );
    const withNames = projects.map((p) => ({
      ...p.toObject(),
      authorName: p.authorId?.fullName || 'Unknown',
    }));

    await logAction({
      userId: req.params.authorId,
      action: 'Viewed My Projects',
      details: `Count: ${withNames.length}`,
    });

    res.json(withNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('authorId', 'fullName');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const projectWithAuthor = {
      ...project.toObject(),
      authorName: project.authorId?.fullName || 'Unknown',
    };
    res.json(projectWithAuthor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post(
  '/upload',
  upload.fields([
    { name: 'projectImage', maxCount: 1 },
    { name: 'projectFile',  maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title, brief, budget, category, authorId, status,
        projectType, initialDeadline, halfDeadline, finalDeadline, skills,
      } = req.body;

      if (!initialDeadline || !halfDeadline || !finalDeadline) {
        return res.status(400).json({ message: 'All three deadlines are required.' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const projectImage = req.files['projectImage']
        ? `${baseUrl}/${req.files['projectImage'][0].path}` : '';
      const projectFiles = req.files['projectFile'] ? req.files['projectFile'].map((f) => ({
        name: f.originalname, url: `${baseUrl}/${f.path}`,
      })) : [];

      const initial = new Date(initialDeadline);
      const half    = new Date(halfDeadline);
      const final   = new Date(finalDeadline);

      const normalizedType = String(projectType || 'project').toLowerCase() === 'campaign'
        ? 'campaign' : 'project';

      const newProject = new Project({
        title,
        brief,
        budget: Number(budget),
        category,
        authorId,
        status,
        projectType: normalizedType,
        deadlines: { initial, half, final },
        duration: { from: initial, to: half }, 
        imageUrl: projectImage,
        files: projectFiles,
        skills: sanitizeSkills(skills),
      });

      await newProject.save();

      await logAction({ userId: authorId, action: 'Added New Project', projectId: newProject._id });

   
      const [freelancers, admins] = await Promise.all([
        Freelancer.find().select('fullName email role'),
        Admin.find().select('fullName email role'),
      ]);
      const allRecipients = [...freelancers, ...admins];

      const projectLink = `${FRONTEND_URL}/project-details/${newProject._id}`;

      await Promise.allSettled(
        allRecipients.map((user) => {
          const userType = (user.role || 'freelancer').toLowerCase();
          const html = require('../utils/emailTemplates').newProjectAvailable({
            name: user.fullName || user.name || 'there',
            projectTitle: newProject.title,
            projectLink,
            projectType: normalizedType,
          });

          return sendNotification({
            userId: user._id,
            userType,
            subject: 'New Project Available!',
            message: `A new ${normalizedType} titled "${newProject.title}" has been posted.`,
            type: 'available',
            meta: { projectId: newProject._id, projectType: normalizedType },
            alsoEmail: true,   
            html,             
          });
        })
      );

      return res.status(201).json(newProject);
    } catch (error) {
      console.error('Error saving project:', error);
      return res.status(500).json({ message: error.message || 'Failed to save project' });
    }
  }
);



router.put(
  '/:id',
  upload.fields([
    { name: 'projectImage', maxCount: 1 },
    { name: 'projectFile', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const currentProject = await Project.findById(req.params.id);
      if (!currentProject)
        return res.status(404).json({ message: 'Project not found' });


      const initial = req.body.initialDeadline
        ? new Date(req.body.initialDeadline)
        : currentProject.deadlines?.initial;
      const half = req.body.halfDeadline
        ? new Date(req.body.halfDeadline)
        : currentProject.deadlines?.half;
      const final = req.body.finalDeadline
        ? new Date(req.body.finalDeadline)
        : currentProject.deadlines?.final;

  
      let newType = currentProject.projectType;
      if (typeof req.body.projectType === 'string') {
        const t = req.body.projectType.toLowerCase();
        if (t === 'project' || t === 'campaign') newType = t;
      }

      const updates = {
        title: req.body.title ?? currentProject.title,
        brief: req.body.brief ?? currentProject.brief,
        category: req.body.category ?? currentProject.category,
        budget: req.body.budget ? Number(req.body.budget) : currentProject.budget,
        status: req.body.status ?? currentProject.status,
        projectType: newType,

   
        deadlines: { initial, half, final },
        duration: { from: initial, to: half },

        skills: req.body.skills
          ? sanitizeSkills(req.body.skills)
          : currentProject.skills,
      };

    
      if (req.files['projectImage']) {
        updates.imageUrl = `${baseUrl}/${req.files['projectImage'][0].path}`;
      } else {
        updates.imageUrl = currentProject.imageUrl;
      }

   
      const kept = (() => {
        const raw = req.body.existingFiles;
        if (!raw) return currentProject.files || [];
        let urls = [];
        try {
          urls = JSON.parse(raw);
        } catch {
          urls = Array.isArray(raw) ? raw : [raw];
        }
        return urls
          .map((u) => ({ name: nameFromUrl(u), url: String(u) }))
          .filter((f) => f.url);
      })();

      const newUploads = req.files['projectFile']
        ? req.files['projectFile'].map((file) => ({
            name: file.originalname,
            url: `${baseUrl}/${file.path}`,
          }))
        : [];

      updates.files = [...kept, ...newUploads];

      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      const actorId = req.body.authorId || currentProject.authorId?.toString();
      await logAction({
        userId: actorId,
        action: 'Edited Project',
        projectId: updatedProject._id,
      });

      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  }
);

module.exports = router;
