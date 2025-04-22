import React, { useState } from 'react';
import '../../Style/Admin/EditUserProfile.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';


const EditUserProfile = () => {
  const [activeSection] = useState('edit');

  return (
    <div className="settings-page">
    <Navbar links={NavConfig4} />
  
    <div className="settings-container">
   
     

      <div className="settings-content">
      <h2>      
           Edit user profile
          </h2>
        {activeSection === 'edit' && (
          <div className="settings-section">
            <h4>Name</h4>
            <input type="text" defaultValue="Fatema Almutawa" />

            <h4>Email</h4>
            <input type="text" defaultValue="fatema.almutawa@alsalambank.com" />

            <h4>Occupation</h4>
            <input type="text" defaultValue="IT Specialist" />

            <h4>Phone Number</h4>
            <input type="text" defaultValue="+973 33333333" />

            <h4>Company Name</h4>
            <input type="text" defaultValue="Alsalam Bank" />

            <h4>Date of Birth</h4>
            <input type="date" placeholder="25-11-1990" />

            <div className="option-form-group3">
              <label>Type</label>
              <select>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <button className="settings-save-btn">Save</button>
          </div>
        )}

       
      </div>
    </div>
    <Footer />
  </div>
  );
};

export default EditUserProfile;
