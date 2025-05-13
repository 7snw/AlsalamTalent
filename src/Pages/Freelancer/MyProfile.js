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
import { showError } from '../../utils/toastMessages';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [uploadedFiles, setUploadedFiles] = useState([]);  // Portfolio items
  const [showPopup, setShowPopup] = useState(false);
  const [viewPopup, setViewPopup] = useState(false);
  const [freelancerData, setFreelancerData] = useState(null); // Freelancer profile data
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFreelancerProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const freelancerId = storedUser?._id;
        if (!freelancerId) {
          console.error('No user ID found in localStorage.');
          return;
        }

        // Fetch freelancer profile data
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${freelancerId}`);
        setFreelancerData(data);

        // Fetch freelancer portfolio data
        fetchPortfolio(freelancerId);
      } catch (error) {
        console.error('Failed to fetch freelancer profile:', error);
      }
    };

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

  const handlePopupSave = (formData) => {
    axios.post(`http://localhost:5000/api/freelancer/portfolio/${freelancerData._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      // Once the portfolio is added, update the state
      setUploadedFiles([...uploadedFiles, response.data]);  // Add the new portfolio to state
      setShowPopup(false);  // Close the popup
    })
    .catch(error => {
      showError(error);
    });
  };

  return (
    <div className="freelancer-profile2">
      <Navbar links={NavConfig2} />
      <div className="profile-container2">
        <div className="profile-header2">
          <div className="left-profile2">
            <img
               src={freelancerData?.profileImageUrl ? freelancerData.profileImageUrl : userIcon}
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
          </div>
        ) : (
          <div className="portfolio-section2">
            <div className="portfolio-grid2">
              {uploadedFiles.map((proj, i) => (
                <div
                  key={`uploaded-${i}`}
                  className="project-card"
                  onClick={() => setViewPopup(true)} // Opens the project details popup
                >
                  <img src={proj.imageUrl} alt={`portfolio-${i}`} />
                  <h4>{proj.title}</h4>
                  <p>{proj.category}</p>  {/* Adjusted "type" to "category" */}
                </div>
              ))}
              <div className="add-portfolio-card" onClick={() => setShowPopup(true)}>
                +
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio add popup */}
      {showPopup && (
        <PortfolioPopup onClose={() => setShowPopup(false)} onSubmit={handlePopupSave} />
      )}

      {/* View portfolio popup */}
      {viewPopup && (
        <ViewPortfolioPopup
          project={uploadedFiles.find((p) => p)}  // Use the first project as an example for viewing
          onClose={() => setViewPopup(false)}
        />
      )}
    </div>
  );
};

export default MyProfile;
