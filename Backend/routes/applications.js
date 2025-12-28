const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const Project = require("../models/Project");
const Freelancer = require("../models/Freelancer");
const Assignment = require("../models/Assignment");
const Client = require("../models/Client");

const logAction = require("../utils/logAction");
const { sendNotification } = require("../utils/sendNotification");
const sendEmail = require("../utils/sendEmail");
const {
  newApplicationReceived,
  applicationSubmitted,
  assignmentAssigned,
} = require("../utils/emailTemplates");

const FRONTEND_URL = process.env.FRONTEND_URL || "https://ctrlz.bh";

/* ---------- List by author ---------- */
router.get("/by-author/:authorId", async (req, res) => {
  try {
    const applications = await Application.find({ authorId: req.params.authorId })
      .populate({ path: "projectId", select: "title imageUrl" })
      .populate({ path: "freelancerId", select: "fullName" });

    const formatted = applications.map((app) => ({
      _id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      project: app.projectId
        ? { id: app.projectId._id, title: app.projectId.title, imageUrl: app.projectId.imageUrl }
        : null,
      freelancer: app.freelancerId
        ? { id: app.freelancerId._id, name: app.freelancerId.fullName }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
});

/* ---------- APPROVE (single source of truth) ---------- */
router.post("/:projectId/approve", async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;
    const FRONTEND = process.env.FRONTEND_URL || "https://ctrlz.bh";

    // 1) Mark the application as Assigned
    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: "Assigned" },
      { new: true }
    );
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 2) Reflect in freelancer embedded list
    await Freelancer.updateOne(
      { _id: freelancerId, "applications.projectId": projectId },
      { $set: { "applications.$.status": "Assigned" } }
    );

    // 3) Create assignment if needed + mirror to project
    let assignment = await Assignment.findOne({ projectId, freelancerId });
    if (!assignment) {
      assignment = await Assignment.create({
        projectId,
        freelancerId,
        authorId: updatedApplication.authorId,
        status: "Assigned",
      });
      await Project.findByIdAndUpdate(projectId, {
        assignmentId: assignment._id,
        status: "Assigned",
      });
    }

    // 4) Fetch entities for comms
    const [freelancer, project] = await Promise.all([
      Freelancer.findById(freelancerId).select("fullName email"),
      Project.findById(projectId).select("title"),
    ]);

    // 5) In-app notification to the freelancer
    try {
      const notif = await sendNotification({
        userId: freelancerId,
        userType: "freelancer",
        subject: "You’ve been assigned a new project",
        message: `You’ve been assigned to “${project?.title || "Project"}”.`,
        type: "success",
        meta: { projectId, assignmentId: assignment._id, deeplink: `/project-details/${projectId}` },
      });
      console.log("[applications:approve] notification created:", !!notif, notif?._id || "");
    } catch (e) {
      console.warn("[applications:approve] sendNotification failed:", e?.message || e);
    }

    // 6) Branded HTML email
    try {
      if (freelancer?.email) {
        const html = assignmentAssigned({
          name: freelancer.fullName || "there",
          projectTitle: project?.title || "Project",
          projectLink: `${FRONTEND}/project-details/${projectId}`,
        });
        await sendEmail({
          to: freelancer.email,
          subject: "You’ve been assigned a new project",
          html,
          text:
            `Hi ${freelancer.fullName || "there"},\n\n` +
            `You’ve been assigned to the project "${project?.title || "Project"}".\n` +
            `Open the project: ${FRONTEND}/project-details/${projectId}\n`,
        });
      }
    } catch (e) {
      console.warn("[applications:approve] templated email failed:", e?.message || e);
    }

    // 7) Audit log
    await logAction({
      userId: updatedApplication.authorId,
      action: "Approved Application",
      projectId,
    });

    // 8) Done
    return res.json({
      message: "Application approved, assignment created, and project marked as Assigned.",
      updatedApplication,
      assignmentId: assignment?._id,
    });
  } catch (error) {
    console.error("Error approving application:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ---------- REJECT ---------- */
router.post("/:projectId/reject", async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { projectId } = req.params;

    const updatedApplication = await Application.findOneAndUpdate(
      { projectId, freelancerId },
      { status: "Cancelled" },
      { new: true }
    );
    if (!updatedApplication) return res.status(404).json({ message: "Application not found" });

    await Freelancer.updateOne(
      { _id: freelancerId, "applications.projectId": projectId },
      { $set: { "applications.$.status": "Cancelled" } }
    );

    const freelancer = await Freelancer.findById(freelancerId);
    const project = await Project.findById(projectId);

    if (freelancer && project) {
      await sendNotification({
        userId: freelancer._id,
        userType: "freelancer",
        subject: "Application Rejected",
        message: `Hi ${freelancer.fullName}, your application to “${project.title}” was declined.`,
        type: "info",
        meta: { projectId },
      });
    }

    await logAction({ userId: updatedApplication.authorId, action: "Rejected Application", projectId });

    res.json({ message: "Application cancelled and freelancer notified.", updatedApplication });
  } catch (error) {
    console.error("Error cancelling application:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ---------- CREATE APPLICATION ---------- */
router.post("/create", async (req, res) => {
  try {
    const { projectId, freelancerId, authorId, paymentInfo } = req.body;

    if (!projectId || !freelancerId || !authorId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Application.findOne({ projectId, freelancerId });
    if (existing) return res.status(400).json({ message: "You have already applied to this project." });

    let finalPaymentInfo = paymentInfo && typeof paymentInfo === "object" ? { ...paymentInfo } : {};
    if (!finalPaymentInfo.iban) {
      const f = await Freelancer.findById(freelancerId).select("iban");
      if (f?.iban) finalPaymentInfo.iban = String(f.iban).trim();
    }

    const app = await Application.create({
      projectId,
      freelancerId,
      authorId,
      status: "Under Review",
      paymentInfo: finalPaymentInfo,
    });

    await Freelancer.updateOne(
      { _id: freelancerId },
      { $push: { applications: { projectId, status: "Under Review" } } }
    );

    res.status(201).json({ message: "Application submitted", applicationId: app._id, status: "Under Review" });

    // Fire-and-forget notifications + emails
    (async () => {
      try {
        const [freelancer, project, client] = await Promise.all([
          Freelancer.findById(freelancerId).select("fullName email"),
          Project.findById(projectId).select("title"),
          Client.findById(authorId).select("fullName email"),
        ]);

        if (client && freelancer && project) {
          await sendNotification({
            userId: client._id,
            userType: "client",
            subject: "New Application Received",
            message: `${freelancer.fullName} has applied to your project “${project.title}”.`,
            type: "info",
            meta: { projectId, applicationId: app._id },
          });
        }

        if (freelancer && project) {
          await sendNotification({
            userId: freelancer._id,
            userType: "freelancer",
            subject: "Application submitted",
            message: `Your application to “${project.title}” was submitted successfully.`,
            type: "success",
            meta: { projectId, applicationId: app._id },
          });
        }

        try {
          if (client?.email) {
            const htmlClient = newApplicationReceived({
              name: client.fullName || "there",
              freelancerName: freelancer?.fullName || "A freelancer",
              projectTitle: project?.title || "Project",
              reviewLink: `${FRONTEND_URL}/project-details/${projectId}?tab=applications`,
            });
            await sendEmail({
              to: client.email,
              subject: `New application for "${project?.title || "your project"}"`,
              html: htmlClient,
              text:
                `Hi ${client.fullName || "there"},\n\n` +
                `${freelancer?.fullName || "A freelancer"} applied to your project "${project?.title || "Project"}".\n` +
                `Review applications: ${FRONTEND_URL}/project-details/${projectId}?tab=applications\n`,
            });
          }

          if (freelancer?.email) {
            const htmlFreelancer = applicationSubmitted({
              name: freelancer.fullName || "there",
              projectTitle: project?.title || "Project",
              projectLink: `${FRONTEND_URL}/project-details/${projectId}`,
            });
            await sendEmail({
              to: freelancer.email,
              subject: "Your application was submitted",
              html: htmlFreelancer,
              text:
                `Hi ${freelancer.fullName || "there"},\n\n` +
                `Your application to "${project?.title || "the project"}" was submitted successfully.\n` +
                `View project: ${FRONTEND_URL}/project-details/${projectId}\n`,
            });
          }
        } catch (e) {
          console.warn("[applications] email send failed:", e?.message || e);
        }

        await logAction({ userId: freelancerId, action: "Applied to Project", projectId });
      } catch (e) {
        console.warn("[applications] post-send work failed:", e?.message || e);
      }
    })();
  } catch (error) {
    console.error("Error creating application:", error);
    return res.status(500).json({ message: "Error submitting application", error: error.message });
  }
});

/* ---------- Check applied ---------- */
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

/* ---------- Misc fetchers ---------- */
router.get("/by-project-and-freelancer", async (req, res) => {
  const { projectId, freelancerId } = req.query;
  try {
    const application = await Application
      .findOne({ projectId, freelancerId })
      .populate({ path: "freelancerId", select: "fullName email iban" });

    if (!application) return res.status(404).json({ message: "Not found" });

    const obj = application.toObject();
    const existing = obj.paymentInfo || {};
    const mergedPayment = { ...existing, iban: (existing.iban || obj.freelancerId?.iban || "").trim() };

    res.json({ ...obj, paymentInfo: mergedPayment });
  } catch (err) {
    console.error("by-project-and-freelancer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/by-project/:projectId", async (req, res) => {
  try {
    const app = await Application.findOne({ projectId: req.params.projectId });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

module.exports = router;
