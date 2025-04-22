import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/FreelancersList.css';
import '../Style/Navbar.css';
import '../Style/PageContents.css';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';


import { NavConfig2, NavConfig3, NavConfig4 } from '../Data/NavbarConfigs';
import SearchIcon from '../Assets/search.png';
import UserIcon from '../Assets/ProfileImage.png';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectsData from '../Data/ProjectsData';

const renderStars = (count) => {
  return Array.from({ length: count }, (_, i) => <span key={i}>★</span>);
};

const FreelancersList = () => {
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    expertise: [],
    level: [],
    rating: []
  });

  let navLinks;
  switch (role) {
    case 'admin':
      navLinks = NavConfig4;
      break;
    case 'client':
      navLinks = NavConfig3;
      break;
    case 'freelancer':
    default:
      navLinks = NavConfig2;
      break;
  }

  const freelancers = ProjectsData.freelancers;

  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((v) => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const nameMatch = freelancer.name.toLowerCase().includes(search.toLowerCase());
    const titleMatch = freelancer.title.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = nameMatch || titleMatch;

    const matchesExpertise =
      filters.expertise.length === 0 ||
      filters.expertise.some((exp) => freelancer.title.toLowerCase().includes(exp.toLowerCase()));

    const matchesLevel = true; // Placeholder - no level field yet

    const matchesRating =
      filters.rating.length === 0 || filters.rating.includes(freelancer.rating.toString());

    return matchesSearch && matchesExpertise && matchesLevel && matchesRating;
  });

  return (
    <div className="freelancer-page">
      <Navbar links={navLinks} />
      <div className="freelancer-container9">
        <div className="freelancer-content">
          {/* LEFT FILTER */}
          <div className="freelancer-left-panel">
            <h1 className="page-title">Freelancers</h1>
            <div className="filter-section">
              <h3>Filter</h3>
              <p className="hint">Filter your Freelancers according to their Expertise, Level and Rating.</p>

              <div className="filter-group">
                <h4>Expertise</h4>
                {['Marketing consultant', 'Graphic Designer', 'Illustrator', 'Video Editor', 'Web Developer'].map((type) => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={filters.expertise.includes(type)}
                      onChange={() => handleFilterChange('expertise', type)}
                    /> {type}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h4>Level</h4>
                {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                  <label key={level}>
                    <input
                      type="checkbox"
                      onChange={() => handleFilterChange('level', level)}
                    /> {level}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h4>Rating</h4>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating}>
                    <input
                      type="checkbox"
                      checked={filters.rating.includes(rating.toString())}
                      onChange={() => handleFilterChange('rating', rating.toString())}
                    />{' '}
                    {'★'.repeat(rating)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SEARCH & RESULTS */}
          <div className="freelancer-results">
            <div className="search-wrapper9">
              <input
                type="text"
                placeholder="Who are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img src={SearchIcon} alt="Search" className="search-icon9" />
            </div>

            <AnimatePresence>
              {filteredFreelancers.map((freelancer, i) => (
                <motion.div
                  className="freelancer-card"
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => navigate('/freelancerprofile')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="freelancer-info">
                    <img src={UserIcon} alt="user" className="profile-icon" />
                    <div>
                      <h3>{freelancer.name}</h3>
                      <p>{freelancer.title}</p>
                    </div>
                  </div>

                  <div className="freelancer-meta">
                    <div className="rating">{renderStars(freelancer.rating)}</div>
                    <button
                      className="contact-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/freelancermessages');
                      }}
                    >
                      Get in touch
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default FreelancersList;
