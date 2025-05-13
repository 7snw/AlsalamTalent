// src/Pages/Freelancer/SavedProjects.js

import { FaBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/SavedProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

const SavedProjects = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const [savedProjects, setSavedProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: [], budget: [] });

  useEffect(() => {
    const fetchSavedProjects = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/${userId}/saved-projects`);
        setSavedProjects(data);
      } catch (error) {
        console.error('Error fetching saved projects:', error);
      }
    };

    if (userId) fetchSavedProjects();
  }, [userId]);

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      const alreadySelected = updated[category]?.includes(value);

      updated[category] = alreadySelected
        ? updated[category].filter((v) => v !== value)
        : [...(updated[category] || []), value];

      return { ...updated };
    });
  };

  const handleUnsave = async (e, projectId) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:5000/api/freelancer/${userId}/save-project`, { projectId });
      setSavedProjects((prev) => prev.filter((proj) => proj._id !== projectId));
    } catch (error) {
      console.error('Error unsaving project:', error);
    }
  };

  const filteredProjects = savedProjects.filter((proj) => {
    const matchesSearch = proj.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(proj.category);
    const matchesBudget =
      filters.budget.length === 0 ||
      filters.budget.some((range) => {
        const [min, max] = range.replace('BHD', '').split('-').map((v) => parseFloat(v.trim()));
        const rawBudget = proj.budget;

        if (!rawBudget) return false;
        const projectBudget =
          typeof rawBudget === 'number'
            ? rawBudget
            : parseFloat(rawBudget.replace('BHD', '').trim());

        return projectBudget >= min && projectBudget <= max;
      });

    return matchesSearch && matchesType && matchesBudget;
  });

  return (
    <div className="saved-projects-page">
      <Navbar links={NavConfig2} />
      <div className="saved-projects-container">
        <aside className="saved-left-panel">
          <h1 className="page-title">Saved Projects</h1>

          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter the projects according to their type and budget range.</p>

          <div className="filter-group">
              <h4>Type</h4>
              {['Marketing', 'Graphic Design', 'Web Design', 'Illustration', 'Content Creation', 'Product Design'].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleCheckbox('type', type)}
                  />{' '}
                  {type}
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Budget</h4>
              {['10 - 40 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((range) => (
                <label key={range}>
                  <input
                    type="checkbox"
                    checked={filters.budget.includes(range)}
                    onChange={() => handleCheckbox('budget', range)}
                  />{' '}
                  {range}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="saved-right-panel">
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
              {filteredProjects.map((proj, index) => (
                <motion.div
                  className="my-project-card"
                  key={proj._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => navigate(`/project-details/${proj._id}`)}
                >
                  <img src={proj.imageUrl || proj.image || proj.coverImage} alt={proj.title} />
                  <h4>{proj.title}</h4>
                  <p>{proj.budget} BHD</p>
                  <span className="bookmark" onClick={(e) => handleUnsave(e, proj._id)}>
                    <FaBookmark />
                  </span>
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

export default SavedProjects;
