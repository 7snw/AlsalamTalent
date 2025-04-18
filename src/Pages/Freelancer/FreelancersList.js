// src/Pages/FreelancersList.js
import React from 'react';
import '../../Style/Freelancer/FreelancersList.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import {
  NavConfig2, // freelancer
  NavConfig3, // client
  NavConfig4  // admin
} from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import UserIcon from '../../Assets/ProfileImage.png';

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

  return (
    <div className="freelancer-page">
      <Navbar links={navLinks} />
      <div className="freelancer-container">
        <div className="freelancer-content">
          {/* LEFT - Filter */}
          <div className="freelancer-left-panel">
            <h1 className="page-title">Freelancers</h1>
            <div className="filter-section">
              <h3>Filter</h3>
              <p className="hint">Filter your Freelancers according to their Expertise, Level and Rating.</p>

              <div className="filter-group">
                <h4>Expertise</h4>
                <label><input type="checkbox" /> Marketing consultant</label>
                <label><input type="checkbox" /> Graphic Designer</label>
                <label><input type="checkbox" defaultChecked /> Illustrator</label>
                <label><input type="checkbox" /> Video Editor</label>
                <label><input type="checkbox" /> Web Developer</label>
              </div>

              <div className="filter-group">
                <h4>Level</h4>
                <label><input type="checkbox" /> Beginner</label>
                <label><input type="checkbox" /> Intermediate</label>
                <label><input type="checkbox" defaultChecked /> Advanced</label>
                <label><input type="checkbox" /> Expert</label>
              </div>

              <div className="filter-group">
                <h4>Rating</h4>
                <label><input type="checkbox" /> ★★★★★</label>
                <label><input type="checkbox" /> ★★★★</label>
                <label><input type="checkbox" defaultChecked /> ★★★</label>
                <label><input type="checkbox" /> ★★</label>
                <label><input type="checkbox" /> ★</label>
              </div>
            </div>
          </div>

          {/* RIGHT - Search & Results */}
          <div className="freelancer-results">
            <div className="search-wrapper">
              <input type="text" placeholder="Who are you looking for?" />
              <img src={SearchIcon} alt="search" className="search-icon" />
            </div>

            {freelancers.map((freelancer, i) => (
              <div className="freelancer-card" key={i}>
                <div className="freelancer-info">
                  <img src={UserIcon} alt="user" className="profile-icon" />
                  <div>
                    <h3>{freelancer.name}</h3>
                    <p>{freelancer.title}</p>
                  </div>
                </div>

                <div className="freelancer-meta">
                  <div className="rating">{renderStars(freelancer.rating)}</div>
                  <button className="contact-btn">Get in touch</button>
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
