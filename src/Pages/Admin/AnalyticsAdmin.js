// src/Pages/Clients/Analyticslient.js
import React from 'react';
import '../../Style/Admin/AnalyticsClient.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';

const AnalyticsAdmin = () => {
  return (
    <div className="analytics-page">
      <Navbar links={NavConfig4} />
      <div className="analytics-container">
        <h2>Analytics</h2>

        <div className="summary-cards">
          <div className="card">
            <h4>Number of Projects</h4>
            <div className="big-number">9</div>
          </div>
          <div className="card">
            <h4>Number of Freelancers</h4>
            <div className="big-number">2</div>
          </div>
          <div className="card">
            <h4>Active Projects</h4>
            <div className="big-number">1</div>
          </div>
        </div>

        <div className="details-section">
          <div className="card progress">
            <h4>Projects Progress</h4>
            <p className="title">Promotional Video - Eid Offers.</p>
            <div className="stars">★★★★☆</div>
            <p className="freelancer">Hasan Mohamed</p>
            <div className="progress-bar">
              <div className="fill" style={{ width: '75%' }}>75%</div>
            </div>
          </div>

          <div className="card performance">
            <h4>Performance Graph</h4>
            <div className="circle">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="50" stroke="#f0f0f0" strokeWidth="10" fill="none" />
                <circle cx="60" cy="60" r="50" stroke="#EE582B" strokeWidth="10" fill="none"
                        strokeDasharray="314" strokeDashoffset="94" />
              </svg>
              <div className="percent">70%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAdmin;
