import React, { useState } from 'react';
import '../../Style/Freelancer/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import userIcon from '../../Assets/ProfileIcon.png';
import { NavConfig2 } from '../../Data/NavbarConfigs';

const ProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [preview, setPreview] = useState(null);

  return (
    <div className="settings-page9">
      <Navbar links={NavConfig2} />
      <div className="settings-container9">
        <div className="settings-sidebar9">
        <div className="sidebar-profile-header9">
  <img
    src={preview || userIcon}
    alt="Profile"
    className="settings-user-icon9"
  />
  <h3 className="settings-username9">Maryam Yusuf</h3>
</div>

          <ul className="settings-tabs9">
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

          <button className="delete-account9">Delete account</button>
        </div>

        <div className="settings-content9">
          {activeSection === 'general' && (
            <div className="section9">
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
            <div className="section9">
            <div className="edit-profile-picture9">
  <img
    src={preview || userIcon}
    alt="Profile"
    className="profile-preview9"
  />
  <div className="upload-delete-container9">
    <button
      className="upload-pic-btn9"
      onClick={() => document.getElementById('hiddenFileInput').click()}
    >
      Upload a picture
    </button>
    <button
      className="delete-btn9"
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
              <input type="text"  defaultValue="Maryam Yusuf" />

              <h4>Email</h4>
              <input type="text"  defaultValue="202100516@student.polytechnic.bh" />

              <h4>Major</h4>
              <select className="full-width9" defaultValue="Web Media">
                <option value="Web Media">Web Media</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Visual Design">Visual Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Software Development">
                  Software Development
                </option>
              </select>

              <h4>Phone Number</h4>
              <input type="text"  defaultValue="+973 33333333" />

              <h4>CPR Number</h4>
              <input type="text"  defaultValue="030000000" />

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
              <div className="checkboxes-grid9">
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
                  <label key={index} className="checkbox-item9">
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

              <button className="save-btn9">Save</button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="section9">
              <h4>Old Password</h4>
              <input type="password" placeholder="Enter old password" />
              <h4>New Password</h4>
              <input type="password" placeholder="Enter new password" />
              <button className="save-btn9">Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
