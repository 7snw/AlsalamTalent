// src/Components/Profile/ClientProfileSection.js
import React, { useState } from 'react';
import userIcon from '../Assets/ProfileIcon.png';
import '../Style/ProfilePage.css';

const ClientProfileSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [clientData, setClientData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || 'Bahrain FinTech Bay',
    phone: user?.phone || '+973 33221100',
    dob: user?.dob || '15 January 1999',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

  return (
    <div className="unified-profile-section">
      <div className="profile-top">
        <img src={userIcon} alt="User" className="profile-photo" />
        <h2>{clientData.name}</h2>
      </div>

      <div className="tab-buttons">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Edit Profile
        </button>
        <button
          className={activeTab === 'password' ? 'active' : ''}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
      </div>

      <hr />

      {activeTab === 'profile' && (
        <form className="profile-form">
          <label>Name</label>
          <input name="name" value={clientData.name} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={clientData.email} onChange={handleChange} />

          <label>Company</label>
          <input name="company" value={clientData.company} onChange={handleChange} />

          <label>Phone Number</label>
          <input name="phone" value={clientData.phone} onChange={handleChange} />

          <label>Date of Birth</label>
          <input name="dob" value={clientData.dob} onChange={handleChange} />

          <button type="submit" className="save-btn">Save</button>
        </form>
      )}

      {activeTab === 'password' && (
        <form className="password-form">
          <label>Current Password</label>
          <input type="password" name="currentPassword" />

          <label>New Password</label>
          <input type="password" name="newPassword" />

          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" />

          <button type="submit" className="save-btn">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ClientProfileSection;
