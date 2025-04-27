// src/Pages/Clients/PostProject.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/Clients/PostProject.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import uploadIcon from '../../Assets/Upload.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

const PostProject = () => {
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [projectFiles, setProjectFiles] = useState(null);
  const [contractDocs, setContractDocs] = useState(null);
  const [projectImage, setProjectImage] = useState(null);

  const projectFileInput = useRef();
  const contractDocInput = useRef();
  const projectImageInput = useRef();
  const navigate = useNavigate();

  const handleProjectFilesChange = (e) => {
    setProjectFiles(e.target.files[0]);
  };

  const handleContractDocsChange = (e) => {
    setContractDocs(e.target.files[0]);
  };

  const handleProjectImageChange = (e) => {
    setProjectImage(e.target.files[0]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const authorId = localStorage.getItem('userId');
    if (!authorId) {
      alert('You must be logged in to post a project.');
      return;
    }
  
    const formData = new FormData();
    formData.append('title', projectTitle);
    formData.append('brief', description);
    formData.append('budget', budget);
    formData.append('category', category);
    formData.append('authorId', authorId);
    formData.append('status', status);
    formData.append('durationFrom', startDate);
    formData.append('durationTo', endDate);
  
    if (projectImage) {
      formData.append('projectImage', projectImage);
    }
  
    if (projectFiles) {
      formData.append('projectFile', projectFiles);
    }
  
    if (contractDocs) {
      formData.append('contractDoc', contractDocs);
    }
  
    try {
      await axios.post('http://localhost:5000/api/projects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Project successfully posted!');
      navigate('/clientprojects');
    } catch (error) {
      console.error('Error posting project:', error.response?.data || error.message);
      alert('Failed to post project.');
    }
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

          <label>Project Category*</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="Marketing">Marketing</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Illustration">Illustration</option>
            <option value="Product Design">Product Design</option>
            <option value="Web Design">Web Design</option>
          </select>

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

          <label>Project Status*</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Select status</option>
            <option value="Open">Open</option>
<option value="In Progress">In Progress</option>
<option value="Completed">Completed</option>
<option value="Cancelled">Cancelled</option>

            
          </select>

          
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
            {projectFiles && <p className="post-project-filename">{projectFiles.name}</p>}
          </div>

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
            {contractDocs && <p className="post-project-filename">{contractDocs.name}</p>}
          </div>

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
            {projectImage && <p className="post-project-filename">{projectImage.name}</p>}
          </div>

          <div className="post-project-actions">
            <button type="submit" className="post-project-button post">Post</button>
            <button type="button" className="post-project-button cancel">Cancel</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PostProject;
