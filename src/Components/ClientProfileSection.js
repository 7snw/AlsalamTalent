// src/Components/Profile/ClientProfileSection.js
import React, { useState } from 'react';
import userIcon from '../Assets/ProfileIcon.png';
import '../Style/ProfilePage.css';

const ClientProfileSection = () => {
  const [activeTab, setActiveTab] = useState('edit');
  const [formData, setFormData] = useState({
    name: 'Maryam Yusuf Haji',
    email: 'maryam.yusuf@alsalambank.com',
    occupation: 'Marketing Executive - Alsalam Bank',
    phone: '+973 33339991',
    dob: '24 October 2002',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <img src={userIcon} alt="Profile" className="profile-avatar" />
        <h2>{formData.name}</h2>
      </div>

      <div className="tab-menu">
        <span
          className={activeTab === 'edit' ? 'active' : ''}
          onClick={() => setActiveTab('edit')}
        >
          Edit Profile
        </span>
        <span
          className={activeTab === 'password' ? 'active' : ''}
          onClick={() => setActiveTab('password')}
        >
          Password
        </span>
      </div>

      {activeTab === 'edit' ? (
        <form className="profile-form">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={formData.email} onChange={handleChange} />

          <label>Occupation</label>
          <input name="occupation" value={formData.occupation} onChange={handleChange} />

          <label>Phone Number</label>
          <input name="phone" value={formData.phone} onChange={handleChange} />

          <label>Date of Birth</label>
          <input name="dob" value={formData.dob} onChange={handleChange} />

          <button type="submit">Save</button>
        </form>
      ) : (
        <form className="profile-form">
          <label>Current Password</label>
          <input type="password" name="currentPassword" />

          <label>New Password</label>
          <input type="password" name="newPassword" />

          <label>Confirm New Password</label>
          <input type="password" name="confirmPassword" />

          <button type="submit">Update Password</button>
        </form>
      )}
    </div>
  );
};

export default ClientProfileSection;
