// src/Pages/SavedProjects.js
import React from 'react';
import '../../Style/Freelancer/SavedProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';


const projects = [
  { name: "Re-branding social media presence", image: require('../../Assets/Projects/banner.png'), price: "50 BHD"},
  { name: "One month campaign", image: require('../../Assets/Projects/Design.png'), price: "50 BHD"},
  { name: "One month campaign", image: require('../../Assets/Projects/socialmedia.png'), price: "50 BHD" },
];


const SavedProjects = () => {
  return (
    <div className="saved-projects-page">
      <Navbar links={NavConfig2} />
      <div className="saved-projects-container">
        <div className="saved-left-panel">
          <h1 className="page-title">Saved Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your projects according to their type, level and price range.</p>

            <div className="filter-group">
              <h4>Type</h4>
              <label><input type="checkbox" defaultChecked /> Marketing</label>
              <label><input type="checkbox" defaultChecked /> Graphic Design</label>
              <label><input type="checkbox" /> Illustration</label>
              <label><input type="checkbox" /> Product Design</label>
              <label><input type="checkbox" /> Web Design</label>
            </div>

            <div className="filter-group">
              <h4>Level</h4>
              <label><input type="checkbox" /> Beginner</label>
              <label><input type="checkbox" /> Intermediate</label>
              <label><input type="checkbox" defaultChecked /> Advanced</label>
              <label><input type="checkbox" /> Expert</label>
            </div>

            <div className="filter-group">
              <h4>Price</h4>
              <label><input type="checkbox" /> 20 - 50 BHD</label>
              <label><input type="checkbox" defaultChecked /> 50 - 70 BHD</label>
              <label><input type="checkbox" /> 80 - 100 BHD</label>
            </div>
          </div>
        </div>

        <div className="saved-right-panel">
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
</div>

            ))}
          </div>
       
        </div>
      </div>
    </div>
  );
};

export default SavedProjects;
