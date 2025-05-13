// src/Pages/Freelancer/MyProjectsDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../Style/Freelancer/MyProjectsDetails.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import uploadIcon from '../../Assets/Upload.png';
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';
import ChatBox from '../../Components/ChatBox';
import { showAlert } from '../../utils/toastMessages';


const MyProjectsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assignments/${id}`);
        setAssignment(res.data);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      }
    };
    fetchAssignment();
  }, [id]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveSubmittedFile = async (fileIndex) => {
    try {
      const updatedDocs = [...assignment.docs];
      updatedDocs.splice(fileIndex, 1);

      await axios.put(`http://localhost:5000/api/assignments/${id}/update-docs`, {
        docs: updatedDocs,
      });

      setAssignment((prev) => ({
        ...prev,
        docs: updatedDocs,
      }));
    } catch (error) {
      console.error('Failed to remove file:', error);
      showAlert('Could not remove the file.');
    }
  };

  const handleSubmitProject = async () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('docs', file));

    try {
      await axios.post(`http://localhost:5000/api/assignments/${id}/update-docs`, formData);
      await axios.put(`http://localhost:5000/api/assignments/${id}/update-status`, {
        status: 'Submitted',
      });
      showAlert('Project submitted successfully.');
      setSelectedFiles([]);
      navigate('/myprojects');
    } catch (error) {
      console.error('Submission failed:', error);
      showAlert('Submission failed');
    }
  };

  if (!assignment) return <p>Loading...</p>;

  const { projectId, status, feedback, docs, rating } = assignment;



  return (
    <div className="project-progress-page">
      <Navbar links={NavConfig2} />
      <div className="progress-container">
        <h2>{projectId?.title || 'Project Details'}</h2>

       {(status === 'Declined' || status === 'Re-submit' || status === 'Completed') && (

          <div className="feedback-box">
            <h3>Client Feedback:</h3>
            <p>{feedback || 'No feedback provided.'}</p>
            
              <div className="starss">
                <strong>Rating:</strong>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={rating >= star ? 'filled' : ''}
                  >
                    ★
                  </span>
                ))}
              </div>
          
          </div>
        )}

        <div className="top-section">
          <div className="left-section">
            <h4>Project Files (from Client)</h4>
            {projectId?.files?.length > 0 ? (
              <ul className="attached-files-list9">
                {projectId.files.map((file, idx) => (
                  <li key={idx} className="attached-file-item9">
                    {file.name}
                    <button
                      type="button"
                      className="download-file-btn9"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <FiDownload size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files uploaded by client.</p>
            )}

            <h4>Your Submissions:</h4>
            {docs?.length > 0 ? (
              <ul className="attached-files-list9">
                {docs.map((file, idx) => (
                  <li key={idx} className="attached-file-item9">
                    {file.name}
                    <div className="file-actions">
                      <button
                        type="button"
                        className="download-file-btn9"
                        onClick={() => {
                          window.location.href = file.url;
                        }}
                      >
                        <FiDownload size={18} />
                      </button>
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={() => handleRemoveSubmittedFile(idx)}
                      >
                        <AiOutlineClose size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven’t submitted any files yet.</p>
            )}

            <div className="upload-section">
              <h4>Project Files:</h4>
              <button
                type="button"
                className="submit-file-btn9"
                onClick={() => document.getElementById('fileInputCustom').click()}
              >
                {selectedFiles.length
                  ? `${selectedFiles.length} Files Selected`
                  : 'Attach Files'}
                <img src={uploadIcon} alt="upload" className="submit-upload-icon" />
              </button>
              <input
                id="fileInputCustom"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {selectedFiles.length > 0 && (
                <ul className="attached-files-list9">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="attached-file-item9">
                      {file.name}
                      <button
                        type="button"
                        className="remove-file-btn9"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <AiOutlineClose size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="submit-section">
              <h3>Ready to {status === 'Declined' || status === 'Re-submit' ? 'resubmit' : 'submit'}?</h3>
              <button className="submit-btn" onClick={handleSubmitProject}>
                {status === 'Declined' || status === 'Re-submit' ? 'Re-submit Project' : 'Submit Project'}
              </button>
            </div>

            <button onClick={() => setShowChat(true)} className="open-chat-btn">
              <FiMessageCircle />
            </button>

            {showChat &&(
              <ChatBox
                userId={freelancerId}
                otherUserId={clientId}
                role="Freelancer"
                assignmentId={assignment._id}  // ✅ Add this
                closeChat={() => setShowChat(false)}
              />
            )}
          </div>
        </div>

        <hr />

        <div className="details-section">
          <div className="details-left">
            <h2>Project Details</h2>
            <h3>{projectId?.title}</h3>

            <h4>Project Brief:</h4>
            <p>{projectId?.brief || 'No brief provided.'}</p>

            <h4>Budget/Price:</h4>
            <p>{projectId?.budget} BHD</p>

            <h4>Status:</h4>
            <p>{status}</p>
          </div>

          <div className="details-right">
            {projectId?.imageUrl ? (
              <img src={projectId.imageUrl} alt={projectId.title} className="project-image" />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyProjectsDetails;