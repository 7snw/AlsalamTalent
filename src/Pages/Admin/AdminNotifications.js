import  { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import '../../Style/Notifications.css';
import { NavConfig4 } from "../../Data/NavbarConfigs";
import { showAlert } from '../../utils/toastMessages';


const AdminNotifications = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      axios
        .get(`http://localhost:5000/api/notifications/${parsed._id}/admin`)
        .then((res) => {
          console.log("📥 Admin notifications:", res.data);
          setNotifications(res.data);
        })
        .catch((err) => {
          console.error("❌ Error fetching admin notifications:", err);
          showAlert("Failed to fetch notifications.");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <Navbar links={NavConfig4} />
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
                  <p>{note.message}</p>
                  <small className="notification-time">{new Date(note.createdAt).toLocaleString()}</small>
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

export default AdminNotifications;
