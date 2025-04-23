// src/Pages/Clients/AssignedProject.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../Style/Clients/AssignedProject.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import projectsData from '../../Data/ProjectsData';
import Footer from '../../Components/Footer';

const AssignedProject = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: [] });
  const navigate = useNavigate();

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      const isSelected = updated[category].includes(value);

      return {
        ...updated,
        [category]: isSelected
          ? updated[category].filter((v) => v !== value)
          : [...updated[category], value],
      };
    });
  };

  const filteredProjects = projectsData.deitailes.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());
    const projectStatus = project.progress === '100%' ? 'completed' : 'ongoing';
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(projectStatus);
    return matchesSearch && matchesStatus;
  });

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
              {['ongoing', 'completed'].map((status) => (
                <label key={status}>
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleCheckbox('status', status)}
                  />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
              {filteredProjects.map((proj, index) => (
                <motion.div
                  className="project-card"
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => navigate(`/assigned-project/${index}`)}
                >
                  <img src={proj.image} alt={proj.title} />
                  <h4>{proj.title}</h4>
                  <p>{proj.name}</p>
                  <span className="progress-text2">{proj.progress}</span>
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
