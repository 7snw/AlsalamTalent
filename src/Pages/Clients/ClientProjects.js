// src/Pages/Clients/ClientProjects.js
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import { NavConfig3 } from '../../Data/NavbarConfigs'

const ClientProjects = () => {
  // Holds the list of all client projects
  const [projects, setProjects] = useState([])

  // Fetch projects from the backend when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/projects')
        setProjects(data)
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }

    fetchProjects()
  }, [])

  return (
    <div>
      {/* Top navigation bar */}
      <Navbar links={NavConfig3} />

      <div className="client-projects-container">
        <h2>My Projects</h2>

        {/* Display list of projects if any exist */}
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project._id} className="project-card">
              {/* Project title */}
              <h3>{project.title}</h3> {/* <- fix field name if needed */}
              {/* Project category */}
              <p><strong>Category:</strong> {project.category}</p>
              {/* Project budget */}
              <p><strong>Budget:</strong> {project.budget} BD</p>
              {/* Project status */}
              <p><strong>Status:</strong> {project.status}</p>
            </div>
          ))
        ) : (
          // If no projects, show a message
          <p>No projects found.</p>
        )}
      </div>

      {/* Page footer */}
      <Footer />
    </div>
  )
}

export default ClientProjects
