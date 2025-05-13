// src/Pages/Clients/AssignedProject.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../Style/Clients/AssignedProject.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';
import axios from 'axios';


const AssignedProject = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: [] });
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const clientId = user?._id;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assignments/by-author/${clientId}`);
        setAssignments(res.data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };
    fetchAssignments();
  }, [clientId]);

  const filteredAssignments = assignments.filter((assignment) => {
    const title = assignment.projectId?.title?.toLowerCase() || '';
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(assignment.status);
    return matchesSearch && matchesStatus;
  });

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const updated = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updated };
    });
  };

  const handleProjectClick = (assignment) => {
    if (assignment.status === 'Submitted') {
      navigate(`/submitted-project/${assignment._id}`);
    } else {
      navigate(`/assigned-project/${assignment._id}`);
    }
  };

  return (
    <div className="assigned-projects-page">
      <Navbar links={NavConfig3} />

      <div className="assigned-projects-container">
        <aside className="assigned-left-panel">
          <h1 className="page-title">Assigned Projects</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your assigned projects by their status.</p>
            <div className="filter-group">
              <h4>Status</h4>
              {['Assigned', 'Submitted', 'Completed', 'Re-submit', 'Declined'].map((status) => (

                <label key={status}>
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleCheckbox('status', status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="assigned-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="projects-grid">
            <AnimatePresence>
              {filteredAssignments.map((assignment) => (
                <motion.div
                  className="project-card"
                  key={assignment._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => handleProjectClick(assignment)}
                  style={{ cursor: 'pointer' }}
                >
                  {assignment.projectId?.imageUrl ? (
                    <img src={assignment.projectId.imageUrl} alt={assignment.projectId.title} />
                  ) : (
                    <p>No image available</p>
                  )}
                  <h4>{assignment.projectId?.title || 'Untitled'}</h4>
                  <p>{assignment.freelancerId?.fullName || 'Freelancer not found'}</p>
                  <span className="progress-text2">{assignment.status}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AssignedProject;
