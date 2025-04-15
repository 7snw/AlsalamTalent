// src/pages/FreelancerSettings.js
import React, { useState } from 'react';
import '../../Style/Freelancer/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import userIcon from '../../Assets/ProfileIcon.png';
import { NavConfig2 } from '../../Data/NavbarConfigs';

const ProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="settings-page">
      <Navbar links={NavConfig2} />
      <div className="settings-container">
        <div className="settings-sidebar">
          <img src={userIcon} alt="Profile" className="settings-user-icon" />
          <h3 className="settings-username">Maryam Yusuf</h3>

          <ul className="settings-tabs">
            <li
              className={activeSection === 'general' ? 'active' : ''}
              onClick={() => setActiveSection('general')}
            >
              General
            </li>
            <li
              className={activeSection === 'edit' ? 'active' : ''}
              onClick={() => setActiveSection('edit')}
            >
              Edit Profile
            </li>
            <li
              className={activeSection === 'password' ? 'active' : ''}
              onClick={() => setActiveSection('password')}
            >
              Password
            </li>
          </ul>

          <button className="delete-account">Delete account</button>
        </div>

        <div className="settings-content">
          {activeSection === 'general' && (
            <div className="section">
              <h4>Username</h4>
              <input type="text" value="Maryam_Yusuf" readOnly />
              <h4>Email</h4>
              <input
                type="text"
                value="maryam.yusuf@student.polytechnic.bh"
                readOnly
              />
            </div>
          )}

          {activeSection === 'edit' && (
            <div className="section">
              <div className="edit-profile-picture">
                <img src={userIcon} alt="Profile" />
                <div className="upload-delete-container">
  <button className="upload-pic-btn">Upload a picture</button>
  <button className="delete-btn">Delete</button>
</div>
              </div>
              <h4>Username</h4>
              <input type="text" defaultValue="Maryam_Yusuf" />
              <h4>Email</h4>
              <input type="text" defaultValue="maryam.yusuf@student.polytechnic.bh" />
              <h4>Bio</h4>
              <textarea defaultValue="I'm a creative Visual Design student..."></textarea>
              <h4>Skills</h4>
              <input type="text" defaultValue="Branding, Marketing, Web Design, Photography" />
              <h4>Select your specialties</h4>
              <div className="checkboxes">
                {['Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Design'].map((specialty, index) => (
                  <label key={index}>
                    <input type="checkbox" defaultChecked={index < 2} />
                    {specialty}
                  </label>
                ))}
              </div>
              <button className="save-btn">Save</button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="section">
              <h4>Old Password</h4>
              <input type="password" placeholder="Enter old password" />
              <h4>New Password</h4>
              <input type="password" placeholder="Enter new password" />
              <button className="save-btn">Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
