import React, { useState } from 'react';
import '../../Style/Admin/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';

const AdminProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('edit');

  return (
    <div className="settings-page">
      <Navbar links={NavConfig4} />
      <div className="settings-container">
        <div className="settings-sidebar">
          <h3 className="settings-username">Maryam Yusuf Haji</h3>

          <ul className="settings-tabs">
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


          {activeSection === 'edit' && (
            <div className="section">
            
              <h4>Name</h4>
              <input type="text" defaultValue="Maryam Yusuf Haji" />
              <h4>Email</h4>
              <input type="text" defaultValue="maryam.yusuf@alsalambank.com" />
              <h4>Occupation</h4>
              <input type="text" defaultValue="IT Administrator - Alsalam Bank" />
              <h4>Phone Number</h4>
              <input type="text" defaultValue="+973 33339991" />
              <h4>Date of Birth</h4>
              <input type="date" defaultValue="2002-10-24" />
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

export default AdminProfileSettings;
