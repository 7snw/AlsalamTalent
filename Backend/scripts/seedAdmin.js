require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
  
    await Admin.deleteOne({ email: 'admin@alsalam.com' });

  
    const hashedPassword = await bcrypt.hash('12345678', 10);
    const newAdmin = await Admin.create({
      fullName: 'Default Admin',
      email: 'admin@alsalam.com',
      password: hashedPassword,
      phone: '00000000',
      occupation: 'Platform Owner',
      companyName: 'Al Salam',
      role: 'admin'
    });

    console.log('Fresh admin created:', newAdmin.email);
    mongoose.disconnect();
  })
  .catch(err => console.error('Seeding error:', err));
