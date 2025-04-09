// src/pages/FreelancerDashboard.js
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';


const FreelancerDashboard = () => {
  return (
    <div>
      <h2>Freelancer Dashboard</h2>
      <nav>
        <ul>
          <li><Link to="profile">Profile</Link></li>
          <li><Link to="job-listings">Job Listings</Link></li>
        </ul>
      </nav>
      

    </div>
  );
};

export default FreelancerDashboard;
