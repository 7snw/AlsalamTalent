// src/Pages/Clients/EditProject.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../Style/Clients/PostProject.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import uploadIcon from '../../Assets/Upload.png';
import ProjectsData from '../../Data/ProjectsData';

const EditProject = () => {
  const { id } = useParams();
  const project = ProjectsData.deitailes[parseInt(id)];

  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectFiles, setProjectFiles] = useState(null);
  const [contractDocs, setContractDocs] = useState(null);
  const [projectImage, setProjectImage] = useState(null);

  const projectFileInput = useRef();
  const contractDocInput = useRef();
  const projectImageInput = useRef();

  useEffect(() => {
    if (project) {
      setProjectTitle(project.projectTitle || project.title || '');
      setDescription(project.description || '');
      setCategory(project.category || '');
      setBudget(project.budget || '');
      setStartDate(project.startDate || '');
      setEndDate(project.endDate || '');
      setProjectFiles(project.projectFiles || null);
      setContractDocs(project.contractDocs || null);
      setProjectImage(project.coverImage || null);
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProject = {
      projectTitle,
      description,
      category,
      budget,
      startDate,
      endDate,
      projectFiles,
      contractDocs,
      projectImage,
    };
    console.log('Updated Project:', updatedProject);
    alert('Project updated successfully!');
  };

  if (!project) return <p>Project not found</p>;

  return (
    <div className="post-project-page">
      <Navbar links={NavConfig3} />
      <div className="post-project-container">
        <h2>Edit Project</h2>
        <form className="post-project-form" onSubmit={handleSubmit}>
          <label>Project Title*</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <label>About this project/Description*</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

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

          <label>Budget/Price*</label>
          <input
            type="number"
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
              onChange={(e) => setProjectFiles(e.target.files[0]?.name)}
              hidden
            />
            {projectFiles && <p className="post-project-filename">{projectFiles}</p>}
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
              onChange={(e) => setContractDocs(e.target.files[0]?.name)}
              hidden
            />
            {contractDocs && <p className="post-project-filename">{contractDocs}</p>}
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
              onChange={(e) => setProjectImage(e.target.files[0]?.name)}
              hidden
            />
            {projectImage && <p className="post-project-filename">{projectImage}</p>}
          </div>

          <div className="post-project-actions">
            <button type="submit" className="post-project-button post">Update</button>
            <button type="button" className="post-project-button cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;