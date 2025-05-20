import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import "../../Style/Notifications.css";
import { NavConfig4 } from "../../Data/NavbarConfigs";
import { showAlert } from "../../utils/toastMessages";
import BellIcon from '../../Assets/Bell3.png';

// AdminNotifications page: Displays all notifications specific to admin users
const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]); // Stores list of notifications
  const [loading, setLoading] = useState(true); // Indicates loading state

  useEffect(() => {
    const stored = localStorage.getItem("user"); // Retrieve user data from localStorage

    if (stored) {
      const parsed = JSON.parse(stored); // Parse stored user JSON

      // Fetch notifications for the admin using their ID
      axios
        .get(`http://localhost:5000/api/notifications/${parsed._id}/admin`)
        .then((res) => {
          console.log("Admin notifications:", res.data);
          setNotifications(res.data); // Store the notifications
        })
        .catch((err) => {
          console.error("Error fetching admin notifications:", err);
          showAlert("Failed to fetch notifications."); // Show alert if request fails
        })
        .finally(() => setLoading(false)); // Stop loading regardless of success/failure
    } else {
      setLoading(false); // No user found, stop loading
    }
  }, []);

  // Show loading state while notifications are being fetched
  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <Navbar links={NavConfig4} /> {/* Admin navigation bar */}

      <div className="notifications-container">
        <h2>Notifications</h2>

        {/* If no notifications, show message */}
        {notifications.length === 0 ? (
          <>
            <p className="no-notifications">No notifications to show.</p>
          </>
        ) : (
          <>
            {/* Render each notification as a list item */}
            <ul className="notification-list">
              {notifications.map((note) => (
                <li key={note._id} className={`notification-item ${note.type}`}>
                  {/* Bell icon next to each notification */}
                  <img src={BellIcon} alt="Bell Icon" className="bell-icon1" />

                  {/* Notification details */}
                  <div className="notification-content">
                    <p>
                      <strong>{note.subject || "No subject"}</strong>
                    </p>
                    <p>{note.message || "No message"}</p>
                    <small className="notification-time">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleString() // Format timestamp
                        : "No timestamp"}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Footer /> {/* Footer */}
    </div>
  );
};

export default AdminNotifications;
