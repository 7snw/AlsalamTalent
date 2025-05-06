// src/Pages/Admin/AdminProfileSettings.js
import React, { useState, useEffect } from 'react';
import '../../Style/Admin/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';

const AdminProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('edit');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    occupation: '',
    phone: '',
    companyName: '',
    dateOfBirth: ''
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const adminId = storedUser?._id;
  
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        const data = response.data;
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          occupation: data.occupation || '',
          phone: data.phone || '',
          companyName: data.companyName || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : ''
        });
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        alert('Failed to load profile.');
      }
    };

    if (adminId) fetchAdmin();
  }, [adminId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/${adminId}`, formData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/changepassword/${adminId}`, {
        oldPassword,
        newPassword
      });
      alert('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="admin-settings-page">
      <Navbar links={NavConfig4} />
      <div className="admin-settings-container">
        <div className="admin-settings-sidebar">
          <h3 className="admin-settings-username">{formData.fullName || 'Admin'}</h3>

          <ul className="admin-settings-tabs">
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>
              Edit Profile
            </li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>
              Password
            </li>
          </ul>
        </div>

        <div className="admin-settings-content">
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

              <button className="admin-save-btn" onClick={handleSave}>Save</button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="admin-section">
              <h4>Old Password</h4>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <h4>New Password</h4>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button className="admin-save-btn" onClick={handleChangePassword}>Save</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProfileSettings;
