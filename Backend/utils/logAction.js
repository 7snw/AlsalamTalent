// utils/logAction.js
const AuditLog = require('../models/AuditLog');
const Project  = require('../models/Project');

/**
 * Use either:
 *   await logAction(req, { action:'Edited Project', projectId })
 *   await logAction({ userId, action:'Edited Project', projectId })
 */
async function logAction(reqOrOpts, maybeOpts) {
  try {
    const looksLikeReq =
      reqOrOpts &&
      typeof reqOrOpts === 'object' &&
      ('headers' in reqOrOpts || 'method' in reqOrOpts);

    const req  = looksLikeReq ? reqOrOpts : undefined;
    const opts = looksLikeReq ? (maybeOpts || {}) : (reqOrOpts || {});

    let {
      userId: explicitUserId,
      action,
      details = '',
      projectId = null,
    } = opts;

    // 🔎 Resolve userId from many places (now includes authorId)
    const userId =
      explicitUserId ||
      req?.userId ||
      req?.user?._id ||
      req?.params?.userId ||
      req?.params?.authorId ||
      req?.body?.userId ||
      req?.body?.authorId ||
      req?.query?.userId;

    // infer projectId if omitted
    if (!projectId) {
      projectId =
        req?.params?.projectId ||
        req?.params?.id ||
        req?.body?.projectId ||
        null;
    }

    if (!action) {
      console.warn('logAction: missing "action" — skipping write');
      return;
    }
    if (!userId) {
      console.warn('logAction: missing "userId" — skipping write for action:', action);
      return;
    }

    // build details; append project title if not already present
    let finalDetails = String(details || '');
    const mentionsProject = /\bproject\s*:/i.test(finalDetails);

    if (projectId && !mentionsProject) {
      try {
        const project = await Project.findById(projectId).select('title').lean();
        const label = project?.title ? project.title : `ID: ${projectId}`;
        finalDetails = finalDetails ? `${finalDetails} | Project: ${label}` : `Project: ${label}`;
      } catch {
        finalDetails = finalDetails ? `${finalDetails} | Project: ID: ${projectId}` : `Project: ID: ${projectId}`;
      }
    }

    const ip = req?.ip || req?.headers?.['x-forwarded-for'];
    const ua = req?.headers?.['user-agent'];

    await AuditLog.create({
      userId,
      action,
      details: finalDetails,
      ip,
      ua,
    });
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
}

module.exports = logAction;
