// src/Pages/Freelancer/MyProjects.js
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/MyProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../Components/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignedProjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: [] });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const freelancerId = storedUser?._id;
        const response = await axios.get(`http://localhost:5000/api/assignments/by-freelancer/${freelancerId}`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleCheckbox = (value) => {
    setFilters((prev) => {
      const updatedType = prev.type.includes(value)
        ? prev.type.filter((v) => v !== value)
        : [...prev.type, value];
      return { ...prev, type: updatedType };
    });
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesType =
      filters.type.length === 0 || filters.type.includes(proj.status);

    const matchesSearch = proj.projectId?.title?.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  const handleProjectClick = (assignmentId) => {
    navigate(`/my-project/${assignmentId}`);
  };

  return (
    <div className="my-projects-page">
      <Navbar links={NavConfig2} />
      <div className="my-projects-container">
        <div className="my-left-panel">
          <h1 className="page-title">Assigned Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your projects according to their progress.</p>
            <div className="filter-group">
              <h4>Status</h4>
              {['Assigned', 'Submitted', 'Completed', 'Re-submit', 'Declined'].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleCheckbox(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="my-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="my-projects-grid">
            <AnimatePresence>
              {filteredProjects.map((project, i) => (
                <motion.div
                  className="my-project-card"
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => handleProjectClick(project._id)}
                >
                  <img
                    src={project.projectId?.imageUrl || "path_to_default_image.jpg"}
                    alt={project.projectId?.title}
                  />
                  <h4>{project.projectId?.title}</h4>
                  <span className="progress-text">{project.status}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AssignedProjects;
