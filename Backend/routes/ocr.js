// routes/ocr.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { createWorker } = require('tesseract.js');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req,_file,cb)=>cb(null, uploadDir),
  filename: (_req,file,cb)=>cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/cpr-ocr', upload.single('cprImage'), async (req,res) => {
  if (!req.file) return res.status(400).json({ message:'No image uploaded.' });

  const worker = await createWorker({ logger:()=>{} });
  try {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data:{ text } } = await worker.recognize(req.file.path);
    const cpr = (text || '').replace(/\D/g,'').match(/\d{9}/)?.[0] || '';
    await worker.terminate();
    try { fs.unlinkSync(req.file.path); } catch {}

    if (!cpr) return res.status(400).json({ message:'CPR not detected. Please type it manually.' });
    return res.json({ cpr });
  } catch (e) {
    try { await worker.terminate(); } catch {}
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(500).json({ message:'OCR failed.' });
  }
});

module.exports = router;
