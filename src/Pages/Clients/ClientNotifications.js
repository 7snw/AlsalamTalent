import React, { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../../Components/Navbar"
import Footer from "../../Components/Footer"
import "../../Style/Notifications.css"
import { NavConfig3 } from "../../Data/NavbarConfigs"
import { showAlert } from "../../utils/toastMessages"
import BellIcon from '../../Assets/Bell3.png'

const ClientNotifications = () => {
  // Holds the list of notifications for the client
  const [notifications, setNotifications] = useState([])

  // Used to show loading state until data is fetched
  const [loading, setLoading] = useState(true)

  // Runs once when component mounts
  useEffect(() => {
    const stored = localStorage.getItem("user")

    if (stored) {
      const parsed = JSON.parse(stored)
      const userId = parsed._id
      const role = (parsed.role || parsed.userType || "").toLowerCase()

      console.log("Requesting notifications for:", userId, role)

      // Ensure we have the right user and role before making request
      if (userId && role === "client") {
        axios
          .get(`http://localhost:5000/api/notifications/${userId}/client`)
          .then((res) => {
            console.log("Notifications response:", res.data)
            setNotifications(res.data)
          })
          .catch((err) => {
            console.error("Full Axios error:", err)
            showAlert("Failed to fetch notifications.")
          })
          .finally(() => setLoading(false))
      } else {
        console.warn("Invalid role or missing userId.")
        setLoading(false)
      }
    } else {
      console.warn("No user found in localStorage.")
      setLoading(false)
    }
  }, [])

  // Display loading message while waiting for data
  if (loading) return <div>Loading notifications...</div>

  return (
    <div className="notifications-page">
      {/* Top navigation bar for clients */}
      <Navbar links={NavConfig3} />

      <div className="notifications-container">
        <h2>Notifications</h2>

        {/* If no notifications, show empty state message */}
        {notifications.length === 0 ? (
          <>
            <p className="no-notifications">No notifications to show.</p>
          </>
        ) : (
          // Otherwise, show list of notifications
          <ul className="notification-list">
            {notifications.map((note) => (
              <li key={note._id} className={`notification-item ${note.type}`}>
                {/* Notification icon */}
                <img src={BellIcon} alt="Bell Icon" className="bell-icon1" />

                {/* Notification text content */}
                <div className="notification-content">
                  <p><strong>{note.subject || "No subject"}</strong></p>
                  <p>{note.message || "No message"}</p>

                  {/* Timestamp if available */}
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

      {/* Page footer */}
      <Footer />
    </div>
  )
}

export default ClientNotifications
