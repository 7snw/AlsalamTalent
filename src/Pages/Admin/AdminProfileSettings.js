import React, { useState } from 'react';
import '../../Style/Admin/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';


const AdminProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('edit');

  return (
    <div className="admin-settings-page">
      <Navbar links={NavConfig4} />
      <div className="admin-settings-container">
        <div className="admin-settings-sidebar">
          <h3 className="admin-settings-username">Maryam Yusuf</h3>

          <ul className="admin-settings-tabs">
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

        <div className="admin-settings-content">
          {activeSection === 'edit' && (
            <div className="admin-section">
              <h4>Name</h4>
              <input type="text" defaultValue="Maryam Yusuf" />

              <h4>Email</h4>
              <input type="text" defaultValue="maryam.yusuf@alsalambank.com" />

              <h4>Occupation</h4>
              <input type="text" defaultValue="Marketing" />

              <h4>Phone Number</h4>
              <input type="text" defaultValue="+973 33333333" />

              <h4>Company Name</h4>
              <input type="text" defaultValue="AlSalam Bank" />

              <h4>Date of Birth</h4>
              <input type="date" defaultValue="2002-10-24" />
              
              <button className="admin-save-btn">Save</button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="admin-section">
              <h4>Old Password</h4>
              <input type="password" placeholder="Enter old password" />
              <h4>New Password</h4>
              <input type="password" placeholder="Enter new password" />
              <button className="admin-save-btn">Save</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProfileSettings;
