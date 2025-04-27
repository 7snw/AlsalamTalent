const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/User');

const insertData = async () => {
  await connectDB();
  await User.create({
    role: 'freelancer',
    name: 'Maryam Yusuf',
    email: 'maryam@example.com',
    password: 'hashedpassword',
    major: 'Web Media',
    phone_number: '12345678',
    date_of_birth: '1998-07-21',
    bio: 'Creative designer',
    skills: ['Figma', 'Photoshop'],
    specialties: ['Branding'],
    rating: 4.5
  });
  console.log('Data inserted!');
};

insertData();
