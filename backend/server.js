const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();

const projects = require('./routes/projects');


const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Routes
const userRoutes = require('./routes/users'); // login route for all users
app.use('/api/users', userRoutes);
app.use('/api/freelancer', require('./routes/freelancers'));
const clientRoutes = require('./routes/clients');
app.use('/api/client', clientRoutes);
app.use('/api/projects', projects);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Optional: Additional routes (freelancer, client, admin-specific APIs in future)
// const freelancerRoutes = require('./routes/freelancers');
// const clientRoutes = require('./routes/clients');
// const adminRoutes = require('./routes/admins');

// 4. Health Check Route
app.get('/', (req, res) => {
  res.send('🎯 API is running...');
});

// 5. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
