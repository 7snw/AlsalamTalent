// src/Pages/Clients/SubmittedProjects.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../Style/Clients/SubmittedProjects.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import SearchIcon from "../../Assets/search.png";
import projectsData from "../../Data/ProjectsData";
import Footer from '../../Components/Footer';


const SubmittedProjects = () => {
  const [search, setSearch] = useState("");

  const filteredProjects = projectsData.submitted.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="submitted-projects-page">
    <Navbar links={NavConfig3} />
  
    <div className="submitted-content">
  <div className="title-search-row">
    <h1 className="page-title4">Submitted Projects</h1>

    <div className="search-wrapper4">
      <input
        type="text"
        placeholder="What are you looking for?"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <img src={SearchIcon} alt="search" className="search-icon4" />
    </div>
  </div>

  <div className="submitted-project-grid">
    {filteredProjects.map((proj, index) => (
      <Link
        to={`/submitted-project/${index}`}
        className="submitted-project-card"
        key={index}
      >
        <img src={proj.image} alt={proj.title} />
        <div className="submitted-project-info">
          <h5>{proj.title}</h5>
          <p>{proj.name}</p>
        </div>
      </Link>
    ))}
  </div>
</div>
<Footer />
  </div>
  
  );
};

export default SubmittedProjects;
