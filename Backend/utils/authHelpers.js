// utils/authHelpers.js  (NEW)
const bcrypt = require('bcryptjs');

const POLY_EMAIL_RE = /^20\d{7}@student\.polytechnic\.bh$/i; // 9 digits starting with 20xxxxxxx
const BH_IBAN_RE = /^BH\d{2}[A-Z]{4}\d{14}$/i;

const isValidPolyEmail = (email='') => POLY_EMAIL_RE.test(String(email).trim());
const isValidStudentId = (id='') => /^\d{9}$/.test(id) && (() => {
  const year = parseInt(String(id).slice(0,4),10);
  return year >= 2008 && year <= 2025; // per requirement
})();
const isValidBHIban = (s='') => BH_IBAN_RE.test(String(s).replace(/\s+/g,''));

const genOtp = () => String(Math.floor(100000 + Math.random()*900000)); // 6-digit
const hashOtp = async (otp) => bcrypt.hash(otp, 10);
const matchOtp = async (otp, hash) => bcrypt.compare(otp, hash);

module.exports = { isValidPolyEmail, isValidStudentId, isValidBHIban, genOtp, hashOtp, matchOtp };
