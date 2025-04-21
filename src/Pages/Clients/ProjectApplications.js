// src/Pages/Clients/ProjectApplications.js
import React, { useState } from 'react';
import '../../Style/Clients/ProjectApplications.css';
import { Link } from 'react-router-dom';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import FakeProjects from '../../Data/ProjectsData';


const ProjectApplications = () => {
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

  const filteredProjects = FakeProjects.deitailes.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="project-applications-page">
      <Navbar links={NavConfig3} />
      <div className="project-applications-container">
          <aside className="applications-left-panel">
            <h1 className="page-title">Project Applications</h1>
            <div className="filter-section">
              <h3>Filter</h3>
              <p className="hint">Filter your projects according to their type, level and price range.</p>

              <div className="filter-group">
                <h4>Type</h4>
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
                <h4>Price</h4>
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
            </div>
          </aside>

          <main className="applications-right-panel">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img src={SearchIcon} alt="search" className="search-icon" />
            </div>

            <div className="applications-list">
              {filteredProjects.map((proj, index) => (
                <div className="application-card" key={index}>
                  <img src={proj.image} alt={proj.title} />
                  <div className="application-info">
                    <h4>{proj.title}</h4>
               
                    <div className="freelancer-name">
  <span>👤</span>
  <Link to="/freelancerprofile" className="freelancer-link">
    {proj.name}
  </Link>
</div>
                  </div>
                  <div className="application-actions">
                    <button className="approve">Approve</button>
                    <button className="reject">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
  );
};

export default ProjectApplications;
