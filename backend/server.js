const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();

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

// 3. Static files (uploaded project files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. API Routes
app.use('/api/users', userRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/client/analytics', analyticsClientRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin/analytics', analyticsAdminRoutes);

// 5. Health Check Route
app.get('/', (req, res) => {
  res.send('🎯 API is running...');
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
