// src/pages/AdminDashboard.js
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';


const AdminDashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <nav>
        <ul>
          <li><Link to="manage-freelancers">Manage Freelancers</Link></li>
          <li><Link to="manage-clients">Manage Clients</Link></li>
        </ul>
      </nav>

    </div>
  );
};

export default AdminDashboard;
