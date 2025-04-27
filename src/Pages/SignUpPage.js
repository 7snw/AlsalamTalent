import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/SignUpPage.css';
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
  "UX/UI Designer",
  "Photographer"
];

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    password: '',
    major: '',
    contactNumber: '',
    expertise: []
  });

  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
  
    // Validate student ID (numbers only)
    if (!/^\d+$/.test(formData.studentId)) {
      alert('Student ID must contain numbers only.');
      return;
    }
  
    // Validate full name
    if (!formData.fullName.trim()) {
      alert('Full Name is required.');
      return;
    }
  
    // Validate password length
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
  
    // Validate major selection
    if (!formData.major) {
      alert('Please select your Major.');
      return;
    }
  
    // Validate phone number (must be 8 digits)
    if (!/^\d{8}$/.test(formData.contactNumber)) {
      alert('Phone number must be exactly 8 digits.');
      return;
    }
  
    // Validate expertise (at least 1 selected)
    if (formData.expertise.length === 0) {
      alert('Please select at least one area of expertise.');
      return;
    }
  
    // Submit if all is valid
    try {
      const newFreelancer = {
        userType: 'student',
        studentId: formData.studentId,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        major: formData.major,
        phone: formData.contactNumber,
        expertise: formData.expertise
      };
  
      const response = await axios.post('http://localhost:5000/api/freelancer/register', newFreelancer);
  
      if (response.status === 201 || response.status === 200) {
        alert('Account Created!');
        navigate('/signin');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error creating account. Please try again.');
    }
  };
  

  return (
    <div className="signup-body">
      <div className="signup-container">
        <button className="back-btn" onClick={() => navigate('/studentgraduate')}>
          <FaArrowLeft />
        </button>

        <h2>Create your Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="left-fields">
            <div>
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                required
              />
            </div>
          </div>

          <div className="student-divider"></div>

          <div className="right-fields">
            <div>
              <label>Major</label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="custom-major-dropdown"
                required
              >
                <option value="">Select Major</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Accounting">Accounting</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label>Contact Number</label>
              <input
  type="tel"
  name="contactNumber"
  value={formData.contactNumber}
  onChange={handleChange}
  pattern="\d{8}"
  minLength="8"
  maxLength="8"
  title="Phone number must be exactly 8 digits"
  required
/>

            </div>

            <div className="expertise-wrapper">
              <label>Choose Your Expertise</label>
              <div
                className="expertise-dropdown"
                onClick={() => setShowExpertiseDropdown(!showExpertiseDropdown)}
              >
                {formData.expertise.join(', ') || 'Select Expertise'}
              </div>
              {showExpertiseDropdown && (
                <div className="expertise-list">
                  {expertiseOptions.map((option, index) => (
                    <label key={index} className="expertise-option">
                      <input
                        type="checkbox"
                        checked={formData.expertise.includes(option)}
                        onChange={() => handleExpertiseChange(option)}
                      />
                      {option}
                    </label>
                  ))}
                  <button
                    type="button"
                    className="ok-btn"
                    onClick={() => setShowExpertiseDropdown(false)}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="create-btn">Create</button>
          </div>
        </form>

        <p className="signin-link">
          I have an account?{' '}
          <span onClick={() => navigate('/signin')}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
