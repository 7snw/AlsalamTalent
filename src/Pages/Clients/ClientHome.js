// src/Pages/ClientHome.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/Clients/ClientHome.css';
import '../../Style/Navbar.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../Components/Footer';
import axios from 'axios';

const ClientHome = () => {
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  

  const categories = ['All', 'Marketing', 'Graphic Design', 'Web Design', 'Illustration', 'Content Creation', 'Product Design'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects/all');
        setAllProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

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
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                className="project-card"
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                  transition: { duration: 0.2 },
                }}
                onClick={() => navigate(`/project-info/${project._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={project.imageUrl} alt={project.title} />
                <h4>{project.title}</h4>
                <p>{project.budget} BHD</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ClientHome;
