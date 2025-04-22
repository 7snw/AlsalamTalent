import React, { useState } from 'react'; 
import '../../Style/Freelancer/MyProjects.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import { useNavigate } from 'react-router-dom';
import ProjectsData from '../../Data/ProjectsData';
import SearchIcon from '../../Assets/search.png';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../Components/Footer';

const MyProjects = () => {
  const navigate = useNavigate();
  const referenceProjects = ProjectsData.deitailes;
  const [search, setSearch] = useState('');

  const filteredProjects = referenceProjects
    .filter((proj) =>
      proj.title.toLowerCase().includes(search.toLowerCase())
    )
    .map((proj) => ({
      ...proj,
      progress: proj.progress !== '0%' ? proj.progress : undefined,
    }));

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
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="my-projects-grid">
            <AnimatePresence>
              {filteredProjects.map((project, i) => (
                <motion.div
                  className="my-project-card"
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => navigate(`/submit-project/${i}`)}
                >
                  <img src={project.image} alt={project.name} />
                  <h4>{project.title}</h4>
                  <p>{project.budget}</p>
                  {project.progress && <span className="progress-text">{project.progress}</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default MyProjects;
