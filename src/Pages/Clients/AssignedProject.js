import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import '../../Style/Clients/AssignedProject.css'
import '../../Style/PageContents.css'
import Navbar from '../../Components/Navbar'
import { NavConfig3 } from '../../Data/NavbarConfigs'
import SearchIcon from '../../Assets/search.png'
import Footer from '../../Components/Footer'
import axios from 'axios'

const AssignedProject = () => {
  // Search bar input value
  const [search, setSearch] = useState('')

  // Filter state for selected statuses
  const [filters, setFilters] = useState({ status: [] })

  // List of assignments fetched from the backend
  const [assignments, setAssignments] = useState([])

  const navigate = useNavigate()

  // Get logged-in client from localStorage
  const user = JSON.parse(localStorage.getItem('user'))
  const clientId = user?._id

  // Fetch assignments for the logged-in client on page load
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assignments/by-author/${clientId}`)
        setAssignments(res.data)
      } catch (error) {
        console.error('Error fetching assignments:', error)
      }
    }

    fetchAssignments()
  }, [clientId])

  // Filter assignments based on search input and selected statuses
  const filteredAssignments = assignments.filter((assignment) => {
    const title = assignment.projectId?.title?.toLowerCase() || ''
    const matchesSearch = title.includes(search.toLowerCase())
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(assignment.status)
    return matchesSearch && matchesStatus
  })

  // Toggle filter values on checkbox click
  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const updated = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value]
      return { ...prev, [category]: updated }
    })
  }

  // Navigate to correct page based on assignment status
  const handleProjectClick = (assignment) => {
    if (assignment.status === 'Submitted') {
      navigate(`/submitted-project/${assignment._id}`)
    } else {
      navigate(`/assigned-project/${assignment._id}`)
    }
  }

  return (
    <div className="assigned-projects-page">
      {/* Client navbar */}
      <Navbar links={NavConfig3} />

      <div className="assigned-projects-container">
        {/* Left panel with filters */}
        <aside className="assigned-left-panel">
          <h1 className="page-title">Assigned Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your assigned projects by their status.</p>
            <div className="filter-group">
              <h4>Status</h4>
              {/* Status filter checkboxes */}
              {['Assigned', 'Submitted', 'Completed', 'Re-submit', 'Declined'].map((status) => (
                <label key={status}>
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleCheckbox('status', status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right panel with search and project cards */}
        <div className="assigned-right-panel">
          {/* Search input */}
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          {/* Grid showing assignment cards */}
          <div className="projects-grid">
            <AnimatePresence>
              {filteredAssignments.map((assignment) => (
                <motion.div
                  className="project-card"
                  key={assignment._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => handleProjectClick(assignment)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Show project image or fallback text */}
                  {assignment.projectId?.imageUrl ? (
                    <img src={assignment.projectId.imageUrl} alt={assignment.projectId.title} />
                  ) : (
                    <p>No image available</p>
                  )}

                  {/* Project title */}
                  <h4>{assignment.projectId?.title || 'Untitled'}</h4>

                  {/* Assigned freelancer name */}
                  <p>{assignment.freelancerId?.fullName || 'Freelancer not found'}</p>

                  {/* Project status text */}
                  <span className="progress-text2">{assignment.status}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Page footer */}
      <Footer />
    </div>
  )
}

export default AssignedProject
