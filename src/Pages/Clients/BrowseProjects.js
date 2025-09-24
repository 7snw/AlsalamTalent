import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig3 } from "../../Data/NavbarConfigs";

import SearchIcon from "../../Assets/search.png";
import WavyBackground from "../../Components/WavyBackground";
/* Reuse freelancer AllProjects visual system */
import "../../Style/Clients/BrowseProjects.css";

const skillsOf = (proj) => {
  let raw = proj?.skills ?? proj?.requiredSkills ?? proj?.tags ?? [];
  if (typeof raw === "string") raw = raw.split(",");
  return (Array.isArray(raw) ? raw : [])
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .slice(0, 10);
};

const BrowseProjects = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const [showModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: [], budget: [] });

  // Fetch ONLY this client's projects
  useEffect(() => {
    const load = async () => {
      try {
        if (!userId) return;
        const { data } = await axios.get(
          `http://localhost:5000/api/projects/client/${userId}`
        );
        setProjects(data || []);
      } catch (e) {
        console.error("Error fetching projects:", e);
      }
    };
    load();
  }, [userId]);

  // Checkbox handler (type/budget)
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
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Filtering (same behavior as freelancer page)
  const filteredProjects = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return projects.filter((proj) => {
      const title = String(proj.title || "").toLowerCase();
      const projSkills = skillsOf(proj).map((s) => s.toLowerCase());

      const matchesSearch =
        !q || title.includes(q) || projSkills.some((s) => s.includes(q));

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

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [projects, debounced, filters]);

 

  return (
    <div className="ap-page">
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


      <div className="ap-container">
        {/* LEFT FILTER (dark panel look) */}
        <aside className="ap-filter">
          <h1 className="ap-title">
            <span className="ap-title-accent">My</span> Projects
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

        {/* RIGHT CONTENT */}
        <main className="ap-content">
          {/* Search pill */}
          <div className="ap-search">
            <input
              type="text"
              placeholder="Search project by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" />
          </div>

          {/* Cards grid */}
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

                  
                    {!!tags.length && (
                      <div className="ap-tags-marquee" aria-hidden>
                        <div className="ap-track" style={{ "--ap-speed": "6s" }}>
                          <div className="ap-strip">
                            {tags.map((t, ix) => (
                              <span className="ap-tag" key={`a-${ix}`}>{t}</span>
                            ))}
                          </div>
                          <div className="ap-strip" aria-hidden>
                            {tags.map((t, ix) => (
                              <span className="ap-tag" key={`b-${ix}`}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ap-meta">
                    <h4 className="ap-name">{proj.title}</h4>
                    <div className="ap-price">{proj.budget} BHD</div>
                  </div>

                  {/* (Removed bottom static tags row to avoid duplication) */}
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

export default BrowseProjects;
