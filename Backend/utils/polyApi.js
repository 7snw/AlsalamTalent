// utils/polyApi.js
const axios = require('axios');

const POLY_API_BASE = process.env.POLY_API_BASE || 'https://moodle.polytechnic.bh/alsalamAPI';
const POLY_API_KEY  = process.env.POLY_API_KEY;

if (!POLY_API_KEY) {
  console.warn('[POLY] Missing POLY_API_KEY. Student/Graduate verification will fail.');
}

const client = axios.create({
  baseURL: POLY_API_BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json', 'X-API-Key': POLY_API_KEY }
});

async function health() {
  const { data } = await axios.get(`${POLY_API_BASE}/health.php`, { timeout: 4000 });
  return data;
}

/**
 * POST /verify.php { cpr }
 * Response (example):
 * {
 *   "CPR": "123456789",
 *   "Student_ID": "201234567",
 *   "Student_Name": "Firstname Lastname",
 *   "Programme": "School of Business",
 *   "Graduated": "Y",
 *   "Graduation_Year": 2024
 * }
 */
async function verifyByCpr(cpr) {
  const clean = String(cpr || '').replace(/\D/g, '');
  if (!/^\d{9}$/.test(clean)) {
    const err = new Error('Invalid CPR format. Must be 9 digits.');
    err.status = 400;
    throw err;
  }
  const { data, status } = await client.post('/verify.php', { cpr: clean });
  if (status !== 200) {
    const e = new Error('Polytechnic verification failed');
    e.status = status;
    throw e;
  }
  return {
    cpr: data?.CPR,
    studentId: data?.Student_ID,
    studentName: data?.Student_Name ?? data?.Name,
    programme: data?.Programme ?? data?.Program,
    graduated: String(data?.Graduated || '').toLowerCase().startsWith('y'),
    graduationYear: data?.Graduation_Year ?? null,
    raw: data
  };
}

module.exports = { health, verifyByCpr };
