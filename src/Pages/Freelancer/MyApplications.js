// src/Pages/Freelancer/MyApplications.js
import React, { useState } from 'react';
import '../../Style/Freelancer/MyApplications.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import { useNavigate } from 'react-router-dom';
import FakeProjects from '../../Data/ProjectsData';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../Components/Footer';

const MyApplications = () => {
  const navigate = useNavigate();
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
        const budget = parseFloat(project.budget.replace('BHD', '').trim());
        return budget >= min && budget <= max;
      });

    return matchesSearch && matchesType && matchesLevel && matchesBudget;
  });

  const getApplicationClass = (application) => {
    if (!application) return 'Pending';

    switch (application.toLowerCase()) {
      case 'approved':
        return 'Approved';
      case 'canceled':
        return 'Canceled';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <div className="my-applications-page">
      <Navbar links={NavConfig2} />
      <div className="my-applications-container">
        <aside className="my-applications-left-panel">
          <h1 className="page-title">My Applications</h1>

          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your applications by type, level, and budget.</p>

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

        <main className="my-applications-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="my-applications-list">
            <AnimatePresence>
              {filteredProjects.map((proj, index) => (
                <motion.div
                  className="my-application-card"
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
                  onClick={() => navigate(`/project-details/${index}`)}
                >
                  <img src={proj.image} alt={proj.title} />
                  <div className="my-application-info">
                    <h4>{proj.title}</h4>
                    <p>{proj.budget || '—'}</p>
                  </div>
                  <div className="my-application-actions">
                    <button className={getApplicationClass(proj.application)}>
                      {proj.application}
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

export default MyApplications;
