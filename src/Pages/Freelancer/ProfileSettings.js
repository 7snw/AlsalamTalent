import React, { useState } from 'react';
import '../../Style/Freelancer/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import userIcon from '../../Assets/ProfileIcon.png';
import { NavConfig2 } from '../../Data/NavbarConfigs';

const ProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [preview, setPreview] = useState(null);

  return (
    <div className="settings-page">
      <Navbar links={NavConfig2} />
      <div className="settings-container">
        <div className="settings-sidebar">
        <div className="sidebar-profile-header">
  <img
    src={preview || userIcon}
    alt="Profile"
    className="settings-user-icon"
  />
  <h3 className="settings-username">Maryam Yusuf</h3>
</div>

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
              <h4>Name</h4>
              <input type="text" value="Maryam Yusuf" readOnly />
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
  <img
    src={preview || userIcon}
    alt="Profile"
    className="profile-preview"
  />
  <div className="upload-delete-container">
    <button
      className="upload-pic-btn"
      onClick={() => document.getElementById('hiddenFileInput').click()}
    >
      Upload a picture
    </button>
    <button
      className="delete-btn"
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
      id="hiddenFileInput"
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
              <input type="text"  placeholder="Enter you name" />

              <h4>Email</h4>
              <input type="text"  placeholder="Enter you email" />

              <h4>Major</h4>
              <select className="full-width" defaultValue="">
                <option value="Web Media">Web Media</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Visual Design">Visual Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Software Development">
                  Software Development
                </option>
              </select>

              <h4>Phone Number</h4>
              <input type="text"  placeholder="Enter your phone number" />

              <h4>Date of Birth</h4>
              <input type="date" defaultValue="dd-mm-yyyy" />

              <h4>Bio</h4>
              <textarea  placeholder="Add your bio"></textarea>

              <h4>Skills</h4>
              <input
                type="text"
                placeholder="Add your skills"
              />

              <h4>Select your specialties</h4>
              <div className="checkboxes-grid">
                {[
                  'Animation',
                  'Brand / Graphic Design',
                  'Illustration',
                  'Leadership',
                  'Mobile Design',
                  'UI / Visual Design',
                  'Product Design',
                  'UX Design / Research'
                ].map((specialty, index) => (
                  <label key={index} className="checkbox-item">
                    <input
                      type="checkbox"
                      defaultChecked={
                        specialty === 'Illustration' ||
                        specialty === 'Animation'
                      }
                    />
                    {specialty}
                  </label>
                ))}
              </div>

              <h4>Other Specialties</h4>
              <input
                type="text"
                 placeholder="Add other specialties"
              />

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
