// server.js

const express = require('express');
const cors = require('cors')
const connectDB = require('./db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // ✅ Enable CORS for all routes
app.use(express.json()); // For parsing application/json

// Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
