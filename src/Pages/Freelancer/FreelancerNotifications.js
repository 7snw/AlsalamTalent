import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import '../../Style/Notifications.css';
import { NavConfig2 } from "../../Data/NavbarConfigs";

const FreelancerNotifications = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      axios
        .get(`http://localhost:5000/api/notifications/${parsed._id}/${parsed.role}`)
        .then((res) => {
          console.log("🔔 Notifications response:", res.data);
          setNotifications(res.data);
        })
        .catch((err) => console.error("❌ Error fetching notifications:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <Navbar links={NavConfig2} />
      <div className="notifications-container">
        <h2>Welcome, {user?.fullName}</h2>
        {notifications.length === 0 ? (
          <>
            <p className="no-notifications">No notifications to show.</p>
            <pre className="debug-output">{JSON.stringify(notifications, null, 2)}</pre>
          </>
        ) : (
          <>
            <ul className="notification-list">
              {notifications.map((note) => (
                <li key={note._id} className={`notification-item ${note.type}`}>
                  <span className="bell-icon">🔔</span>
                  <div className="notification-content">
                    <p className="notification-subject"><strong>{note.subject || 'No subject'}</strong></p>
                    <p>{note.message || 'No message'}</p>
                    <small className="notification-time">
                      {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'No timestamp'}
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

export default FreelancerNotifications;
