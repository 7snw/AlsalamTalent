import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Style/Clients/ProjectProgress.css";
import "../../Style/CircularProgress.css";
import Navbar from "../../Components/Navbar";
import Footer from '../../Components/Footer';
import { NavConfig3 } from "../../Data/NavbarConfigs";
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';

const ProjectProgress = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/assignments/${id}`);
        setAssignment(response.data);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  const getStatusClass = () => {
    switch (assignment?.status?.toLowerCase()) {
      case 'assigned':
      case 'in progress':
        return 'inprogress';
      case 'submitted':
        return 'submitted';
      case 'completed':
      case 'approved':
        return 'completed';
      default:
        return 'open';
    }
  };

  const progressText = {
    'assigned': 50,
    'in progress': 50,
    'submitted': 75,
    'completed': 100,
    'approved': 100
  }[assignment?.status?.toLowerCase()] ?? 0;

  if (loading) return <p>Loading project...</p>;
  if (!assignment || !assignment.projectId) return <p>Project not found</p>;

  const project = assignment.projectId;

  return (
    <div className="project-progress-page">
      <Navbar links={NavConfig3} />
      <div className="progress-container">
          <h2>{assignment.projectId?.title || 'Submitted Project'}</h2>
        <div className="top-section">
          <div className="left-section">
            <h4>Project Files (from Client)</h4>
            {project.files?.length > 0 ? (
              <ul className="attached-files-list9">
                {project.files.map((file, idx) => (
                  <li key={idx} className="attached-file-item9">
                    {file.name}
                    <button
                      type="button"
                      className="download-file-btn9"
                      onClick={() => window.location.href = file.url}
                    >
                      <FiDownload size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files uploaded by client.</p>
            )}

            <h4>Freelancer Submitted Files:</h4>
            {assignment.docs?.length > 0 ? (
              <ul className="attached-files-list9">
                {assignment.docs.map((file, idx) => (
                  <li key={idx} className="attached-file-item9">
                    {file.name}
                    <button
                      type="button"
                      className="download-file-btn9"
                      onClick={() => window.location.href = file.url}
                    >
                      <FiDownload size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files submitted by the freelancer.</p>
            )}
          </div>

          <div className="right-section">
            <div className="circular-chart">
              <svg viewBox="0 0 36 36" className="circular">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={`circle ${getStatusClass()}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="percentage">{progressText}%</text>
              </svg>
            </div>
          </div>
        </div>

        <hr />

        <div className="details-section">
          <div className="details-left">
            <h2>Project Details</h2>
            <h3>{project.title}</h3>
            <h4>Project Brief:</h4>
            <p>{project.brief || project.description}</p>
            <h4>Budget:</h4>
            <p>{project.budget} BHD</p>
            <h4>Status:</h4>
            <p>{assignment.status}</p>
          </div>
          <div className="details-right">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="project-image" />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>

        <button onClick={() => setShowChat(true)} className="open-chat-btn">
          <FiMessageCircle />
        </button>

        {showChat && (
  <ChatBox
    userId={clientId}
    otherUserId={freelancerId}
    role="Client"
    assignmentId={assignment._id}  // ✅ Add this
    closeChat={() => setShowChat(false)}
  />
)}

      </div>
      <Footer />
    </div>
  );
};

export default ProjectProgress;