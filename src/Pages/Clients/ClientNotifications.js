import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import "../../Style/Notifications.css";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import { showAlert } from "../../utils/toastMessages";

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      const parsed = JSON.parse(stored);
      const userId = parsed._id;
      const role = (parsed.role || parsed.userType || "").toLowerCase();

      console.log("📤 Requesting notifications for:", userId, role);

      if (userId && role === "client") {
        axios
          .get(`http://localhost:5000/api/notifications/${userId}/client`)
          .then((res) => {
            console.log("📥 Notifications response:", res.data);
            setNotifications(res.data);
          })
          .catch((err) => {
            console.error("❌ Full Axios error:", err);
            showAlert("Failed to fetch notifications.");
          })
          .finally(() => setLoading(false));
      } else {
        console.warn("⚠️ Invalid role or missing userId.");
        setLoading(false);
      }
    } else {
      console.warn("⚠️ No user found in localStorage.");
      setLoading(false);
    }
  }, []); // ✅ no setUser dependency warning anymore

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <Navbar links={NavConfig3} />
      <div className="notifications-container">
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <>
            <p className="no-notifications">No notifications to show.</p>
            <pre className="debug-output">
              {JSON.stringify(notifications, null, 2)}
            </pre>
          </>
        ) : (
          <ul className="notification-list">
            {notifications.map((note) => (
              <li key={note._id} className={`notification-item ${note.type}`}>
                <span className="bell-icon">🔔</span>
                <div className="notification-content">
                  <p><strong>{note.subject || "No subject"}</strong></p>
                  <p>{note.message || "No message"}</p>
                  <small className="notification-time">
                    {note.createdAt
                      ? new Date(note.createdAt).toLocaleString()
                      : "No timestamp"}
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

export default ClientNotifications;
