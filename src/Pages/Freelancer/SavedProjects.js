// src/Pages/Freelancer/SavedProjects.js

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";
import axios from "axios";
import WavyBackground from "../../Components/WavyBackground";  
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig2 } from "../../Data/NavbarConfigs";

import SearchIcon from "../../Assets/search.png";

import "../../Style/Freelancer/SavedProjects.css";
import "../../Style/Navbar.css";
import "../../Style/PageContents.css";

const SavedProjects = () => {
  const navigate = useNavigate();

  // Current user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const [showModal] = useState(false);
  // State
  const [savedProjects, setSavedProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: [], budget: [] });

  // Fetch saved projects
  useEffect(() => {
    const fetchSavedProjects = async () => {
      try {
        if (!userId) return;
        const { data } = await axios.get(
          `http://localhost:5000/api/freelancer/${userId}/saved-projects`
        );
        setSavedProjects(data || []);
      } catch (error) {
        console.error("Error fetching saved projects:", error);
      }
    };
    fetchSavedProjects();
  }, [userId]);

  // Toggle filters
  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const list = prev[category] || [];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...prev, [category]: next };
    });
  };

  // Unsave (remove bookmark)
  const handleUnsave = async (e, projectId) => {
    e.stopPropagation();
    try {
      if (!userId) return;
      await axios.put(
        `http://localhost:5000/api/freelancer/${userId}/save-project`,
        { projectId }
      );
      setSavedProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Error unsaving project:", error);
    }
  };

  // Search + filters (memoized)
  const filteredProjects = useMemo(() => {
    return savedProjects.filter((proj) => {
      const matchesSearch = (proj.title || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        filters.type.length === 0 || filters.type.includes(proj.category);

      const matchesBudget =
        filters.budget.length === 0 ||
        filters.budget.some((range) => {
          const [min, max] = range
            .replace("BHD", "")
            .split("-")
            .map((v) => parseFloat(v.trim()));
          const rawBudget = proj.budget;
          if (rawBudget == null) return false;
          const value =
            typeof rawBudget === "number"
              ? rawBudget
              : parseFloat(String(rawBudget).replace("BHD", "").trim());
          return value >= min && value <= max;
        });

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [savedProjects, search, filters]);

  return (
    <div className="sp-page">
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
   

      <div className="sp-container">
        {/* LEFT FILTER */}
        <aside className="sp-filter">
          <h1 className="sp-title">
            <span className="sp-title-accent">Saved</span> Projects
          </h1>

          <div className="sp-filter-box">
            <h3 className="sp-filter-heading">Filter</h3>
            <p className="sp-filter-hint">
              Filter the projects according to their <br></br>type and reward range.
            </p>

            <div className="sp-filter-group">
              <h4 className="sp-filter-label">Type</h4>
              {[
                "Marketing",
  "Graphic Design",
  "Content Creation",
  "Product Design",
  "Web Design",
  "Photography",
  "Video & Motion",
  "Reports & Presentations"
              ].map((type) => (
                <label key={type} className="sp-check">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleCheckbox("type", type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            <div className="sp-filter-group">
              <h4 className="sp-filter-label">Reward</h4>
            {["BHD 10 - 40 ", "BHD 50 - 70 ", "BHD 80 - 100 "].map((range) => (
                <label key={range} className="sp-check">
                  <input
                    type="checkbox"
                    checked={filters.budget.includes(range)}
                    onChange={() => handleCheckbox("budget", range)}
                  />
                  <span>{range}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="sp-content">
          <div className="sp-search">
            <input
              type="text"
              placeholder="Search project by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" />
          </div>

          <div className="sp-grid">
              {filteredProjects.length === 0 ? (
    <h3 className="empty-title0">No saved projects yet.</h3>
  ) : (
    <>
            {filteredProjects.map((proj, index) => (
              <motion.div
                key={proj._id}
                className="sp-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                whileHover={{ y: -4, boxShadow: "0 10px 22px rgba(0,0,0,.14)" }}
                onClick={() => navigate(`/project-details/${proj._id}`)}
              >
                <div className="sp-thumb">
                  <img
                    src={proj.imageUrl || proj.image || proj.coverImage}
                    alt={proj.title}
                    loading="lazy"
                  />
                  {/* Bookmark on TOP-RIGHT over the image */}
                  <button
                    className="sp-save"
                    aria-label="Unsave project"
                    onClick={(e) => handleUnsave(e, proj._id)}
                    title="Remove from saved"
                  >
                    <FaBookmark />
                  </button>
                </div>

                <div className="sp-meta">
                  <h4 className="sp-name">{proj.title}</h4>
                  <div className="sp-price">BHD {proj.budget} </div>
                </div>
              </motion.div>
            ))}
              </>
  )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SavedProjects;
