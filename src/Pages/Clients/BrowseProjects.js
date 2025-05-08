// src/Pages/Clients/BrowseProjects.js
import React, { useState, useEffect } from 'react';
import '../../Style/Clients/BrowseProjects.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BrowseProjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    budget: []
  });
  const [projects, setProjects] = useState([]);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?._id;
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/client/${userId}`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
  
    if (userId) { 
      fetchProjects();
    }
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

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = proj.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(proj.category);
    const matchesBudget =
      filters.budget.length === 0 ||
      filters.budget.some((range) => {
        const [min, max] = range.replace('BHD', '').split('-').map(v => parseFloat(v.trim()));
        const projectBudget = parseFloat(proj.budget);
        return projectBudget >= min && projectBudget <= max;
      });

    return matchesSearch && matchesType && matchesBudget;
  });

  return (
    <div className="browse-projects-page">
      <Navbar links={NavConfig3} />
      <div className="browse-container">
        <aside className="browse-left-panel">
          <h1 className="page-title">My Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter the projects according to their type and budget range.</p>

            <div className="filter-group">
              <h4>Type</h4>
              {['Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Design'].map((type) => (
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
              {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((budget) => (
                <label key={budget}>
                  <input
                    type="checkbox"
                    checked={filters.budget.includes(budget)}
                    onChange={() => handleCheckbox('budget', budget)}
                  />{' '}
                  {budget}
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
                  onClick={() => navigate(`/project-info/${proj._id}`)}
                >
                  <img src={proj.imageUrl} alt={proj.title} />
                  <h4>{proj.title}</h4>
                  <p>{proj.budget} BHD</p>
                  <p style={{ fontSize: '13px', color: '#888' }}>
                    {proj.authorName || 'No Name'}
                  </p>
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

export default BrowseProjects;
