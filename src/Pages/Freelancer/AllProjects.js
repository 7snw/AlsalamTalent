import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import axios from "axios";

import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig2 } from "../../Data/NavbarConfigs";
import WavyBackground from "../../Components/WavyBackground";
import SearchIcon from "../../Assets/search.png";

import "../../Style/Freelancer/AllProjects.css";
import "../../Style/Navbar.css";
import "../../Style/PageContents.css";

const skillsOf = (proj) => {
  let raw = proj?.skills ?? proj?.requiredSkills ?? proj?.tags ?? [];
  if (typeof raw === "string") raw = raw.split(",");
  return (Array.isArray(raw) ? raw : [])
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .slice(0, 10);
};

const AllProjects = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const [showModal] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: [], budget: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ⬇️ IMPORTANT: ask backend to hide Completed for freelancers
        const [projectsRes, savedRes] = await Promise.all([
          axios.get("http://localhost:5000/api/projects/all?audience=freelancer"),
          userId
            ? axios.get(`http://localhost:5000/api/freelancer/${userId}/saved-projects`)
            : Promise.resolve({ data: [] }),
        ]);

        // Extra safety: also drop Completed in the client (in case of legacy data)
        const clean = (projectsRes.data || []).filter(
          (p) => String(p.status || "").toLowerCase() !== "completed"
        );

        setAllProjects(clean);
        setSavedProjects((savedRes.data || []).map((p) => p._id));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [userId]);

  const handleCheckbox = (category, value) => {
    setFilters((prev) => {
      const list = prev[category] || [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [category]: next };
    });
  };

  const isProjectSaved = (id) => savedProjects.includes(id);

  const handleBookmarkClick = async (e, projectId) => {
    e.stopPropagation();
    try {
      if (!userId) return;
      await axios.put(`http://localhost:5000/api/freelancer/${userId}/save-project`, { projectId });
      setSavedProjects((prev) =>
        prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
      );
    } catch (err) {
      console.error("Error updating saved projects:", err);
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filteredProjects = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return allProjects.filter((proj) => {
      // (Double safety) never show Completed
      if (String(proj.status || "").toLowerCase() === "completed") return false;

      const title = (proj.title || "").toLowerCase();
      const projSkills = skillsOf(proj).map((s) => s.toLowerCase());

      const matchesSearch = !q || title.includes(q) || projSkills.some((s) => s.includes(q));
      const matchesType = filters.type.length === 0 || filters.type.includes(proj.category);
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

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [allProjects, debouncedSearch, filters]);

  return (
    <div className="ap-page">
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

      <div className="ap-container">
        <aside className="ap-filter">
          <h1 className="ap-title">
            <span className="ap-title-accent">All</span> Projects
          </h1>
          <div className="ap-filter-box">
            <h3 className="ap-filter-heading">Filter</h3>
            <p className="ap-filter-hint">
              Filter the projects according to
              <br /> their type and reward range.
            </p>

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
                    checked={filters.type.includes(t)}
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
            {filteredProjects.map((proj, i) => {
              
              const tags = skillsOf(proj);
              
              return (
                <motion.div
                  key={proj._id}
                  className="ap-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  whileHover={{ y: -4, boxShadow: "0 10px 22px rgba(0,0,0,.14)" }}
                  onClick={() => navigate(`/project-details/${proj._id}`)}
                >
                  <div className="ap-thumb">
                    <img
                      src={proj.imageUrl || proj.image || proj.coverImage}
                      alt={proj.title}
                      loading="lazy"
                    />
                    <button
                      className="ap-save"
                      aria-label="Save project"
                      onClick={(e) => handleBookmarkClick(e, proj._id)}
                    >
                      {isProjectSaved(proj._id) ? <FaBookmark /> : <FaRegBookmark />}
                    </button>

                    {!!tags.length && (
                      <div className="ap-tags-marquee" aria-hidden>
                        <div className="ap-track" style={{ "--ap-speed": "6s" }}>
                          <div className="ap-strip">
                            {tags.map((t, ix) => (
                              <span className="ap-tag" key={`a-${ix}`}>
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="ap-strip" aria-hidden>
                            {tags.map((t, ix) => (
                              <span className="ap-tag" key={`b-${ix}`}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ap-meta">
                    <h4 className="ap-name">{proj.title}</h4>
                    <div className="ap-price">BHD {proj.budget} </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AllProjects;
