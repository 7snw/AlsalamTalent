const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AUTH } = require('../config/auth');

function newSid() {
  return crypto.randomUUID();
}

function signAccessToken({ userId, role, sid }) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(userId),
    role,
    sid,
    jti: crypto.randomUUID(),
    iat: now,
  };
  return jwt.sign(payload, AUTH.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: AUTH.ACCESS_TOKEN_TTL_SEC,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, AUTH.JWT_SECRET, { algorithms: ['HS256'] });
}

module.exports = { newSid, signAccessToken, verifyAccessToken };
