import { useEffect } from "react";
import axios from "axios";
import { showAlert } from "../utils/toastMessages";


export function useSessionWatcher() {
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return; 

    const interval = setInterval(async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE || process.env.REACT_APP_API_BASE}/api/session/status`, {
  withCredentials: true,
});

      } catch (err) {
       
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
