// src/Pages/Clients/AnalyticsClient.js

import React, { useEffect, useState } from 'react';
import '../../Style/Clients/AnalyticsClient.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const AnalyticsClient = () => {
  const [analytics, setAnalytics] = useState({
    openCount: 0,
    assignedCount: 0,
    completedCount: 0,
    projectsProgress: [],
    allProjects: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/client/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="analytics-page">
      <Navbar links={NavConfig3} />
      <div className="analytics-container">

        {/* TOP CARDS */}
        <div className="summary-cards">
          <div className="card1">
            <h4>Open Projects</h4>
            <div className="big-number">{analytics.openCount}</div>
          </div>
          <div className="card1">
            <h4>Assigned Projects</h4>
            <div className="big-number">{analytics.assignedCount}</div>
          </div>
          <div className="card1">
            <h4>Completed Projects</h4>
            <div className="big-number">{analytics.completedCount}</div>
          </div>
        </div>

        {/* CHART + LIST */}
        <div className="details-section9">

          {/* Left - Recharts Bar Chart */}
          <div className="card progress9">
            <h4>Projects by Month</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.projectsProgress}>
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#1B223C" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right - List of All Projects */}
          <div className="card project-list9">
            <h4>All Projects</h4>
            <div className="project-scroll">
              {analytics.allProjects.length === 0 ? (
                <p>No projects found.</p>
              ) : (
                analytics.allProjects.map((proj, idx) => (
                  <div key={idx} className="project-item">
                    <strong>{proj.title}</strong>
                    <p>Status: {proj.status}</p>
                    <p>Budget: {proj.budget} BD</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsClient;
