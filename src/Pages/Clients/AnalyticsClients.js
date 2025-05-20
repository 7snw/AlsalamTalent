import React, { useEffect, useState } from 'react'
import '../../Style/Clients/AnalyticsClient.css'
import Navbar from '../../Components/Navbar'
import { NavConfig3 } from '../../Data/NavbarConfigs'
import Footer from '../../Components/Footer'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

const AnalyticsClient = () => {
  // This state holds all the analytics data shown on the page
  const [analytics, setAnalytics] = useState({
    openCount: 0,
    assignedCount: 0,
    completedCount: 0,
    projectsProgress: [], // For the bar chart
    allProjects: [] // For the scrollable project list
  })

  // Get the current logged-in user's ID from local storage
  const storedUser = JSON.parse(localStorage.getItem("user"))
  const clientId = storedUser?._id

  // When the page loads, fetch analytics data for this client
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/client/analytics/${clientId}`)
        setAnalytics(response.data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    // Only fetch data if the client ID exists
    if (clientId) {
      fetchAnalytics()
    }
  }, [clientId])

  return (
    <div className="analytics-page">
      {/* Show the navbar with client-specific links */}
      <Navbar links={NavConfig3} />

      <div className="analytics-container">
        <h2> Analytics</h2>

        {/* Show summary numbers for Open, Assigned, and Completed projects */}
        <div className="summary-cards">
          <div className="card1">
            <h4>Open Projects</h4>
            <div className="big-number">{analytics.openCount}</div>
          </div>
          <div className="card1">
            <h4>Assigned Projects</h4>
            <div className="big-number">{analytics.assignedCount}</div>
          </div>
          <div className="card1">
            <h4>Completed Projects</h4>
            <div className="big-number">{analytics.completedCount}</div>
          </div>
        </div>

        {/* This section includes a bar chart and a list of all projects */}
        <div className="details-section9">
          {/* The left card shows a bar chart of projects by month */}
          <div className="card progress9">
            <h4>Projects by Month</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.projectsProgress}>
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#1B223C" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* The right card shows all projects with basic info */}
          <div className="card project-list9">
            <h4>All Projects</h4>
            <div className="project-scroll">
              {analytics.allProjects.length === 0 ? (
                // Show a message if there are no projects
                <p>No projects found.</p>
              ) : (
                // Otherwise, list each project with title, status, and budget
                analytics.allProjects.map((proj, idx) => (
                  <div key={idx} className="project-item">
                    <strong>{proj.title}</strong>
                    <p>Status: {proj.status}</p>
                    <p>Budget: {proj.budget} BD</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Show the shared footer at the bottom */}
      <Footer />
    </div>
  )
}

export default AnalyticsClient
