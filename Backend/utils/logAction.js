// utils/logAction.js
const AuditLog = require('../models/AuditLog');
const Project = require('../models/Project');

const logAction = async ({ userId, action, details = '', projectId = null }) => {
  try {
    let finalDetails = details;

    if (projectId && !details.includes('project:')) {
      const project = await Project.findById(projectId).select('title');
      const projectTitle = project ? project.title : `ID: ${projectId}`;
      finalDetails += ` | Project: ${projectTitle}`;
    }

    await AuditLog.create({
      userId,
      action,
      details: finalDetails
    });
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
};

module.exports = logAction;
