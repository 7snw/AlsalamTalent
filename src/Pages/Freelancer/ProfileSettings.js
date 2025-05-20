// src/Pages/Freelancer/ProfileSettings.js

import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import userIcon from '../../Assets/ProfileIcon.png';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import axios from 'axios';
import { showAlert } from '../../utils/toastMessages';

// List of predefined expertise options
const expertiseOptions = [
  "Marketing",
  "Graphic Designer",
  "Illustrator",
  "Web Developer",
  "UX/UI Designer",
  "Content Creator"
];

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('general'); // Toggle between tabs
  const [freelancerData, setFreelancerData] = useState(null); // Original freelancer data
  const [formData, setFormData] = useState({}); // Editable form data
  const [preview, setPreview] = useState(null); // Preview image for profile picture
  const [imageFile, setImageFile] = useState(null); // Image file selected
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [isActive, setIsActive] = useState(true); // Account status

  // Fetch freelancer profile on mount
  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const freelancerId = storedUser?._id;
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${freelancerId}`);
        setFreelancerData(data);
        setFormData({
          ...data,
          skills: data.skills?.join(', ') || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
        });
        setIsActive(data.isActive);
      } catch (error) {
        console.error('Error fetching freelancer data:', error);
      }
    };
    fetchFreelancer();
  }, []);

  // Handle text/field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle expertise selection
  const handleExpertiseChange = (value) => {
    setFormData(prev => {
      const isSelected = prev.expertise.includes(value);
      const updated = isSelected
        ? prev.expertise.filter(item => item !== value)
        : [...prev.expertise, value];
      return { ...prev, expertise: updated };
    });
  };

  // Toggle skills checkbox
  const handleSkillsCheckboxChange = (skill) => {
    setFormData(prev => {
      const updatedSkills = prev.skills ? prev.skills.split(', ') : [];
      if (updatedSkills.includes(skill)) {
        return { ...prev, skills: updatedSkills.filter(item => item !== skill).join(', ') };
      } else {
        return { ...prev, skills: [...updatedSkills, skill].join(', ') };
      }
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      showAlert(`Image must be less than ${maxSizeMB} MB.`);
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const freelancerId = storedUser?._id;
      const updates = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()),
      };

      const form = new FormData();
      form.append('data', JSON.stringify(updates));
      if (imageFile) {
        form.append('profileImage', imageFile);
      }

      const { data: res } = await axios.put(`http://localhost:5000/api/freelancer/profile/${freelancerId}`, form);

      showAlert('Profile updated successfully!');
      setPreview(res.profileImageUrl ? `http://localhost:5000${res.profileImageUrl}` : userIcon);
      setFreelancerData(res);
      setImageFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Failed to update profile.');
    }
  };

  // Delete profile picture
  const handleDeleteProfilePicture = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const freelancerId = storedUser?._id;
      await axios.put(`http://localhost:5000/api/freelancer/profile/${freelancerId}`, {
        profileImageUrl: '',
      });
      showAlert('Profile picture removed.');
      setPreview(null);
      setFreelancerData(prev => ({ ...prev, profileImageUrl: '' }));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      showAlert('Failed to remove picture.');
    }
  };

  // Change password
  const handleChangePassword = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const freelancerId = storedUser?._id;
      await axios.put(`http://localhost:5000/api/freelancer/changepassword/${freelancerId}`, {
        oldPassword,
        newPassword,
      });
      showAlert('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error.message);
      showAlert(error.response?.data?.message || 'Failed to change password.');
    }
  };

  // Deactivate or reactivate freelancer account
  const handleDeactivateAccount = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const freelancerId = storedUser?._id;
      const { data } = await axios.put(`http://localhost:5000/api/freelancer/deactivate/${freelancerId}`);
      showAlert(data.message);
      setIsActive(data.isActive);
      if (!data.isActive) navigate('/');
    } catch (error) {
      console.error('Error deactivating account:', error);
      showAlert('Failed to toggle account status.');
    }
  };

  return (
    <div className="settings-page9">
      <Navbar links={NavConfig2} />
      <div className="settings-container9">
        {/* Sidebar with user info and navigation tabs */}
        <div className="settings-sidebar9">
          <div className="sidebar-profile-header9">
            <img
              src={freelancerData?.profileImageUrl || userIcon}
              alt="Profile"
              className="settings-user-icon9"
            />
            <h3 className="settings-username9">{freelancerData?.fullName || 'Your Name'}</h3>
          </div>

          {/* Tabs */}
          <ul className="settings-tabs9">
            <li className={activeSection === 'general' ? 'active' : ''} onClick={() => setActiveSection('general')}>General</li>
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>Edit Profile</li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>Password</li>
          </ul>

          {/* Deactivate button */}
          <button className="delete-account9" onClick={handleDeactivateAccount}>
            {isActive ? 'Deactivate Account' : 'Deactivate Account'}
          </button>
        </div>

        {/* Main content area */}
        <div className="settings-content9">
          {/* GENERAL TAB */}
          {activeSection === 'general' && (
            <div className="section9">
              <h4>Name</h4>
              <input type="text" value={formData.fullName} readOnly />
              <h4>Email</h4>
              <input type="text" value={formData.email} readOnly />
            </div>
          )}

          {/* EDIT TAB */}
          {activeSection === 'edit' && (
            <div className="section9">
              {/* Profile picture preview and upload */}
              <div className="edit-profile-picture9">
                <img
                  src={preview || freelancerData?.profileImageUrl || userIcon}
                  alt="Profile"
                  className="profile-preview9"
                />
                <div className="upload-delete-container9">
                  <button className="upload-pic-btn9" onClick={() => document.getElementById('hiddenFileInput').click()}>
                    Upload a picture
                  </button>
                  <button className="delete-btn9" onClick={handleDeleteProfilePicture}>
                    Delete picture
                  </button>
                  <input
                    type="file"
                    id="hiddenFileInput"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Editable fields */}
              <h4>Name</h4>
              <input type="text" value={formData.fullName} readOnly />
              <h4>Email</h4>
              <input type="text" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />

              {/* Major dropdown */}
              <div className="major-field">
                <p>Major</p>
                <div className="major-display8" onClick={() => setShowMajorDropdown((prev) => !prev)}>
                  {formData.major || "Select Major"}
                </div>
                {showMajorDropdown && (
                  <div className="major-dropdown-list8">
                    {[
                      "School of ICT",
                      "School of Creative Media",
                      "School of Business",
                      "School of Logistics & Maritime Studies",
                      "School of Engineering",
                      "School of Foundation",
                    ].map((option, index) => (
                      <div
                        key={index}
                        className="major-option8"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, major: option }));
                          setShowMajorDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expertise selection */}
              <div className="expertiseer">
                <p>Expertise</p>
                <div className="expertise-display" onClick={() => setShowExpertiseDropdown(!showExpertiseDropdown)}>
                  {formData.expertise?.length ? formData.expertise.join(', ') : 'Select Expertise'}
                </div>
                {showExpertiseDropdown && (
                  <>
                    <div className="expertise-dropdown-list">
                      {expertiseOptions.map((option, index) => (
                        <label key={index} className="expertise-checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.expertise?.includes(option)}
                            onChange={() => handleExpertiseChange(option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    <div className="expertise-dropdown-actions">
                      <button type="button" className="close-expertise-dropdown" onClick={() => setShowExpertiseDropdown(false)}>Done</button>
                      <button type="button" className="clear-expertise-dropdown" onClick={() => setFormData(prev => ({ ...prev, expertise: [] }))}>Clear</button>
                    </div>
                  </>
                )}
              </div>

              {/* Phone, DOB, Bio */}
              <h4>Phone Number</h4>
              <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              <h4>Date of Birth</h4>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
              <h4>Bio</h4>
              <textarea value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />

              {/* Skills checkbox grid */}
              <h4>Skills</h4>
              <div className="checkboxes-grid9">
                {['Animation','Marketing', 'Illustration', 'Web Development', 'Branding', 'Graphic Design','UI/UX Design', 'Content Creation'].map((skill, index) => (
                  <div key={index} className="checkbox-item9">
                    <input
                      type="checkbox"
                      checked={formData.skills?.split(', ').includes(skill)}
                      onChange={() => handleSkillsCheckboxChange(skill)}
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>

              <button className="save-btn9" onClick={handleSave}>Save</button>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeSection === 'password' && (
            <div className="section9">
              <h4>Old Password</h4>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <h4>New Password</h4>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
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
