// src/Pages/Freelancer/PortfolioPopup.js

import React, { useState } from 'react';
import '../../Style/Freelancer/PortfolioPopup.css';

const PortfolioPopup = ({ onClose, onSubmit }) => {
  // State for the form fields
  const [image, setImage] = useState(null);         // File object for the project image
  const [title, setTitle] = useState('');           // Project title
  const [description, setDescription] = useState(''); // Project description
  const [projectType, setProjectType] = useState(''); // Selected category

  // Handle image file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);  // Save file object to state
  };

  // Handle form submission
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('projectType', projectType);
    formData.append('image', image); // Attach image file

    onSubmit(formData);  // Send form data back to parent (MyProfile.js)
    onClose();           // Close popup after submission
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-content">
          <h2 className="view-title">Add Project Details</h2>

          {/* Project Title */}
          <label>Project Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Image Upload */}
          <label>Upload Project Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* Project Description */}
          <label>Add Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief about this project"
          />

          {/* Project Category */}
          <label>Project Category:</label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Illustration">Illustration</option>
            <option value="Branding">Branding</option>
            <option value="Video Editing">Content Creation</option>
            <option value="UI/UX Design">UI/UX Design</option>
          </select>

          {/* Form Action Buttons */}
          <div className="popup-buttons">
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPopup;
