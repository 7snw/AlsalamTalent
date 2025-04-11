import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Style/Clients/SubmittedProjects.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import projectsData from '../../Data/ProjectsData';

const SubmittedProjects = () => {
  const [search, setSearch] = useState('');
  

  const filteredProjects = projectsData.submitted.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="submitted-projects-page">
      <Navbar links={NavConfig3} />
      <div className="submitted-container">
        <h2 className="page-title">Submitted Projects</h2>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Which project are you looking for?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <img src={SearchIcon} alt="Search" />
        </div>

        <div className="project-grid">
          {filteredProjects.map((proj, index) => (
            <Link to={`/submitted-project/${index}`} className="project-card" key={index}>
            <img src={proj.image} alt={proj.title} />
            <div className="project-info">
              <h5>{proj.title}</h5>
              <p>{proj.name}</p>
            </div>
          </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubmittedProjects;
