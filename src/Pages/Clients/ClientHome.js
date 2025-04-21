// src/Pages/ClientHome.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/Clients/ClientHome.css';
import '../../Style/Navbar.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';     
import ProjectsData from '../../Data/ProjectsData';

const ClientHome = () => {
  const navigate = useNavigate();
  const allProjects = ProjectsData.deitailes;
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  

  const categories = ['All', 'Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Design'];

  const filteredProjects = allProjects.filter((proj) => {
    const matchesCategory = activeCategory === 'All' || proj.category === activeCategory;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  

  return (
    <div className="client-home">
      <div className="client-container">
        <Navbar links={NavConfig3} />

        <header className="hero2">
          <h1><span className="highlight">Explore</span> Real-World Projects</h1>
          <p>Take on your next project, build your portfolio, and develop your skills.</p>
          <div className="search-bar">
            <input type="text" placeholder="What are you looking for?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            <img src={SearchIcon} alt="Search" className="search-icon" />
          </div>
          <br />
          <div className="categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <section className="project-grid">
          {filteredProjects.map((project, index) => (
            <div
              className="project-card"
              key={index}
              onClick={() => navigate(`/project-details/${index}`)}
              style={{ cursor: 'pointer' }}
            >
              <img src={project.image || project.coverImage} alt={project.title} />
              <h4>{project.title}</h4>
              <p>{project.budget}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ClientHome;
