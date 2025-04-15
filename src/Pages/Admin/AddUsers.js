// src/pages/AddUserAccount.js
import React from 'react';
import '../../Style/Admin/AddUsers.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';

const AddUsers = () => {
  return (
    <div className="add-user-page">
      <Navbar links={NavConfig4} />
      <div className="add-user-container">
       

        <div className="add-user-content">
          <h2>
            Add a new Account <strong>(Admin/Client)</strong>
          </h2>
          <div className="add-user-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Maryam Yusuf Haji" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="maryam.yusuf@alsalambank.com" />
            </div>

            <div className="form-group">
              <label>Occupation</label>
              <input type="text" placeholder="Marketing Executive - Alsalam Bank" />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" placeholder="+973 33339991" />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" defaultValue="2002-10-24" />
            </div>

            <div className="option-form-group">
              <label>Type</label>
              <select>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button className="add-btn">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUsers;
