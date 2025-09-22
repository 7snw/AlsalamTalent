// src/Pages/Admin/EditUserProfile.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../Style/Admin/EditUserProfile.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';
import { showAlert } from '../../utils/toastMessages';

// Admin page to edit a client's profile
const EditUserProfile = () => {
  const { userId } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate(); // For programmatic navigation

  const [formData, setFormData] = useState(null); // Stores the form fields
  const [loading, setLoading] = useState(true); // Loading state

 

  // Handle input changes
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value // Update changed field
    }));
  };

// src/Pages/Admin/EditUserProfile.js
// (Only key changes shown: stricter payload + DOB handling)

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const admin = JSON.parse(localStorage.getItem("user"));

    // Build a *whitelist* payload so we don't send internal props accidentally
    const payload = {
      fullName:     formData.fullName || '',
      email:        formData.email || '',
      occupation:   formData.occupation || '',
      phone:        formData.phone || '',
      companyName:  formData.companyName || '',
      dateOfBirth:  formData.dateOfBirth || '', // keep as 'YYYY-MM-DD'
      authorId:     admin?._id
    };

    await axios.put(`http://localhost:5000/api/client/${userId}`, payload);

    showAlert('User updated successfully!');
    navigate('/clientlist');
  } catch (error) {
    console.error('Error updating user:', error?.response?.data || error);
    showAlert(error?.response?.data?.message || 'Failed to update user.');
  }
};

// When loading the user, don't reformat DOB if it's already YYYY-MM-DD:
useEffect(() => {
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/client/${userId}`);

      const userData = { ...data };
      if (userData.dateOfBirth) {
        // If backend returns a full ISO, normalize to YYYY-MM-DD for <input type="date">
        const s = String(userData.dateOfBirth);
        userData.dateOfBirth =
          /^\d{4}-\d{2}-\d{2}$/.test(s)
            ? s
            : new Date(s).toISOString().slice(0, 10);
      }

      userData.role = 'client';
      setFormData(userData);
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchUser();
}, [userId]);


  // Cancel and return to client list
  const handleCancel = () => {
    navigate('/clientlist');
  };

  // Show loading indicator until data is ready
  if (loading || !formData) return <p>Loading...</p>;

  return (
    <div className="settings-page">
      <Navbar links={NavConfig4} /> {/* Admin navbar */}

      <div className="settings-container">
        <div className="settings-content">
          <h2>Edit user profile</h2>

          {/* Profile edit form */}
          <form className="settings-section" onSubmit={handleSubmit}>
            <h4>Name</h4>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <h4>Email</h4>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <h4>Occupation</h4>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              required
            />

            <h4>Phone Number</h4>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <h4>Company Name</h4>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />

            <h4>Date of Birth</h4>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />

            {/* Hidden input to enforce role as client */}
            <input type="hidden" name="role" value="client" />

            {/* Save and Cancel buttons */}
            <div className="edit-buttons">
              <button type="submit" className="settings-save-btn">Save</button>
              <button type="button" className="settings-cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <Footer /> {/* Footer */}
    </div>
  );
};

export default EditUserProfile;
