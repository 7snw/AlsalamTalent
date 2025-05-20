// src/Pages/Freelancer/MyApplications.js

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Style/Freelancer/MyApplications.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import Footer from '../../Components/Footer';
import SearchIcon from '../../Assets/search.png';

const MyApplications = () => {
  const navigate = useNavigate();

  // State for storing applications, search text, and filters
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    level: [],
    budget: [],
  });

  // Get current user ID from local storage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  
  // Fetch all applications made by the freelancer
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/freelancer/${userId}/applications`);
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    fetchApplications();
  }, [userId]);

  // Filter applications based on search, type, and budget
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.project?.title?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filters.type.length === 0 || filters.type.includes(app.project?.category);

    const matchesBudget =
      filters.budget.length === 0 ||
      filters.budget.some((range) => {
        const [min, max] = range.replace('BHD', '').split('-').map(v => parseFloat(v.trim()));
        const rawBudget = app.project?.budget;

        if (!rawBudget) return false;

        const budgetValue =
          typeof rawBudget === 'number'
            ? rawBudget
            : parseFloat(rawBudget.replace('BHD', '').trim());

        return budgetValue >= min && budgetValue <= max;
      });

    return matchesSearch && matchesType && matchesBudget;
  });

  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'Approved';
      case 'cancelled':
        return 'Canceled';
      case 'under review':
        return 'Pending';
      default:
        return 'Pending';
    }
  };
  
  // Update filters when checkboxes are clicked
  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      const alreadySelected = updated[category]?.includes(value);

      updated[category] = alreadySelected
        ? updated[category].filter((v) => v !== value)
        : [...(updated[category] || []), value];

      return { ...updated };
    });
  };

  return (
    <div className="my-applications-page">
      <Navbar links={NavConfig2} />
      <div className="my-applications-container">

        {/* Filter Sidebar */}
        <aside className="my-applications-left-panel">
          <h1 className="page-title">My Applications</h1>

          <div className="filter-section">
            <h3>Filter</h3>
            <div className="filter-group">
              <p className="hint">Filter the projects according to their type and budget range.</p>
              <h4>Type</h4>
              {['Marketing', 'Graphic Design', 'Web Design', 'Illustration', 'Content Creation', 'Product Design'].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleCheckbox('type', type)}
                  />{' '}
                  {type}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Budget</h4>
              {['10 - 40 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((range) => (
                <label key={range}>
                  <input
                    type="checkbox"
                    checked={filters.budget.includes(range)}
                    onChange={() => handleCheckbox('budget', range)}
                  />{' '}
                  {range}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Applications List */}
        <main className="my-applications-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="my-applications-list">
            <AnimatePresence>
              {filteredApplications.map((app, index) => (
                <motion.div
                  className="my-application-card"
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => navigate(`/project-details/${app.project._id}`)}
                >
                  <img
                    src={app.project?.imageUrl || app.project?.coverImage || app.project?.image || ''}
                    alt={app.project?.title}
                  />
                  <div className="my-application-info">
                    <h4>{app.project?.title}</h4>
                    <p>{app.project?.budget ? `${app.project.budget} BHD` : '—'}</p>
                  </div>
                  <div className="my-application-actions">
                    <button className={getStatusClass(app.status)}>
                      {app.status === 'Under Review' ? 'Under Review' : app.status}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MyApplications;
