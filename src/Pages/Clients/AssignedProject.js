import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Style/Clients/AssignedProject.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import projectsData from '../../Data/ProjectsData'; 

const AssignedProject = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ ongoing: false, completed: false });

  const handleCheckboxChange = (type) => {
    setFilters({ ...filters, [type]: !filters[type] });
  };

  const filteredProjects = projectsData.assigned.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      (!filters.ongoing && !filters.completed) ||
      (filters.ongoing && project.status === 'ongoing') ||
      (filters.completed && project.status === 'completed');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="assigned-project-page">
      <Navbar links={NavConfig3} />
      <div className="assigned-container">
        <h2 className="page-title">Assigned Projects</h2>

        <div className="assigned-layout">
          <aside className="filter-section">
            <h4>Filter</h4>
            <p>Filter your assigned project according to their completion progress.</p>
            <label>
              <input
                type="checkbox"
                checked={filters.ongoing}
                onChange={() => handleCheckboxChange('ongoing')}
              />
              Ongoing
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.completed}
                onChange={() => handleCheckboxChange('completed')}
              />
              Completed
            </label>
          </aside>

          <main className="project-section">
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
                <Link to={`/assigned-project/${index}`} className="project-card" key={index}>
                <img src={proj.image} alt={proj.title} />
                <div className="project-info">
                  <h5>{proj.title}</h5>
                  <p>{proj.name}</p>
                </div>
              </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AssignedProject;
