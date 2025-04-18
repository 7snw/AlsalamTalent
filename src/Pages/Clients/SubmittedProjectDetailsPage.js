// src/Pages/Clients/SubmittedProjectDetailsPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../Style/Clients/SubmittedProjectDetailsPage.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import ProjectsData from '../../Data/ProjectsData';

const SubmittedProjectDetailsPage = () => {
  const { id } = useParams();
  const project = ProjectsData.submitted[parseInt(id)];
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  if (!project) return <p>Project not found</p>;

  return (
    <div className="submitted-details-page">
      <Navbar links={NavConfig3} />
      <div className="details-container">
        <h2>Submitted Projects</h2>
        <div className="submitted-layout">
          <div className="left">
            <h4>Project Files:</h4>
            <button>Download Files</button>
            <h4>Contract Documents:</h4>
            <button>Download Files</button>

            <h4>Review:*</h4>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={rating >= star ? 'filled' : ''}
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
              <button disabled={!rating || !feedback}>Approve</button>
              <button className="outline">Request Revision</button>
            </div>
          </div>

          <div className="right">
            <div className="progress-circle">
              <svg>
                <circle cx="60" cy="60" r="50" />
                <circle cx="60" cy="60" r="50" className="progress" />
              </svg>
              <div className="percent">100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmittedProjectDetailsPage;
