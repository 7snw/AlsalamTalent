import React, { useEffect, useState, useMemo } from "react";
import "../../Style/Admin/AuditLogs.css";
import Navbar from "../../Components/Navbar";
import { NavConfig4 } from "../../Data/NavbarConfigs";
import Footer from "../../Components/Footer";
import axios from "axios";
import { showAlert } from "../../utils/toastMessages";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("latest");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auditlogs")
      .then((res) => setLogs(res.data || []))
      .catch((err) => {
        console.error("Error fetching audit logs:", err);
        showAlert("Failed to load audit logs.");
      })
      .finally(() => setLoading(false));
  }, []);

  const displayed = useMemo(() => {
    const arr = [...logs];
    if (tab === "latest") {
      arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      arr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    return arr;
  }, [logs, tab]);

  if (loading) return null;

  return (
    <div className="auditlogs-page">
      <Navbar links={NavConfig4} />

      <div className="auditlogs-container">
        <div className="audit-header">
          <h2>Audit Logs</h2>
          <div className="segmented">
            <button
              className={`seg-option ${tab === "latest" ? "active" : ""}`}
              onClick={() => setTab("latest")}
            >
              Latest
            </button>
            <button
              className={`seg-option ${tab === "earliest" ? "active" : ""}`}
              onClick={() => setTab("earliest")}
            >
              Earliest
            </button>
          </div>
        </div>

        {displayed.length === 0 ? (
          <p className="no-logs">No logs available.</p>
        ) : (
          <ul className="audit-list">
            {displayed.map((log) => (
              <li key={log._id} className="audit-item">
                <div className="audit-content">
                  <p className="audit-subject">
                    <strong>{log.userName || "Unknown User"}</strong> ({log.role || "—"})
                  </p>
                  <p>{log.action}: {log.details}</p>
                  <small className="audit-time">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "—"}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AuditLogs;
