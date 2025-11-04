const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logAction = require('../utils/logAction');



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
const nameFromUrl = (u) => {
  try {
    const p = new URL(u);
    return decodeURIComponent(path.basename(p.pathname));
  } catch {
    try {
      return decodeURIComponent(path.basename(u || ''));
    } catch {
      return String(u || '').split('/').pop() || 'file';
    }
  }
};


router.post(
  '/upload',
  upload.fields([
    { name: 'resourceImage', maxCount: 1 },
    { name: 'resourceFile',  maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        section,          
        description,
        externalUrl,
        order
      } = req.body;

      if (!title || !section) {
        return res.status(400).json({ message: 'Title and section are required.' });
      }

      const sec = String(section || '').toLowerCase();
      if (!['platform','resources','bank'].includes(sec)) {
        return res.status(400).json({ message: 'Invalid section.' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const imageUrl = req.files['resourceImage']
        ? `${baseUrl}/${req.files['resourceImage'][0].path}` : '';

      const files = req.files['resourceFile'] ? req.files['resourceFile'].map((f) => ({
        name: f.originalname,
        url: `${baseUrl}/${f.path}`,
      })) : [];

      const newRes = new Resource({
        title,
        section: sec,
        description: description || '',
        externalUrl: externalUrl || '',
        order: Number.isFinite(Number(order)) ? Number(order) : 0,
        imageUrl,
        files,
        docs: []
      });

      await newRes.save();

       await logAction({
      userId: req.user?.id,
      action: 'Uploaded Resource',
      meta: { title: newRes.title, section: newRes.section },
    });

      return res.status(201).json(newRes);
    } catch (err) {
      console.error('Error creating resource:', err);
      return res.status(500).json({ message: err.message || 'Failed to create resource' });
    }
  }
);


router.put(
  '/:id',
  upload.fields([
    { name: 'resourceImage', maxCount: 1 },
    { name: 'resourceFile',  maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const current = await Resource.findById(req.params.id);
      if (!current) return res.status(404).json({ message: 'Resource not found' });

   
      let newSection = current.section;
      if (typeof req.body.section === 'string') {
        const s = req.body.section.toLowerCase();
        if (['platform','resources','bank'].includes(s)) newSection = s;
      }

      const updates = {
        title: req.body.title ?? current.title,
        section: newSection,
        description: req.body.description ?? current.description,
        externalUrl: req.body.externalUrl ?? current.externalUrl,
        order: (req.body.order !== undefined)
          ? Number(req.body.order)
          : current.order,
      };

      
      if (req.files['resourceImage']) {
        updates.imageUrl = `${baseUrl}/${req.files['resourceImage'][0].path}`;
      } else {
        updates.imageUrl = current.imageUrl;
      }

  
      const kept = (() => {
        const raw = req.body.existingFiles;
        if (!raw) return current.files || [];
        let urls = [];
        try { urls = JSON.parse(raw); }
        catch { urls = Array.isArray(raw) ? raw : [raw]; }
        return urls
          .map((u) => ({ name: nameFromUrl(u), url: String(u) }))
          .filter((f) => f.url);
      })();

      const newUploads = req.files['resourceFile']
        ? req.files['resourceFile'].map((file) => ({
            name: file.originalname,
            url: `${baseUrl}/${file.path}`,
          }))
        : [];

      updates.files = [...kept, ...newUploads];

      const updated = await Resource.findByIdAndUpdate(req.params.id, updates, { new: true });

 await logAction({
      userId: req.user?.id,
      action: 'Updated Resource',
      meta: { resourceId: updated._id, title: updated.title },
    });

      return res.json(updated);
    } catch (err) {
      console.error('Error updating resource:', err);
      return res.status(500).json({ message: 'Failed to update resource' });
    }
  }
);


router.get('/', async (req, res) => {
  try {
    const q = {};
    if (req.query.section) {
      const s = String(req.query.section).toLowerCase();
      if (['platform','resources','bank'].includes(s)) q.section = s;
    }
    const list = await Resource.find(q)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(list);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ message: 'Failed to load resources' });
  }
});

module.exports = router;
