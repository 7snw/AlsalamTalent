import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/Admin/AddUsers.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';
import { logError, logSuccess } from '../../utils/consoleMessages';
import { showAlert } from '../../utils/toastMessages';

// Component for adding a new client user
const AddUsers = () => {
  const navigate = useNavigate();

  // State to manage form input data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    occupation: '',
    phone: '',
    companyName: '',
    dateOfBirth: '',
    role: 'client' // Fixed role as 'client'
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Map unique names to actual data keys
    const updatedName = name === 'new_email' ? 'email' : name === 'new_password' ? 'password' : name;
    setFormData(prev => ({
      ...prev,
      [updatedName]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const admin = JSON.parse(localStorage.getItem('user')); // Get current logged-in admin
      const payload = { ...formData, authorId: admin?._id }; // Attach admin ID to form data

      // Send POST request to backend to register a new client
      const response = await axios.post('http://localhost:5000/api/client/register', payload);

      if (response.status === 201 || response.status === 200) {
        logSuccess('Client created successfully.');
        navigate('/clientlist');
      }
    } catch (err) {
      logError('Failed to create client: ' + (err.response?.data?.message || err.message));
      showAlert(err.response?.data?.message || 'Failed to create client.');
    }
  };

  return (
    <div className="add-user-page">
      <Navbar links={NavConfig4} />
      <div className="add-user-container">
        <div className="add-user-content">
          <h2>Add a new client account</h2>

          {/* Client registration form */}
          <form className="add-user-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter user name"
                required
              />
            </div>

            {/* Email input with unique name */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="new_email"
                autoComplete="off"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            {/* Password input with unique name */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="new_password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="form-group">
              <label>Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Enter occupation"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />
            </div>


            <button type="submit" className="add-btn">Add</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddUsers;
