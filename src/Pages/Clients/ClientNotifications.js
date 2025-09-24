import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import "../../Style/Notifications.css";
import { NavConfig3 } from "../../Data/NavbarConfigs";

// Reuse the same icon set & color mapping used on the freelancer page
import AssignedIcon from "../../Assets/assigned.png";
import SubmittedIcon from "../../Assets/submitted.png";
import AvailableIcon from "../../Assets/available.png";
import WelcomeIcon from "../../Assets/welcome.png";
import PaymentIcon from "../../Assets/payment.png";
import Booking from "../../Assets/booking.png";

const TYPE_META = {
  assigned:  { color: "#f16238", bg: "#f16238", icon: AssignedIcon },
  submitted: { color: "#3d76ae", bg: "#3d76ae", icon: SubmittedIcon },
  available: { color: "#f89d33", bg: "#f89d33", icon: AvailableIcon },
  welcome:   { color: "#9dcbd8", bg: "#9dcbd8", icon: WelcomeIcon },
  payment:   { color: "#06142f", bg: "#06142f", icon: PaymentIcon },
  booking:   { color: "#deaa87", bg: "#deaa87", icon: Booking },
  default:   { color: "#9dcbd8", bg: "#9dcbd8", icon: WelcomeIcon },
};

// Heuristic type inference (same as freelancer page)
const inferType = (t = "", s = "", m = "") => {
  const text = `${t} ${s} ${m}`.toLowerCase();
  if (text.includes("assigned")) return "assigned";
  if (text.includes("submitted")) return "submitted";
  if (text.includes("available") || text.includes("new project")) return "available";
  if (text.includes("welcome")) return "welcome";
  if (text.includes("payment") || text.includes("invoice")) return "payment";
  if (text.includes("booking") || text.includes("reservation")) return "booking";
  return "default";
};

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("latest");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return setLoading(false);

    const parsed = JSON.parse(stored);
    const userId = parsed?._id;
    const role = (parsed.role || parsed.userType || "").toLowerCase();

    if (!userId || role !== "client") return setLoading(false);

    axios
      .get(`http://localhost:5000/api/notifications/${userId}/client`)
      .then((res) => setNotifications(res.data || []))
      .catch((err) => {
        console.error("Error fetching client notifications:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Attach meta (icon/colors) just like the freelancer page
  const enriched = useMemo(
    () =>
      notifications.map((n) => {
        const key = inferType(n.type, n.subject, n.message);
        const meta = TYPE_META[key] || TYPE_META.default;
        return { ...n, __meta: meta };
      }),
    [notifications]
  );

  // Same segmented filter (Latest / Earliest)
  const displayed = useMemo(() => {
    const arr = [...enriched];
    if (tab === "latest") {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (tab === "earliest") {
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return arr;
  }, [enriched, tab]);

  if (loading) return null;

  return (
    <div className="notifications-page">
      <Navbar links={NavConfig3} />

      <div className="notifications-container">
        <div className="notif-header">
          <h2>Notifications</h2>
          <div className="segmented" role="tablist" aria-label="Filter notifications">
            <button
              className={`seg-option ${tab === "latest" ? "active" : ""}`}
              onClick={() => setTab("latest")}
              role="tab"
              aria-selected={tab === "latest"}
            >
              Latest
            </button>
            <button
              className={`seg-option ${tab === "earliest" ? "active" : ""}`}
              onClick={() => setTab("earliest")}
              role="tab"
              aria-selected={tab === "earliest"}
            >
              Earliest
            </button>
          </div>
        </div>

        {displayed.length === 0 ? (
          <p className="no-notifications">No notifications to show.</p>
        ) : (
          <ul className="notification-list">
            {displayed.map((note) => (
              <li key={note._id} className="notification-item">
                <div
                  className="notif-icon-wrapper"
                  style={{ backgroundColor: note.__meta.bg }}
                  aria-hidden
                >
                  <img src={note.__meta.icon} alt="" className="notif-icon" />
                </div>

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

export default ClientNotifications;
