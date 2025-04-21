// src/Pages/Admin/AnalyticsAdmin.js
import React from 'react';
import '../../Style/Admin/AnalyticsAdmin.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';

const AnalyticsAdmin = () => {
  const yLines = [0, 50, 100, 150];
  const chartPoints = '0,140 100,100 200,60 300,80 400,60 500,40';

  return (
    <div className="analytics-page2">
      <Navbar links={NavConfig4} />
      <div className="analytics-container2">
        <h2>Admin Analytics</h2>

        <div className="summary-cards2">
          <div className="card22">
            <h4>Total Clients</h4>
            <div className="big-number2">12</div>
          </div>
          <div className="card22">
            <h4>Total Freelancers</h4>
            <div className="big-number2">24</div>
          </div>
          <div className="card22">
            <h4>Total Projects</h4>
            <div className="big-number2">18</div>
          </div>
        </div>

        <div className="details-section2">
          <div className="card progress2">
            <h4>Projects Progress Overview</h4>
            <div className="custom-chart2">
              <div className="y-labels2">
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
              <div className="x-labels2">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          <div className="card performance2">
            <h4>Performance Overview</h4>
            <div className="circular-chart9">
              <svg viewBox="0 0 36 36" className="circular9">
                <path
                  className="circle-bg9"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <path
                  className="circle9"
                  strokeDasharray="66, 100"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <text x="18" y="20.35" className="percentage9">
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

export default AnalyticsAdmin;
