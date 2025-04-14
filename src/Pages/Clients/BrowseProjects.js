// src/Pages/Clients/BrowseProjects.js
import React, { useState } from 'react';
import '../../Style/Clients/BrowseProjects.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import { useNavigate } from 'react-router-dom';
import ProjectsData from '../../Data/ProjectsData';

const BrowseProjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    level: [],
    price: []
  });

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((v) => v !== value);
      } else {
        updated[category].push(value);
      }
      return updated;
    });
  };

  const filteredProjects = ProjectsData.assigned.filter((proj) => {
    const matchesSearch = proj.title.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filters.type.length === 0 || filters.type.includes(proj.type);
    const matchesLevel =
      filters.level.length === 0 || filters.level.includes(proj.level);
    const matchesPrice =
      filters.price.length === 0 || filters.price.includes(proj.priceRange);

    return matchesSearch && matchesType && matchesLevel && matchesPrice;
  });

  return (
    <div className="browse-projects-page">
      <Navbar links={NavConfig3} />
      <div className="browse-container">
        <h2>All Projects</h2>
        <div className="browse-layout">
          <aside className="filter-section">
            <h4>Filter</h4>
            <p>Filter your projects according to their type, level and price range.</p>

            <strong>Type</strong>
            {['Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Development'].map((type) => (
              <label key={type}>
                <input type="checkbox" onChange={() => handleCheckbox('type', type)} /> {type}
              </label>
            ))}

            <strong>Level</strong>
            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
              <label key={level}>
                <input type="checkbox" onChange={() => handleCheckbox('level', level)} /> {level}
              </label>
            ))}

            <strong>Price</strong>
            {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((price) => (
              <label key={price}>
                <input type="checkbox" onChange={() => handleCheckbox('price', price)} /> {price}
              </label>
            ))}
          </aside>

          <main className="project-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Which project are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="project-grid">
              {filteredProjects.map((proj, index) => (
                <div
                  key={index}
                  className="project-card"
                  onClick={() => navigate(`/project-info/${index}`)}
                >
                  <img src={proj.image} alt={proj.title} />
                  <h5>{proj.title}</h5>
                  <p>{proj.budget}</p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrowseProjects;