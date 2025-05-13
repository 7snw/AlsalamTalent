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
  const [activeSection, setActiveSection] = useState('general');
  const [freelancerData, setFreelancerData] = useState(null);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
    const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [isActive, setIsActive] = useState(true);

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


  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpertiseChange = (value) => {
    setFormData(prev => {
      const isSelected = prev.expertise.includes(value);
      const updated = isSelected
        ? prev.expertise.filter(item => item !== value)
        : [...prev.expertise, value];
      return { ...prev, expertise: updated };
    });
  };

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
      
      // Update the image preview immediately
      if (res.profileImageUrl) {
        setPreview(`http://localhost:5000${res.profileImageUrl}`);
      } else {
        setPreview(userIcon); // Fallback if no image is returned
      }
  
      setFreelancerData(res);  // Update freelancer data
      setImageFile(null);  // Reset the file input
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Failed to update profile.');
    }
  };
  
  

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

  const handleDeactivateAccount = async () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const freelancerId = storedUser?._id;

    const { data } = await axios.put(`http://localhost:5000/api/freelancer/deactivate/${freelancerId}`);
    
    showAlert(data.message);
    
    setIsActive(data.isActive);

    if (!data.isActive) {
      // Redirect only if account is deactivated
      navigate('/');
    }

  } catch (error) {
    console.error('Error deactivating account:', error);
    showAlert('Failed to toggle account status.');
  }
};


  return (
    <div className="settings-page9">
      <Navbar links={NavConfig2} />
      <div className="settings-container9">
        <div className="settings-sidebar9">
          <div className="sidebar-profile-header9">
            <img
            src={freelancerData?.profileImageUrl ? freelancerData.profileImageUrl : userIcon}

              alt="Profile"
              className="settings-user-icon9"
            />
            <h3 className="settings-username9">{freelancerData?.fullName || 'Your Name'}</h3>
          </div>

          <ul className="settings-tabs9">
            <li className={activeSection === 'general' ? 'active' : ''} onClick={() => setActiveSection('general')}>General</li>
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>Edit Profile</li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>Password</li>
          </ul>

          <button className="delete-account9" onClick={handleDeactivateAccount}>
            {isActive ? 'Deactivate Account' : 'Reactivate Account'}
          </button>
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
                <img
                  src={preview || (freelancerData?.profileImageUrl ? freelancerData.profileImageUrl : userIcon)}
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

              <h4>Name</h4>
              <input type="text" value={formData.fullName} readOnly />

              <h4>Email</h4>
              <input type="text" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />

                   <div className="major-field">
  <p>Major</p>
  <div
    className="major-display8"
    onClick={() => setShowMajorDropdown((prev) => !prev)}
  >
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
                      <button className="close-expertise-dropdown"type="button" onClick={() => setShowExpertiseDropdown(false)}>Done</button>
                      <button className="clear-expertise-dropdown"type="button" onClick={() => setFormData(prev => ({ ...prev, expertise: [] }))}>Clear</button>
                    </div>
                  </>
                )}
              </div>

              <h4>Phone Number</h4>
              <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />

              <h4>Date of Birth</h4>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />

              <h4>Bio</h4>
              <textarea value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />

              <h4>Skills</h4>
<div className="checkboxes-grid9">
  {['Animation','Marketing', 'Illustration', 'Web Development', 'Branding', 'Graphic Design','UI/UX Design', 'Content Creation'].map((skill, index) => (
    <div key={index} className="checkbox-item9">
      <input
        type="checkbox"
        checked={formData.skills?.split(', ').includes(skill)}  // Check if the skill is in the list of selected skills
        onChange={() => handleSkillsCheckboxChange(skill)}  // Update the skills list when checked or unchecked
      />
      <span>{skill}</span>
    </div>
  ))}
</div>

              <button className="save-btn9" onClick={handleSave}>Save</button>
            </div>
          )}

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
