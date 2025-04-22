// src/pages/Freelancer/ViewPortfolioPopup.js
import React from 'react';
import '../../Style/Freelancer/ViewPortfolioPopup.css';

const ViewPortfolioPopup = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2 className="popup-title">Project Details</h2>

        <div className="popup-content">
          <p><strong>Project Image:</strong></p>
          <img src={project.imageUrl || project.image} alt="Project" style={{ width: '100%', borderRadius: '10px' }} />

          <p><strong>Description:</strong></p>
          <p>{project.description || 'No description available.'}</p>

          <p><strong>Category:</strong></p>
          <p>{project.category || 'N/A'}</p>

          {project.fileUrl && (
            <div className="file-section">
              <p><strong>Project File:</strong></p>
              <a href={project.fileUrl} download className="download-btn">⬇ Download File</a>
            </div>
          )}
        </div>

        <div className="popup-actions">
          <button onClick={onClose} className="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewPortfolioPopup;
