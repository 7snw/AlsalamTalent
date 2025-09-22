import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Style/Clients/ProjectProgress.css";
import Navbar from "../../Components/Navbar";
import Footer from '../../Components/Footer';
import { NavConfig3 } from "../../Data/NavbarConfigs";
import axios from 'axios';
import { FiDownload, FiMessageCircle } from 'react-icons/fi';
import ChatBox from "../../Components/ChatBox";

const ProjectProgress = () => {
  // Get assignment ID from URL
  const { id } = useParams();

  // State to store assignment data
  const [assignment, setAssignment] = useState(null);

  // Show loading indicator while fetching data
  const [loading, setLoading] = useState(true);

  // Toggle chatbox visibility
  const [showChat, setShowChat] = useState(false);

  // Fetch assignment details on mount
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

  // Determine circle color class based on status
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

  // Extract IDs for chat
  const clientId = assignment?.authorId || assignment?.projectId?.authorId;
  const freelancerId = assignment?.freelancerId?._id || assignment?.freelancerId;

  // Match progress percentage to status
  const progressText = {
    'assigned': 50,
    'in progress': 50,
    'submitted': 75,
    'completed': 100,
    'approved': 100
  }[assignment?.status?.toLowerCase()] ?? 0;

  // Handle loading and error states
  if (loading) return <p>Loading project...</p>;
  if (!assignment || !assignment.projectId) return <p>Project not found</p>;

  const project = assignment.projectId;

  return (
    <div className="project-progress-page">
      {/* Top Navbar */}
      <Navbar links={NavConfig3} />

      <div className="progress-container">
        <h2>{assignment.projectId?.title || 'Submitted Project'}</h2>

        {/* Top Section with files and progress circle */}
        <div className="top-section">
          <div className="left-section">
            <h4>Client Files:</h4>
            {project.files?.length > 0 ? (
              <ul className="attached-files-list9">
                {project.files.map((file, idx) => (
                  <li key={idx} className="attached-file-item99">
                    {file.name}
                    <button
                      type="button"
                      className="download-file-btn99"
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

          {/* Circular Progress Indicator */}
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

        {/* Details Section */}
        <div className="details-section">
          <div className="details-left">
            <h2>Project Details</h2>
            <h3>{project.title}</h3>
            <h4>Project Brief:</h4>
            <p>{project.brief || project.description}</p>
            <h4>Reward:</h4>
            <p>{project.budget} BHD</p>
            <h4>Status:</h4>
            <p>{assignment.status}</p>
          </div>

          {/* Project Image */}
          <div className="details-right">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="project-image" />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>

        {/* Open Chat Button */}
        <button onClick={() => setShowChat(true)} className="open-chat-btn">
          <FiMessageCircle />
        </button>

        {/* Chat box component */}
        {showChat && (
          <ChatBox
            userId={clientId}
            otherUserId={freelancerId}
            role="Client"
            assignmentId={assignment._id}
            closeChat={() => setShowChat(false)}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProjectProgress;
