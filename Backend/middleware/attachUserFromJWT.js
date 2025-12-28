
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const Client = require('../models/Client');
const Admin = require('../models/Admin');
const Freelancer = require('../models/Freelancer');


function getToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (h && typeof h === 'string' && h.startsWith('Bearer ')) return h.slice(7).trim();
  if (req.headers?.['x-access-token']) return String(req.headers['x-access-token']).trim();
  if (req.cookies?.token) return req.cookies.token;
  return null;
}


async function attachUserFromJWT(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return next();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn('[attachUserFromJWT] Missing JWT_SECRET env – token will not be verified.');
      return next();
    }

    const decoded = jwt.verify(token, secret); 
   
    const userId = decoded.id || decoded._id;
    const role = (decoded.role || '').toLowerCase();

    let userDoc = null;
    if (role === 'client') userDoc = await Client.findById(userId).select('_id role fullName name email').lean();
    else if (role === 'admin') userDoc = await Admin.findById(userId).select('_id role fullName name email').lean();
    else if (role === 'freelancer') userDoc = await Freelancer.findById(userId).select('_id role fullName name email').lean();


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
   
      req.user = { _id: userId, role, ...decoded };
    }

    req.token = token;
    return next();
  } catch (err) {
  
    return next();
  }
}

module.exports = [cookieParser(), attachUserFromJWT];
