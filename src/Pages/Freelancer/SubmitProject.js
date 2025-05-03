import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/Freelancer/SubmitProject.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import uploadIcon from '../../Assets/Upload.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

const SubmitProject = () => {
  const navigate = useNavigate();

  const [projectTitle, setProjectTitle] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [projectFiles, setProjectFiles] = useState([]);
  const [projectImage, setProjectImage] = useState(null);

  const projectFileInput = useRef();
  const projectImageInput = useRef();

  const handleProjectFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setProjectFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setProjectFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleProjectImageChange = (e) => {
    setProjectImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const freelancerId = localStorage.getItem('userId');
      const formData = new FormData();

      formData.append('projectTitle', projectTitle);
      formData.append('projectStatus', projectStatus);
      projectFiles.forEach(file => formData.append('projectFiles', file));
      if (projectImage) formData.append('projectImage', projectImage);

      await axios.post(`http://localhost:5000/api/freelancer/${freelancerId}/add-project`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/myprojects');
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  return (
    <div className="submit-page">
      <Navbar links={NavConfig2} />
      <div className="overlay-background">
        <div className="submit-container">
          <div className="left-panel">
            <h1 className="page-title">Submit Project / Progress</h1>

            <form className="submit-form" onSubmit={handleSubmit}>
              {/* Project Title */}
              <div className="submit-form-group">
                <label className="submit-label">Project Title:</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter your project title"
                  className="submit-input-title"
                  required
                />
              </div>

              {/* Project Status */}
              <div className="submit-form-group">
                <label className="submit-label">Project Status:</label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="submit-input-title9"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="In-progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Project Image */}
              <div className="submit-form-group">
                <label className="submit-label">Project Image:</label>
                <button
                  type="button"
                  className="submit-file-btn9"
                  onClick={() => projectImageInput.current.click()}
                >
                  {projectImage ? "Image Selected" : "Attach Image"}
                  <img src={uploadIcon} alt="upload" className="submit-upload-icon" />
                </button>
                <input
                  type="file"
                  ref={projectImageInput}
                  onChange={handleProjectImageChange}
                  className="submit-file-input"
                  hidden
                  accept="image/*"
                />
              </div>

              {/* Project Files */}
              <div className="submit-form-group">
                <label className="submit-label">Project Files:</label>
                <button
                  type="button"
                  className="submit-file-btn9"
                  onClick={() => projectFileInput.current.click()}
                >
                  {projectFiles.length ? `${projectFiles.length} Files Selected` : "Attach Files"}
                  <img src={uploadIcon} alt="upload" className="submit-upload-icon" />
                </button>
                <input
                  type="file"
                  ref={projectFileInput}
                  onChange={handleProjectFileChange}
                  className="submit-file-input"
                  hidden
                  multiple
                />

           
                {projectFiles.length > 0 && (
                  <ul className="attached-files-list9">
                    {projectFiles.map((file, index) => (
                      <li key={index} className="attached-file-item9">
                        {file.name}
                        <button
                          type="button"
                          className="remove-file-btn9"
                          onClick={() => handleRemoveFile(index)}
                        >
                          ✖
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submit button */}
              <button type="submit" className="submit-project-btn">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubmitProject;
