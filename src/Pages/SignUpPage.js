// src/pages/SignUpPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/SignUpPage.css';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    password: '',
    major: '',
    contactNumber: '',
    cpr: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signed up:', formData);
    alert('Account Created!');
  };

  return (
    <div className="signup-body">
      <div className="signup-container">
        <h2>Create your Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="left-fields">
            <div>
              <label>Student ID</label>
              <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} required />
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
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="divider"></div>

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
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
            </div>
            <div>
              <label>CPR Number</label>
              <input type="text" name="cpr" value={formData.cpr} onChange={handleChange} required />
            </div>
            <button type="submit" className="create-btn">Create</button>
          </div>
        </form>

        <p className="signin-link">I have an account? <span onClick={() => navigate('/signin')}>Sign In</span></p>
      </div>
    </div>
  );
};

export default SignUpPage;
