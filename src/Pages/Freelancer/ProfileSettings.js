import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/ProfileSettings.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import userIcon from '../../Assets/ProfileImage.png';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import axios from 'axios';
import { showAlert } from '../../utils/toastMessages';

const expertiseOptions = [
  "Marketing",
  "Graphic Design",
  "Content Creation",
  "Product Design",
  "Web Design",
  "Photography",
  "Video & Motion",
  "Reports & Presentations"
];

/* ---------------- Skills tags input ---------------- */
const SkillsInput = ({ value = "", onChange, placeholder = "Type a skill and press Enter" }) => {
  const [draft, setDraft] = React.useState("");
  const tags = (value || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const commit = (raw) => {
    const txt = String(raw || "").trim();
    if (!txt) return;
    if (!tags.includes(txt)) {
      const next = [...tags, txt].join(", ");
      onChange(next);
    }
    setDraft("");
  };

  const removeAt = (i) => {
    const next = tags.filter((_, idx) => idx !== i).join(", ");
    onChange(next);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      removeAt(tags.length - 1);
    }
  };

  return (
    <div className="skills-tags-wrap" onClick={() => document.getElementById("skills-input-box")?.focus()}>
      {tags.map((t, i) => (
        <span className="tag-chip" key={`${t}-${i}`}>
          {t}
          <button
            type="button"
            className="tag-x"
            aria-label={`Remove ${t}`}
            onClick={() => removeAt(i)}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id="skills-input-box"
        className="skills-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit(draft)}
        placeholder={tags.length ? "" : placeholder}
      />
    </div>
  );
};

/* ---------------- IBAN helpers (BH) ---------------- */
const normalizeIban = (s = '') => s.replace(/\s+/g, '').toUpperCase();
const isValidBHIban = (s = '') => /^BH\d{2}[A-Z]{4}\d{14}$/.test(normalizeIban(s));
const formatIban = (s = '') => normalizeIban(s).replace(/(.{4})/g, '$1 ').trim();

/* ---------------- CV constraints ---------------- */
const CV_ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const CV_MAX = 10 * 1024 * 1024;

/* ---------------- Password strength (for change password tab) ---------------- */
const isStrongPassword = (pwd) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(String(pwd || ""));

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

  // IBAN/CV state
  const [ibanError, setIbanError] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvDisplayName, setCvDisplayName] = useState(''); // shown instead of “No file chosen”

  const fetchFreelancer = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const freelancerId = storedUser?._id;
      if (!freelancerId) {
        showAlert('You are not logged in.');
        return;
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/freelancer/profile/${freelancerId}`
      );

      // Normalize media URLs
      const fullImg = data.profileImageUrl?.startsWith('http')
        ? data.profileImageUrl
        : data.profileImageUrl
          ? `http://localhost:5000${data.profileImageUrl}`
          : null;

      const fullCv = data.cvUrl?.startsWith('http')
        ? data.cvUrl
        : data.cvUrl
          ? `http://localhost:5000${data.cvUrl}`
          : '';

      setFreelancerData({ ...data, profileImageUrl: fullImg, cvUrl: fullCv });
      setFormData({
        ...data,
        iban: data.iban ? formatIban(data.iban) : '',
        skills: data.skills?.join(', ') || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
      });
      setIsActive(data.isActive);
      setPreview(fullImg || userIcon);

      // Display saved CV filename in the fake input
      const existingName = fullCv ? decodeURIComponent(fullCv.split('/').pop()) : '';
      setCvDisplayName(existingName);

      setCvFile(null);
    } catch (err) {
      console.error('Error fetching freelancer data:', err);
    }
  };

  useEffect(() => { fetchFreelancer(); }, []);

  const handleChange = (field, value) => {
    if (field === 'iban') {
      const formatted = formatIban(value);
      const valid = !formatted || isValidBHIban(formatted);
      setIbanError(valid ? '' : 'IBAN should look like BH12 BANK 1234 5678 9012 34');
      setFormData(prev => ({ ...prev, iban: formatted }));
      return;
    }
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showAlert('Image must be less than 2 MB.');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // CV change – update the fake input text with the new filename
  const handleCvChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setCvFile(null); return; }
    if (!CV_ALLOWED.includes(f.type)) return showAlert('Please upload a PDF, DOC, or DOCX.');
    if (f.size > CV_MAX) return showAlert('CV must be 10MB or less.');
    setCvFile(f);
    setCvDisplayName(f.name);
  };

  const handleSave = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const freelancerId = storedUser?._id;

      const cleanIban = formData.iban ? normalizeIban(formData.iban) : '';
      if (cleanIban && !isValidBHIban(cleanIban)) {
        return showAlert('Please enter a valid Bahrain IBAN.');
      }

      const updates = {
        ...formData,
        iban: cleanIban,
        skills: (formData.skills || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      };

      const form = new FormData();
      form.append('data', JSON.stringify(updates));
      if (imageFile) form.append('profileImage', imageFile);
      if (cvFile) form.append('cv', cvFile);

      await axios.put(`http://localhost:5000/api/freelancer/profile/${freelancerId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchFreelancer();
      window.dispatchEvent(new Event('profileImageUpdated'));
      setImageFile(null);
      showAlert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Failed to update profile.');
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const freelancerId = storedUser?._id;
      await axios.put(`http://localhost:5000/api/freelancer/profile/${freelancerId}`, { profileImageUrl: '' });
      setPreview(userIcon);
      setFreelancerData(prev => ({ ...prev, profileImageUrl: '' }));
      window.dispatchEvent(new Event('profileImageUpdated'));
      showAlert('Profile picture removed.');
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      showAlert('Failed to remove picture.');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!isStrongPassword(newPassword)) {
        return showAlert('New password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      }
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const freelancerId = storedUser?._id;
      await axios.put(`http://localhost:5000/api/freelancer/changepassword/${freelancerId}`, {
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });
      showAlert('Password updated successfully!');
      setOldPassword(''); setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert('Failed to change password.');
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
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
        <div className="settings-sidebar9">
          <div className="sidebar-profile-header9">
            <img src={preview || userIcon} alt="Profile" className="settings-user-icon9" />
            <h3 className="settings-username9">{freelancerData?.fullName || 'Your Name'}</h3>
          </div>
          <ul className="settings-tabs9">
            <li className={activeSection === 'general' ? 'active' : ''} onClick={() => setActiveSection('general')}>General</li>
            <li className={activeSection === 'edit' ? 'active' : ''} onClick={() => setActiveSection('edit')}>Edit Profile</li>
            <li className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>Password</li>
          </ul>
          <button className="delete-account9" onClick={handleDeactivateAccount}>
            {isActive ? 'Deactivate Account' : 'Deactivate Account'}
          </button>
        </div>

        <div className="settings-content9">
          {activeSection === 'general' && (
            <div className="section9">
               <h4>Student ID</h4>
              <input type="text" value={formData.studentId || ''} readOnly />
              <h4>Name</h4>
              <input type="text" value={formData.fullName || ''} readOnly />
              <h4>Email</h4>
              <input type="text" value={formData.email || ''} readOnly />
            </div>
          )}

          {activeSection === 'edit' && (
            <div className="section9">
              <div className="edit-profile-picture9">
                <img src={preview || userIcon} alt="Profile" className="profile-preview9" />
                <div className="upload-delete-container9">
                  <button className="upload-pic-btn9" onClick={() => document.getElementById('hiddenFileInput').click()}>Upload a picture</button>
                  <button className="delete-btn9" onClick={handleDeleteProfilePicture}>Delete picture</button>
                  <input type="file" id="hiddenFileInput" hidden accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <h4>Name</h4>
              <input type="text" value={formData.fullName || ''} readOnly />
             

              {/* Major */}
              <div className="majorr-field8">
                <p>Major</p>
                <div className="majorr-display8" onClick={() => setShowMajorDropdown(!showMajorDropdown)}>
                  {formData.major || "Select Major"}
                </div>
                {showMajorDropdown && (
                  <div className="majorr-dropdown-list8">
                    {[
                      "School of ICT", "School of Creative Media", "School of Business",
                      "School of Logistics", "School of Engineering", "School of Foundation"
                    ].map((option, i) => (
                      <div
                        key={i}
                        className="majorr-option8"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, major: option }));
                          setShowMajorDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expertise */}
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
                 
                  </>
                )}
              </div>

              {/* IBAN */}
              <h4>IBAN</h4>
              <input
                type="text"
                value={formData.iban || ''}
                onChange={(e) => handleChange('iban', e.target.value)}
                placeholder="BH12 BANK 1234 5678 9012 34"
                aria-invalid={!!ibanError}
              />
              {ibanError && <small className="error">{ibanError}</small>}

              <h4>Phone Number</h4>
              <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />

              <h4>Date of Birth</h4>
              <input type="date" value={formData.dateOfBirth || ''} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />

              <h4>Bio</h4>
              <textarea value={formData.bio || ''} onChange={(e) => handleChange('bio', e.target.value)} />

              {/* CV – fake input that shows saved filename */}
              <h4>CV</h4>
              <div className="cv-wrapper">
                <input
                  id="cvFileInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  className="cv-hidden-input"
                />
                <label htmlFor="cvFileInput" className="cv-fake-input" title="Click to choose a file">
                  <span className="cv-choose-btn">Choose File</span>
                  <span className="cv-file-name">
                    {cvDisplayName || 'No file chosen'}
                  </span>
                </label>
              </div>

              {/* Skills – type to add tags */}
              <h4>Skills</h4>
              <SkillsInput
                value={formData.skills || ""}
                onChange={(val) => handleChange("skills", val)}
              />
              <small style={{opacity:.7}}>
                Press <strong>Enter</strong> or <strong>,</strong> to add. Backspace removes the last tag.
              </small>
<br></br>
             <button
  className="save-btn9"
  onClick={() => {
    handleSave();        // call save function
    navigate("/myprofile"); // then navigate
  }}
>
  Save
</button>

            </div>
          )}

          {activeSection === 'password' && (
            <div className="section9">
              <h4>Old Password</h4>
              <input type="password" name="oldPassword" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <h4>New Password</h4>
              <input type="password" name="newPassword" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
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
