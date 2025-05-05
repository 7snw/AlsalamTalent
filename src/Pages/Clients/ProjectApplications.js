// src/Pages/Clients/ProjectApplications.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../Style/Clients/ProjectApplications.css';
import { Link } from 'react-router-dom';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import FakeProjects from '../../Data/ProjectsData';
import Footer from '../../Components/Footer';

const ProjectApplications = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    level: [],
    budget: [],
  });

  const toggleFilter = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const filteredProjects = FakeProjects.deitailes.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(project.category);
    const matchesLevel = filters.level.length === 0 || filters.level.includes(project.level);
    const matchesBudget =
      filters.budget.length === 0 ||
      filters.budget.some((range) => {
        const [min, max] = range.replace('BHD', '').split('-').map(v => parseFloat(v.trim()));
        const projectBudget = parseFloat(project.budget.replace('BHD', '').trim());
        return projectBudget >= min && projectBudget <= max;
      });

    return matchesSearch && matchesType && matchesLevel && matchesBudget;
  });

  return (
    <div className="project-applications-page">
      <Navbar links={NavConfig3} />
      <div className="project-applications-container">
        <aside className="applications-left-panel">
          <h1 className="page-title">Project Applications</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your projects according to their type, level and budget range.</p>

            <div className="filter-group">
              <h4>Type</h4>
              {['Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Design'].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => toggleFilter('type', type)}
                  />
                  {type}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Level</h4>
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                <label key={level}>
                  <input
                    type="checkbox"
                    checked={filters.level.includes(level)}
                    onChange={() => toggleFilter('level', level)}
                  />
                  {level}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Budget</h4>
              {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((range) => (
                <label key={range}>
                  <input
                    type="checkbox"
                    checked={filters.budget.includes(range)}
                    onChange={() => toggleFilter('budget', range)}
                  />
                  {range}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="applications-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="applications-list">
            <AnimatePresence>
              {filteredProjects.map((proj, index) => (
                <motion.div
                  className="application-card"
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
                >
                  <img src={proj.image} alt={proj.title} />
                  <div className="application-info">
                    <h4>{app.project?.title}</h4>
                    <p>Freelancer: <span className="freelancer-link" onClick={() => navigate(`/freelancerprofile/${app.freelancer.id}`)}>{app.freelancer?.name}</span></p>

                    <p>Status: {app.status}</p>
                  </div>
                  <div className="application-actions">
                    <button
                      className="assign"
                      disabled={app.status === 'Assigned'}
                      onClick={() => handleAction(app.project.id, app.freelancer.id, 'approve')}
                    >
                      Assign
                    </button>
                    <button
                      className="cancel"
                      disabled={app.status === 'Cancelled'}
                      onClick={() => handleAction(app.project.id, app.freelancer.id, 'reject')}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectApplications;
