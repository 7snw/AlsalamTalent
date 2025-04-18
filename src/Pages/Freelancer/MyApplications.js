// src/Pages/MyApplications.js
import React, { useState } from 'react';
import '../../Style/Freelancer/MyApplications.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import FakeProjects from '../../Data/ProjectsData';
  

const MyApplications = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    level: [],
    price: [],
  });

  const toggleFilter = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const filtered = FakeProjects.assigned.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="project-applications-page">
      <Navbar links={NavConfig2} />
      <div className="project-applications-container">
        <h2>Project Applications</h2>

        <div className="applications-layout">
          <aside className="filter-section">
            <h4>Filter</h4>
            <p>Filter your projects according to their type, level and price range.</p>

            <div className="filter-group">
              <strong>Type</strong>
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
              <strong>Level</strong>
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
              <strong>Price</strong>
              {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((price) => (
                <label key={price}>
                  <input
                    type="checkbox"
                    checked={filters.price.includes(price)}
                    onChange={() => toggleFilter('price', price)}
                  />
                  {price}
                </label>
              ))}
            </div>
          </aside>

          <main className="applications-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img src={SearchIcon} alt="Search" />
            </div>

            {filtered.map((proj, index) => (
              <div className="application-card" key={index}>
                <img src={proj.image} alt={proj.title} />
                <div className="application-info">
                  <h4>{proj.title}</h4>
                  <p>Marketing consultant</p>
                  <div className="freelancer-name">
                    <span>👤</span> {proj.name}
                  </div>
                </div>
                <div className="actions">
                  <button className="approve">Approve</button>
                  <button className="reject">Reject</button>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
};


export default MyApplications;
