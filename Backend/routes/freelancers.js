// routes/freelancers.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const router  = express.Router();
const axios   = require('axios');

const PendingSignup = require('../models/PendingSignUp');
const { Freelancer } = require('../models/Freelancer');
const nodemailer    = require('nodemailer');
const bcrypt        = require('bcryptjs');

const { sendNotification } = require('../utils/sendNotification');
const sendEmail = require('../utils/sendEmail');
const { lookupHash } = require('../utils/cryptoVault'); 

const parseSkills = (raw) => {
  if (!raw) return [];
  try {
    const a = JSON.parse(raw);
    return (Array.isArray(a) ? a : [a]).map(s => String(s).trim()).filter(Boolean);
  } catch {
    return String(raw)
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
};

const {
  adminNewStudentRegistered,
  studentWelcomePending,
  adminNewGraduateRegistered,
  graduateWelcomePending,
  newChatMessageEmail,
  verificationCode
} = require('../utils/emailTemplates');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ctrlz.bh';
const BASE_URL     = process.env.BASE_URL     || 'http://localhost:5000';

const crypto   = require('crypto');
const OtpToken = require('../models/OtpToken');

const OTP_TTL_MIN = 10;
const generate6   = () => String(crypto.randomInt(100000, 1000000)); // 6-digit

/* ------------------------------ Helpers ------------------------------ */
const normEmail = (v='') => String(v).trim().toLowerCase();
const normPhone = (v='') => String(v).replace(/\s+/g, '').trim();
const normStr   = (v='') => String(v).trim();

async function createAndSendOtp({ userId, email }) {
  await OtpToken.updateMany({ userId, used: false }, { $set: { used: true } });
  const code = generate6();
  const codeHash  = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
  await OtpToken.create({ userId, codeHash, expiresAt });

  const html = `
    <p>Use this code to verify your identity:</p>
    <div style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</div>
    <p>This code expires in ${OTP_TTL_MIN} minutes.</p>
  `;
  await sendEmail({
    to: email, subject: 'Your ctrlZ verification code',
    html, text: `Your ctrlZ code is ${code} (expires in ${OTP_TTL_MIN} minutes)`
  });
}

async function verifyOtp({ userId, code }) {
  const token = await OtpToken.findOne({
    userId, used: false, expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!token) return { ok: false, reason: 'NO_ACTIVE' };
  const ok = await bcrypt.compare(String(code || ''), token.codeHash);
  if (!ok)   return { ok: false, reason: 'BAD_CODE' };

  token.used = true;
  await token.save();
  return { ok: true };
}

/* ---------------------------- Uploads setup ---------------------------- */
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  }
});

const isValidBHIban = (s='') => /^BH\d{2}[A-Z]{4}\d{14}$/i.test(String(s).replace(/\s+/g,''));
const imageFileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true)
    : cb(new Error('Only JPEG/PNG/JPG/WEBP images are allowed.'));
};
const docFileFilter = (_req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  allowed.includes(file.mimetype) ? cb(null, true)
    : cb(new Error('Only PDF, DOC, or DOCX files are allowed.'));
};

const uploadImage   = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadCv      = multer({ storage, fileFilter: docFileFilter,   limits: { fileSize: 10 * 1024 * 1024 } });
const uploadAnyFile = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/* ------------------------------ Email/OTP ------------------------------ */
const transporter = nodemailer.createTransport({
  service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
const isValidIban = (iban = '') => /^BH\d{2}[A-Z0-9]{18}$/i.test(iban.replace(/\s+/g, ''));

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
async function sendOtpEmail(email, name, code) {
  const subject = 'Your ctrlZ verification code';
  const html = verificationCode({ name, code });
  await sendEmail({ to: email, subject, html, text: `Your code is ${code}` });
}

/** DUMMY API for graduates (unchanged) */
// const dummyGraduates = [ ... ];
async function verifyGraduateWithPolytechnic({ studentId, fullName, cpr }) {
  const match = dummyGraduates.find(
    g => g.studentId === normStr(studentId) &&
         g.fullName.toLowerCase() === normStr(fullName).toLowerCase() &&
         g.cpr === normStr(cpr)
  );
  return !!match;
}

/* --------------------------- Generic Register --------------------------- */
router.post('/register', uploadCv.single('cv'), async (req, res) => {
  try {
    let { studentId, fullName, email, password, major, phone, expertise, userType, iban, cpr } = req.body;

    if (iban) {
      const clean = String(iban).replace(/\s+/g, '').toUpperCase();
      if (!isValidBHIban(clean)) return res.status(400).json({ message: 'Invalid IBAN format.' });
      iban = clean;
    }

    email     = normEmail(email);
    studentId = normStr(studentId);

    //  de-dupe using deterministic hashes (email) or plain studentId
    const dup = await Freelancer.findOne({
      $or: [
        email ? { emailHash: lookupHash(email) } : null,
        studentId ? { studentId } : null
      ].filter(Boolean)
    });
    if (dup) return res.status(400).json({ message: 'Email or Student ID already registered.' });

    const parsedExpertise = Array.isArray(expertise) ? expertise : JSON.parse(expertise || '[]');
    const cvPath = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : null;

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    const newFreelancer = await Freelancer.create({
      userType,
      studentId,
      fullName,
      email,
      password,
      major,
      phone: normPhone(phone),
      expertise: parsedExpertise,
      iban,
      cpr: normStr(cpr),
      cvUrl: cvPath,
      isVerified: false,
      otpHash,
      otpExpires
    });

    await sendOtpEmail(email, fullName, otp);
    res.status(201).json({ message: 'OTP sent.', freelancerId: newFreelancer._id });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

/* ------------------------------ Admin Lists ----------------------------- */

// verified list
router.get('/list', async (_req, res) => {
  try {
    const people = await Freelancer
      .find({ isVerified: true, isActive: true });
    res.json(people);
  } catch (err) {
    console.error('Error fetching list:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ------------------------- ADMIN: unified list (pending + verified) ------------------------- */
// GET /api/freelancer/admin/all?q=...&limit=...
router.get('/admin/all', async (_req, res) => {
  const verifiedDocs = await Freelancer
    .find({ isVerified: true })
    .select('_id studentId fullName email major phone expertise iban cvUrl isVerified isActive createdAt')
    .sort({ createdAt: -1 });
  const items = verifiedDocs.map(v => v.toObject());
  res.json({ items, total: items.length });
});


/* ------------------------- STUDENT REGISTER -> PENDING ------------------------- */
router.post('/student-register', uploadCv.single('cv'), async (req, res) => {
  try {
    let { studentId, fullName, email, password, major, phone, expertise, iban } = req.body;

    email     = normEmail(email);
    studentId = normStr(studentId);

    if (typeof iban === 'string' && iban) {
      const clean = iban.replace(/\s+/g, '').toUpperCase();
      if (!isValidBHIban(clean)) return res.status(400).json({ message: 'Invalid IBAN format.' });
      iban = clean;
    }

    //  de-dupe using hash
    const dup = await Freelancer.findOne({
      $or: [
        email ? { emailHash: lookupHash(email) } : null,
        studentId ? { studentId } : null
      ].filter(Boolean)
    });
    if (dup) return res.status(400).json({ message: 'Email or Student ID already registered.' });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    const cvUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : '';
    const parsedExpertise = Array.isArray(expertise) ? expertise : JSON.parse(expertise || '[]');

    const pending = await PendingSignup.create({
      kind: 'Student',
      data: { userType: 'Student', studentId, fullName, email, password, major, phone: normPhone(phone), expertise: parsedExpertise, iban, cvUrl },
      otpHash, otpExpires
    });

    await sendOtpEmail(email, fullName, otp);
    return res.status(201).json({ message: 'OTP sent to your email.', regId: pending._id });
  } catch (err) {
    console.error('Student pending signup error:', err);
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

/* ----------------------- GRADUATE REGISTER -> PENDING ----------------------- */
router.post('/graduate-register', uploadCv.single('cv'), async (req, res) => {
  try {
    let { studentId, fullName, email, password, major, phone, expertise, iban, cpr } = req.body;

    email     = normEmail(email);
    studentId = normStr(studentId);

    if (iban) {
      const clean = String(iban).replace(/\s+/g, '').toUpperCase();
      if (!isValidBHIban(clean)) return res.status(400).json({ message: 'Invalid IBAN format.' });
      iban = clean;
    }

    const match = await verifyGraduateWithPolytechnic({ studentId, fullName, cpr });
    if (!match) {
      return res.status(400).json({ message: 'Graduate details could not be verified. Please check your Student ID, Name, and CPR.' });
    }

    //  de-dupe using hash
    const dup = await Freelancer.findOne({
      $or: [
        email ? { emailHash: lookupHash(email) } : null,
        studentId ? { studentId } : null
      ].filter(Boolean)
    });
    if (dup) return res.status(400).json({ message: 'Email or Student ID already registered.' });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    const cvUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : '';
    const parsedExpertise = Array.isArray(expertise) ? expertise : JSON.parse(expertise || '[]');

    const pending = await PendingSignup.create({
      kind: 'Graduate',
      data: { userType: 'Graduate', studentId, fullName, email, password, major, phone: normPhone(phone), expertise: parsedExpertise, iban, cpr: normStr(cpr), cvUrl },
      otpHash, otpExpires
    });

    await sendOtpEmail(email, fullName, otp);
    res.status(201).json({ message: 'OTP sent to your email.', regId: pending._id });
  } catch (err) {
    console.error('Graduate pending signup error:', err);
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

/* ----------------------------- VERIFY OTP -> CREATE ----------------------------- */
router.post('/verify-otp', async (req, res) => {
  try {
    const { regId, code } = req.body;
    if (!regId || !code) return res.status(400).json({ message: 'Missing fields.' });

    const pending = await PendingSignup.findById(regId);
    if (!pending) return res.status(400).json({ message: 'No active signup. Please restart.' });

    if (!pending.otpHash || !pending.otpExpires) return res.status(400).json({ message: 'No active OTP. Please resend.' });
    if (new Date() > new Date(pending.otpExpires)) return res.status(400).json({ message: 'OTP expired. Please resend.' });

    const ok = await bcrypt.compare(String(code), pending.otpHash);
    if (!ok) return res.status(400).json({ message: 'Incorrect code.' });

    const payload = pending.data;

    // de-dup on hash/plain
    const already = await Freelancer.findOne({
      $or: [
        payload.email ? { emailHash: lookupHash(normEmail(payload.email)) } : null,
        payload.studentId ? { studentId: normStr(payload.studentId) } : null
      ].filter(Boolean)
    });

    if (already) {
      await PendingSignup.findByIdAndDelete(regId);
      return res.json({ message: 'Account already verified. You can sign in now.' });
    }

       const freelancer = new Freelancer({
      ...payload,
      email: normEmail(payload.email),
      studentId: normStr(payload.studentId),
     phone: normPhone(payload.phone),
      cpr: normStr(payload.cpr || ''),
      isVerified: true,
      emailVerified: true
    });
   await freelancer.save(); 

    const dashboardLink = `${FRONTEND_URL}/freelancer-dashboard`;
    const welcomeHtml = pending.kind === 'Graduate'
      ? graduateWelcomePending({ name: payload.fullName, dashboardLink })
      : studentWelcomePending({ name: payload.fullName, dashboardLink });

    await sendNotification({
      userId: freelancer._id,
      userType: 'freelancer',
      subject: 'Welcome to ctrlZ!',
      message: 'Your account is ready. Start exploring projects.',
      type: 'welcome',
      alsoEmail: true,
      // use plaintext payload.email to avoid any chance of ciphertext on fresh doc
      email: normEmail(payload.email),
      html: welcomeHtml
    });

    await PendingSignup.findByIdAndDelete(regId);
    res.json({ message: 'Account verified. You can sign in now.', freelancerId: freelancer._id });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* --------------------------------- RESEND OTP --------------------------------- */
router.post('/resend-otp', async (req, res) => {
  try {
    const { regId } = req.body;
    if (!regId) return res.status(400).json({ message: 'Missing regId.' });

    const pending = await PendingSignup.findById(regId);
    if (!pending) return res.status(400).json({ message: 'No active signup. Please restart.' });

    const otp = generateOtp();
    pending.otpHash = await bcrypt.hash(otp, 10);
    pending.otpExpires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
    await pending.save();

    await sendOtpEmail(pending.data.email, pending.data.fullName, otp);
    res.json({ message: 'OTP resent.' });
  } catch (err) {
    console.error('resend-otp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* --------------------------- Profile: GET / PUT ------------------------- */
router.get('/profile/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).select(
      'fullName email studentId major userType phone dateOfBirth bio skills expertise portfolio role cvUrl profileImageUrl projects iban isVerified isActive rating cpr'
    );
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    freelancer.profileImageUrl = freelancer.profileImageUrl || '';
    res.status(200).json(freelancer);
  } catch (err) {
    console.error('Error fetching freelancer profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message || err });
  }
});

// UPDATE profile (supports profile image upload)
router.put(
  '/profile/:id',
  uploadAnyFile.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'cv', maxCount: 1 }]),
  async (req, res) => {
    try {
      const freelancerId = req.params.id;
      const bodyObj = req.body.data ? JSON.parse(req.body.data) : req.body;
      const updates = { ...bodyObj };

      if (typeof updates.iban === 'string') {
        const clean = updates.iban.replace(/\s+/g, '').toUpperCase();
        if (clean && !isValidBHIban(clean)) {
          return res.status(400).json({ message: 'Invalid IBAN format.' });
        }
        updates.iban = clean;
      }

      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

      // PROFILE IMAGE
      const newImg = req.files?.profileImage?.[0];
      if (newImg) {
        if (freelancer.profileImageUrl) {
          const old = path.join(__dirname, '..', freelancer.profileImageUrl.replace(BASE_URL, '').replace(/^\//, ''));
          if (fs.existsSync(old)) try { fs.unlinkSync(old); } catch {}
        }
        updates.profileImageUrl = `${BASE_URL}/uploads/${newImg.filename}`;
      } else if (req.body.profileImageUrl === '') {
        if (freelancer.profileImageUrl) {
          const old = path.join(__dirname, '..', freelancer.profileImageUrl.replace(BASE_URL, '').replace(/^\//, ''));
          if (fs.existsSync(old)) try { fs.unlinkSync(old); } catch {}
        }
        updates.profileImageUrl = '';
      }

      // CV FILE
      const newCv = req.files?.cv?.[0];
      if (newCv) {
        const ok = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ].includes(newCv.mimetype);
        if (!ok) return res.status(400).json({ message: 'Only PDF, DOC, or DOCX allowed.' });

        if (freelancer.cvUrl) {
          const old = path.join(__dirname, '..', freelancer.cvUrl.replace(BASE_URL, '').replace(/^\//, ''));
          if (fs.existsSync(old)) try { fs.unlinkSync(old); } catch {}
        }
        updates.cvUrl = `${BASE_URL}/uploads/${newCv.filename}`;
      }
      if (String(req.body.removeCv || '').toLowerCase() === 'true') {
        if (freelancer.cvUrl) {
          const old = path.join(__dirname, '..', freelancer.cvUrl.replace(BASE_URL, '').replace(/^\//, ''));
          if (fs.existsSync(old)) try { fs.unlinkSync(old); } catch {}
        }
        updates.cvUrl = '';
      }

      if (updates.dateOfBirth) updates.dateOfBirth = new Date(updates.dateOfBirth);

      // basic normalizations
      if (typeof updates.email === 'string') updates.email = normEmail(updates.email);
      if (typeof updates.phone === 'string') updates.phone = normPhone(updates.phone);
      if (typeof updates.studentId === 'string') updates.studentId = normStr(updates.studentId);
      if (typeof updates.cpr === 'string') updates.cpr = normStr(updates.cpr);

      const updated = await Freelancer.findByIdAndUpdate(freelancerId, updates, { new: true, runValidators: true });
      res.json(updated);
    } catch (err) {
      console.error('Error updating freelancer profile:', err);
      res.status(500).json({ message: 'Server error', error: err.message || err });
    }
  }
);

/* ---------------------------- Auth / Security --------------------------- */
router.put('/changepassword/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const trimmedOldPassword = (oldPassword || '').trim();
    const trimmedNewPassword = (newPassword || '').trim();

    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const isMatch = await bcrypt.compare(trimmedOldPassword, freelancer.password || '');
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    freelancer.password = trimmedNewPassword;
    await freelancer.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error', error: err.message || err });
  }
});

/* ------------------------------- Projects ------------------------------ */
router.post('/:id/add-project', uploadAnyFile.fields([
  { name: 'projectFiles', maxCount: 10 },
  { name: 'projectImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { projectTitle, projectStatus } = req.body;
    const freelancerId = req.params.id;

    const projectFiles = req.files?.projectFiles?.map(f => `${BASE_URL}/uploads/${f.filename}`) || [];
    const projectImage = req.files?.projectImage?.[0]
      ? `${BASE_URL}/uploads/${req.files.projectImage[0].filename}`
      : '';

    const newProject = { projectTitle, projectStatus, projectFiles, projectImage };
    await Freelancer.findByIdAndUpdate(freelancerId, { $push: { projects: newProject } }, { new: true });

    res.json({ message: 'Project added successfully', project: newProject });
  } catch (err) {
    console.error('Error adding project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id/my-projects', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).select('projects');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });
    res.json(freelancer.projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:freelancerId/update-project/:projectId', uploadAnyFile.fields([
  { name: 'projectFiles', maxCount: 10 },
  { name: 'projectImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { freelancerId, projectId } = req.params;
    const { projectTitle, projectStatus, existingFiles = [] } = req.body;

    const newProjectFiles = req.files?.projectFiles?.map(f => `${BASE_URL}/uploads/${f.filename}`) || [];
    const allFiles = [...(Array.isArray(existingFiles) ? existingFiles : [existingFiles]), ...newProjectFiles];
    const projectImage = req.files?.projectImage?.[0]
      ? `${BASE_URL}/uploads/${req.files.projectImage[0].filename}`
      : undefined;

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const project = freelancer.projects.id(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.projectTitle = projectTitle || project.projectTitle;
    project.projectStatus = projectStatus || project.projectStatus;
    project.projectFiles = allFiles;
    if (projectImage) project.projectImage = projectImage;

    await freelancer.save();
    res.json({ message: 'Project updated successfully', project });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ----------------------------- Applications ---------------------------- */
router.put('/:id/apply-project', async (req, res) => {
  try {
    const { projectId } = req.body;
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const alreadyApplied = freelancer.applications.find(a => a.projectId.toString() === projectId);
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied to this project' });

    freelancer.applications.push({ projectId });
    await freelancer.save();

    await sendNotification({
      userId: freelancer._id,
      userType: 'freelancer',
      email: freelancer.email, // decrypted because fetched (no lean)
      subject: 'Project Application Submitted',
      message: 'You have successfully applied to a project. Please wait for further updates.',
      type: 'info'
    });

    res.json({ message: 'Application submitted.' });
  } catch (err) {
    console.error('Error applying to project:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id/applications', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate('applications.projectId');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const apps = freelancer.applications.map(a => ({ project: a.projectId, status: a.status }));
    res.json(apps);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ------------------------------- Saved --------------------------------- */
router.put('/:id/save-project', async (req, res) => {
  try {
    const { projectId } = req.body;
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    const idx = freelancer.savedProjects.findIndex(id => id.toString() === projectId);
    if (idx > -1) freelancer.savedProjects.splice(idx, 1);
    else freelancer.savedProjects.push(projectId);

    await freelancer.save();
    res.json({ message: 'Saved projects updated successfully', savedProjects: freelancer.savedProjects });
  } catch (error) {
    console.error('Error saving/unsaving project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id/saved-projects', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate('savedProjects');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });
    res.json(freelancer.savedProjects);
  } catch (error) {
    console.error('Error fetching saved projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/portfolio/:freelancerId', uploadImage.array('images', 10), async (req, res) => {
  try {
    const freelancerId = String(req.params.freelancerId);
    const { title, description, projectType, skills } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Missing required fields (title, description).' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image file is required.' });
    }

    // accept new "skills" (preferred) and gracefully fall back to legacy "projectType"
    const skillsArr = parseSkills(skills).length ? parseSkills(skills) : parseSkills(projectType);
    if (skillsArr.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one skill/type.' });
    }

    const imageUrls = req.files.map((file) => `${BASE_URL}/uploads/${file.filename}`);

    // collaborators (unchanged)
    let collaboratorIds = [];
    try {
      collaboratorIds = JSON.parse(req.body.collaborators || '[]');
      if (!Array.isArray(collaboratorIds)) collaboratorIds = [];
    } catch { collaboratorIds = []; }

    collaboratorIds = collaboratorIds
      .map(String)
      .filter(Boolean)
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .filter((id) => id !== freelancerId);

    let collaborators = [];
    if (collaboratorIds.length) {
      const found = await Freelancer.find({
        _id: { $in: collaboratorIds },
        isVerified: true
      }).select('_id fullName email');
      collaborators = found.map(c => ({ _id: c._id, fullName: c.fullName, email: c.email }));
    }

    const newPortfolio = {
      title,
      description,
      skills: skillsArr,
      // keep legacy "category" for older UIs (first skill as a fallback)
      category: projectType || skillsArr[0],
      imageUrls,
      collaborators,
      createdBy: freelancerId
    };

    const owner = await Freelancer.findByIdAndUpdate(
      freelancerId,
      { $push: { portfolio: newPortfolio } },
      { new: true }
    );

    if (!owner) return res.status(404).json({ message: 'Freelancer not found.' });
    return res.status(201).json(newPortfolio);
  } catch (error) {
    console.error('Error adding portfolio project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/portfolio/:freelancerId', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.freelancerId).select('portfolio');
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found.' });
    res.json(freelancer.portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/portfolio/:portfolioId', async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const freelancer = await Freelancer.findOne({ 'portfolio._id': portfolioId });
    if (!freelancer) return res.status(404).json({ message: 'Portfolio project not found.' });

    freelancer.portfolio = freelancer.portfolio.filter(item => item._id.toString() !== portfolioId);
    await freelancer.save();

    res.status(200).json({ message: 'Portfolio project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting portfolio project:', error);
    res.status(500).json({ message: 'Failed to delete portfolio project.', error: error.message });
  }
});

/* --------------------------- Search (plain filter) ---------------------- */
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);

    // avoid .lean() so plugin decrypts email/fullName
    const raw = await Freelancer
      .find({ isVerified: true, isActive: true })
      .select('_id fullName email profileImageUrl rating expertise')
      .limit(limit);

    const people = q
      ? raw
          .map(d => d.toObject())
          .filter(p =>
            String(p.fullName || '').toLowerCase().includes(q) ||
            String(p.email || '').toLowerCase().includes(q)
          )
      : raw.map(d => d.toObject());

    res.json(people);
  } catch (e) {
    console.error('search error', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

/* ------------------------------ Activate/Off ---------------------------- */
router.put('/deactivate/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).send('Freelancer not found');

    freelancer.isActive = !freelancer.isActive;
    await freelancer.save();

    res.status(200).json({ message: `Account ${freelancer.isActive ? 'reactivated' : 'deactivated'}.`, isActive: freelancer.isActive });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
