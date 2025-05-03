// Updated server.js (main backend file)

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();
const multer = require('multer');

// Import routes
const userRoutes = require('./routes/users'); // login + register users
const freelancerRoutes = require('./routes/freelancers');
const clientRoutes = require('./routes/clients');
const analyticsClientRoutes = require('./routes/analyticsClient');
const applicationRoutes = require('./routes/applications');
const projectRoutes = require('./routes/projects');
const analyticsAdminRoutes = require('./routes/analyticsAdmin');

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Configure Multer (file uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, JPG, or WEBP images are allowed.'), false);
  }
};

const anyFileFilter = (req, file, cb) => {
  cb(null, true); // Allow any file type
};

// Upload handlers
const uploadImage = multer({ storage, fileFilter: imageFileFilter });
const uploadAnyFile = multer({ storage, fileFilter: anyFileFilter });

// 4. Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. API Routes
app.use('/api/users', userRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/client/analytics', analyticsClientRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin/analytics', analyticsAdminRoutes);

// 6. Upload routes
app.post('/api/upload-image', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded');
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

app.post('/api/upload-file', uploadAnyFile.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// 7. Health Check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));