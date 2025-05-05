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
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    level: [],
    budget: [],
  });

  const userId = localStorage.getItem('userId');

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

  const toggleFilter = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.project?.title?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filters.type.length === 0 || filters.type.includes(app.project?.category);

    const matchesBudget =
      filters.budget.length === 0 ||
      filters.budget.some((range) => {
        const [min, max] = range.replace('BHD', '').split('-').map(v => parseFloat(v.trim()));
        const rawBudget = app.project?.budget;

        if (!rawBudget) return false; // if no budget, don't match

        // If budget is a number, use directly
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
        return 'Pending'; // show 'Pending' styling but label will be 'Under Review'
      default:
        return 'Pending';
    }
  };
  

  return (
    <div className="my-applications-page">
      <Navbar links={NavConfig2} />
      <div className="my-applications-container">
        <aside className="my-applications-left-panel">
          <h1 className="page-title">My Applications</h1>

          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your applications by type, level, and budget.</p>

            <div className="filter-group">
              <h4>Type</h4>
              {['Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Design'].map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => toggleFilter('type', type)}
                  />
                  {type}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Budget</h4>
              {['20 - 50 BHD', '50 - 70 BHD', '80 - 100 BHD'].map((range) => (
                <label key={range}>
                  <input
                    type="checkbox"
                    checked={filters.budget.includes(range)}
                    onChange={() => toggleFilter('budget', range)}
                  />
                  {range}
                </label>
              ))}
            </div>
          </div>
        </aside>

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
