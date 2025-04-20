// src/Pages/Admin/AnalyticsAdmin.js
import React from 'react';
import '../../Style/Clients/AnalyticsClient.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';

const AnalyticsAdmin = () => {
  const yLines = [0, 50, 100, 150];
  const chartPoints = '0,140 100,100 200,60 300,80 400,60 500,40';

  return (
    <div className="analytics-page">
      <Navbar links={NavConfig4} />
      <div className="analytics-container">
        <h2>Admin Analytics</h2>

        <div className="summary-cards">
          <div className="card">
            <h4>Total Clients</h4>
            <div className="big-number">12</div>
          </div>
          <div className="card">
            <h4>Total Freelancers</h4>
            <div className="big-number">24</div>
          </div>
          <div className="card">
            <h4>Total Projects</h4>
            <div className="big-number">18</div>
          </div>
        </div>

        <div className="details-section">
          <div className="card progress">
            <h4>Projects Progress Overview</h4>
            <div className="custom-chart">
              <div className="y-labels">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
                {yLines.map((y, i) => (
                  <line key={i} x1="0" y1={y + 25} x2="500" y2={y + 25} stroke="#ccc" strokeWidth="1" />
                ))}
                <polyline
                  fill="none"
                  stroke="#1B223C"
                  strokeWidth="3"
                  points={chartPoints}
                />
              </svg>
              <div className="x-labels">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          <div className="card performance">
            <h4>Performance Overview</h4>
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
