// src/Components/Profile/AdminProfileSection.js
import React, { useState } from 'react';
import userIcon from '../Assets/ProfileIcon.png';
import '../Style/ProfilePage.css';

const AdminProfileSection = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const [adminData, setAdminData] = useState({
    name: 'Maryam Yusuf Haji',
    email: 'maryam.yusuf@alsalambank.com',
    occupation: 'Marketing Executive - Alsalam Bank',
    phone: '+973 33339991',
    dob: '24 October 2002',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
  };

  return (
    <div className="unified-profile-section">
      <div className="profile-top">
        <img src={userIcon} alt="User" className="profile-photo" />
        <h2>{adminData.name}</h2>
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
        <div className="profile-form">
          <label>Name</label>
          <input name="name" value={adminData.name} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={adminData.email} onChange={handleChange} />

          <label>Occupation</label>
          <input name="occupation" value={adminData.occupation} onChange={handleChange} />

          <label>Phone Number</label>
          <input name="phone" value={adminData.phone} onChange={handleChange} />

          <label>Date of Birth</label>
          <input name="dob" value={adminData.dob} onChange={handleChange} />

          <button className="save-btn">Save</button>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="password-form">
          <label>Current Password</label>
          <input type="password" />

          <label>New Password</label>
          <input type="password" />

          <label>Confirm Password</label>
          <input type="password" />

          <button className="save-btn">Reset Password</button>
        </div>
      )}
    </div>
  );
};

export default AdminProfileSection;
