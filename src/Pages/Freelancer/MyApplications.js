// src/Pages/Freelancer/MyApplications.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig2 } from "../../Data/NavbarConfigs";

import SearchIcon from "../../Assets/search.png";
import WavyBackground from "../../Components/WavyBackground"; 

import "../../Style/Freelancer/MyApplications.css";
import "../../Style/Navbar.css";
import "../../Style/PageContents.css";

const MyApplications = () => {
  const navigate = useNavigate();

  // State
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ status: [] });;
  const [showModal] = useState(false);
  // Current user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;

  // Fetch all applications for this freelancer
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/freelancer/${userId}/applications`
        );
        setApplications(res.data || []);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    if (userId) fetchApplications();
  }, [userId]);

    const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const list = prev[category] || [];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...prev, [category]: next };
    });
  };

 

  // Status → pill class
  const getStatusClass = (status = "") => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "Approved";
      case "cancelled":
        return "Canceled";
      case "under review":
        return "Pending";
      default:
        return "Pending";
    }
  };

   // Filtered list
  const filtered = applications.filter((a) => {
    const stat = a.status || "Under Review";
    const title = (a.project?.title || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(stat);
    return matchesSearch && matchesStatus;
  });




  return (
    <div className="ma-page">
      <Navbar links={NavConfig2} />

      
             <WavyBackground
            colors={["#111c2f", "#111c2f", "#111c2f", "#111c2f"]}
            waveOpacity={0.85}
            waveWidth={450}
            blur={0}
            speed="fast"
            accentColors={["#f1633a", "#9FD8FF"]}
            accentWidth={3}
            accentOpacity={0.5}
            accentVertical={-220}
            accentSpacing={12}
        
  containerClassName={`fh-bg ${showModal ? "is-paused" : ""}`}

  paused={showModal}
  speedOverride={showModal ? 0 : undefined}
          />
         
      <div className="ma-container">
        {/* LEFT FILTER */}
        <aside className="ma-filter">
          <h1 className="ma-title1">
           My Applications
          </h1>

          <div className="ma-filter-box1">
            <h3 className="ma-filter-heading">Filter</h3>
            <p className="ma-filter-hint">
             Filter your applications by status.</p>
           

            <div className="ma-filter-group">
            <h4 className="ma-filter-label">Status</h4>
              {["Under Review", "Assigned", "Cancelled"].map((s) => (
                <label key={s} className="ma-check">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(s)}
                    onChange={() => toggleFilter("status", s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>

          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="ma-content">
          <div className="ma-search">
            <input
              type="text"
              placeholder="Search project by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" />
          </div>

          <div className="ma-list">
             {filtered.length === 0 ? (
    <h3 className="empty-title4">No project applications yet.</h3>
  ) : (
            <AnimatePresence>
              {filtered.map((app, index) => (
                <motion.div
                  className="ma-card"
              
                  onClick={() => navigate(`/project-details/${app.project._id}`)}
                >
                  <img
                    className="ma-thumb"
                    src={
                      app.project?.imageUrl ||
                      app.project?.coverImage ||
                      app.project?.image ||
                      ""
                    }
                    alt={app.project?.title || "Project"}
                    loading="lazy"
                  />

                  <div className="ma-info">
                    <h4>{app.project?.title}</h4>
                    <p>
                      {app.project?.budget || app.project?.budget === 0
                        ? `BHD ${app.project.budget} `
                        : "—"}
                    </p>
                  </div>

                  <div className="ma-actions">
                    <button className={getStatusClass(app.status)}>
                      {app.status === "Under Review" ? "Under Review" : app.status}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
  )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MyApplications;
