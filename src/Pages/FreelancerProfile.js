// src/Pages/FreelancerProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Style/FreelancerProfile.css';
import Navbar from '../Components/Navbar';
import '../Style/Navbar.css';
import { NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";
import ViewPortfolioPopup from '../Pages/Freelancer/ViewPortfolioPopup';
import userIcon from "../Assets/ProfileImage.png";
import Footer from '../Components/Footer';
import axios from 'axios';

/* --- stars identical to the list page --- */
const renderStars = (rating) => {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const full = Math.min(Math.max(Math.floor(safeRating), 0), 5);
  const empty = 5 - full;

  return (
    <>
      {Array.from({ length: full }, (_, i) => (
        <span key={`full-${i}`} className="star-full">★</span>
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`empty-${i}`} className="star-empty">☆</span>
      ))}
    </>
  );
};


const FreelancerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [freelancer, setFreelancer] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [viewPopup, setViewPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [navbarConfig, setNavbarConfig] = useState(NavConfig2);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role;
    switch (role) {
      case 'admin':
        setNavbarConfig(NavConfig4);
        break;
      case 'client':
        setNavbarConfig(NavConfig3);
        break;
      default:
        setNavbarConfig(NavConfig2);
    }
  }, []);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${id}`);
        setFreelancer(data);
      } catch (error) {
        console.error('Error fetching freelancer profile:', error);
      }
    };
    fetchFreelancer();
  }, [id]);

  if (!freelancer) return <div>Loading...</div>;

  return (
    <div className="freelancer-profile">
      <Navbar links={navbarConfig} />
      <div className="profile-container">
        <div className="profile-header">
          <div className="left-profile">
            <img
              src={freelancer.profileImageUrl || userIcon}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-info">
              <h2>{freelancer.fullName}</h2>

              {/* NEW: rating just like list page */}
              <div className="profile-stars">
                {renderStars(Math.round(freelancer?.rating ?? 0))}
                {!!freelancer?.rating && (
                  <span className="stars-num">({Number(freelancer.rating).toFixed(2)})</span>
                )}
              </div>
            </div>
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
                    profileImageUrl: freelancer.profileImageUrl,
                  },
                },
              });
            }}
          >
            Get in touch
          </button>
        </div>

        <div className="tab-buttons">
          <button
            className={activeTab === 'about' ? 'active' : ''}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={activeTab === 'portfolio' ? 'active' : ''}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
        </div>
        <hr />

        {activeTab === 'about' ? (
          <div className="about-section">
            <div className="about-content">
              <div className="basic-info-box">
                <p><strong>Name:</strong> {freelancer.fullName}</p>
                <p><strong>ID:</strong> {freelancer.studentId}</p>
                <p><strong>Major:</strong> {freelancer.major}</p>
                <p><strong>Freelancer Type:</strong> {freelancer.userType}</p>
              </div>
              <div className="about-text">
                <div className="bio-info">
                  <h4>Biography</h4>
                  <p>{freelancer.bio || 'No biography provided yet.'}</p>
                </div>
                <div className="skills-info">
                  <h4>Skills</h4>
                  {freelancer.skills && freelancer.skills.length > 0 ? (
                    <div className="skills-list">
                      {freelancer.skills.map((skill, index) => (
                        <span key={index} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="portfolio-section9">
            <div className="portfolio-grid99">
              {freelancer.portfolio && freelancer.portfolio.length > 0 ? (
                freelancer.portfolio.map((proj, i) => (
                  <div
                    key={i}
                    className="project-card"
                    onClick={() => {
                      setSelectedProject(proj);
                      setViewPopup(true);
                    }}
                  >
                    {proj.imageUrls && proj.imageUrls.length > 0 ? (
                      <img src={proj.imageUrls[0]} alt={proj.title} />
                    ) : (
                      <div className="no-image-placeholder">No Image</div>
                    )}
                    <h4>{proj.title}</h4>
                  </div>
                ))
              ) : (
                <p>No portfolio projects yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {viewPopup && selectedProject && (
        <ViewPortfolioPopup
          project={selectedProject}
          onClose={() => setViewPopup(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default FreelancerProfile;
