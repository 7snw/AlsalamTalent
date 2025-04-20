// src/Pages/Admin/AuditLogs.js
import React from 'react';
import '../../Style/Admin/AuditLogs.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';

const logs = [
  { id: 1, user: 'Admin', action: 'Deleted user Maryam Yusuf', timestamp: '2025-04-20 10:12 AM' },
  { id: 2, user: 'Admin', action: 'Updated project status', timestamp: '2025-04-19 3:47 PM' },
  { id: 3, user: 'Client', action: 'Reviewed freelancer profile', timestamp: '2025-04-18 11:30 AM' },
  { id: 4, user: 'freelancer', action: 'Created new project entry', timestamp: '2025-04-18 9:00 AM' },
  { id: 5, user: 'Admin', action: 'Deleted user Maryam Yusuf', timestamp: '2025-04-20 10:12 AM' },
  { id: 6, user: 'freelancer', action: 'Updated project status', timestamp: '2025-04-19 3:47 PM' },
  { id: 7, user: 'client', action: 'Reviewed freelancer profile', timestamp: '2025-04-18 11:30 AM' },
  { id: 8, user: 'Admin', action: 'Created new project entry', timestamp: '2025-04-18 9:00 AM' }
];

const AuditLogs = () => {
  return (
    <div className="auditlogs-page">
      <Navbar links={NavConfig4} />
      <div className="auditlogs-container">
        <h2 className="auditlogs-title">Audit Logs</h2>
        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.user}</td>
                  <td>{log.action}</td>
                  <td>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
