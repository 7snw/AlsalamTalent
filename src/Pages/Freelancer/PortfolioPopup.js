import React, { useState } from 'react';
import '../../Style/Freelancer/PortfolioPopup.css';

const PortfolioPopup = ({ onClose, onSubmit }) => {
  const [image, setImage] = useState(null);  // Now handling the file as an object
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);  // Store the selected image file
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('projectType', projectType);
    formData.append('image', image);  // Send the image file
  
    onSubmit(formData);  // Pass the FormData to the parent component (MyProfile)
    onClose();  // Close the popup
  };
  
  
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-content">
          <h2 className="view-title">Add Project Details</h2>

          <label>Project Title:</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <label>Upload Project Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <label>Add Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief about this project"
          />

          <label>Project Category:</label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Illustration">Illustration</option>
            <option value="Branding">Branding</option>
            <option value="Video Editing">Video Editing</option>
            <option value="UI/UX Design">UI/UX Design</option>
          </select>

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
