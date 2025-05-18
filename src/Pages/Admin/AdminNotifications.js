import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import "../../Style/Notifications.css";
import { NavConfig4 } from "../../Data/NavbarConfigs";
import { showAlert } from "../../utils/toastMessages";
import BellIcon from '../../Assets/Bell3.png';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      const parsed = JSON.parse(stored);

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
        <h2>Notifications</h2>

        {notifications.length === 0 ? (
          <>
            <p className="no-notifications">No notifications to show.</p>
          </>
        ) : (
          <>
            <ul className="notification-list">
              {notifications.map((note) => (
                <li key={note._id} className={`notification-item ${note.type}`}>
                                 <img src={BellIcon} alt="Bell Icon" className="bell-icon1" />
                  <div className="notification-content">
                    <p>
                      <strong>{note.subject || "No subject"}</strong>
                    </p>
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
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminNotifications;
