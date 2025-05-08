// src/Pages/Clients/AnalyticsClient.js

import React, { useEffect, useState } from 'react';
import '../../Style/Clients/AnalyticsClient.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';

const AnalyticsClient = () => {
  const [analytics, setAnalytics] = useState({
    projectCount: 0,
    freelancerCount: 0,
    activeProjectsCount: 0,
    projectsProgress: []
  });

  const [chartPoints, setChartPoints] = useState('0,140 100,100 200,60 300,80 400,60 500,40');
  const yLines = [0, 50, 100, 150];

  useEffect(() => {
    // Fetch analytics data from backend API
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/client/analytics');
        setAnalytics(response.data);

        // Update chart points from progress data
        const progressData = response.data.projectsProgress || [];
        const progressPoints = progressData.map(p => `${p.month},${p.progress}`);
        setChartPoints(progressPoints.join(' '));
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  const safePercentage = isNaN((analytics.activeProjectsCount / analytics.projectCount) * 100) || !isFinite((analytics.activeProjectsCount / analytics.projectCount) * 100)
    ? 0
    : (analytics.activeProjectsCount / analytics.projectCount) * 100;

  return (
    <div className="analytics-page">
      <Navbar links={NavConfig3} />
      <div className="analytics-container">

        <div className="summary-cards">
          <div className="card1">
            <h4>Number of Projects</h4>
            <div className="big-number">{analytics.projectCount}</div>
          </div>
          <div className="card1">
            <h4>Number of Freelancers</h4>
            <div className="big-number">{analytics.freelancerCount}</div>
          </div>
          <div className="card1">
            <h4>Active Projects</h4>
            <div className="big-number">{analytics.activeProjectsCount}</div>
          </div>
        </div>

        <div className="details-section9">
          <div className="card progress9">
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

          <div className="card performance9">
            <h4>Performance Graph</h4>
            <div className="circular-chart8">
              <svg viewBox="0 0 36 36" className="circular8">
                <path
                  className="circle-bg8"
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <path
                  className="circle8"
                  strokeDasharray={`${safePercentage}, 100`}
                  d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831A15.9155 15.9155 0 1 1 18 2.0845"
                />
                <text x="18" y="20.35" className="percentage8">
                  {safePercentage.toFixed(0)}%
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

export default AnalyticsClient;
