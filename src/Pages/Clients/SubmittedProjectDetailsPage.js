import React, { useState, useEffect } from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import '../../Style/Clients/SubmittedProjectDetailsPage.css';
import '../../Style/CircularProgress.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';


const SubmittedProjectDetailsPage = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assignments/${id}`);
        setAssignment(res.data);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleAction = async (actionType) => {
    if (!assignment) return;
  
    try {
      const statusUpdate =
        actionType === 'approve'
          ? 'Completed'
          : actionType === 'revise'
          ? 'Assigned' // <- revision is treated as assigned
          : 'Rejected';
  
      await axios.put(
        `http://localhost:5000/api/assignments/${assignment._id}/update-status`,
        {
          status: statusUpdate,
          rating,
          feedback,
        }
        
      );
  
      alert('Action submitted successfully');
      setSubmitted(true);
      navigate(-1);
    } catch (err) {
      console.error('Error submitting action:', err);
      alert('Something went wrong');
    }
  };
  
  if (loading) return <p>Loading project...</p>;
  if (!assignment || !assignment.projectId) return <p>Project not found</p>;

  return (
    <div className="submitted-details-page">
      <Navbar links={NavConfig3} />
      <div className="details-container">
        <h2>Submitted Project</h2>

        <div className="submitted-layout">
          <div className="left">
          <h4>Project Files:</h4>
{assignment.projectId.files?.length > 0 ? (
  <div className="client-files">
    {assignment.projectId.files.map((file, idx) => (
      <button
        key={idx}
        className="client-download-btn"
        onClick={() => window.open(file.url, '_blank')}
      >
        {file.name}
      </button>
    ))}
  </div>
) : (
  <p className="submitted-no-files">No project files provided by the client.</p>
)}


            <h4>Freelancer Files:</h4>
            {assignment.docs?.length > 0 ? (
              <div className="submitted-files-list">
                {assignment.docs.map((file, idx) => (
                  <div key={idx} className="submitted-file-item">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="submitted-file-link"
                    >
                      {file.name}
                    </a>
                    <a href={file.url} download className="submitted-download-icon">
                      <FiDownload size={18} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="submitted-no-files">No files submitted by the freelancer.</p>
            )}

            <h4>Review:*</h4>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={rating >= star ? 'filled' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  ★
                </span>
              ))}
            </div>

            <h4>Feedback/Comments:*</h4>
            <textarea
              placeholder="Write a description..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>

            <div className="actions">
              <button disabled={!rating || !feedback || submitted} onClick={() => handleAction('approve')}>
                Approve
              </button>
              <button className="outline" disabled={submitted} onClick={() => handleAction('revise')}>
                Request Revision
              </button>
              <button className="decline" disabled={submitted} onClick={() => handleAction('reject')}>
                Decline
              </button>
            </div>
          </div>

          <div className="right-section">
            <div className="circular-chart">
              <svg viewBox="0 0 36 36" className="circular">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle submitted"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">75%</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubmittedProjectDetailsPage;
