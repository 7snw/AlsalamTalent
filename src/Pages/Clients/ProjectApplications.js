// src/Pages/Clients/ProjectApplications.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../../Style/Clients/ProjectApplications.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

const ProjectApplications = () => {
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({ status: [] });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const clientId = user?._id;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/applications/by-author/${clientId}`);
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    if (clientId) fetchApplications();
  }, [clientId]);

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newValues = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: newValues };
    });
  };

  const handleAction = async (projectId, freelancerId, action) => {
    const actionLabel = action === "approve" ? "assign this freelancer" : "cancel this application";
    const confirmed = window.confirm(`Are you sure you want to ${actionLabel}? This action cannot be undone.`);

    if (!confirmed) return;

    try {
      await axios.post(
        `http://localhost:5000/api/applications/${projectId}/${action}`,
        { freelancerId, clientId }
      );

      const app = applications.find(
        (a) => a.project?.id === projectId && a.freelancer?.id === freelancerId
      );

      if (app && app.freelancer?.email && app.project?.title) {
        const notification = {
          userId: freelancerId,
          userType: "freelancer",
          email: app.freelancer.email,
          type: "info",
          subject: "",
          message: "",
        };

        if (action === "approve") {
          notification.subject = "You've been assigned!";
          notification.message = `You have been assigned to the project "${app.project.title}".`;
        } else {
          notification.subject = "Application Cancelled";
          notification.message = `Your application to "${app.project.title}" has been declined.`;
        }

        await axios.post("http://localhost:5000/api/notifications", notification);
      }

      // Update local state to reflect action
      setApplications((prev) =>
        prev.map((app) =>
          app.project?.id === projectId && app.freelancer?.id === freelancerId
            ? {
                ...app,
                status: action === "approve" ? "Assigned" : "Cancelled",
              }
            : app
        )
      );
    } catch (error) {
      console.error(`Error on ${action}:`, error);
    }
  };

  const filteredApps = applications.filter((app) => {
    const appStatus = app.status || 'Under Review'; 
    const matchesSearch = app.project?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filters.status.length === 0 || filters.status.includes(appStatus);
    return matchesSearch && matchesStatus;
  });
  

  return (
    <div className="project-applications-page">
      <Navbar links={NavConfig3} />
      <div className="project-applications-container">
        <aside className="applications-left-panel">
          <h1 className="page-title">Project Applications</h1>
          <div className="filter-section">
            <h3>Filter</h3>
            <p className="hint">Filter your projects by status.</p>

            <div className="filter-group">
              <h4>Status</h4>
              {['Under Review', 'Assigned', 'Cancelled'].map((status) => (
                <label key={status}>
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleFilter('status', status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="applications-right-panel">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by project title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="search" className="search-icon" />
          </div>

          <div className="applications-list">
            <AnimatePresence>
              {filteredApps.map((app, index) => (
                <motion.div
                  className="application-card"
                  key={app._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 },
                  }}
                >
                  <img src={app.project?.imageUrl} alt={app.project?.title} />
                  <div className="application-info">
                    <h4>{app.project?.title}</h4>
                    <p>
                      Freelancer:{" "}
                      <span
                        className="freelancer-link"
                        onClick={() =>
                          navigate(`/freelancerprofile/${app.freelancer.id}`)
                        }
                      >
                        {app.freelancer?.name}
                      </span>
                    </p>
                    <p>Status: {app.status || "Under Review"}</p>
                  </div>

                  <div className="application-actions">
                    {app.status === "Under Review" || !app.status ? (
                      <>
                        <button
                          className="assign"
                          onClick={() =>
                            handleAction(
                              app.project.id,
                              app.freelancer.id,
                              "approve"
                            )
                          }
                        >
                          Assign
                        </button>
                        <button
                          className="cancel"
                          onClick={() =>
                            handleAction(
                              app.project.id,
                              app.freelancer.id,
                              "reject"
                            )
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <p className={`status-label ${app.status.toLowerCase()}`}>
                        {app.status}
                      </p>
                    )}
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

export default ProjectApplications;
