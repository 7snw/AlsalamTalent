// src/Pages/MyApplications.js
import React, { useState } from 'react';
import '../../Style/Freelancer/MyApplications.css';
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

  const filteredProjects = FakeProjects.applied.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());

    const matchesType = filters.type.length === 0 || filters.type.includes(project.type);
    const matchesLevel = filters.level.length === 0 || filters.level.includes(project.level);
    const matchesPrice = filters.price.length === 0 || filters.price.includes(project.priceRange);

    return matchesSearch && matchesType && matchesLevel && matchesPrice;
  });

  return (
    <div className="my-applications-page">
      <Navbar links={NavConfig2} />
      <div className="my-applications-container">
        <aside className="my-applications-left-panel">
          <h1 className="page-title">My Applications</h1>

          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your applications by type, level, and price.</p>

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

        <main className="my-applications-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="my-applications-list">
            {filteredProjects.map((proj, index) => (
              <div className="my-application-card" key={index}>
                <img src={proj.image} alt={proj.title} />
                <div className="my-application-info">
                  <h4>{proj.title}</h4>
                  <p>{proj.price}</p>
                </div>
                <div className="my-application-actions">
                  <button className="pending">Pending</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyApplications;
