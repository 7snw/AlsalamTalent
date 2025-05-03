import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import '../../Style/Freelancer/MyProjectsDetails.css';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import axios from 'axios';
import { FiDownload, FiTrash2, FiPaperclip } from 'react-icons/fi'; // 📎 + Download + Trash

const MyProjectsDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const imageInputRef = useRef();

  const [project, setProject] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newProjectImage, setNewProjectImage] = useState(null);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const freelancerId = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:5000/api/freelancer/${freelancerId}/my-projects`);
        const projects = response.data;
        const selectedProject = projects.find((proj) => proj._id === projectId);

        if (!selectedProject) {
          alert('Project not found!');
          navigate('/myprojects');
        } else {
          setProject(selectedProject);
          setNewTitle(selectedProject.projectTitle);
          setNewStatus(selectedProject.projectStatus);
          setNewFiles(selectedProject.projectFiles || []);
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    setNewProjectImage(e.target.files[0]);
  };

  const handleSaveChanges = async () => {
    try {
      const freelancerId = localStorage.getItem('userId');
      const formData = new FormData();

      formData.append('projectTitle', newTitle);
      formData.append('projectStatus', newStatus);

      if (newProjectImage) {
        formData.append('projectImage', newProjectImage);
      }

      newFiles.forEach(file => {
        if (typeof file === 'string') {
          formData.append('existingFiles', file); // existing
        } else {
          formData.append('projectFiles', file); // new uploads
        }
      });

      await axios.put(`http://localhost:5000/api/freelancer/${freelancerId}/update-project/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Project updated successfully!');
      navigate('/myprojects');
    } catch (error) {
      console.error('Error saving project changes:', error);
      alert('Failed to save changes.');
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="project-details-page4">
      <Navbar links={NavConfig2} />

      <div className="details-container4">

      <h1 className="page-title">My Project Details</h1>
        <div className="submit-form-group4">
          <label className="submit-label44">Project Title:</label>
          <input
            type="text"
            className="submit-input-title44"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter your project title"
            required
          />
        </div>

        {/* Project Status */}
        <div className="submit-form-group4">
          <label className="submit-label4">Project Status:</label>
          <select
            className="submit-input-title4"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            required
          >
            <option value="">Select Status</option>
            <option value="In-progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Project Image */}
        <div className="submit-form-group4">
          <label className="submit-label4">Project Image:</label>
          <div className="project-image44">
            <img src={newProjectImage ? URL.createObjectURL(newProjectImage) : project.projectImage} alt="Project" />
          </div>
          <button type="button" className="submit-file-btn44" onClick={() => imageInputRef.current.click()}>
            Attach Image <FiPaperclip style={{ marginLeft: '8px' }} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageChange}
            hidden
          />
        </div>

        {/* Project Files */}
        <div className="submit-form-group4">
          <label className="submit-Files">Project Files:</label>
          <div className="uploaded-files-list4">
            {newFiles.map((file, index) => (
              <div key={index} className="uploaded-file4">
                {typeof file === 'string' ? (
                  <>
                    <a href={file} target="_blank" rel="noopener noreferrer" className="file-link4">
                      {file.split('/').pop()}
                    </a>
                  </>
                ) : (
                  <span className="file-link4">{file.name}</span>
                )}
                <div className="icons-container4">
                  {typeof file === 'string' && (
                    <a href={file} download className="download-icon4">
                      <FiDownload size={18} />
                    </a>
                  )}
                  <span className="remove-icon4" onClick={() => handleRemoveFile(index)}>
                    <FiTrash2 size={18} />
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="submit-file-btn4"
            onClick={() => fileInputRef.current.click()}
          >
            Attach Files <FiPaperclip style={{ marginLeft: '8px' }} />
          </button>
          <input
            type="file"
            id="projectFilesInput"
            ref={fileInputRef}
            multiple
            hidden
            onChange={handleFileChange}
          />
        </div>

        {/* Save + Back Buttons */}
        <div className="button-container4">
          <button className="back-btn4" onClick={() => navigate('/myprojects')}>Back to My Projects</button>
          <button className="save-btn4" onClick={handleSaveChanges}>Save Changes</button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default MyProjectsDetails;
