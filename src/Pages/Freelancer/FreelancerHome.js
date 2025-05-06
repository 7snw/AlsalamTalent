// Updated FreelancerHome.js

import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/FreelancerHome.css';
import '../../Style/Navbar.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

const FreelancerHome = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const [allProjects, setAllProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await axios.get('http://localhost:5000/api/projects/all');
        setAllProjects(projectsRes.data);

        if (userId) {
          const savedRes = await axios.get(`http://localhost:5000/api/freelancer/${userId}/saved-projects`);
          setSavedProjects(savedRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const isProjectSaved = (projectId) => {
    return savedProjects.some(p => p._id === projectId);
  };

  const handleBookmarkClick = async (e, projectId) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:5000/api/freelancer/${userId}/save-project`, { projectId });
      const res = await axios.get(`http://localhost:5000/api/freelancer/${userId}/saved-projects`);
      setSavedProjects(res.data);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const categories = ['All', 'Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Design'];

  const filteredProjects = allProjects.filter((proj) => {
    const matchesCategory = activeCategory === 'All' || proj.category === activeCategory;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="freelancer-home">
      <div className="freelancer-container">
        <Navbar links={NavConfig2} />

        <header className="hero">
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
          <div className="categories9">
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

        <section className="project-gridd">
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
                onClick={() => navigate(`/project-details/${project._id}`)}
              >
                <img src={project.imageUrl || project.image || project.coverImage} alt={project.title} />
                <h4>{project.title}</h4>
                <p>{project.budget} BHD</p>
                <span className="bookmark" onClick={(e) => handleBookmarkClick(e, project._id)}>
                  {isProjectSaved(project._id) ? <FaBookmark /> : <FaRegBookmark />}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>
      <Footer/>
    </div>
  );
};

export default FreelancerHome;
