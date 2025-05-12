const express = require('express'); 
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();
const morgan = require('morgan');

// Import routes
const userRoutes = require('./routes/users');
const freelancerRoutes = require('./routes/freelancers');
const clientRoutes = require('./routes/clients');
const adminRoutes = require('./routes/admin');
const analyticsClientRoutes = require('./routes/analyticsClient');
const applicationRoutes = require('./routes/applications');
const assignmentRoutes = require('./routes/assignments');
const projectRoutes = require('./routes/projects');
const analyticsAdminRoutes = require('./routes/analyticsAdmin');
const auditLogRoutes = require('./routes/auditLogs');
const messageRoutes = require('./routes/messages'); 
const polytechRoutes = require('./routes/polytech');

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const anyFileFilter = (req, file, cb) => cb(null, true);

const uploadImage = multer({ storage, fileFilter: imageFileFilter });
const uploadAnyFile = multer({ storage, fileFilter: anyFileFilter });

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/polytech', polytechRoutes);
app.use('/api/admin/analytics', analyticsAdminRoutes);
app.use('/api/client/analytics', analyticsClientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auditlogs', auditLogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use(morgan('dev'));


// File upload endpoints
app.post('/api/upload-image', uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No image uploaded');
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

app.post('/api/upload-file', uploadAnyFile.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Socket.IO Setup
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', async (msgData) => {
    try {
      const newMessage = new Message({
        senderId: msgData.senderId,
        receiverId: msgData.receiverId,
        senderRole: msgData.senderRole,
        receiverRole: msgData.receiverRole,
        content: msgData.content,
        roomId: msgData.roomId,
        attachments: msgData.attachments || []
      });

      await newMessage.save();
      io.to(msgData.roomId).emit('receiveMessage', newMessage);
    } catch (err) {
      console.error('Error saving message:', err.message);
    }
  });

  socket.on('disconnect', () => {});
});

// ✅ Connect to DB and hash default admin password if needed
connectDB().then(async () => {
  try {
    const admin = await Admin.findOne({ email: 'admin@alsalam.com' });
    if (admin && admin.password === '12345678') {
      admin.password = await bcrypt.hash(admin.password, 10);
      await admin.save();
      console.log('✅ Default admin password was hashed.');
    }
  } catch (err) {
    console.error('Error hashing default admin password:', err.message);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Server with Socket.IO running on port ${PORT}`));
});
// Add this to your server (temporarily)
app.get('/fix-admin-password', async (req, res) => {
  const admin = await Admin.findOne({ email: 'admin@alsalam.com' });
  if (admin) {
    admin.password = await bcrypt.hash('12345678', 10);
    await admin.save();
    return res.send('✅ Admin password updated');
  }
  res.send('❌ Admin not found');
});


