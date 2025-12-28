const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();
const morgan = require('morgan');
const expressRequestId = require('express-request-id');
const addRequestId = expressRequestId(); 


const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { v4: uuidv4 } = require("uuid");
const logAction = require("./utils/logAction"); 

app.use(addRequestId);


app.use(express.json());
app.use(cors({
  origin: ["https://ctrlz.bh", "https://www.ctrlz.bh", "http://localhost:3000"],
  credentials: true,
}));


morgan.token('reqid', (req) => req.id);
const httpLogFormatDev = ':method :url :status :res[content-length] - :response-time ms (:reqid)'; // NEW
const httpLogFormatProd = ':remote-addr :method :url :status :res[content-length] - :response-time ms :reqid'; // NEW
app.use(
  morgan(process.env.NODE_ENV === 'development' ? httpLogFormatDev : httpLogFormatProd)
); 

app.use('/uploads', express.static('uploads'));
// app.js or server.js


//  routes
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
const messageUploadsRoute = require('./routes/messageUploads');
const notificationRoutes = require('./routes/notifications');

const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);

const paymentsRouter = require('./routes/payments');
app.use('/api/payments', paymentsRouter);

const bookingsRoute = require('./routes/bookings');
app.use('/api/bookings', bookingsRoute);

const clientsRouter = require('./routes/clients');
app.use('/api/clients', clientsRouter);

const freelancerRouter = require('./routes/freelancers');
app.use('/api/freelancers', freelancerRouter);

const qnaRoutes = require("./routes/qna.routes");  



// File upload
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

// Static file 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/messages', express.static('uploads/messages'));

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
app.use('/api/upload-message-files', messageUploadsRoute);
app.use('/api/notifications', notificationRoutes);

app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/freelancer', require('./routes/freelancers'));



const verifyGraduate = require('./routes/verifyGraduate');
app.use('/api/verify-graduate', verifyGraduate);

app.use("/api/qna", qnaRoutes);


// File upload 
app.post('/api/upload-image', uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No image uploaded');
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl, reqId: req.id }); // NEW: echo reqId if you want
});

app.post('/api/upload-file', uploadAnyFile.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl, reqId: req.id }); // NEW: echo reqId if you want
});

// Health check
app.get('/', (req, res) => {
  res.set('X-Request-Id', req.id); 
  res.send('API is running...');
});


// Socket.IO Setup
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
  socket.on('joinRoom', (roomId) => socket.join(roomId));

  socket.on('sendMessage', async (msg) => {
    const saved = await Message.create({
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      senderRole: msg.senderRole,
      receiverRole: msg.receiverRole,
      content: msg.content,
      roomId: msg.roomId,
      attachments: msg.attachments || [],
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    });

   
    const fresh = await Message.findById(saved._id); 
    io.to(msg.roomId).emit('receiveMessage', fresh);
  });

  socket.on('disconnect', () => {});
});


connectDB().then(async () => {
  try {
    const admin = await Admin.findOne({ email: 'admin@alsalam.com' });
    if (admin && admin.password === '12345678') {
      admin.password = await bcrypt.hash(admin.password, 10);
      await admin.save();
      console.log('Default admin password was hashed.');
    }
  } catch (err) {
    console.error('Error hashing default admin password:', err.message);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running at http://172.20.10.3:${PORT}`);
});
});


app.get('/fix-admin-password', async (req, res) => {
  const admin = await Admin.findOne({ email: 'admin@alsalam.com' });
  if (admin) {
    admin.password = await bcrypt.hash('12345678', 10);
    await admin.save();
    return res.send('Admin password updated');
  }
  res.send('Admin not found');
});

