import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { motion } from "framer-motion";
import axios from "axios";
import PersistentAlert from "../../Components/PersistentAlert";

import WavyBackground from "../../Components/WavyBackground";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig2 } from "../../Data/NavbarConfigs";
import { showAlert } from "../../utils/toastMessages";

import SearchIcon from "../../Assets/search.png";
import MatchIcon from "../../Assets/matchIcon.png";
import ProjectsIcon from "../../Assets/projectsIcon.png";
import CampaignIcon from "../../Assets/campaignIcon.png";
import "../../Style/Freelancer/FreelancerHome.css";

/* ---------- helpers ---------- */

const getType = (p) =>
  String(p?.projectType || p?.type || "project").trim().toLowerCase();

const FreelancerHome = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;

  const MATCH_ICON = MatchIcon;
  const PROJECTS_ICON = ProjectsIcon;
  const CAMPAIGNS_ICON = CampaignIcon;
const [welcomeAlert, setWelcomeAlert] = useState("");

  const [allProjects, setAllProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [matchedProjects, setMatchedProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState("projects");

  const categories = [
    "All",
    "Marketing",
    "Graphic Design",
    "Content Creation",
    "Product Design",
    "Web Design",
    "Photography",
    "Video & Motion",
    "Reports & Presentations",
  ];

 
    /* ---------------- FIRST LOGIN ALERT ---------------- */
  /* ---------------- FIRST LOGIN ALERT ---------------- */
useEffect(() => {
  const justRegistered = localStorage.getItem("cz_just_registered");
  if (justRegistered === "1") {
    setWelcomeAlert("Welcome to ctrlZ! Please complete your profile and portfolio to get personalized project matches.");
    localStorage.removeItem("cz_just_registered");
  }
}, []);

useEffect(() => {
  const checkProfile = async () => {
    const justRegistered = localStorage.getItem("cz_just_registered");
    if (!justRegistered) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const { data } = await axios.get(`http://localhost:5000/api/freelancer/${user._id}`);
      if (!data.portfolio?.length || !data.bio) {
        showAlert("Welcome to ctrlZ! Please complete your profile and portfolio to get personalized project matches.");
      }
    } catch (err) {
      console.error("Error checking profile completeness:", err);
    } finally {
      localStorage.removeItem("cz_just_registered");
    }
  };
  checkProfile();
}, []);


  /* ---------------- DATA FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await axios.get(
          "http://localhost:5000/api/projects/all?audience=freelancer"
        );
        setAllProjects(projectsRes.data || []);

        if (userId) {
          const savedRes = await axios.get(
            `http://localhost:5000/api/freelancer/${userId}/saved-projects`
          );
          setSavedProjects(savedRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    document.body.classList.add("has-page-waves");
    return () => document.body.classList.remove("has-page-waves");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("fh-modal-open", showModal);
  }, [showModal]);

  // replace your current helper
  const isProjectSaved = (projectId) =>
    savedProjects.some((p) => String(p._id) === String(projectId));

  const toggleSave = async (e, projectId) => {
    e?.stopPropagation?.();

    if (!userId) {
      showAlert("Please sign in to save projects.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/freelancer/${userId}/save-project`,
        { projectId }
      );
      const res = await axios.get(
        `http://localhost:5000/api/freelancer/${userId}/saved-projects`
      );
      setSavedProjects(res.data || []);
    } catch (error) {
      console.error("Error toggling save:", error);
      showAlert("Could not update saved state. Please try again.");
    }
  };

  const handleMatchClick = async () => {
    try {
      if (!userId) {
        showAlert("Please sign in to find your match.");
        return;
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/projects/match/${userId}`
      );

      if (!data?.length) {
        showAlert(
          "No matched projects found. Try adding more expertise/skills in your profile."
        );
        return;
      }

      setMatchedProjects(data);
      setSelectedIndex(0);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching matched projects:", err);
      showAlert("Error fetching matched projects. Please try again.");
    }
  };

  const selectedProject = matchedProjects[selectedIndex];
  const closeModal = () => setShowModal(false);
  const nextProject = () =>
    setSelectedIndex((p) => (p + 1) % matchedProjects.length);
  const prevProject = () =>
    setSelectedIndex(
      (p) => (p - 1 + matchedProjects.length) % matchedProjects.length
    );

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const baseFiltered = useMemo(() => {
    return allProjects.filter((proj) => {
      if (String(proj.status).toLowerCase() === "completed") return false;
      const matchesCategory =
        activeCategory === "All" || proj.category === activeCategory;
      const title = (proj.title || "").toLowerCase();
      const matchesSearch = title.includes(debouncedSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allProjects, activeCategory, debouncedSearch]);

  const campaignsOnly = useMemo(
    () => baseFiltered.filter((p) => getType(p) === "campaign"),
    [baseFiltered]
  );
  const projectsOnly = useMemo(
    () => baseFiltered.filter((p) => getType(p) !== "campaign"),
    [baseFiltered]
  );

  // ① Card now accepts `frozen`
  const Card = ({ project, index, frozen }) => {


    return (
      <motion.div
        className="fh-card"
        key={project._id}
        initial={frozen ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          frozen
            ? { duration: 0 }
            : { duration: 0.3, delay: index * 0.02 }
        }
        whileHover={
          frozen
            ? undefined
            : { y: -4, boxShadow: "0 8px 22px rgba(0,0,0,0.16)" }
        }
        style={{ willChange: frozen ? "auto" : "transform" }}
        onClick={() => navigate(`/project-details/${project._id}`)}
      >
        <div className="fh-thumb">
          <img
            src={project.imageUrl || project.image || project.coverImage}
            alt={project.title}
            loading="lazy"
          />
         

          <button
            className="fh-save"
            onClick={(e) => toggleSave(e, project._id)}
            aria-label={
              isProjectSaved(project._id) ? "Unsave project" : "Save project"
            }
            aria-pressed={isProjectSaved(project._id)}
          >
            {isProjectSaved(project._id) ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>

        <div className="fh-meta">
          <h4 className="fh-name">{project.title}</h4>
          <div className="fh-price">BHD {project.budget} </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fh-root">
      <WavyBackground
        colors={["#111c2f", "#111c2f", "#111c2f", "#111c2f"]}
        waveOpacity={0.8}
        waveWidth={400}
        blur={0}
        speed="fast"
        accentColors={["#f1633a", "#9FD8FF"]}
        accentWidth={3}
        accentOpacity={0.4}
        accentVertical={-180}
        accentSpacing={10}
        containerClassName={`fh-bg ${showModal ? "is-paused" : ""}`}
        paused={showModal}
        speedOverride={showModal ? 0 : undefined}
      />

      <div className="fh-content">
        <div className="fh-container">
          <Navbar links={NavConfig2} />
          <PersistentAlert
  message={welcomeAlert}
  onClose={() => setWelcomeAlert("")}
/>

          <header className="fh-hero">
            <div className="fh-hero-inner">
              <h1 className="fh-title1">
                <span className="fh-title-accent1">Explore</span> Real-World
                Projects
              </h1>
              <p className="fh-sub">
                Take on your next project, build your portfolio, and develop
                your skills.
              </p>

              <div className="fh-links">
                <button className="fh-link" onClick={handleMatchClick}>
                  <img src={MATCH_ICON} alt="" className="fh-link-ico" />
                  <span>Find your Match</span>
                </button>

                <button
                  className={`fh-link ${
                    viewMode === "projects" ? "is-active" : ""
                  }`}
                  onClick={() => setViewMode("projects")}
                >
                  <img src={PROJECTS_ICON} alt="" className="fh-link-ico" />
                  <span>All Projects</span>
                </button>

                <button
                  className={`fh-link ${
                    viewMode === "campaigns" ? "is-active" : ""
                  }`}
                  onClick={() => setViewMode("campaigns")}
                >
                  <img src={CAMPAIGNS_ICON} alt="" className="fh-link-ico" />
                  <span>Project Campaigns</span>
                </button>
              </div>

              <div className="fh-search">
                <input
                  type="text"
                  placeholder="Search project by title…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <img src={SearchIcon} alt="Search" />
              </div>
            </div>
          </header>

          <div className="fh-cats">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`fh-cat ${
                  activeCategory === cat ? "is-active" : ""
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <section className="fh-catalog">
            {viewMode === "campaigns" ? (
              campaignsOnly.length ? (
                <div className="fh-grid">
                  {campaignsOnly.map((project, index) => (
                    <Card
                      key={project._id}
                      project={project}
                      index={index}
                      frozen={showModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="fh-empty">
                  <h3>Campaigns</h3>
                  <p>No project campaigns found.</p>
                </div>
              )
            ) : (
              <div className="fh-grid">
                {projectsOnly.map((project, index) => (
                  <Card
                    key={project._id}
                    project={project}
                    index={index}
                    frozen={showModal}
                  />
                ))}
              </div>
            )}
          </section>

          {showModal && matchedProjects.length > 0 && selectedProject && (
            <div className="fh-modal" onClick={closeModal}>
              <div className="fh-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="fh-modal-body">
                  <img
                    src={
                      selectedProject.imageUrl ||
                      selectedProject.image ||
                      selectedProject.coverImage
                    }
                    alt={selectedProject.title}
                  />
                  <h2>{selectedProject.title}</h2>
                  <p>
                    <strong>Your Reward:</strong> {selectedProject.budget} BHD
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedProject.category}
                  </p>
                  <p className="fh-brief">
                    <strong>Brief:</strong> {selectedProject.brief}
                  </p>
                </div>

                <div className="fh-modal-actions">
                  <button
                    className="fh-nav"
                    onClick={prevProject}
                    aria-label="Previous"
                  >
                    <FaChevronLeft />
                  </button>

                  <button
                    className="fh-save is-large fh-center"
                    onClick={(e) => toggleSave(e, selectedProject._id)}
                    aria-label={
                      isProjectSaved(selectedProject._id)
                        ? "Unsave project"
                        : "Save project"
                    }
                    aria-pressed={isProjectSaved(selectedProject._id)}
                  >
                    {isProjectSaved(selectedProject._id) ? (
                      <FaBookmark />
                    ) : (
                      <FaRegBookmark />
                    )}
                  </button>

                  <button
                    className="fh-nav"
                    onClick={nextProject}
                    aria-label="Next"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default FreelancerHome;
