// src/Pages/Freelancer/MyProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import userIcon from '../../Assets/ProfileImage.png';
import PortfolioPopup from './PortfolioPopup';
import ViewPortfolioPopup from './ViewPortfolioPopup';
import Footer from '../../Components/Footer';
import '../../Style/Freelancer/MyProfile.css';
import '../../Style/Navbar.css';

import '../../Style/Freelancer/PortfolioPopup.css';
import axios from 'axios';
import { showError } from '../../utils/toastMessages';


/* --- stars identical to the list page --- */
const renderStars = (rating) => {
  const full = Math.min(Math.max(parseInt(rating ?? 0, 10), 0), 5);
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

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [viewPopup, setViewPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [freelancerData, setFreelancerData] = useState(null);
  const navigate = useNavigate();

  // Fetch freelancer profile & portfolio
  const fetchFreelancerProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const freelancerId = storedUser?._id;
      if (!freelancerId) {
        console.error('No user ID found in localStorage.');
        return;
      }

      const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${freelancerId}`);
      setFreelancerData(data);
      setUploadedFiles(data.portfolio);
    } catch (error) {
      console.error('Failed to fetch freelancer profile:', error);
    }
  };

  useEffect(() => {
    fetchFreelancerProfile();
  }, []);

  // Global scroll lock with scrollbar compensation (works for both popups)
  useEffect(() => {
    const isOpen = showPopup || viewPopup;
    const sbw = window.innerWidth - document.documentElement.clientWidth;

    if (isOpen) {
      document.body.classList.add('no-scroll');
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    } else {
      document.body.classList.remove('no-scroll');
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.classList.remove('no-scroll');
      document.body.style.paddingRight = '';
    };
  }, [showPopup, viewPopup]);

  const handlePopupSave = (formData) => {
    axios.post(`http://localhost:5000/api/freelancer/portfolio/${freelancerData._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        fetchFreelancerProfile(); // Re-fetch portfolio after upload
        setShowPopup(false);
      })
      .catch(error => {
        showError(error);
      });
  };

  const handleDeleteAndRefresh = (deletedId) => {
    // Optimistic UI update
    setUploadedFiles((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="freelancer-profile2">
      <Navbar links={NavConfig2} />
      <div className={`profile-container2 ${showPopup || viewPopup ? 'modal-open' : ''}`}>

        {/* Profile Header */}
        <div className="profile-header2">
          <div className="left-profile2">
            <img
              src={freelancerData?.profileImageUrl || userIcon}
              alt="User Icon"
              className="profile-image2"
            />
            <div className="profile-info2">
              <h2>{freelancerData?.fullName || 'Your Name'}</h2>

              {/* NEW: rating just like list page */}
              <div className="profile-stars">
                {renderStars(Math.round(freelancerData?.rating ?? 0))}
                {!!freelancerData?.rating && (
                  <span className="stars-num">({Number(freelancerData.rating).toFixed(2)})</span>
                )}
              </div>
            </div>
          </div>
          <button className="edit-profile" onClick={() => navigate('/profilesettings')}>
            Edit Profile
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="tab-buttons22">
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

        {/* About Tab Content */}
        {activeTab === 'about' ? (
          <div className="about-section2">
            <div className="about-content2">
              <div className="basic-info-box2">
                <p><strong>Name:</strong> {freelancerData?.fullName}</p>
                <p><strong>ID:</strong> {freelancerData?.studentId}</p>
                <p><strong>Major:</strong> {freelancerData?.major}</p>
                <p><strong>Freelancer Type:</strong> {freelancerData?.userType}</p>
              </div>
              <div className="about-text2">
                <div className="bio-info2">
                  <h4>Biography</h4>
                  <p>{freelancerData?.bio || 'No biography provided yet.'}</p>
                </div>
                <div className="skills-info2">
                  <h4>Skills</h4>
                  {freelancerData?.skills && freelancerData.skills.length > 0 ? (
                    <div className="skills-list2">
                      {freelancerData.skills.map((skill, index) => (
                        <span key={index} className="skill-pill2">
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
          <div className="portfolio-section2">
            <div className="portfolio-grid2">
              {uploadedFiles.map((proj, i) => (
                <div
                  key={`uploaded-${i}`}
                  className="project-card"
                  onClick={() => { setSelectedProject(proj); setViewPopup(true); }}
                >
                  {proj.imageUrls && proj.imageUrls.length > 0 ? (
                    <img src={proj.imageUrls[0]} alt={`portfolio-${i}`} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                  <h4>{proj.title}</h4>
                </div>
              ))}
              <div
                className="add-portfolio-card1"
                onClick={() => setShowPopup(true)}
                aria-label="Add portfolio item"
              >
                <img
                  src={require("../../Assets/add-portfolio.png")}
                  alt=""
                  className="upload-image-icon"
                />
                <p>Upload Portfolio</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Portfolio Modal */}
      {showPopup && (
        <PortfolioPopup onClose={() => setShowPopup(false)} onSubmit={handlePopupSave} />
      )}

      {/* View Portfolio Modal */}
      {viewPopup && selectedProject && (
        <ViewPortfolioPopup
          project={selectedProject}
          onClose={() => setViewPopup(false)}
          onDelete={handleDeleteAndRefresh}
        />
      )}

      <Footer />
    </div>
  );
};

export default MyProfile;
