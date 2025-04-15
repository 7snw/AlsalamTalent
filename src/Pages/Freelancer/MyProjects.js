// src/Pages/MyProjects.js
import React from 'react';
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
             <div className="my-project-card" key={i}>
  <img src={project.image} alt={project.name} />
  <h4>{project.name}</h4>
  <p>{project.price}</p>
  <span className="progress-text">{project.progress}</span>
</div>

            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
