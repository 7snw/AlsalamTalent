const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Project = require("../models/Project");
const Freelancer = require("../models/Freelancer");
const Assignment = require("../models/Assignment");
const logAction = require("../utils/logAction"); // ✅ Import logger
const sendNotification = require("../utils/sendNotification");
const Client = require("../models/Client");

// GET all applications for a client (by authorId)
router.get("/by-author/:authorId", async (req, res) => {
  try {
    const applications = await Application.find({
      authorId: req.params.authorId,
    })
      .populate({ path: "projectId", select: "title imageUrl" })
      .populate({ path: "freelancerId", select: "fullName" });

    const formatted = applications.map((app) => ({
      _id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      project: app.projectId
        ? {
            id: app.projectId._id,
            title: app.projectId.title,
            imageUrl: app.projectId.imageUrl,
          }
        : null,
      freelancer: app.freelancerId
        ? {
            id: app.freelancerId._id,
            name: app.freelancerId.fullName,
          }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
});

router.post("/:projectId/approve", async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;

    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: "Assigned" },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    await Freelancer.updateOne(
      { _id: freelancerId, "applications.projectId": projectId },
      { $set: { "applications.$.status": "Assigned" } }
    );

    const exists = await Assignment.findOne({ projectId, freelancerId });
    let assignment;

 if (!exists) {
  const application = await Application.findOne({
    projectId,
    freelancerId,
  });
  if (!application) {
    return res
      .status(404)
      .json({ message: "Application not found for assignment creation" });
  }

  assignment = new Assignment({
    projectId,
    freelancerId,
    authorId: application.authorId,
    status: "Assigned",
  });

  await assignment.save();

  // ✅ Update project
  await Project.findByIdAndUpdate(projectId, {
    assignmentId: assignment._id,
    status: "Assigned"
  });

  // ✅ Notify freelancer
  const freelancer = await Freelancer.findById(freelancerId);
  const project = await Project.findById(projectId);

  if (freelancer && project) {
    await sendNotification({
      userId: freelancer._id,
      userType: 'freelancer',
      email: freelancer.email,
      subject: 'New Project Assigned',
      message: `Hi ${freelancer.fullName}, you have been assigned to the project "${project.title}".`,
      type: 'info'
    });
  }

  // ✅ Log approval
  await logAction({
    userId: application.authorId,
    action: "Approved Application",
    projectId,
  });
}

    res.json({
      message: "Application approved, assignment created, and project marked as Assigned.",
      updatedApplication,
    });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Reject an application + notify freelancer
router.post("/:projectId/reject", async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;

    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: "Cancelled" },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    await Freelancer.updateOne(
      { _id: freelancerId, "applications.projectId": projectId },
      { $set: { "applications.$.status": "Cancelled" } }
    );

    // ✅ Fetch freelancer and project info
    const freelancer = await Freelancer.findById(freelancerId);
    const project = await Project.findById(projectId);

    if (freelancer && project) {
      // ✅ Send notification to freelancer
      await sendNotification({
        userId: freelancer._id,
        userType: 'freelancer',
        email: freelancer.email,
        subject: 'Application Rejected',
        message: `Hi ${freelancer.fullName}, your application to the project "${project.title}" has been declined.`,
        type: 'info'
      });
    }

    // ✅ Log rejection using projectId
    await logAction({
      userId: updatedApplication.authorId,
      action: "Rejected Application",
      projectId,
    });

    res.json({
      message: "Application cancelled and freelancer notified.",
      updatedApplication,
    });
  } catch (error) {
    console.error("Error cancelling application:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new application
// Create a new application
router.post("/create", async (req, res) => {
  try {
    const { projectId, freelancerId, authorId } = req.body;

    if (!projectId || !freelancerId || !authorId)
      return res.status(400).json({ message: "Missing required fields" });

    const existingApplication = await Application.findOne({ projectId, freelancerId });
    if (existingApplication)
      return res.status(400).json({ message: "You have already applied to this project." });

    const newApplication = new Application({
      projectId,
      freelancerId,
      authorId,
      status: "Under Review"
    });

    await newApplication.save();

    await Freelancer.updateOne(
      { _id: freelancerId },
      { $push: { applications: { projectId, status: "Under Review" } } }
    );

    const freelancer = await Freelancer.findById(freelancerId);
    const project = await Project.findById(projectId);
    const client = await Client.findById(authorId);

    // ✅ Notify client about the new application
    if (client && freelancer && project) {
      await sendNotification({
        userId: client._id,
        userType: 'client',
        email: client.email,
        subject: 'New Application Received',
        message: `${freelancer.fullName} has applied to your project "${project.title}".`,
        type: 'info'
      });
    }

    // ✅ Notify freelancer that their application was submitted
    if (freelancer && project) {
      await sendNotification({
        userId: freelancer._id,
        userType: 'freelancer',
        email: freelancer.email,
        subject: 'Project Application Submitted',
        message: `You have successfully applied to the project "${project.title}". Please wait for client's approval.`,
        type: 'info'
      });
    }

    await logAction({
      userId: freelancerId,
      action: "Applied to Project",
      projectId
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication
    });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ message: "Error submitting application", error: error.message });
  }
});


//  Check if a freelancer has already applied to a project
router.get("/check", async (req, res) => {
  try {
    const { freelancerId, projectId } = req.query;

    if (!freelancerId || !projectId) {
      return res.status(400).json({ message: "Missing freelancerId or projectId" });
    }

    const application = await Application.findOne({ projectId, freelancerId });

    res.json({ applied: !!application });
  } catch (error) {
    console.error("Error checking application status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
