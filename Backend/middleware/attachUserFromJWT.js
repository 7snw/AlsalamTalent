// middleware/attachUserFromJWT.js
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// OPTIONAL: if you want full user objects from DB
const Client = require('../models/Client');
const Admin = require('../models/Admin');
const Freelancer = require('../models/Freelancer');

/**
 * Extract "Bearer <token>" from Authorization header, or x-access-token, or cookie "token".
 */
function getToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (h && typeof h === 'string' && h.startsWith('Bearer ')) return h.slice(7).trim();
  if (req.headers?.['x-access-token']) return String(req.headers['x-access-token']).trim();
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

/**
 * Attach req.user (if token valid). Does NOT throw on missing/invalid token.
 * Your requireAuth/requireRole middlewares will enforce access later.
 */
async function attachUserFromJWT(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return next();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn('[attachUserFromJWT] Missing JWT_SECRET env – token will not be verified.');
      return next();
    }

    const decoded = jwt.verify(token, secret); // throws if invalid/expired
    // decoded should contain { id/_id, role, ... } depending on how you sign it
    const userId = decoded.id || decoded._id;
    const role = (decoded.role || '').toLowerCase();

    // Option A: minimal attach (fast, no DB hit)
    // req.user = { _id: userId, role, token };
    // return next();

    // Option B: hydrate from DB (recommended if you need name/email/etc.)
    let userDoc = null;
    if (role === 'client') userDoc = await Client.findById(userId).select('_id role fullName name email').lean();
    else if (role === 'admin') userDoc = await Admin.findById(userId).select('_id role fullName name email').lean();
    else if (role === 'freelancer') userDoc = await Freelancer.findById(userId).select('_id role fullName name email').lean();

    // If role wasn’t in token or user not found, try best-effort lookup
    if (!userDoc && userId) {
      userDoc =
        (await Client.findById(userId).select('_id role fullName name email').lean()) ||
        (await Admin.findById(userId).select('_id role fullName name email').lean()) ||
        (await Freelancer.findById(userId).select('_id role fullName name email').lean());
    }

    if (userDoc) {
      req.user = {
        _id: userDoc._id,
        role: (userDoc.role || role || '').toLowerCase(),
        name: userDoc.fullName || userDoc.name,
        email: userDoc.email,
      };
    } else if (userId) {
      // Fallback to token claims only
      req.user = { _id: userId, role, ...decoded };
    }

    req.token = token;
    return next();
  } catch (err) {
    // Invalid/expired token? Just proceed without user.
    // Downstream requireAuth will block protected routes.
    return next();
  }
}

/**
 * Export a composed middleware that ensures cookies are parsed first (for cookie tokens).
 * In server.js you can also do app.use(cookieParser()) globally and just export attachUserFromJWT.
 */
module.exports = [cookieParser(), attachUserFromJWT];
