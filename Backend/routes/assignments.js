// routes/assignments.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const Assignment = require('../models/Assignment');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const Project = require('../models/Project');
const logAction = require('../utils/logAction');
const { sendNotification } = require('../utils/sendNotification');

const sendEmail = require('../utils/sendEmail');
const {
  assignmentAssigned,
  // NEW: use the dedicated templates you added
  stageSubmittedForClient,
  stageReviewedForFreelancer,
  finalRatedForFreelancer,
} = require('../utils/emailTemplates');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ctrlz.bh';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join('uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });
const BASE_URL = 'http://localhost:5000';
const VALID_STAGES = ['initial', 'half', 'final'];
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/* ---------------- helpers ---------------- */
const STAGE_TITLES = {
  initial: 'Initial Concept',
  half: '50% of the work',
  final: 'Final Submission',
};

// Plain wrapper used only as a fallback
const htmlWrap = (title, paragraphs = []) =>
  `
  <div style="font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#0f1b2d;line-height:1.5">
    <h2 style="margin:0 0 10px">${title}</h2>
    ${paragraphs.map(p => `<p style="margin:0 0 10px">${p}</p>`).join('')}
  </div>
  `;

async function emailAndNotify({
  toUser,    // mongoose doc with fullName/email/_id
  toType,    // 'client' | 'freelancer'
  subject,
  text,
  html,
  notifType = 'info',
  meta = {},
}) {
  try {
    if (toUser?._id) {
      await sendNotification({
        userId: toUser._id,
        userType: toType,
        subject,
        message: text,
        type: notifType,
        meta,
      });
    }
  } catch (e) {
    console.warn('[notify] failed:', e?.message || e);
  }

  try {
    if (toUser?.email) {
      await sendEmail({
        to: toUser.email,
        subject,
        html: html || htmlWrap(subject, [text]),
        text,
      });
    }
  } catch (e) {
    console.warn('[email] failed:', e?.message || e);
  }
}

// helper: recompute aggregates (mirrors model logic)
const recomputeAggregate = (a) => {
  const s = a.stages || {};
  const ok = (x) => ['reviewed', 'completed'].includes(x);
  let done = 0;
  if (ok(s.initial?.status)) done += 1;
  if (ok(s.half?.status)) done += 1;
  if (ok(s.final?.status)) done += 1;
  a.progressPercentage = Math.round((done / 3) * 100);

  const locked = ['Requested Revision', 'Re-submitted', 'Declined'].includes(a.status);

  if (!locked) {
    if (s.final?.status === 'completed') a.status = 'Completed';
    else if (
      ['pending', 'submitted'].includes(s.initial?.status) ||
      ['pending', 'submitted'].includes(s.half?.status) ||
      ['pending', 'submitted'].includes(s.final?.status)
    ) {
      if (a.status !== 'Re-submitted') a.status = 'Submitted';
    } else {
      a.status = 'Assigned';
    }
  }

  if (typeof s.final?.rating === 'number') a.rating = s.final.rating;
  const lastFb =
    (s.final?.feedback || '').trim() ||
    (s.half?.feedback || '').trim() ||
    (s.initial?.feedback || '').trim();
  if (lastFb) a.feedback = lastFb;
};

/* =================== ASSIGN =================== */
router.post('/assign', async (req, res) => {
  try {
    const { projectId, freelancerId, authorId } = req.body;
    if (!projectId || !freelancerId || !authorId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [project, freelancer] = await Promise.all([
      Project.findById(projectId).select('title'),
      Freelancer.findById(freelancerId).select('fullName email'),
    ]);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const assignment = await Assignment.create({
      projectId,
      freelancerId: freelancer._id,
      authorId,
      status: 'Assigned',
      assignedAt: new Date(),
    });

    // In-app notification
    try {
      const notif = await sendNotification({
        userId: freelancer._id,
        userType: 'freelancer',
        subject: 'You’ve been assigned a new project',
        message: `You’ve been assigned to “${project?.title || 'Project'}”.`,
        type: 'success',
        meta: { projectId, assignmentId: assignment._id, deeplink: `/project-details/${projectId}` },
      });
      console.log('[assignments:assign] notification created:', !!notif, notif?._id || '');
    } catch (e) {
      console.warn('[assignments:assign] sendNotification failed:', e?.message || e);
    }

    try { await Project.findByIdAndUpdate(projectId, { status: 'Assigned' }); } catch {}

    await logAction({ userId: authorId, action: 'Assigned Project to Freelancer', projectId });

    // Branded email
    try {
      if (freelancer.email) {
        const html = assignmentAssigned({
          name: freelancer.fullName || 'there',
          projectTitle: project?.title || 'Project',
          projectLink: `${FRONTEND_URL}/project-details/${projectId}`,
        });
        await sendEmail({
          to: freelancer.email,
          subject: 'You’ve been assigned a new project',
          html,
          text:
            `Hi ${freelancer.fullName || 'there'},\n\n` +
            `You’ve been assigned to the project "${project?.title || 'Project'}".\n` +
            `Open the project: ${FRONTEND_URL}/project-details/${projectId}\n`,
        });
      }
    } catch (e) {
      console.warn('[assign] assignment email failed:', e?.message || e);
    }

    return res.status(201).json({ message: 'Assignment created and freelancer notified.', assignment });
  } catch (error) {
    console.error('Error assigning project:', error);
    return res.status(500).json({ message: 'Failed to assign project', error: error.message });
  }
});

/* =================== BASIC FETCHERS =================== */
router.get('/by-author/:authorId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ authorId: req.params.authorId })
      .populate('projectId', 'title imageUrl')
      .populate('freelancerId', 'fullName');
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-freelancer/:freelancerId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ freelancerId: req.params.freelancerId })
      .populate('projectId', 'title imageUrl')
      .populate('authorId', 'fullName');
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching freelancer assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('projectId')
      .populate('freelancerId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =================== RATING AGGREGATION =================== */
const updateFreelancerRating = async (freelancerId) => {
  const assignments = await Assignment.find({
    freelancerId,
    status: 'Completed',
    rating: { $ne: null },
  });
  if (assignments.length > 0) {
    const total = assignments.reduce((sum, a) => sum + (Number(a.rating) || 0), 0);
    const avgRating = total / assignments.length;
    await Freelancer.findByIdAndUpdate(freelancerId, { rating: Number(avgRating.toFixed(2)) });
  }
};

/* =================== STAGES =================== */

// Upload files to a stage (does NOT mark as submitted)
router.post('/:id/stages/:stage/upload', upload.array('docs'), async (req, res) => {
  try {
    const { id, stage } = req.params;
    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // hard close
    if (assignment.terminal || assignment.status === 'Declined') {
      return res.status(403).json({ message: 'This assignment was closed by the client.' });
    }

    // Progress gating
    if (stage === 'half' && !['reviewed', 'completed'].includes(assignment.stages.initial.status)) {
      return res.status(400).json({ message: 'You must finish Initial review before uploading 50%.' });
    }
    if (stage === 'final' && !['reviewed', 'completed'].includes(assignment.stages.half.status)) {
      return res.status(400).json({ message: 'You must finish 50% review before uploading Final.' });
    }

    const files = (req.files || []).map((f) => ({
      name: f.originalname,
      url: `${BASE_URL}/uploads/${f.filename}`,
    }));

    assignment.stages[stage].docs = [
      ...(assignment.stages[stage].docs || []),
      ...files,
    ];

    await assignment.save();
    res.json({ message: 'Files uploaded to stage', assignment });
  } catch (err) {
    console.error('Stage upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a stage as submitted/pending (awaiting client review)
router.put('/:id/stages/:stage/submit', async (req, res) => {
  try {
    const { id, stage } = req.params;
    if (!VALID_STAGES.includes(stage)) return res.status(400).json({ message: 'Invalid stage' });

    const assignment = await Assignment.findById(id)
      .populate('projectId')
      .populate('freelancerId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.terminal || assignment.status === 'Declined') {
      return res.status(403).json({ message: 'This assignment was closed by the client.' });
    }

    if ((assignment.stages[stage].docs || []).length === 0) {
      return res.status(400).json({ message: 'Attach files before submitting.' });
    }

    if (stage === 'half' && !['reviewed', 'completed'].includes(assignment.stages.initial.status)) {
      return res.status(400).json({ message: 'Initial must be reviewed before submitting 50%.' });
    }
    if (stage === 'final' && !['reviewed', 'completed'].includes(assignment.stages.half.status)) {
      return res.status(400).json({ message: '50% must be reviewed before submitting Final.' });
    }

    assignment.stages[stage].status = 'pending'; // waiting for client
    assignment.submittedAt = new Date();

    // If the assignment was in a revision flow, show "Re-submitted". Otherwise "Submitted".
    if (['Requested Revision', 'Declined', 'Re-submitted'].includes(assignment.status)) {
      assignment.status = 'Re-submitted';
    } else {
      assignment.status = 'Submitted';
    }

    await assignment.save();

    // ===== NOTIFY + EMAIL: client (author) about submission (uses your template) =====
    try {
      const client = await Client.findById(assignment.authorId).select('fullName email');
      const stageTitle = STAGE_TITLES[stage] || 'Submission';
      const subject = `New ${stageTitle} submitted — ${assignment.projectId?.title || 'Project'}`;
      const reviewLink = `${FRONTEND_URL}/submitted/${assignment._id}`; // adjust if needed

      const html = stageSubmittedForClient({
        name: client?.fullName || 'there',
        projectTitle: assignment.projectId?.title || 'Project',
        stage,
        reviewLink,
        freelancerName: assignment.freelancerId?.fullName || 'Your freelancer',
      });
      const text =
        `${assignment.freelancerId?.fullName || 'A freelancer'} submitted files for ${stageTitle}. ` +
        `Open the review screen to approve or request changes: ${reviewLink}`;

      await emailAndNotify({
        toUser: client,
        toType: 'client',
        subject,
        text,
        html,
        notifType: 'info',
        meta: {
          projectId: assignment.projectId?._id,
          assignmentId: assignment._id,
          stage,
          deeplink: `/submitted/${assignment._id}`,
        },
      });
    } catch (e) {
      console.warn('[submit] notify client failed:', e?.message || e);
    }

    res.json({ message: 'Stage submitted, awaiting review', assignment });
  } catch (err) {
    console.error('Stage submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Client review of a stage (approve / request revision / decline). Final can carry a rating.
router.put('/:id/stages/:stage/review', async (req, res) => {
  try {
    const { id, stage } = req.params;
    if (!VALID_STAGES.includes(stage)) return res.status(400).json({ message: 'Invalid stage' });

    // status: 'reviewed' | 'declined' | 'completed'
    // decision (optional when status==='declined'): 'revise' | 'reject'
    const { status, feedback, rating, decision } = req.body;
    if (!['reviewed', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid review status' });
    }

    const assignment = await Assignment.findById(id)
      .populate('projectId')
      .populate('freelancerId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.stages[stage].status = (status === 'completed' && stage !== 'final') ? 'reviewed' : status;
    assignment.stages[stage].feedback = feedback || '';

    if (stage === 'final' && status === 'completed' && rating != null) {
      assignment.stages.final.rating = clamp(Math.round(Number(rating) || 1), 1, 5);
    }

    // Drive top-level status precisely
    if (status === 'declined') {
      if (decision === 'reject') {
        // Terminal decline: fully closed
        assignment.status = 'Declined';
        assignment.terminal = true;
      } else {
        // Non-terminal decline: ask for revision
        assignment.status = 'Requested Revision';
        assignment.terminal = false;
      }
    } else if (stage === 'final' && status === 'completed') {
      assignment.status = 'Completed';
    }

    await assignment.save();

    // sync project + freelancer rating when fully completed
    if (assignment.status === 'Completed') {
      await Project.findByIdAndUpdate(assignment.projectId, { status: 'Completed' });
      await updateFreelancerRating(assignment.freelancerId);
    }

    await logAction({
      userId: assignment.authorId,
      action:
        status === 'declined'
          ? (assignment.status === 'Declined' ? 'Rejected Submitted Work' : 'Requested Revisions')
          : status === 'completed'
          ? 'Approved Final Work'
          : 'Reviewed Stage',
      projectId: assignment.projectId,
    });

    /* ===== NOTIFY + EMAIL: freelancer about the review/feedback/rating (use templates) ===== */
    try {
      const freelancer = assignment.freelancerId; // populated
      const stageTitle = STAGE_TITLES[stage] || 'Submission';
      const workLink = `${FRONTEND_URL}/project-details/${assignment.projectId?._id}`;

      if (status === 'reviewed') {
        const subject = `Your ${stageTitle} was reviewed — ${assignment.projectId?.title || 'Project'}`;
        const html = stageReviewedForFreelancer({
          name: freelancer?.fullName || 'there',
          projectTitle: assignment.projectId?.title || 'Project',
          stage,
          status,
          feedback,
          openLink: workLink,
        });
        const text = `Client reviewed your ${stageTitle}. Feedback: ${feedback || '—'}`;

        await emailAndNotify({
          toUser: freelancer,
          toType: 'freelancer',
          subject,
          text,
          html,
          notifType: 'success',
          meta: { projectId: assignment.projectId?._id, assignmentId: assignment._id, stage, deeplink: `/project/${assignment._id}` },
        });
      } else if (status === 'declined') {
        const isReject = assignment.status === 'Declined';
        const subject = isReject
          ? `Submission declined — ${assignment.projectId?.title || 'Project'}`
          : `Revision requested — ${stageTitle} · ${assignment.projectId?.title || 'Project'}`;
        const text = `${isReject ? 'Your submission was declined.' : 'Revisions were requested.'} Feedback: ${feedback || '—'}`;


        const html = stageReviewedForFreelancer({
   name: freelancer?.fullName || 'there',
  projectTitle: assignment.projectId?.title || 'Project',
   stage,
   status: isReject ? 'declined' : 'revision_requested',
  feedback,
  openLink: workLink,
 });
        await emailAndNotify({
          toUser: freelancer,
          toType: 'freelancer',
          subject,
          text,
          html,
          notifType: isReject ? 'error' : 'warning',
          meta: { projectId: assignment.projectId?._id, assignmentId: assignment._id, stage, deeplink: `/project/${assignment._id}` },
        });
      } else if (stage === 'final' && status === 'completed') {
        const stars = Number(assignment.stages?.final?.rating || 0);
        const subject = `Final Submittion — ${assignment.projectId?.title || 'Project'}`;
        const html = finalRatedForFreelancer({
          name: freelancer?.fullName || 'there',
          projectTitle: assignment.projectId?.title || 'Project',
          rating: stars,
          feedback,
          openLink: workLink,
        });
        const text = `Your final submission was approved. Rating: ${stars}/5.${feedback ? ` Feedback: ${feedback}` : ''}`;

        await emailAndNotify({
          toUser: freelancer,
          toType: 'freelancer',
          subject,
          text,
          html,
          notifType: 'success',
          meta: { projectId: assignment.projectId?._id, assignmentId: assignment._id, stage: 'final', deeplink: `/project/${assignment._id}` },
        });
      }
    } catch (e) {
      console.warn('[review] notify freelancer failed:', e?.message || e);
    }

    res.json({ message: 'Stage reviewed', assignment });
  } catch (err) {
    console.error('Stage review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =================== LEGACY (kept) =================== */

router.put('/:id/update-status', async (req, res) => {
  try {
    const { status, feedback } = req.body;
    let rating = Number(req.body.rating);
    if (!Number.isFinite(rating)) rating = undefined;

    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Assignment not found' });

    a.status = status || a.status;
    if (a.status === 'Declined') a.terminal = true;
    if (typeof rating === 'number') a.rating = clamp(Math.round(rating), 1, 5);
    if (typeof feedback === 'string') a.feedback = feedback;

    // propagate decline to current stage (best effort)
    if ((status || a.status) === 'Declined') {
      const st = a.stages || {};
      const pick = (key) => st[key] && !['completed'].includes(st[key].status);
      const targetKey = pick('final') ? 'final' : pick('half') ? 'half' : 'initial';
      if (targetKey && st[targetKey]) {
        if (st[targetKey].status !== 'declined') {
          st[targetKey].status = 'declined';
        }
      }
    }

    // mirror “Completed” to project + rating aggregation
    if (a.status === 'Completed') {
      await Project.findByIdAndUpdate(a.projectId, { status: 'Completed' });
      await updateFreelancerRating(a.freelancerId);
    } else if (a.status === 'Submitted' || a.status === 'Re-submitted') {
      await Project.findByIdAndUpdate(a.projectId, { status: a.status });
    }

    recomputeAggregate(a);
    await a.save();

    await logAction({
      userId: a.authorId,
      action:
        a.status === 'Completed'
          ? 'Approved Submitted Work'
          : a.status === 'Declined'
          ? 'Rejected Submitted Work'
          : 'Updated Assignment Status',
      projectId: a.projectId,
    });

    res.json({ message: 'Assignment updated successfully', updated: a });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy docs upload endpoints unchanged…
router.post('/:id/update-docs', upload.array('docs'), async (req, res) => {
  try {
    const files = (req.files || []).map((file) => ({
      name: file.originalname,
      url: `${BASE_URL}/uploads/${file.filename}`,
    }));

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          docs: { $each: files },
          files: { $each: files },
        },
        submitted: true,
      },
      { new: true }
    ).populate('projectId');

    if (!updated) return res.status(404).json({ message: 'Assignment not found' });

    const freelancer = await Freelancer.findById(updated.freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const projectRecord = freelancer.projects.find((p) => p.projectTitle === updated.projectId.title);
    const newFiles = files.map((f) => f.url);

    if (projectRecord) {
      projectRecord.projectFiles.push(...newFiles);
      projectRecord.projectStatus = updated.status;
      projectRecord.projectImage = updated.projectId.imageUrl || '';
    } else {
      freelancer.projects.push({
        projectTitle: updated.projectId.title,
        projectStatus: updated.status,
        projectFiles: newFiles,
        projectImage: updated.projectId.imageUrl || '',
      });
    }
    await freelancer.save();

    await logAction({
      userId: updated.freelancerId,
      action: 'Submitted Work (Legacy)',
      projectId: updated.projectId._id,
    });

    res.json({ message: 'Docs saved to assignment and freelancer profile', updated });
  } catch (err) {
    console.error('Error uploading docs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/update-docs', async (req, res) => {
  try {
    const { docs } = req.body; // [{ name, url }]
    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { docs, submitted: Array.isArray(docs) && docs.length > 0 },
      { new: true }
    ).populate('projectId');

    if (!updated) return res.status(404).json({ message: 'Assignment not found' });

    const freelancer = await Freelancer.findById(updated.freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const target = freelancer.projects.find((p) => p.projectTitle === updated.projectId.title);
    if (target) {
      target.projectFiles = (docs || []).map((d) => d.url);
      await freelancer.save();
    }

    res.json({ message: 'Assignment and freelancer project docs updated', updated });
  } catch (error) {
    console.error('Error updating docs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
