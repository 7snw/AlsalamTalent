// src/Pages/Admin/AdminProfileSettings.js

import React, { useState, useEffect } from 'react';
import '../../Style/Admin/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';
import { showAlert } from '../../utils/toastMessages';

// Admin profile settings component
const AdminProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('edit'); // State to toggle between Edit/Profile sections

  // State to hold form data for profile fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    occupation: '',
    phone: '',
    companyName: '',
    dateOfBirth: ''
  });

  // State for password change fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Get the current admin ID from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const adminId = storedUser?._id;
  
  // Fetch admin data on component mount
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        const data = response.data;

        // Set profile fields from response
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          occupation: data.occupation || '',
          phone: data.phone || '',
          companyName: data.companyName || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '' // Format to yyyy-mm-dd
        });
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        showAlert('Failed to load profile.');
      }
    };

    if (adminId) fetchAdmin();
  }, [adminId]);

  // Handle profile form input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save updated profile info
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/${adminId}`, formData);
      showAlert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      showAlert('Failed to update profile.');
    }
  };

  // Submit password change request
  const handleChangePassword = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/changepassword/${adminId}`, {
        oldPassword,
        newPassword
      });
      showAlert('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert(error.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="admin-settings-page">
      <Navbar links={NavConfig4} /> {/* Admin navbar */}

      <div className="admin-settings-container">
        {/* Sidebar with tabs */}
        <div className="admin-settings-sidebar">
          <h3 className="admin-settings-username">{formData.fullName || 'Admin'}</h3>

          <ul className="admin-settings-tabs">
            {/* Toggle between sections */}
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>
              Edit Profile
            </li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>
              Password
            </li>
          </ul>
        </div>

        {/* Main content area */}
        <div className="admin-settings-content">
          {/* Edit Profile Section */}
          {activeSection === 'edit' && (
            <div className="admin-section">
              <h4>Name</h4>
              <input type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />

              <h4>Email</h4>
              <input type="text" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />

              <h4>Occupation</h4>
              <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} />

              <h4>Phone Number</h4>
              <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />

              <h4>Company Name</h4>
              <input type="text" value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />

              <h4>Date of Birth</h4>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />

              {/* Save Profile Button */}
              <button className="admin-save-btn" onClick={handleSave}>Save</button>
            </div>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
            <div className="admin-section">
              <h4>Old Password</h4>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              
              <h4>New Password</h4>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

              {/* Save Password Button */}
              <button className="admin-save-btn" onClick={handleChangePassword}>Save</button>
            </div>
          )}
        </div>
      </div>

      <Footer /> {/* Footer */}
    </div>
  );
};

export default AdminProfileSettings;
