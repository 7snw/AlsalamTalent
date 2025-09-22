import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/FreelancersList.css";
import "../Style/Navbar.css";
import "../Style/PageContents.css";
import WavyBackground from "../Components/WavyBackground";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";


import SearchIcon from "../Assets/search.png";
import DefaultUserIcon from "../Assets/ProfileImage.png";

import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const renderStars = (rating) => {
  const full = Math.min(Math.max(parseInt(rating || 0, 10), 1), 5);
  const empty = 5 - full;
  return (
    <>
      {Array.from({ length: full }, (_, i) => (
        <span key={`full-${i}`}>★</span>
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`empty-${i}`}>☆</span>
      ))}
    </>
  );
};

const FreelancersList = () => {
  const navigate = useNavigate();
  const [showModal] = useState(false);
  const [navbarConfig, setNavbarConfig] = useState(NavConfig2);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ expertise: [], rating: [] });
  const [freelancers, setFreelancers] = useState([]);

  // Navbar role
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role;
    if (role === "admin") setNavbarConfig(NavConfig4);
    else if (role === "client") setNavbarConfig(NavConfig3);
    else setNavbarConfig(NavConfig2);
  }, []);

  // Data
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/freelancer/list")
      .then((res) => {
        const verified = (res.data || []).filter((f) => f.isVerified === true);
        setFreelancers(verified);
      })
      .catch((err) => console.error("Error fetching freelancers:", err));
  }, []);

  // Filters
  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const list = prev[category] || [];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...prev, [category]: next };
    });
  };

  const filteredFreelancers = freelancers.filter((f) => {
    const nameMatch = f.fullName?.toLowerCase().includes(search.toLowerCase());
    const expertiseMatch = f.expertise?.some((e) =>
      e.toLowerCase().includes(search.toLowerCase())
    );
    const matchesSearch = nameMatch || expertiseMatch;

    const matchesExpertise =
      filters.expertise.length === 0 ||
      f.expertise?.some((e) => filters.expertise.includes(e));

    const intRating = Math.round(f.rating || 5);
    const matchesRating =
      filters.rating.length === 0 ||
      filters.rating.includes(intRating.toString());

    return matchesSearch && matchesExpertise && matchesRating;
  });

  return (
    <div className="fl-page">
      <Navbar links={navbarConfig} />
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
      <div className="fl-container">
        {/* LEFT FILTER */}
        <aside className="fl-filter">
          <h1 className="fl-title">
            <span className="fl-title-accent">Freelancers</span>
          </h1>

          <div className="fl-filter-box">
            <h3 className="fl-filter-heading">Filter</h3>
            <p className="fl-filter-hint">
              Filter your Freelancers according <br></br>  to their Expertise and Rating.
            </p>

            <div className="fl-filter-group">
              <h4 className="fl-filter-label">Expertise</h4>
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
                <label key={type} className="fl-check">
                  <input
                    type="checkbox"
                    checked={filters.expertise.includes(type)}
                    onChange={() => handleFilterChange("expertise", type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

          <div className="fl-filter-group">
  <h4 className="fl-filter-label">Rating</h4>
  {[5, 4, 3, 2, 1].map((r) => (
    <label key={r} className="fl-check fl-stars-option">
      <input
        type="checkbox"
        checked={filters.rating.includes(r.toString())}
        onChange={() => handleFilterChange("rating", r.toString())}
      />
      <span className="fl-stars-inline">{"★".repeat(r)}</span>
    </label>
  ))}
</div>

          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="fl-content">
          <div className="fl-search">
            <input
              type="text"
              placeholder="Search freelancers by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" />
          </div>

          <div className="fl-list">
            <AnimatePresence>
              {filteredFreelancers.length ? (
                filteredFreelancers.map((f, i) => (
                  <motion.div
                    key={f._id || i}
                    className="fl-card1"
                   
                    onClick={() => navigate(`/freelancerprofile/${f._id}`)}
                  >
                    <div className="fl-info">
                      <img
                        src={f.profileImageUrl || DefaultUserIcon}
                        alt="profile"
                        className="fl-avatar"
                      />
                      <div className="fl-text">
                        <h3>{f.fullName}</h3>
                        <p>{f.expertise?.join(", ") || "Freelancer"}</p>
                      </div>
                    </div>

                    <div className="fl-meta">
                      <div className="fl-stars">{renderStars(f.rating)}</div>
                      <button
                        className="fl-contact"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/messages", {
                            state: {
                              userToChat: {
                                _id: f._id,
                                fullName: f.fullName,
                                role: "freelancer",
                                profileImageUrl: f.profileImageUrl,
                              },
                            },
                          });
                        }}
                      >
                        Get in touch
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p>No freelancers found matching your search and filters.</p>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default FreelancersList;
