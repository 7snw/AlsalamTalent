import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import userIcon from '../../Assets/ProfileIcon.png';
import PortfolioPopup from './PortfolioPopup';
import ViewPortfolioPopup from './ViewPortfolioPopup';
import '../../Style/Freelancer/MyProfile.css';
import '../../Style/Navbar.css';
import '../../Style/Freelancer/PortfolioPopup.css';
import axios from 'axios';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [viewPopup, setViewPopup] = useState(false);
  const [freelancerData, setFreelancerData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFreelancerProfile = async () => {
      try {
        const freelancerId = localStorage.getItem('userId');
        if (!freelancerId) {
          console.error('No user ID found in localStorage.');
          return;
        }
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${freelancerId}`);
        setFreelancerData(data);
      } catch (error) {
        console.error('Failed to fetch freelancer profile:', error);
      }
    };

    fetchFreelancerProfile();
  }, []);

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
              <p><strong>Name:</strong> {freelancerData?.fullName || 'Not provided'}</p>
              <p><strong>ID:</strong> {freelancerData?.studentId || 'Not provided'}</p>
              <p><strong>Major:</strong> {freelancerData?.major || 'Not provided'}</p>
            </div>

            <div className="bio-info2">
              <h4>Biography</h4>
              <p>{freelancerData?.bio || 'No biography provided yet.'}</p>
            </div>

            <div className="skills-info2">
              <h4>Skills</h4>
              <p>{freelancerData?.skills?.join(', ') || 'No skills added yet.'}</p>
            </div>

            <div className="specialties-info2">
              <h4>Specialties</h4>
              <p>{freelancerData?.specialties?.join(', ') || 'No specialties added yet.'}</p>
            </div>
          </div>
        ) : (
          <div className="portfolio-section2">
            <div className="portfolio-grid2">
              {uploadedFiles.map((proj, i) => (
                <div
                  key={`uploaded-${i}`}
                  className="project-card"
                  onClick={() => {
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

      {showPopup && (
        <PortfolioPopup onClose={() => setShowPopup(false)} onSave={handlePopupSave} />
      )}

      {viewPopup && (
        <ViewPortfolioPopup
          project={uploadedFiles.find((p) => p)}
          onClose={() => setViewPopup(false)}
        />
      )}
    </div>
  );
};

export default MyProfile;
