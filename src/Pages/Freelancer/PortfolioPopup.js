import React, { useState } from 'react';
import '../../Style/Freelancer/PortfolioPopup.css';

const PortfolioPopup = ({ onClose, onSubmit }) => {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    onSubmit({ image, file, description, projectType });
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-content">
          <h2 className="view-title">Add Project Details</h2>

          <label classname="upload0">Upload Project Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />

          <label classname="upload0" >Upload Project File:</label>
          <input type="file" onChange={handleFileChange} />

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
