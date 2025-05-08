import React, { useEffect, useState } from "react";
import "../../Style/Admin/AuditLogs.css";
import Navbar from "../../Components/Navbar";
import { NavConfig4 } from "../../Data/NavbarConfigs";
import Footer from "../../Components/Footer";
import axios from "axios";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auditlogs");
        setLogs(response.data);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        alert("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="auditlogs-page">
      <Navbar links={NavConfig4} />
      <div className="auditlogs-container">
        <h2 className="auditlogs-title">Audit Logs</h2>

        {loading ? (
          <p>Loading logs...</p>
        ) : logs.length === 0 ? (
          <p>No logs available.</p>
        ) : (
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
                    <td>{log.userName}</td>
                    <td>{log.role}</td>
                    <td>{log.action}</td>
                    <td>{log.details}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AuditLogs;
