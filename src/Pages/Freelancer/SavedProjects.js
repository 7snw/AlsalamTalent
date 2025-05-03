import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
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

const SavedProjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: [], level: [], budget: [] });
  const [savedProjects, setSavedProjects] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedProjects')) || [];
    setSavedProjects(stored);
  }, []);

  const isProjectSaved = (project) => {
    return savedProjects.some((p) => p._id === project._id);
  };

  const handleBookmarkClick = (e, project) => {
    e.stopPropagation();
    const current = JSON.parse(localStorage.getItem('savedProjects')) || [];
    const isSaved = current.find((p) => p._id === project._id);

    let updated;
    if (isSaved) {
      updated = current.filter((p) => p._id !== project._id);
    } else {
      updated = [...current, project];
    }

    setSavedProjects(updated);
    localStorage.setItem('savedProjects', JSON.stringify(updated));
  };

  const filteredProjects = savedProjects.filter((proj) => {
    const matchesSearch = proj.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(proj.category);
    const matchesLevel = filters.level.length === 0 || filters.level.includes(proj.level);
    const matchesBudget =
      filters.budget.length === 0 ||
      filters.budget.some((range) => {
        const [min, max] = range.replace('BHD', '').split('-').map((v) => parseFloat(v.trim()));
        const budget = parseFloat(proj.budget.replace('BHD', '').trim());
        return budget >= min && budget <= max;
      });

    return matchesSearch && matchesType && matchesLevel && matchesBudget;
  });

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      const alreadySelected = updated[category].includes(value);

      updated[category] = alreadySelected
        ? updated[category].filter((v) => v !== value)
        : [...updated[category], value];

      return { ...updated };
    });
  };

  return (
    <div className="saved-projects-page">
      <Navbar links={NavConfig2} />
      <div className="saved-projects-container">
        <div className="saved-left-panel">
          <h1 className="page-title">Saved Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter the projects according to their type, level and budget range.</p>

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
              <h4>Level</h4>
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                <label key={level}>
                  <input
                    type="checkbox"
                    checked={filters.level.includes(level)}
                    onChange={() => handleCheckbox('level', level)}
                  />{' '}
                  {level}
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
        </div>

        <div className="saved-right-panel">
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
                  <p>{proj.budget}</p>
                  <span className="bookmark" onClick={(e) => handleBookmarkClick(e, proj)}>
                    {isProjectSaved(proj) ? <FaBookmark /> : <FaRegBookmark />}
                  </span>
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

export default SavedProjects;
