// src/Pages/Clients/AssignedProject.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Style/Clients/AssignedProject.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import projectsData from '../../Data/ProjectsData';

const AssignedProject = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: [] });

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

  const filteredProjects = projectsData.deitailes.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(project.status);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="assigned-projects-page">
      <Navbar links={NavConfig3} />
      <div className="assigned-projects-container">
          <aside className="assigned-left-panel">
            <h1 className="page-title">Assigned Projects</h1>
            <div className="filter-section">
              <h3>Filter</h3>
              <p className="hint">Filter your assigned projects by their status.</p>

              <div className="filter-group">
                <h4>Status</h4>
                {['ongoing', 'completed'].map((status) => (
                  <label key={status}>
                    <input
                      type="checkbox"
                      onChange={() => handleCheckbox('status', status)}
                    />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="assigned-right-panel">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img src={SearchIcon} alt="search" className="search-icon" />
            </div>

            <div className="project-grid">
              {filteredProjects.map((proj, index) => (
                <Link to={`/assigned-project/${index}`} className="project-card" key={index}>
                  <img src={proj.image} alt={proj.title} />
                  <h4>{proj.title}</h4>
                  <p>{proj.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default AssignedProject;
