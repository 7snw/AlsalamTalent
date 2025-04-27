// src/Pages/Clients/ClientProjects.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { NavConfig3 } from '../../Data/NavbarConfigs';

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/projects');
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <Navbar links={NavConfig3} />
      <div className="client-projects-container">
        <h2>My Projects</h2>
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project._id} className="project-card">
              <h3>{project.title}</h3> {/* <- fix field name */}
              <p><strong>Category:</strong> {project.category}</p>
              <p><strong>Budget:</strong> {project.budget} BD</p>
              <p><strong>Status:</strong> {project.status}</p>
            </div>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ClientProjects;
