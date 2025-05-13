import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import '../../Style/Notifications.css';
import { NavConfig3 } from "../../Data/NavbarConfigs";
import { showAlert } from '../../utils/toastMessages';


const ClientNotifications = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      const userId = parsed._id;
      const role = (parsed.role || parsed.userType || "").toLowerCase();

      console.log("📤 Requesting notifications for:", userId, role);

      if (userId && role === 'client') {
        axios
          .get(`/api/notifications/${userId}/client`)
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
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <Navbar links={NavConfig3} />
      <div className="notifications-container">
        <h2>Welcome, {user?.fullName}</h2>
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications to show.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((note) => (
              <li key={note._id} className={`notification-item ${note.type}`}>
                <span className="bell-icon">🔔</span>
                <div className="notification-content">
                  <strong>{note.subject}</strong>
                  <p>{note.message}</p>
                  <small className="notification-time">
                    {new Date(note.createdAt).toLocaleString()}
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
