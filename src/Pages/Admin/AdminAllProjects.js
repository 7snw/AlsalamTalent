// src/Pages/AllProjects.js
import React from 'react';
import '../../Style/Admin/AdminAllProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';

const adminprojects = [
  { name: "Re-branding social media presence", image: require('../../Assets/Projects/banner.png'), price: "50 BHD" },
  { name: "One month campaign", image: require('../../Assets/Projects/Design.png'), price: "50 BHD" },
  { name: "Editing Summer Ads Content", image: require('../../Assets/Projects/socialmedia.png'), price: "50 BHD" },
  { name: "Branding for potential merch", image: require('../../Assets/Projects/packaging.png'), price: "50 BHD" },
  { name: "Website Redesign", image: require('../../Assets/Projects/illustration.png'), price: "60 BHD" },
  { name: "Content Design for Blogs", image: require('../../Assets/Projects/Design.png'), price: "40 BHD" },
  { name: "Re-branding social media presence", image: require('../../Assets/Projects/banner.png'), price: "50 BHD" },
  { name: "One month campaign", image: require('../../Assets/Projects/Design.png'), price: "50 BHD" },
  { name: "Editing Summer Ads Content", image: require('../../Assets/Projects/socialmedia.png'), price: "50 BHD" }
];

const AdminAllProjects = () => {
  return (
    <div className="all-projects-page">
      <Navbar links={NavConfig4} />
      <div className="all-projects-container">
        <div className="all-left-panel">
          <h1 className="page-title">All Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter the projects according to their type, <br/> level and price range.</p>

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

        <div className="all-right-panel">
          <div className="search-wrapper">
            <input type="text" placeholder="What are you looking for?" />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="projects-grid">
            {adminprojects.map((adminproject, i) => (
              <div className="project-card" key={i}>
                <img src={adminproject.image} alt={adminproject.name} />
                <h4>{adminproject.name}</h4>
                <p>{adminproject.price}</p>
                <span className="bookmark">🔖</span>
              </div>
              
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAllProjects;
