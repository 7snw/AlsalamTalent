// src/pages/ClientDashboard.js
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';


const ClientDashboard = () => {
  return (
    <div>
      <h2>Client Dashboard</h2>
      <nav>
        <ul>
          <li><Link to="view-projects">View Projects</Link></li>
          <li><Link to="manage-requests">Manage Requests</Link></li>
        </ul>
      </nav>


    </div>
  );
};

export default ClientDashboard;
