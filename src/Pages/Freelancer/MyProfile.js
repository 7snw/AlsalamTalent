// src/pages/Freelancer/MyProfile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import userIcon from '../../Assets/ProfileIcon.png';
import PortfolioPopup from './PortfolioPopup';
import ViewPortfolioPopup from './ViewPortfolioPopup';
import ProjectsData from '../../Data/ProjectsData';
import '../../Style/Freelancer/MyProfile.css';
import '../../Style/Navbar.css';
import '../../Style/Freelancer/PortfolioPopup.css';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [viewPopup, setViewPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const handlePopupSave = (projectData) => {
    setUploadedFiles([...uploadedFiles, projectData]);
    setShowPopup(false);
  };

  return (
    <div className="freelancer-profile2">
      <Navbar links={NavConfig2} />
      <div className="profile-container2">
        <div className="profile-header2">
          <div className="left-profile2">
            <img src={userIcon} alt="User Icon" className="profile-image2" />
            <div className="profile-info2">
              <h2>Maryam Yusuf</h2>
            </div>
          </div>
          <button className="edit-profile" onClick={() => navigate('/profilesettings')}>
            Edit Profile
          </button>
        </div>

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

        {activeTab === 'about' ? (
          <div className="about-section2">
            <div className="basic-info2">
              <p><strong>Name:</strong> Fatema Almutawa</p>
              <p><strong>ID:</strong> 202100888</p>
              <p><strong>Major:</strong> Web Media</p>
            </div>
            <div className="bio-info2">
              <h4>Biography</h4>
              <p>
                I'm a passionate Web Media student with a focus on creating visually compelling and
                user-friendly websites. Skilled in HTML, CSS, and JavaScript, I specialize in
                designing responsive websites that enhance user experience. Currently freelancing, I
                help clients bring their digital visions to life with custom, innovative web
                solutions.
              </p>
            </div>
            <div className="skills-info2">
              <h4>Skills</h4>
              <p>Branding, Marketing, Web Design, Photography</p>
            </div>
            <div className="specialties-info2">
              <h4>Specialties</h4>
              <p>Marketing, Web Design</p>
            </div>
          </div>
        ) : (
          <div className="portfolio-section2">
            <div className="portfolio-grid2">
              {ProjectsData.deitailes.slice(0, 3).map((proj, i) => (
                <div
                  key={i}
                  className="project-card"
                  onClick={() => {
                    setSelectedProject(proj);
                    setViewPopup(true);
                  }}
                >
                  <img src={proj.image} alt={proj.title} />
                  <h4>{proj.title}</h4>
                  <p>{proj.category}</p>
                </div>
              ))}

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

      {/* Upload Popup */}
      {showPopup && (
        <PortfolioPopup onClose={() => setShowPopup(false)} onSave={handlePopupSave} />
      )}

      {/* View Popup */}
      {viewPopup && (
        <ViewPortfolioPopup
          project={selectedProject}
          onClose={() => setViewPopup(false)}
        />
      )}

  
    </div>
  );
};

export default MyProfile;
