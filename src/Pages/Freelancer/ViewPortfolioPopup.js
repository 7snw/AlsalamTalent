import React from 'react';
import '../../Style/Freelancer/ViewPortfolioPopup.css';

// Component to show portfolio project details in a popup/modal
const ViewPortfolioPopup = ({ project, onClose }) => {
  // If no project data is passed, return nothing
  if (!project) return null;

  return (
    <div className="popup-overlay0"> 
      <div className="popup-box0"> {/* Modal box container */}
        <h2 className="popup-title0">Project Details</h2>

        <div className="popup-content0">
          {/* Project image */}
          <p><strong>Project Image:</strong></p>

          {/* Make image clickable to open in a new tab */}
          <a href={project.imageUrl || project.image} target="_blank" rel="noopener noreferrer">
            <img
              src={project.imageUrl || project.image}
              alt="Project"
              style={{ width: '100%', borderRadius: '10px', cursor: 'pointer' }}
            />
          </a>

          {/* Description section */}
          <p><strong>Description:</strong></p>
          <p>{project.description || 'No description available.'}</p>

          <br />

          {/* Category */}
          <p><strong>Category:</strong></p>
          <p>{project.category || 'N/A'}</p>

          {/* File download section (if exists) */}
          {project.fileUrl && (
            <div className="file-section0">
              <p><strong>Project File:</strong></p>
              <a href={project.fileUrl} download className="download-btn0">⬇ Download File</a>
            </div>
          )}
        </div>

        <div className="popup-actions0">
          <button onClick={onClose} className="cancel-btn0">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewPortfolioPopup;
