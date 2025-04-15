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
          <h1 className="page-title">Submit Project</h1>

          <form className="submit-form">
            {/* Project Files Upload */}
            <div className="submit-form-group">
              <label className="submit-label">
                Project Files:
               
              </label>
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

            {/* Contract Documents Upload */}
            <div className="submit-form-group">
              <label className="submit-label">
                Contract Documents:

              </label>
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

            <button type="submit" className="submit-btn">
              Submit Project
            </button>
          </form>
        </div>

        <div className="right-panel">
          <div className="percentage-box">100%</div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SubmitProject;
