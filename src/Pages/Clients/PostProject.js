// src/Pages/Clients/PostProject.js
import React, { useState, useRef } from 'react';
import '../../Style/Clients/PostProject.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import uploadIcon from '../../Assets/Upload.png';

const PostProject = () => {
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectFiles, setProjectFiles] = useState(null);
  const [contractDocs, setContractDocs] = useState(null);
  const [projectImage, setProjectImage] = useState(null);

  // Refs for file inputs
  const projectFileInput = useRef();
  const contractDocInput = useRef();
  const projectImageInput = useRef();

  const handleProjectFilesChange = (e) => {
    setProjectFiles(e.target.files[0]?.name);
  };

  const handleContractDocsChange = (e) => {
    setContractDocs(e.target.files[0]?.name);
  };

  const handleProjectImageChange = (e) => {
    setProjectImage(e.target.files[0]?.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      projectTitle,
      description,
      budget,
      startDate,
      endDate,
      projectFiles,
      contractDocs,
      projectImage,
    };
    console.log('Project Posted:', projectData);
    alert('Project successfully posted!');
  };

  return (
    <div className="post-project-page">
      <Navbar links={NavConfig3} />
      <div className="post-project-container">
        <h2>Post Project</h2>
        <form className="post-project-form" onSubmit={handleSubmit}>
          <label>Project Title*</label>
          <input
            type="text"
            placeholder="Write a title..."
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <label>About this project/Description*</label>
          <textarea
            placeholder="Write a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <label>Budget/Price*</label>
          <input
            type="number"
            placeholder="0 BD"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

          <label>Timeframe/Duration*</label>
          <div className="post-project-date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <span className="post-project-to-separator">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {/* Project Files Upload */}
          <div className="post-project-upload-group">
            <label>Project Files*</label>
            <button
              type="button"
              className="post-project-button post-project-submit-btn"
              onClick={() => projectFileInput.current.click()}
            >
              Attach File
              <img src={uploadIcon} alt="upload" className="post-project-upload-icon" />
            </button>
            <input
              type="file"
              ref={projectFileInput}
              onChange={handleProjectFilesChange}
              className="post-project-file-input"
              hidden
            />
            {projectFiles && <p className="post-project-filename">{projectFiles}</p>}
          </div>

          {/* Contract Docs Upload */}
          <div className="post-project-upload-group">
            <label>Contract Documents*</label>
            <button
              type="button"
              className="post-project-button post-project-submit-btn"
              onClick={() => contractDocInput.current.click()}
            >
              Attach Docs
              <img src={uploadIcon} alt="upload" className="post-project-upload-icon" />
            </button>
            <input
              type="file"
              ref={contractDocInput}
              onChange={handleContractDocsChange}
              className="post-project-file-input"
              hidden
            />
            {contractDocs && <p className="post-project-filename">{contractDocs}</p>}
          </div>

          {/* Project Image Upload */}
          <div className="post-project-upload-group">
            <label>Project Image*</label>
            <button
              type="button"
              className="post-project-button post-project-submit-btn"
              onClick={() => projectImageInput.current.click()}
            >
              Attach Image
              <img src={uploadIcon} alt="upload" className="post-project-upload-icon" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={projectImageInput}
              onChange={handleProjectImageChange}
              className="post-project-file-input"
              hidden
            />
            {projectImage && <p className="post-project-filename">{projectImage}</p>}
          </div>

          <div className="post-project-actions">
            <button type="submit" className="post-project-button post">Post</button>
            <button type="button" className="post-project-button cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProject;
