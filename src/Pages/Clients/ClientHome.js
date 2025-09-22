// src/Pages/Clients/ClientHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig3 } from "../../Data/NavbarConfigs";

import SearchIcon from "../../Assets/search.png";
import ProjectsIcon from "../../Assets/projectsIcon.png";
import CampaignIcon from "../../Assets/campaignIcon.png";
import WavyBackground from "../../Components/WavyBackground";

import "../../Style/Clients/ClientHome.css";

/* Normalize skills list */
const getProjectSkills = (proj) => {
  let raw =
    proj?.skills ?? proj?.requiredSkills ?? proj?.tags ?? proj?.keywords ?? [];
  if (typeof raw === "string") raw = raw.split(",");
  const list = (Array.isArray(raw) ? raw : [])
    .map((s) => String(s || "").trim())
    .filter(Boolean);
  if (!list.length && proj?.category) list.push(proj.category);
  return list.slice(0, 10);
};

const getType = (p) =>
  String(p?.projectType || p?.type || "project").trim().toLowerCase(); // "project" | "campaign"

const ClientHome = () => {
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
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
  "Reports & Presentations"
];
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/projects/all");
        setAllProjects(data || []);
      } catch (e) {
        console.error("Error fetching projects:", e);
      }
    };
    fetch();
  }, []);

  // Debounced search
  const [debounced, setDebounced] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Base filter (category + search)
  const baseFiltered = useMemo(() => {
    return allProjects.filter((p) => {
      const inCat = activeCategory === "All" || p.category === activeCategory;
      const title = String(p.title || "").toLowerCase();
      return inCat && title.includes(debounced.toLowerCase());
    });
  }, [allProjects, activeCategory, debounced]);

  // Split into Projects vs Campaigns using projectType
  const campaignsOnly = useMemo(
    () => baseFiltered.filter((p) => getType(p) === "campaign"),
    [baseFiltered]
  );
  const projectsOnly = useMemo(
    () => baseFiltered.filter((p) => getType(p) !== "campaign"),
    [baseFiltered]
  );

  const Card = ({ project, index }) => {
    const skills = getProjectSkills(project);
    const type = getType(project);
    return (
      <motion.div
        className="ch-card"
        key={project._id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        whileHover={{ y: -4, boxShadow: "0 8px 22px rgba(0,0,0,0.16)" }}
        onClick={() => navigate(`/project-details/${project._id}`)}
      >
        <div className="ch-thumb">
          <img
            src={project.imageUrl || project.image || project.coverImage}
            alt={project.title}
            loading="lazy"
          />
          {type === "campaign" && <span className="ch-badge">Campaign</span>}

          {!!skills.length && (
            <div className="ch-tags-marquee" aria-hidden>
              <div className="ch-track" style={{ "--ch-speed": "5s" }}>
                <div className="ch-strip">
                  {skills.map((t, i) => (
                    <span className="ch-tag" key={`a-${i}`}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="ch-strip" aria-hidden>
                  {skills.map((t, i) => (
                    <span className="ch-tag" key={`b-${i}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ch-meta">
          <h4 className="ch-name">{project.title}</h4>
          <div className="ch-price">BHD {project.budget} </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="ch-root">
      <WavyBackground
  // keep your dark fat waves
  colors={["#111c2f", "#111c2f", "#111c2f", "#111c2f"]}
  waveOpacity={0.8}
  waveWidth={400}
  blur={0}
  speed="fast"

  // NEW: thin accent lines like your screenshot
  accentColors={["#f1633a", "#9FD8FF"]}  // orange + light blue
  accentWidth={3}
  accentOpacity={0.4}
  accentVertical={-180}   // tweak up/down to sit on the crest you want
  accentSpacing={10}     // gap between the two lines

  containerClassName="fh-bg"   // stays fixed/inset behind content
/>

      <div className="ch-container">
        <Navbar links={NavConfig3} />

        {/* HERO */}
        <header className="ch-hero">
          <div className="ch-hero-inner">
            <h1 className="ch-title1">
              <span className="ch-title-accent">Explore</span> Real-World Projects
            </h1>
            <p className="ch-sub1">
              Take on your next project, build your portfolio, and develop your skills.
            </p>

            <div className="ch-links">
              <button
                className={`ch-link ${viewMode === "projects" ? "is-active" : ""}`}
                onClick={() => setViewMode("projects")}
              >
                <img src={ProjectsIcon} alt="" className="ch-link-ico" />
                <span>All Projects</span>
              </button>

           

              <button
                className={`ch-link ${viewMode === "campaigns" ? "is-active" : ""}`}
                onClick={() => setViewMode("campaigns")}
              >
                <img src={CampaignIcon} alt="" className="ch-link-ico" />
                <span>Project Campaigns</span>
              </button>
            </div>

            <div className="ch-search">
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

        {/* Category pills */}
        <div className="ch-cats">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`ch-cat ${activeCategory === cat ? "is-active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog */}
        <section className="ch-catalog">
          {viewMode === "campaigns" ? (
            campaignsOnly.length ? (
              <div className="ch-grid">
                {campaignsOnly.map((project, index) => (
                  <Card key={project._id} project={project} index={index} />
                ))}
              </div>
            ) : (
              <div className="ch-empty">
                <h3>Campaigns</h3>
                <p>No project campaigns found.</p>
              </div>
            )
          ) : (
            <div className="ch-grid">
              {projectsOnly.map((project, index) => (
                <Card key={project._id} project={project} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ClientHome;
