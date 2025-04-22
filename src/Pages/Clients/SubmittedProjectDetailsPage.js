// src/Pages/Clients/SubmittedProjectDetailsPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../Style/Clients/SubmittedProjectDetailsPage.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import ProjectsData from '../../Data/ProjectsData';
import Footer from '../../Components/Footer';


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
              <button className="decline">Decline</button>
            </div>
          </div>

          <div className="right-section4">
            <div className="circular-chart4">
              <svg viewBox="0 0 36 36" className="circular4">
                <path
                  className="circle-bg4"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <path
                  className="circle4"
                  strokeDasharray="100, 0"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <text x="18" y="20.35" className="percentage4">
                  100%
                </text>
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
