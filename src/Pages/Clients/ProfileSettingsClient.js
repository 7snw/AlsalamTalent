// src/Pages/Clients/ProfileSettingsClient.js
import React, { useState } from 'react';
import '../../Style/Clients/ProfileSettingsClient.css';
import Navbar from '../../Components/Navbar';
import userIcon from '../../Assets/ProfileIcon.png';
import { NavConfig3 } from '../../Data/NavbarConfigs';

const ProfileSettingsClient = () => {
  const [activeSection, setActiveSection] = useState('edit');
  const [preview, setPreview] = useState(null);

  return (
    <div className="client-settings-page">
      <Navbar links={NavConfig3} />
      <div className="client-settings-container">
        <div className="client-settings-sidebar">
          <h3 className="client-settings-username">Ali Salman</h3>

          <ul className="client-settings-tabs">
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
        </div>

        <div className="client-settings-content">
          {activeSection === 'edit' && (
            <div className="client-section">
              <div className="client-edit-profile-picture">
                <img
                  src={preview || userIcon}
                  alt="Profile"
                  className="client-profile-preview"
                />
                <div className="client-upload-delete-container">
                  <button
                    className="client-upload-pic-btn"
                    onClick={() => document.getElementById('clientHiddenFileInput').click()}
                  >
                    Upload a picture
                  </button>
                  <button
                    className="client-delete-btn"
                    onClick={() => {
                      if (window.confirm('Delete current picture?')) {
                        setPreview(null);
                      }
                    }}
                  >
                    Delete
                  </button>
                  <input
                    type="file"
                    id="clientHiddenFileInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setPreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
              <h4>Name</h4>
              <input type="text" placeholder="Enter your name" />

              <h4>Email</h4>
              <input type="text" placeholder="Enter your email" />

              <h4>Occupation</h4>
              <input type="text" placeholder="Enter your occupation" />

              <h4>Phone Number</h4>
              <input type="text" placeholder="Enter your phone number" />

              <h4>Company Name</h4>
              <input type="text" placeholder="Enter your company name" />

              <button className="client-save-btn">Save</button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="client-section">
              <h4>Old Password</h4>
              <input type="password" placeholder="Enter old password" />
              <h4>New Password</h4>
              <input type="password" placeholder="Enter new password" />
              <button className="client-save-btn">Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsClient;
