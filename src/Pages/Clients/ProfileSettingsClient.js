// src/Pages/Clients/ProfileSettingsClient.js
import React, { useState } from 'react';
import '../../Style/Clients/ProfileSettingsClient.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';


const ProfileSettingsClient = () => {
  const [activeSection, setActiveSection] = useState('edit');

  return (
    <div className="client-settings-page">
      <Navbar links={NavConfig3} />
      <div className="client-settings-container">
        <div className="client-settings-sidebar">
          <h3 className="client-settings-username">Ahmed Isa</h3>

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
              <h4>Name</h4>
              <input type="text" defaultValue="Ahmed Isa" />

              <h4>Email</h4>
              <input type="text" defaultValue="ahmed.isa@alsalambank.com" />

              <h4>Occupation</h4>
              <input type="text" defaultValue="HR" />

              <h4>Phone Number</h4>
              <input type="text" defaultValue="+973 33333333" />

              <h4>Company Name</h4>
              <input type="text" defaultValue="AlSalam Bank" />

              <h4>Date of Birth</h4>
              <input type="date" defaultValue="13-01-1996" />
              
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
      <Footer />
    </div>
  );
};

export default ProfileSettingsClient;
