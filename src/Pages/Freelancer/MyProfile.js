// src/Pages/Freelancer/MyProfile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import userIcon from '../../Assets/ProfileIcon.png';
import PortfolioPopup from './PortfolioPopup';
import ViewPortfolioPopup from './ViewPortfolioPopup';
import Footer from '../../Components/Footer';
import '../../Style/Freelancer/MyProfile.css';
import '../../Style/Navbar.css';
import '../../Style/Freelancer/PortfolioPopup.css';
import axios from 'axios';
import { showError } from '../../utils/toastMessages';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('about'); // tab control
  const [uploadedFiles, setUploadedFiles] = useState([]); // portfolio files
  const [showPopup, setShowPopup] = useState(false); // add modal
  const [viewPopup, setViewPopup] = useState(false); // view modal
  const [selectedProject, setSelectedProject] = useState(null); // for viewing details
  const [freelancerData, setFreelancerData] = useState(null); // freelancer info
  const navigate = useNavigate();

  // Fetch freelancer profile and portfolio on mount
  useEffect(() => {
    const fetchFreelancerProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const freelancerId = storedUser?._id;
        if (!freelancerId) {
          console.error('No user ID found in localStorage.');
          return;
        }

        // Get freelancer profile data
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${freelancerId}`);
        setFreelancerData(data);

        // Also fetch portfolio
        fetchPortfolio(freelancerId);
      } catch (error) {
        console.error('Failed to fetch freelancer profile:', error);
      }
    };

    // Fetch freelancer's portfolio files
    const fetchPortfolio = async (freelancerId) => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${freelancerId}`);
        setUploadedFiles(data.portfolio);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      }
    };

    fetchFreelancerProfile();
  }, []);

  // Prevent background scrolling when popups are shown
  useEffect(() => {
    document.body.style.overflow = (showPopup || viewPopup) ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPopup, viewPopup]);

  // Handle saving a new portfolio project
  const handlePopupSave = (formData) => {
    axios.post(`http://localhost:5000/api/freelancer/portfolio/${freelancerData._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      setUploadedFiles([...uploadedFiles, response.data]);
      setShowPopup(false);
    })
    .catch(error => {
      showError(error);
    });
  };

  return (
    <div className="freelancer-profile2">
      <Navbar links={NavConfig2} />
      <div className="profile-container2">

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
            </div>
          </div>
          <button className="edit-profile" onClick={() => navigate('/profilesettings')}>
            Edit Profile
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="tab-buttons22">
          <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>
            About
          </button>
          <button className={activeTab === 'portfolio' ? 'active' : ''} onClick={() => setActiveTab('portfolio')}>
            Portfolio
          </button>
        </div>
        <hr />

        {/* About Tab Content */}
        {activeTab === 'about' ? (
          <div className="about-section2">
            <div className="basic-info2">
              <p><strong>Name:</strong> {freelancerData?.fullName}</p>
              <p><strong>ID:</strong> {freelancerData?.studentId}</p>
              <p><strong>Major:</strong> {freelancerData?.major}</p>
              <p><strong>Freelancer Type:</strong> {freelancerData?.userType}</p>
            </div>
            <div className="bio-info2">
              <h4>Biography</h4>
              <p>{freelancerData?.bio || 'No biography provided yet.'}</p>
            </div>
            <div className="skills-info2">
              <h4>Skills</h4>
              <p>{freelancerData?.skills?.join(', ') || 'No skills added yet.'}</p>
            </div>
          </div>
        ) : (
          // Portfolio Tab Content
          <div className="portfolio-section2">
            <div className="portfolio-grid2">
              {uploadedFiles.map((proj, i) => (
                <div
                  key={`uploaded-${i}`}
                  className="project-card"
                  onClick={() => {
                    setSelectedProject(proj);
                    setViewPopup(true);
                  }}
                >
                  <img src={proj.imageUrl} alt={`portfolio-${i}`} />
                  <h4>{proj.title}</h4>
                  <p>{proj.category}</p>
                </div>
              ))}
              <div className="add-portfolio-card" onClick={() => setShowPopup(true)}>
                +
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
          onClose={() => {
            setViewPopup(false);
            setSelectedProject(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default MyProfile;
