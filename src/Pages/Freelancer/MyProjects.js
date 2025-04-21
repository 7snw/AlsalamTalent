// src/Pages/MyProjects.js
import React from 'react';
import '../../Style/Freelancer/MyProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import { useNavigate } from 'react-router-dom';
import ProjectsData from '../../Data/ProjectsData';
import SearchIcon from '../../Assets/search.png';

const MyProjects = () => {
  const navigate = useNavigate();
  const projects = ProjectsData.submitted;

  return (
    <div className="my-projects-page">
      <Navbar links={NavConfig2} />
      <div className="my-projects-container">
        <div className="my-left-panel">
          <h1 className="page-title">My Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your projects according to their progress. </p>
            <div className="filter-group">
              <h4>Type</h4>
              <label><input type="checkbox" defaultChecked /> Completed</label>
              <label><input type="checkbox" /> In-progress</label>
            </div>
          </div>
        </div>

        <div className="my-right-panel">
          <div className="search-wrapper">
            <input type="text" placeholder="What are you looking for?" />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="my-projects-grid">
            {projects.map((project, i) => (
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
