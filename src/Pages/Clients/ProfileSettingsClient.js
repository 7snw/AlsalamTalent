import React, { useState, useEffect } from 'react';
import '../../Style/Clients/ProfileSettingsClient.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';

const ProfileSettingsClient = () => {
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

  const user = JSON.parse(localStorage.getItem('user'));
  const clientId = user?._id;
  
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/client/${clientId}`);
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
        console.error('Error fetching client profile:', err);
        alert('Failed to load profile.');
      }
    };

    if (clientId) fetchClient();
  }, [clientId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/client/${clientId}`, formData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.put(`http://localhost:5000/api/client/changepassword/${clientId}`, {
        oldPassword,
        newPassword
      });
      alert('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Password update failed:', err);
      alert(err.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="client-settings-page">
      <Navbar links={NavConfig3} />
      <div className="client-settings-container">
        <div className="client-settings-sidebar">
          <h3 className="client-settings-username">{formData.fullName || 'Client'}</h3>
          <ul className="client-settings-tabs">
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>Edit Profile</li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>Password</li>
          </ul>
        </div>

        <div className="client-settings-content">
          {activeSection === 'edit' && (
            <div className="client-section">
              <h4>Name</h4>
              <input type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
              <h4>Email</h4>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
              <h4>Occupation</h4>
              <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} />
              <h4>Phone Number</h4>
              <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              <h4>Company Name</h4>
              <input type="text" value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
              <h4>Date of Birth</h4>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
              <button className="client-save-btn" onClick={handleSave}>Save</button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="client-section">
              <h4>Old Password</h4>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <h4>New Password</h4>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button className="client-save-btn" onClick={handleChangePassword}>Save</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSettingsClient;
