// src/Pages/Clients/AnalyticsClient.js
import React from 'react';
import '../../Style/Clients/AnalyticsClient.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';

const AnalyticsClient = () => {
  const yLines = [0, 50, 100, 150];
  const chartPoints = '0,140 100,100 200,60 300,80 400,60 500,40'; // Example data

  return (
    <div className="analytics-page">
      <Navbar links={NavConfig3} />
      <div className="analytics-container">
        <h2>Client Analytics</h2>

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

        <div className="details-section9">
          <div className="card progress">
            <h4>Projects Progress</h4>
            <div className="custom-chart">
              <div className="y-labels">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              <svg width="100%" height="180" viewBox="0 0 500 180" preserveAspectRatio="none">
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
            <h4>Performance Graph</h4>
            <div className="circular-chart8">
              <svg viewBox="0 0 36 36" className="circular8">
                <path
                  className="circle-bg8"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <path
                  className="circle8"
                  strokeDasharray="66, 100"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <text x="18" y="20.35" className="percentage8">
                  70%
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsClient;