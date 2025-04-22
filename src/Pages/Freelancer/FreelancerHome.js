import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../Style/Freelancer/FreelancerHome.css';
import '../../Style/Navbar.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import ProjectsData from '../../Data/ProjectsData';
import Footer from '../../Components/Footer';

const FreelancerHome = () => {
  const navigate = useNavigate();
  const allProjects = ProjectsData.deitailes;
  const [savedProjects, setSavedProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedProjects')) || [];
    setSavedProjects(stored);
  }, []);

  const isProjectSaved = (project) => {
    return savedProjects.some(p => p.title === project.title);
  };

  const handleBookmarkClick = (e, project) => {
    e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem('savedProjects')) || [];
    const isSaved = stored.find(p => p.title === project.title);

    let updated;
    if (isSaved) {
      updated = stored.filter(p => p.title !== project.title);
    } else {
      updated = [...stored, project];
    }

    setSavedProjects(updated);
    localStorage.setItem('savedProjects', JSON.stringify(updated));
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
                onClick={() => navigate(`/project-details/${index}`)}
              >
                <img src={project.image || project.coverImage} alt={project.title} />
                <h4>{project.title}</h4>
                <p>{project.budget}</p>
                <span className="bookmark" onClick={(e) => handleBookmarkClick(e, project)}>
                  {isProjectSaved(project) ? <FaBookmark /> : <FaRegBookmark />}
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
