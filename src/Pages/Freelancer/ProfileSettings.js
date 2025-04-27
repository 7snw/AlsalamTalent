import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import userIcon from '../../Assets/ProfileIcon.png';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import axios from 'axios';

const ProfileSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [freelancerData, setFreelancerData] = useState(null);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const freelancerId = localStorage.getItem('userId');
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${freelancerId}`);
        setFreelancerData(data);
        setFormData({
          ...data,
          skills: data.skills?.join(', ') || '',
        });
      } catch (error) {
        console.error('Error fetching freelancer data:', error);
      }
    };
    fetchFreelancer();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (specialty) => {
    setFormData(prev => {
      const updated = prev.specialties.includes(specialty)
        ? prev.specialties.filter(item => item !== specialty)
        : [...prev.specialties, specialty];
      return { ...prev, specialties: updated };
    });
  };

  const handleSave = async () => {
    try {
      const freelancerId = localStorage.getItem('userId');
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        specialties: formData.specialties,
        profileImageUrl: preview || formData.profileImageUrl, 
      };

      await axios.put(`http://localhost:5000/api/freelancer/profile/${freelancerId}`, updatedData);
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleChangePassword = async () => {
    try {
      const freelancerId = localStorage.getItem('userId');
      await axios.put(`http://localhost:5000/api/freelancer/changepassword/${freelancerId}`, {
        oldPassword,
        newPassword,
      });
      alert('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="settings-page9">
      <Navbar links={NavConfig2} />
      <div className="settings-container9">
        <div className="settings-sidebar9">
          <div className="sidebar-profile-header9">
            <img src={preview || freelancerData?.profileImageUrl || userIcon} alt="Profile" className="settings-user-icon9" />
            <h3 className="settings-username9">{freelancerData?.fullName || 'Your Name'}</h3>
          </div>

          <ul className="settings-tabs9">
            <li className={activeSection === 'general' ? 'active' : ''} onClick={() => setActiveSection('general')}>General</li>
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>Edit Profile</li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>Password</li>
          </ul>

          <button className="delete-account9">Delete account</button>
        </div>

        <div className="settings-content9">
          {activeSection === 'general' && (
            <div className="section9">
              <h4>Name</h4>
              <input type="text" value={formData.fullName} readOnly />
              <h4>Email</h4>
              <input type="text" value={formData.email} readOnly />
            </div>
          )}

          {activeSection === 'edit' && (
            <div className="section9">
              <div className="edit-profile-picture9">
                <img src={preview || freelancerData?.profileImageUrl || userIcon} alt="Profile" className="profile-preview9" />
                <div className="upload-delete-container9">
                  <button className="upload-pic-btn9" onClick={() => document.getElementById('hiddenFileInput').click()}>
                    Upload a picture
                  </button>
                  <input type="file" id="hiddenFileInput" hidden accept="image/*"
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
              <input type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />

              <h4>Email</h4>
              <input type="text" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />

              <h4>Major</h4>
              <select value={formData.major} onChange={(e) => handleChange('major', e.target.value)}>
                <option value="">Select Major</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Business">Business</option>
              </select>

              <h4>Phone Number</h4>
              <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />

              <h4>Date of Birth</h4>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />

              <h4>Bio</h4>
              <textarea value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />

              <h4>Skills</h4>
              <input type="text" value={formData.skills} onChange={(e) => handleChange('skills', e.target.value)} />

              <h4>Specialties</h4>
              <div className="checkboxes-grid9">
                {['Animation', 'Illustration', 'Mobile Design', 'Product Design', 'Brand / Graphic Design', 'Leadership', 'UI / Visual Design', 'UX Design / Research'].map((specialty) => (
                  <label key={specialty}>
                    <input
                      type="checkbox"
                      checked={formData.specialties?.includes(specialty)}
                      onChange={() => handleCheckboxChange(specialty)}
                    />
                    {specialty}
                  </label>
                ))}
              </div>

              <button className="save-btn9" onClick={handleSave}>Save</button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="section9">
              <h4>Old Password</h4>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter old password" />
              <h4>New Password</h4>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
              <button className="save-btn9" onClick={handleChangePassword}>Save Password</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSettings;
