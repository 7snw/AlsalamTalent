import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/GraduateSignUp.css';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const expertiseOptions = [
  "Marketing Consultant",
  "Graphic Designer",
  "Illustrator",
  "Video Editor",
  "Web Developer",
  "Content Creator",
  "Brand Strategist",
  "UX/UI Designer"
];

const GraduateSignUp = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    password: '',
    major: '',
    contactNumber: '',
    cpr: null,
    expertise: []
  });

  const [isPolyStudent, setIsPolyStudent] = useState(null);
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
    const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'studentId') {
      if (value === '') {
        setIsPolyStudent(null);
      } else {
        const year = parseInt(value.substring(0, 4), 10);
        const validFormat = /^\d{9}$/.test(value);
        if (validFormat && year >= 2008 && year <= new Date().getFullYear()) {
          setIsPolyStudent(true);
        } else {
          setIsPolyStudent(false);
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'cpr' ? files[0] : value
    }));
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

  const handleSubmit = async (e) => {
  e.preventDefault();

  const year = parseInt(formData.studentId.substring(0, 4), 10);
  if (year < 2008 || year > new Date().getFullYear()) {
    alert('Invalid Student ID');
    return;
  }

  const form = new FormData();
  form.append('userType', 'graduate');
  form.append('studentId', formData.studentId);
  form.append('fullName', formData.fullName);
  form.append('email', formData.email);
  form.append('password', formData.password);
  form.append('major', formData.major);
  form.append('phone', formData.contactNumber);
  form.append('expertise', JSON.stringify(formData.expertise));
  form.append('cpr', formData.cpr);

  try {
    const response = await axios.post(
      'http://localhost:5000/api/freelancer/graduate-register',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );

    if (response.status === 200 || response.status === 201) {
      alert('Account Created! Waiting for admin verification.');

      //  Try sending notification to admin
      try {
        await axios.post("http://localhost:5000/api/notifications/send", {
          userType: "admin",
          subject: "New Graduate Freelancer Signup",
          message: `${formData.fullName} has registered as a graduate freelancer and is awaiting approval.`,
          type: "info"
        });
      } catch (notifyErr) {
        console.warn("⚠️ Admin notification failed:", notifyErr.message);
      }

      navigate('/signin');
    }
  } catch (error) {
    console.error('Graduate signup failed:', error.response?.data || error.message);
    alert(error.response?.data?.message || 'Signup failed.');
  }
};

  return (
    <div className="graduate-body">
      <div className="graduate-container">
        <button className="back-btn" onClick={() => navigate('/studentgraduate')}>
          <FaArrowLeft />
        </button>
        <h2>Create your Account</h2>
        <form onSubmit={handleSubmit} className="graduate-form">
          <div className="graduate-left-fields">
            <div>
              <label>Student ID</label>
              <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} required />
              <div style={{ minHeight: '5px', marginTop: '0px' }}>
                {isPolyStudent === true && <p style={{ color: 'green' }}></p>}
                {isPolyStudent === false && <p style={{ color: 'red' }}></p>}
              </div>
            </div>
            <div>
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} minLength="8" required />
            </div>
          </div>

          <div className="graduate-divider"></div>

          <div className="graduate-right-fields">
            
            
              <div className="major-field">
  <p>Major</p>
  <div
    className="major-display"
    onClick={() => setShowMajorDropdown((prev) => !prev)}
  >
    {formData.major || "Select Major"}
  </div>

  {showMajorDropdown && (
    <div className="major-dropdown-list">
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
          className="major-option"
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
            
        

            <div>
              <label>Contact Number</label>
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} pattern="\d{8}" required />
            </div>

            <div className="expertiseer0">
              <p>Expertise</p>
              <div className="expertise-display0" onClick={() => setShowExpertiseDropdown(!showExpertiseDropdown)}>
                {formData.expertise?.length ? formData.expertise.join(', ') : 'Select Expertise'}
              </div>
              {showExpertiseDropdown && (
                <div className="expertise-dropdown-list0">
                  {expertiseOptions.map((option, index) => (
                    <label key={index} className="expertise-checkbox-item0">
                      <input
                        type="checkbox"
                        checked={formData.expertise.includes(option)}
                        onChange={() => handleExpertiseChange(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                  <div className="expertise-dropdown-actions0">
                    <button className="close-expertise-dropdown0" type="button" onClick={() => setShowExpertiseDropdown(false)}>Done</button>
                    <button className="clear-expertise-dropdown0" type="button" onClick={() => setFormData(prev => ({ ...prev, expertise: [] }))}>Clear</button>
                  </div>
                </div>
              )}
            </div>

            <div className="graduate-file-upload-wrapper">
              <label htmlFor="cpr-upload">Upload CPR</label>
              <input id="cpr-upload" type="file" name="cpr" accept="image/*" onChange={handleChange} required />
            </div>

            <button type="submit" className="graduate-create-btn">Create</button>
          </div>
        </form>
        <p className="graduate-signin-link">
          I have an account? <span onClick={() => navigate('/signin')}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default GraduateSignUp;
