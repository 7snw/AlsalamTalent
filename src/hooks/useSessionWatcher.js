import { useEffect } from "react";
import axios from "axios";
import { showAlert } from "../utils/toastMessages";

/**
 * Session timeout watcher — only runs when user is logged in.
 * Checks server every 30s (or longer in production) for idle timeout.
 */
export function useSessionWatcher() {
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return; // 🚫 Skip watcher if not logged in

    const interval = setInterval(async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE || process.env.REACT_APP_API_BASE}/api/session/status`, {
  withCredentials: true,
});

      } catch (err) {
        // 440 = session timeout from backend
        if (err.response?.status === 440) {
          showAlert("Session expired due to inactivity.");
          localStorage.clear();
          window.location.href = "/landingpage";
        }
      }
    }, 60000); 

    return () => clearInterval(interval);
  }, []);
}
