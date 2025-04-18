// src/Components/Profile/FreelancerProfileSection.js
import React, { useState } from 'react';
import userIcon from '../Assets/ProfileIcon.png';
import '../Style/ProfilePage.css';

const FreelancerProfileSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [freelancerData, setFreelancerData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    major: user?.major || 'UI/UX Designer',
    phone: user?.phone || '+973 33445566',
    dob: user?.dob || '20 December 1998',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFreelancerData({ ...freelancerData, [name]: value });
  };

  return (
    <div className="unified-profile-section">
      <div className="profile-top">
        <img src={userIcon} alt="User" className="profile-photo" />
        <h2>{freelancerData.name}</h2>
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
          <input name="name" value={freelancerData.name} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={freelancerData.email} onChange={handleChange} />

          <label>Major</label>
          <input name="major" value={freelancerData.major} onChange={handleChange} />

          <label>Phone Number</label>
          <input name="phone" value={freelancerData.phone} onChange={handleChange} />

          <label>Date of Birth</label>
          <input name="dob" value={freelancerData.dob} onChange={handleChange} />

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

export default FreelancerProfileSection;
