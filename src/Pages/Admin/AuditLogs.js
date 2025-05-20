import React, { useEffect, useState } from "react";
import "../../Style/Admin/AuditLogs.css";
import Navbar from "../../Components/Navbar";
import { NavConfig4 } from "../../Data/NavbarConfigs";
import Footer from "../../Components/Footer";
import axios from "axios";
import { showAlert } from '../../utils/toastMessages';

// Admin AuditLogs component: Displays audit trail of user actions
const AuditLogs = () => {
  const [logs, setLogs] = useState([]);       // Stores audit log entries
  const [loading, setLoading] = useState(true); // Indicates loading state

  // Fetch audit logs from backend when component mounts
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auditlogs");
        setLogs(response.data); // Save logs to state
      } catch (err) {
        console.error("Error fetching audit logs:", err); // Log fetch error
        showAlert("Failed to load audit logs."); // Display alert to user
      } finally {
        setLoading(false); // Stop loading in all cases
      }
    };

    fetchLogs(); // Trigger log fetch
  }, []);

  return (
    <div className="auditlogs-page">
      <Navbar links={NavConfig4} /> {/* Admin navbar */}

      <div className="auditlogs-container">
        <h2 className="auditlogs-title">Audit Logs</h2>

        {/* Conditional rendering for loading, no logs, or logs table */}
        {loading ? (
          <p>Loading logs...</p> // Show while fetching logs
        ) : logs.length === 0 ? (
          <p>No logs available.</p> // Show if no logs returned
        ) : (
          // Display audit logs in table format
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{log.userName}</td> {/* User who triggered action */}
                    <td>{log.role}</td>       {/* Role of user */}
                    <td>{log.action}</td>     {/* Action performed */}
                    <td>{log.details}</td>    {/* Description/details */}
                    <td>{new Date(log.timestamp).toLocaleString()}</td> {/* Timestamp formatted */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer /> {/* Footer */}
    </div>
  );
};

export default AuditLogs;
