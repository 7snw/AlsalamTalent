// src/Pages/Clients/SubmittedProjects.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../../Style/Clients/SubmittedProjects.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import SearchIcon from "../../Assets/search.png";
import projectsData from "../../Data/ProjectsData";
import Footer from '../../Components/Footer';

const SubmittedProjects = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
          <AnimatePresence>
            {filteredProjects.map((proj, index) => (
              <motion.div
                className="submitted-project-card"
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                  transition: { duration: 0.2 },
                }}
                onClick={() => navigate(`/submitted-project/${index}`)}
              >
                <img src={proj.image} alt={proj.title} />
                <div className="submitted-project-info">
                  <h5>{proj.title}</h5>
                  <p>{proj.name}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubmittedProjects;
