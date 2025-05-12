const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads/messages folder exists
const uploadDir = path.join(__dirname, "..", "uploads", "messages");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route: POST /api/upload-message-files
router.post("/", upload.array("attachments"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  const files = req.files.map((file) => ({
    name: file.originalname,
    url: `/uploads/messages/${file.filename}`,
  }));

  res.status(200).json({ files });
});

module.exports = router;
