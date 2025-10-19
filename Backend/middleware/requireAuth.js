// middleware/requireAuth.js
const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized: missing token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

    const _id =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      decoded.user?._id ||
      decoded.sub;

    const role =
      decoded.role ||
      decoded.type ||
      decoded.user?.role ||
      decoded.p?.role;

    if (!_id || !role)
      return res.status(401).json({ message: 'Invalid token payload' });

    // 👇 This part is the only addition
    req.user = {
      _id: String(_id),
      id: String(_id), // add alias for compatibility
      role: String(role).toLowerCase(),
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ message: 'Invalid or malformed token' });
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
