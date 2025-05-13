import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/Admin/AddUsers.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';
import { logError, logSuccess } from '../../utils/consoleMessages'; 
import { showAlert } from '../../utils/toastMessages';





const AddUsers = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    occupation: '',
    phone: '',
    companyName: '',
    dateOfBirth: '',
    role: 'client'
  });

const handleChange = (e) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const admin = JSON.parse(localStorage.getItem('user')); 
    const payload = { ...formData, authorId: admin?._id }; 

    const response = await axios.post('http://localhost:5000/api/client/register', payload);
    if (response.status === 201 || response.status === 200) {
      logSuccess('Client created successfully.');
      navigate('/clientlist');
    }
  } catch (err) {
    logError('Failed to create client: ' + (err.response?.data?.message || err.message));
    showAlert(err.response?.data?.message || 'Failed to create client.');
  }
};

  return (
    <div className="add-user-page">
      <Navbar links={NavConfig4} />
      <div className="add-user-container">
        <div className="add-user-content">
          <h2>Add A New Client Account</h2>
          <form className="add-user-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter user name" required />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required />
            </div>

            <div className="form-group">
              <label>Occupation</label>
              <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Enter occupation" required />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" required />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter company name" required />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
            </div>

            <button type="submit" className="add-btn">Add</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  
  );
};

export default AddUsers;
