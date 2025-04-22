// src/pages/AddUserAccount.js
import React from 'react';
import '../../Style/Admin/AddUsers.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';


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
  <input type="text" placeholder="Enter user name" />
</div>

<div className="form-group">
  <label>Email</label>
  <input type="email" placeholder="Enter email" />
</div>

<div className="form-group">
  <label>Occupation</label>
  <input type="text" placeholder="Enter occupation" />
</div>

<div className="form-group">
  <label>Phone Number</label>
  <input type="text" placeholder="Enter phone number" />
</div>

<div className="form-group">
  <label>Company Name</label>
  <input type="text" placeholder="Enter company name" />
</div>

<div className="form-group">
  <label>Date of Birth</label>
  <input type="date" placeholder="dd-mm-yyyy" />
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
    <Footer />
    </div>
  );
};

export default AddUsers;
