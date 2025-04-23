const express = require('express');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
connectDB();

app.use(express.json()); // For parsing application/json

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
