import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/FreelancersList.css';
import '../Style/Navbar.css';
import '../Style/PageContents.css';
import Navbar from '../Components/Navbar';
import { NavConfig2, NavConfig3, NavConfig4 } from '../Data/NavbarConfigs';
import SearchIcon from '../Assets/search.png';
import UserIcon from '../Assets/ProfileImage.png';

// Dummy data for now
const freelancers = [
  {
    name: 'Sarah Ahmed Isa',
    title: 'Senior Graphic Designer and illustrator',
    rating: 5
  },
  {
    name: 'Muneera Mohamed',
    title: 'Senior illustrator and UX/ UI designer',
    rating: 4
  },
  {
    name: 'Ahmed Rashed',
    title: 'illustrator',
    rating: 4
  },
  {
    name: 'Lulwa Khalid',
    title: 'Advanced illustrator and editor',
    rating: 4
  },
  {
    name: 'Ahmed Rashed',
    title: 'illustrator',
    rating: 4
  },
  {
    name: 'Ahmed Rashed',
    title: 'illustrator',
    rating: 4
  },
  {
    name: 'Ahmed Rashed',
    title: 'illustrator',
    rating: 4
  },
  {
    name: 'Ahmed Rashed',
    title: 'illustrator',
    rating: 4
  }
];

// Function to render stars
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
    case 'admin': navLinks = NavConfig4; break;
    case 'client': navLinks = NavConfig3; break;
    case 'freelancer': default: navLinks = NavConfig2; break;
  }

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const exists = prev[category].includes(value);
      const updatedCategory = exists
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updatedCategory };
    });
  };

  const filteredFreelancers = freelancers.filter((f) => {
    const nameMatch = f.name.toLowerCase().includes(search.toLowerCase());
    const expertiseMatch = filters.expertise.length === 0 || filters.expertise.includes(f.expertise);
    const levelMatch = filters.level.length === 0 || filters.level.includes(f.level);
    const ratingMatch = filters.rating.length === 0 || filters.rating.includes(String(f.rating));
    return nameMatch && expertiseMatch && levelMatch && ratingMatch;
  });

  return (
    <div className="freelancer-page">
      <Navbar links={navLinks} />
      <div className="freelancer-container9">
        <div className="freelancer-content">
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
                      onChange={() => toggleFilter('expertise', type)}
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
                <h4>Rating</h4>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating}>
                    <input
                      type="checkbox"
                      checked={filters.rating.includes(String(rating))}
                      onChange={() => toggleFilter('rating', String(rating))}
                    />
                    {'★'.repeat(rating)}
                  </label>
                ))}
              </div>
            </div>
          </div>

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

            {filteredFreelancers.map((freelancer, i) => (
              <div
                className="freelancer-card"
                key={i}
                onClick={() => navigate('/freelancerprofile')}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancersList;
