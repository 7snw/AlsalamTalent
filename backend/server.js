const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();

// Import routes
const analyticsClientRoutes = require('./routes/analyticsClient');
const applicationRoutes = require('./routes/applications'); // Import application routes

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/client', analyticsClientRoutes); // Analytics route for client
app.use('/api/applications', applicationRoutes); // Register the applications routes under /api/applications

// Other routes like user, freelancer, projects, etc.
app.use('/api/users', require('./routes/users'));
app.use('/api/freelancer', require('./routes/freelancers'));
app.use('/api/projects', require('./routes/projects'));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.send('🎯 API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
