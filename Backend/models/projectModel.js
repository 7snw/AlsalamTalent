const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectTitle: String,
  description: String,
  budget: String,
  startDate: String,
  endDate: String,
  category: String,
  projectFiles: String,
  contractDocs: String,
  projectImage: String
});

module.exports = mongoose.model('Project', projectSchema);
