// Import necessary modules and components
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import "../../Style/Notifications.css";
import { NavConfig2 } from "../../Data/NavbarConfigs";
import BellIcon from '../../Assets/Bell3.png';

const FreelancerNotifications = () => {
  // State to store fetched notifications
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch notifications once component mounts
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      const parsed = JSON.parse(stored);
      const userId = parsed._id;
      const role = (parsed.role || parsed.userType || "").toLowerCase();

      // Only proceed if user is freelancer
      if (userId && role === "freelancer") {
        axios
          .get(`http://localhost:5000/api/notifications/${userId}/${role}`)
          .then((res) => {
            console.log(" Notifications response:", res.data);
            setNotifications(res.data);
          })
          .catch((err) =>
            console.error("❌ Error fetching notifications:", err)
          )
          .finally(() => setLoading(false));
      } else {
        setLoading(false); // Not a freelancer
      }
    } else {
      setLoading(false); // No user stored
    }
  }, []);

  if (loading) return <div>Loading notifications...</div>; // Loading state

  return (
    <div className="notifications-page">
      <Navbar links={NavConfig2} />

      <div className="notifications-container">
        <h2>Notifications</h2>

        {/* Show message if no notifications */}
        {notifications.length === 0 ? (
          <>
            <p className="no-notifications">No notifications to show.</p>
          </>
        ) : (
          // Render notifications
          <ul className="notification-list">
            {notifications.map((note) => (
              <li key={note._id} className={`notification-item ${note.type}`}>
                <img src={BellIcon} alt="Bell Icon" className="bell-icon1" />

                <div className="notification-content">
                  <p className="notification-subject">
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FreelancerNotifications;
