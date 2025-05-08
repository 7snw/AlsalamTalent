// src/Pages/Clients/SubmittedProjects.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../../Style/Clients/SubmittedProjects.css";
import Navbar from "../../Components/Navbar";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import SearchIcon from "../../Assets/search.png";
import Footer from '../../Components/Footer';
import axios from 'axios';

const SubmittedProjects = () => {
  const [search, setSearch] = useState("");
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?._id;

  useEffect(() => {
    const fetchSubmittedProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects/all');
        const allProjects = response.data;

        // ✅ Only projects submitted by this user and Completed
        const filtered = allProjects.filter(
          (proj) => proj.authorId === userId && proj.status === 'Completed'
        );
        setSubmittedProjects(filtered);
      } catch (error) {
        console.error('Error fetching submitted projects:', error);
      }
    };

    fetchSubmittedProjects();
  }, [userId]);

  const filteredProjects = submittedProjects.filter((project) =>
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
            {filteredProjects.map((proj) => (
              <motion.div
                className="submitted-project-card"
                key={proj._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                  transition: { duration: 0.2 },
                }}
                onClick={() => navigate(`/submitted-project/${proj._id}`)} // ✅ navigate correctly
              >
                {proj.imageUrl ? (
                  <img src={proj.imageUrl} alt={proj.title} />
                ) : (
                  <p>No image available</p>
                )}
                <div className="submitted-project-info">
                  <h5>{proj.title}</h5>
                  <p>{proj.authorName || 'Unknown'}</p>
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
