import React, { useState } from 'react';
import '../../Style/Freelancer/SubmitProject.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import uploadIcon from '../../Assets/Upload.png';

const SubmitProject = () => {
  const [projectFile, setProjectFile] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [progress, setProgress] = useState(66.6);

  const handleProjectFileChange = (e) => {
    setProjectFile(e.target.files[0]?.name);
  };

  const handleContractFileChange = (e) => {
    setContractFile(e.target.files[0]?.name);
  };

  return (
    <div className="submit-page">
      <Navbar links={NavConfig2} />
      <div className="overlay-background">
        <div className="submit-container">
          <div className="left-panel">
            <h1 className="page-title">Submit Project / Progress</h1>

            <form className="submit-form">
              <div className="submit-form-group">
                <label className="submit-label">Project Files:</label>
                <label className="submit-file-label">
                  Attach Files
                  <img src={uploadIcon} alt="upload" className="submit-upload-icon" />
                  <input
                    type="file"
                    onChange={handleProjectFileChange}
                    className="submit-file-input"
                  />
                </label>
                {projectFile && <p className="submit-filename">{projectFile}</p>}
              </div>

              <div className="submit-form-group">
                <label className="submit-label">Contract Documents:</label>
                <label className="submit-file-label">
                  Attach Docs
                  <img src={uploadIcon} alt="upload" className="submit-upload-icon" />
                  <input
                    type="file"
                    onChange={handleContractFileChange}
                    className="submit-file-input"
                  />
                </label>
                {contractFile && <p className="submit-filename">{contractFile}</p>}
              </div>

              <div className="submit-form-group">
                <label className="submit-label">Progress Percentage:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                />
                <p>{progress}%</p>
              </div>

              <button type="submit" className="submit-project-btn">
                Submit
              </button>
            </form>
          </div>

          <div className="right-section2">
            <div className="circular-chart2">
              <svg viewBox="0 0 36 36" className="circular2">
                <path
                  className="circle-bg2"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <path
                  className="circle2"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <text x="18" y="20.35" className="percentage2">
                  {progress}%
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitProject;
