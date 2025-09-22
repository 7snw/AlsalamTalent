// middleware/requireAuth.js
const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const p = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    // tolerate different token shapes
    const _id =
      p._id || p.id || p.userId || p.user?._id || p.user?.id || p.sub;
    const role = p.role || p.type || p.user?.role;

    if (!_id || !role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = { _id: String(_id), role: String(role).toLowerCase() };
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
