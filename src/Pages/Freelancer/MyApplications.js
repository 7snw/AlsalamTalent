// src/Pages/MyApplications.js
import React, { useState } from 'react';
import '../../Style/Freelancer/MyApplications.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import FakeProjects from '../../Data/ProjectsData';

const MyApplications = () => {
  const [search, setSearch] = useState('');

  const filtered = FakeProjects.applied.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="project-applications-page">
      <Navbar links={NavConfig2} />
      <div className="project-applications-container">
        <h2>My Applications</h2>

        <div className="applications-layout">
          <main className="applications-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img src={SearchIcon} alt="Search" />
            </div>

            {filtered.map((proj, index) => (
              <div className="application-card" key={index}>
                <img src={proj.image} alt={proj.title} />
                <div className="application-info">
                  <h4>{proj.title}</h4>
                  <p>{proj.client}</p>
                  <p className="status">Status: Pending Approval</p>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
