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

  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
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

    // Convert CPR file to base64 (you can replace this with file upload logic)
    const toBase64 = file =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

    try {
      const cprImageBase64 = await toBase64(formData.cpr);

      const graduate = {
        userType: 'graduate',
        studentId: formData.studentId,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        major: formData.major,
        phone: formData.contactNumber,
        expertise: formData.expertise,
        cprImageUrl: cprImageBase64 // this is optional, replace with upload URL if needed
      };

      const response = await axios.post('http://localhost:5000/api/freelancer/register', graduate);

      if (response.status === 201 || response.status === 200) {
        alert('Graduate account created successfully!');
        navigate('/signin');
      }
    } catch (error) {
      console.error('Graduate registration failed:', error);
      alert(error.response?.data?.message || 'Failed to create account.');
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
                required
              />
            </div>

         
            <div className="expertiseer0">
  <p>Expertise</p>
  <div
    className="expertise-display0"
    onClick={() => setShowExpertiseDropdown(!showExpertiseDropdown)}
  >
    {formData.expertise?.length ? formData.expertise.join(', ') : 'Select Expertise'}
  </div>

  {showExpertiseDropdown && (
  <>
    <div className="expertise-dropdown-list0">
  {expertiseOptions.map((option, index) => (
    <label key={index} className="expertise-checkbox-item0">
      <input
        type="checkbox"
        checked={formData.expertise?.includes(option)}
        onChange={() => handleExpertiseChange(option)}
      />
      <span>{option}</span>
    </label>
  ))}

  <div className="expertise-dropdown-actions0">
    <button
      type="button"
      className="close-expertise-dropdown0"
      onClick={() => setShowExpertiseDropdown(false)}
    >
      Done
    </button>
    <button
      type="button"
      className="clear-expertise-dropdown0"
      onClick={() => setFormData(prev => ({ ...prev, expertise: [] }))}
    >
      Clear
    </button>
  </div>
</div>
  </>
)}

</div>

            <div className="graduate-file-upload-wrapper">
              <label htmlFor="cpr-upload" className="graduate-file-upload-label">
                Upload CPR <span className="graduate-upload-icon"></span>
              </label>
              <input
                id="cpr-upload"
                type="file"
                name="cpr"
                accept="image/*"
                onChange={handleChange}
                required
                className="graduate-file-upload-input"
              />
            </div>

            <button type="submit" className="graduate-create-btn">Create</button>
          </div>
        </form>

        <p className="graduate-signin-link">I have an account? <span onClick={() => navigate('/signin')}>Sign In</span></p>
      </div>
    </div>
  );
};

export default GraduateSignUp;
