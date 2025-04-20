// src/Pages/AllProjects.js
import React, { useState } from 'react';
import '../../Style/Freelancer/AllProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { useNavigate } from 'react-router-dom';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import ProjectsData from '../../Data/ProjectsData';
import SearchIcon from '../../Assets/search.png';



const  AllProjects = () => {
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

  const filteredProjects = ProjectsData.deitailes.filter((proj) => {
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
                  <input type="checkbox" onChange={() => handleCheckbox('type', type)} /> {type}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Level</h4>
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                <label key={level}>
                  <input type="checkbox" onChange={() => handleCheckbox('level', level)} /> {level}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Price</h4>
              {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((price) => (
                <label key={price}>
                  <input type="checkbox" onChange={() => handleCheckbox('price', price)} /> {price}
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
            {filteredProjects.map((proj, index) => (
              <div
                key={index}
                className="project-card"
                onClick={() => navigate(`/project-info/${index}`)}
              >
                <img src={proj.image} alt={proj.title} />
                <h4>{proj.title}</h4>
                <p>{proj.budget}</p>
                <span className="bookmark">🔖</span>

              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};


export default AllProjects;
