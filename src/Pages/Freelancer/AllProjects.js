import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/AllProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import ProjectsData from '../../Data/ProjectsData';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';

const AllProjects = () => {
  const navigate = useNavigate();
  const allProjects = ProjectsData.deitailes;
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    level: [],
    price: []
  });
  const [savedProjects, setSavedProjects] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedProjects')) || [];
    setSavedProjects(stored);
  }, []);

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


  const handleBookmarkClick = (e, project) => {
    e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem('savedProjects')) || [];
    const isSaved = stored.find(p => p.title === project.title);

    let updated;
    if (isSaved) {
      updated = stored.filter(p => p.title !== project.title);
    } else {
      updated = [...stored, project];
    }

    setSavedProjects(updated);
    localStorage.setItem('savedProjects', JSON.stringify(updated));
  };

  const filteredProjects = allProjects.filter((proj) => {
    const matchesSearch = proj.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(proj.category);
    const matchesLevel = filters.level.length === 0 || filters.level.includes(proj.level);
    const matchesPrice = filters.price.length === 0 || filters.price.includes(proj.priceRange);

    return matchesSearch && matchesType && matchesLevel && matchesPrice;
  });

  return (
    <div className="browse-projects-page">
       <Navbar links={NavConfig2} />
      <div className="browse-container">
       
        <aside className="browse-left-panel">
          <h1 className="page-title">All Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter the projects according to their type, level and price range.</p>

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
              <h4>Price</h4>
              {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((price) => (
                <label key={price}>
                  <input
                    type="checkbox"
                    checked={filters.price.includes(price)}
                    onChange={() => handleCheckbox('price', price)}
                  />{' '}
                  {price}
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
                  onClick={() => navigate(`/project-details/${index}`)}
                >
                  <img src={proj.image || proj.coverImage} alt={proj.title} />
                  <h4>{proj.title}</h4>
                  <p>{proj.budget}</p>
                  <span className="bookmark" onClick={(e) => handleBookmarkClick(e, proj)}>
                    {savedProjects.some(p => p.title === proj.title) ? <FaBookmark /> : <FaRegBookmark />}
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
