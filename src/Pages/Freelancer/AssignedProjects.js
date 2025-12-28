// src/Pages/Freelancer/AssignedProjects.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
 
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig2 } from "../../Data/NavbarConfigs";
import SearchIcon from "../../Assets/search.png";


import "../../Style/Freelancer/MyProjects.css";
import "../../Style/Navbar.css";
import "../../Style/PageContents.css";

const AssignedProjects = () => {
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: [] }); // status filters
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const freelancerId = storedUser?._id;
        const { data } = await axios.get(
          `http://localhost:5000/api/assignments/by-freelancer/${freelancerId}`
        );
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleCheckbox = (value) => {
    setFilters((prev) => {
      const next = prev.type.includes(value)
        ? prev.type.filter((v) => v !== value)
        : [...prev.type, value];
      return { ...prev, type: next };
    });
  };

  const filteredProjects = projects.filter((proj) => {
    const title = (proj.projectId?.title || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesType =
      filters.type.length === 0 || filters.type.includes(proj.status);
    return matchesSearch && matchesType;
  });

  const openProject = (assignmentId) => navigate(`/my-project/${assignmentId}`);

  return (
    <div className="as-page">
      <Navbar links={NavConfig2} />
  

      <div className="as-container">
        {/* LEFT FILTER */}
        <aside className="as-filter">
          <h1 className="as-title1">
           Assigned Projects
          </h1>

          <div className="as-filter-box1">
            <h3 className="as-filter-heading">Filter</h3>
            <p className="as-filter-hint">
              Filter your projects according to <br />their progress.
            </p>

            <div className="as-filter-group">
              <h4 className="as-filter-label">Status</h4>
              {[
                "Assigned",
                "Submitted",
                "Re-submitted",
                "Requested Revision",
                "Completed",
                "Declined",
              ].map((type) => (
                <label key={type} className="as-check">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleCheckbox(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="as-content">
          <div className="as-search">
            <input
              type="text"
              placeholder="Search project by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" />
          </div>

          <div className="as-grid">
            {filteredProjects.length === 0 ? (
    <h3 className="empty-title2">No assigned projects yet.</h3>
  ) : (
            <AnimatePresence>
              
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project._id || i}
                  className="as-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  whileHover={{ y: -4, boxShadow: "0 10px 22px rgba(0,0,0,.14)" }}
                  onClick={() => openProject(project._id)}
                >
                  <div className="as-thumb">
                    <img
                      src={
                        project.projectId?.imageUrl ||
                        project.projectId?.image ||
                        project.projectId?.coverImage
                      }
                      alt={project.projectId?.title || "Project"}
                      loading="lazy"
                    />
                  </div>

                  <div className="as-meta">
                    <h4 className="as-name">{project.projectId?.title}</h4>
                    <span
                      className={`as-status ${String(project.status || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {project.status}
                    </span>
                  </div>
                </motion.div>
              )
              )}  
            </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AssignedProjects;
