import React, { useState, useEffect } from 'react';
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
import axios from 'axios'; // ADD axios for API call!

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

  const [freelancers, setFreelancers] = useState([]); // ADD state to hold freelancers from database

  // Fetch freelancers from API
  useEffect(() => {
    axios.get('http://localhost:5000/api/freelancer/list')
      .then(response => {
        setFreelancers(response.data); // save freelancers from backend
      })
      .catch(error => {
        console.error('Error fetching freelancers:', error);
      });
  }, []);

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
    const nameMatch = freelancer.fullName?.toLowerCase().includes(search.toLowerCase());
    const expertiseMatch = freelancer.expertise?.some(exp =>
      exp.toLowerCase().includes(search.toLowerCase())
    );
    const matchesSearch = nameMatch || expertiseMatch;

    // For now assume all freelancers are same level and rating (you can improve later)
    return matchesSearch;
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
                {['Marketing Consultant', 'Graphic Designer', 'Illustrator', 'Video Editor', 'Web Developer'].map((type) => (
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
                      <h3>{freelancer.fullName}</h3>
                      <p>{freelancer.expertise?.join(', ') || "Freelancer"}</p>
                    </div>
                  </div>

                  <div className="freelancer-meta">
                    {/* Future: you can add real rating from DB */}
                    <div className="rating">{renderStars(5)}</div>
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
