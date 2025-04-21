// src/Pages/MyProjects.js
import React, { useState } from 'react';
import '../../Style/Freelancer/MyProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';

const projects = [
    { name: "Re-branding social media presence", image: require('../../Assets/Projects/banner.png'), price: "50 BHD", progress: "70%" },
    { name: "One month campaign", image: require('../../Assets/Projects/Design.png'), price: "50 BHD", progress: "90%" },
    { name: "One month campaign", image: require('../../Assets/Projects/socialmedia.png'), price: "50 BHD", progress: "45%" },
  ];
  

const MyProjects = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: ['Completed'] });

  const handleCheckbox = (value) => {
    setFilters((prev) => {
      const updatedType = prev.type.includes(value)
        ? prev.type.filter((v) => v !== value)
        : [...prev.type, value];
      return { ...prev, type: updatedType };
    });
  };

  const filteredProjects = ProjectsData.submitted.filter((proj) =>
    filters.type.length === 0 || filters.type.includes(proj.status)
  );

  return (
    <div className="my-projects-page">
      <Navbar links={NavConfig2} />
      <div className="my-projects-container">
        <div className="my-left-panel">
          <h1 className="page-title">My Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your projects according to their progress.</p>
            <div className="filter-group">
              <h4>Type</h4>
              {['Completed', 'In-progress'].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleCheckbox(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="my-right-panel">
          <div className="search-wrapper">
            <input type="text" placeholder="What are you looking for?" />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="my-projects-grid">
            {filteredProjects.map((project, i) => (
              <div
                className="my-project-card"
                key={i}
                onClick={() => navigate(`/submit-project/${i}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={project.image} alt={project.name} />
                <h4>{project.title}</h4>
                <p>{project.budget || '50 BHD'}</p>
                <span className="progress-text">{project.progress || '0%'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
