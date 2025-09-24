import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig3 } from "../../Data/NavbarConfigs";

import SearchIcon from "../../Assets/search.png";
import WavyBackground from "../../Components/WavyBackground";

import "../../Style/Clients/AssignedProject.css";   

const AssignedProject = () => {
  const navigate = useNavigate();
  const [showModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: [] }); // status filters
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const clientId = storedUser?._id;
        if (!clientId) return;

        const { data } = await axios.get(
          `http://localhost:5000/api/assignments/by-author/${clientId}`
        );
        setAssignments(data || []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };
    fetchAssignments();
  }, []);

  const handleCheckbox = (value) => {
    setFilters((prev) => {
      const next = prev.type.includes(value)
        ? prev.type.filter((v) => v !== value)
        : [...prev.type, value];
      return { ...prev, type: next };
    });
  };

  const filtered = assignments.filter((a) => {
    const title = (a.projectId?.title || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesType =
      filters.type.length === 0 || filters.type.includes(a.status);
    return matchesSearch && matchesType;
  });

  // Always open the single review/details page
  const openAssignment = (assignmentId) =>
    navigate(`/submitted-project/${assignmentId}`);

  return (
    <div className="as-page">
      <Navbar links={NavConfig3} />

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

      <div className="as-container">
        {/* LEFT FILTER */}
        <aside className="as-filter">
          <h1 className="as-title">
            <span className="as-title-accent">Assigned</span> Projects
          </h1>

          <div className="as-filter-box">
            <h3 className="as-filter-heading">Filter</h3>
            <p className="as-filter-hint">
              Filter your projects according to <br />
              their progress.
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
                {filtered.length === 0 ? (
    <h3 className="empty-title6">No projects assigned yet.</h3>
  ) : (
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  key={a._id || i}
                  className="as-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  whileHover={{ y: -4, boxShadow: "0 10px 22px rgba(0,0,0,.14)" }}
                  onClick={() => openAssignment(a._id)}
                >
                  <div className="as-thumb">
                    <img
                      src={
                        a.projectId?.imageUrl ||
                        a.projectId?.image ||
                        a.projectId?.coverImage
                      }
                      alt={a.projectId?.title || "Project"}
                      loading="lazy"
                    />
                  </div>

                  <div className="as-meta">
                    <h4 className="as-name">{a.projectId?.title}</h4>
                    <span
                      className={`as-status ${String(a.status || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {a.status}
                    </span>
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

export default AssignedProject;
