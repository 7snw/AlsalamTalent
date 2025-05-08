import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/FreelancersList.css";
import "../Style/Navbar.css";
import "../Style/PageContents.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";
import SearchIcon from "../Assets/search.png";
import DefaultUserIcon from "../Assets/ProfileImage.png";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Render full stars (1-5), always 5 stars total
const renderStars = (rating) => {
  const fullStars = Math.min(Math.max(parseInt(rating || 0), 1), 5);
  const emptyStars = 5 - fullStars;
  return (
    <>
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`}>★</span>
      ))}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`}>☆</span>
      ))}
    </>
  );
};

const FreelancersList = () => {
  const navigate = useNavigate();

  const [navbarConfig, setNavbarConfig] = useState(NavConfig2);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    expertise: [],
    rating: [],
  });
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role;
    if (role === "admin") setNavbarConfig(NavConfig4);
    else if (role === "client") setNavbarConfig(NavConfig3);
    else setNavbarConfig(NavConfig2);
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/freelancer/list")
      .then((response) => {
        setFreelancers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching freelancers:", error);
      });
  }, []);

  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((v) => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const nameMatch = freelancer.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const expertiseMatch = freelancer.expertise?.some((exp) =>
      exp.toLowerCase().includes(search.toLowerCase())
    );
    const matchesSearch = nameMatch || expertiseMatch;

    const matchesExpertiseFilter =
      filters.expertise.length === 0 ||
      freelancer.expertise?.some((exp) => filters.expertise.includes(exp));

    const intRating = Math.round(freelancer.rating || 5);
    const matchesRatingFilter =
      filters.rating.length === 0 ||
      filters.rating.includes(intRating.toString());

    return matchesSearch && matchesExpertiseFilter && matchesRatingFilter;
  });

  return (
    <div className="freelancer-page">
      <Navbar links={navbarConfig} />

      <div className="freelancer-container9">
        <div className="freelancer-content">
          {/* LEFT FILTER */}
          <div className="freelancer-left-panel">
            <h1 className="page-title">Freelancers</h1>
            <div className="filter-section">
              <h3>Filter</h3>
              <p className="hint">
                Filter your Freelancers according to their Expertise and Rating.
              </p>

              <div className="filter-group">
                <h4>Expertise</h4>
                {[
                  "Marketing Consultant",
                  "Graphic Designer",
                  "Illustrator",
                  "Video Editor",
                  "Web Developer",
                ].map((type) => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={filters.expertise.includes(type)}
                      onChange={() => handleFilterChange("expertise", type)}
                    />{" "}
                    {type}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h4>Rating</h4>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating}>
                    <input
                      type="checkbox"
                      checked={filters.rating.includes(rating.toString())}
                      onChange={() =>
                        handleFilterChange("rating", rating.toString())
                      }
                    />{" "}
                    {"★".repeat(rating)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SEARCH & RESULTS */}
          <div className="freelancer-results">
            <div className="search-wrapper9">
              <input
                type="text"
                placeholder="Who are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img src={SearchIcon} alt="Search" className="search-icon9" />
            </div>

            <AnimatePresence>
              {filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((freelancer, i) => (
                  <motion.div
                    className="freelancer-card"
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() =>
                      navigate(`/freelancerprofile/${freelancer._id}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className="freelancer-info">
                      <img
                        src={freelancer.profileImageUrl || DefaultUserIcon}
                        alt="user"
                        className="profile-icon"
                      />
                      <div>
                        <h3>{freelancer.fullName}</h3>
                        <p>
                          {freelancer.expertise?.join(", ") || "Freelancer"}
                        </p>
                      </div>
                    </div>

                    <div className="freelancer-meta">
                      <div className="rating">
                        {renderStars(freelancer.rating)}
                      </div>
                      <button
                        className="contact-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/messages", {
                            state: {
                              userToChat: {
                                _id: freelancer._id,
                                fullName: freelancer.fullName,
                                role: "freelancer",
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreelancersList;
