// src/Pages/Clients/AssignedProject.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../Style/Clients/AssignedProject.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

const AssignedProject = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: [] });
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects/all');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const assignedProjects = projects.filter(
    (proj) => proj.authorId?._id === userId || proj.authorId === userId
  );

  const filteredProjects = assignedProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(project.status);
    return matchesSearch && matchesStatus;
  });

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const isSelected = prev[category].includes(value);
      return {
        ...prev,
        [category]: isSelected
          ? prev[category].filter((v) => v !== value)
          : [...prev[category], value],
      };
    });
  };

  const handleProjectClick = (proj) => {
    if (proj.status === 'Submitted') {
      navigate(`/submitted-project/${proj._id}`);
    } else {
      navigate(`/assigned-project/${proj._id}`);
    }
  };

  return (
    <div className="assigned-projects-page">
      <Navbar links={NavConfig3} />

      <div className="assigned-projects-container">
        <aside className="assigned-left-panel">
          <h1 className="page-title">Assigned Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your assigned projects by their status.</p>
            <div className="filter-group">
              <h4>Status</h4>
              {['On Going', 'Submitted', 'Completed'].map((status) => (
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

        <div className="assigned-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="projects-grid">
            <AnimatePresence>
              {filteredProjects.map((proj) => (
                <motion.div
                  className="project-card"
                  key={proj._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => handleProjectClick(proj)}
                  style={{ cursor: 'pointer' }}
                >
                  {proj.imageUrl ? (
                    <img src={proj.imageUrl} alt={proj.title} />
                  ) : (
                    <p>No image available</p>
                  )}
                  <h4>{proj.title}</h4>
                  <p>{proj.authorName || 'Unknown'}</p>
                  <span className="progress-text2">{proj.status}</span>
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

export default AssignedProject;
