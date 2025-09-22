import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig4 } from "../../Data/NavbarConfigs";
import WavyBackground from "../../Components/WavyBackground";
import SearchIcon from "../../Assets/search.png";

// ⬅️ Reuse the freelancer AllProjects styles for identical look
import "../../Style/Freelancer/AllProjects.css";
import "../../Style/Navbar.css";
import "../../Style/PageContents.css";

const AdminAllProjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: [], type: [], budget: [] });
  const [projects, setProjects] = useState([]);
  const [showModal] = useState(false);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects/all");
        setProjects(res.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const list = prev[category] || [];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...prev, [category]: next };
    });
  };

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesSearch = (proj.title || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const matchesType =
        filters.type.length === 0 || filters.type.includes(proj.category);

   const matchesBudget =
        filters.budget.length === 0 ||
        filters.budget.some((range) => {
          const [min, max] = range
            .replace("BHD", "")
            .split("-")
            .map((v) => parseFloat(v.trim()));
          const val =
            typeof proj.budget === "number"
              ? proj.budget
              : parseFloat(String(proj.budget).replace("BHD", "").trim());
          return val >= min && val <= max;
        });

      const matchesStatus =
        filters.status.length === 0 || filters.status.includes(proj.status);

      return matchesSearch && matchesType && matchesBudget && matchesStatus;
    });
  }, [projects, debouncedSearch, filters]);

  return (
    <div className="ap-page">
      <Navbar links={NavConfig4} />

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

      <div className="ap-container">
        {/* LEFT FILTER (same visual style as AllProjects) */}
        <aside className="ap-filter">
          <h1 className="ap-title">
            <span className="ap-title-accent">All</span> Projects
          </h1>

          <div className="ap-filter-box">
            <h3 className="ap-filter-heading">Filter</h3>
            <p className="ap-filter-hint">
              Filter the projects according to their status, type, and reward range.
            </p>

            <div className="ap-filter-group">
              <h4 className="ap-filter-label">Status</h4>
              {["Open", "Assigned", "Completed"].map((s) => (
                <label key={s} className="ap-check">
                  <input
                    type="checkbox"
                    checked={(filters.status || []).includes(s)}
                    onChange={() => handleCheckbox("status", s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            <div className="ap-filter-group">
              <h4 className="ap-filter-label">Type</h4>
              {[
            "Marketing",
  "Graphic Design",
  "Content Creation",
  "Product Design",
  "Web Design",
  "Photography",
  "Video & Motion",
  "Reports & Presentations"
              ].map((t) => (
                <label key={t} className="ap-check">
                  <input
                    type="checkbox"
                    checked={(filters.type || []).includes(t)}
                    onChange={() => handleCheckbox("type", t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>

            <div className="ap-filter-group">
              <h4 className="ap-filter-label">Reward</h4>
               {["BHD 10 - 40 ", "BHD 50 - 70 ", "BHD 80 - 100 "].map((r) => (
                <label key={r} className="ap-check">
                  <input
                    type="checkbox"
                    checked={filters.budget.includes(r)}
                    onChange={() => handleCheckbox("budget", r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT (cards styled like freelancer AllProjects) */}
        <main className="ap-content">
          <div className="ap-search">
            <input
              type="text"
              placeholder="Search project by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" />
          </div>

          <div className="ap-grid">
            {filteredProjects.map((proj, index) => (
              <motion.div
                key={proj._id}
                className="ap-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                whileHover={{ y: -4, boxShadow: "0 10px 22px rgba(0,0,0,.14)" }}
                onClick={() => navigate(`/project-details/${proj._id}`)}
              >
                <div className="ap-thumb">
                  <img
                    src={proj.imageUrl || proj.image || proj.coverImage}
                    alt={proj.title}
                    loading="lazy"
                  />
                </div>

                <div className="ap-meta">
                  <h4 className="ap-name">{proj.title}</h4>
                  <div className="ap-price">BHD {proj.budget} </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminAllProjects;
