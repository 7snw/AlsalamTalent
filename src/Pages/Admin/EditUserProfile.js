// src/Pages/Admin/EditUserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../Style/Admin/EditUserProfile.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';
import { showAlert } from '../../utils/toastMessages';

const EditUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/client/${userId}`);
        const userData = response.data;

        // Format date for input
        if (userData.dateOfBirth) {
          userData.dateOfBirth = new Date(userData.dateOfBirth).toISOString().split('T')[0];
        }

        userData.role = 'client'; // ensure role is fixed
        setFormData(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const admin = JSON.parse(localStorage.getItem("user")); // ✅ Get admin from localStorage
  
      const payload = {
        ...formData,
        authorId: admin?._id  // ✅ Add this to trigger logAction on backend
      };
  
      await axios.put(`http://localhost:5000/api/client/${userId}`, payload);
  
      showAlert('User updated successfully!');
      navigate('/clientlist');
    } catch (error) {
      console.error('Error updating user:', error);
      showAlert('Failed to update user.');
    }
  };
  
  const handleCancel = () => {
    navigate('/clientlist');
  };

  if (loading || !formData) return <p>Loading...</p>;

  return (
    <div className="settings-page">
      <Navbar links={NavConfig4} />
      <div className="settings-container">
        <div className="settings-content">
          <h2>Edit user profile</h2>
          <form className="settings-section" onSubmit={handleSubmit}>
            <h4>Name</h4>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />

            <h4>Email</h4>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />

            <h4>Occupation</h4>
            <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required />

            <h4>Phone Number</h4>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />

            <h4>Company Name</h4>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />

            <h4>Date of Birth</h4>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />

            {/* Role is fixed */}
            <input type="hidden" name="role" value="client" />

            <div className="edit-buttons">
              <button type="submit" className="settings-save-btn">Save</button>
              <button type="button" className="settings-cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditUserProfile;
