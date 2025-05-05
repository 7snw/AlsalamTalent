// src/Pages/Freelancer/AllProjects.js

import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/AllProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

const AllProjects = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [allProjects, setAllProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: [], budget: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, savedRes] = await Promise.all([
          axios.get('http://localhost:5000/api/projects/all'),
          axios.get(`http://localhost:5000/api/freelancer/${userId}/saved-projects`)
        ]);
        setAllProjects(projectsRes.data);
        setSavedProjects(savedRes.data.map(p => p._id));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (userId) fetchData();
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

  const isProjectSaved = (projectId) => savedProjects.includes(projectId);

  const handleBookmarkClick = async (e, projectId) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`http://localhost:5000/api/freelancer/${userId}/save-project`, { projectId });
      setSavedProjects(res.data);
    } catch (error) {
      console.error('Error updating saved projects:', error);
    }
  };

  const filteredProjects = allProjects.filter((proj) => {
    const matchesSearch = proj.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(proj.category);
    const matchesBudget =
      filters.budget.length === 0 ||
      filters.budget.some((range) => {
        const [min, max] = range.replace('BHD', '').split('-').map(v => parseFloat(v.trim()));
        const rawBudget = proj.budget;
        if (!rawBudget) return false;
        const projectBudget = typeof rawBudget === 'number'
          ? rawBudget
          : parseFloat(rawBudget.replace('BHD', '').trim());
        return projectBudget >= min && projectBudget <= max;
      });

    return matchesSearch && matchesType && matchesBudget;
  });

  return (
    <div className="browse-projects-page">
      <Navbar links={NavConfig2} />
      <div className="browse-container">
        <aside className="browse-left-panel">
          <h1 className="page-title">All Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <div className="filter-group">
              <h4>Type</h4>
              {['Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Development'].map((type) => (
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
              {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((range) => (
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

        <main className="browse-right-panel">
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
                  key={proj._id}
                  className="project-card"
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
                  <span className="bookmark" onClick={(e) => handleBookmarkClick(e, proj._id)}>
                    {isProjectSaved(proj._id) ? <FaBookmark /> : <FaRegBookmark />}
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

export default AllProjects;
