import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Style/FreelancerProfile.css';
import Navbar from '../Components/Navbar';
import '../Style/Navbar.css';
import { NavConfig2, NavConfig3, NavConfig4 } from '../Data/NavbarConfigs';
import ViewPortfolioPopup from '../Pages/Freelancer/ViewPortfolioPopup';
import userIcon from '../Assets/ProfileIcon.png';
import Footer from '../Components/Footer';
import ProjectsData from '../Data/ProjectsData';
import axios from 'axios';

const FreelancerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [viewPopup, setViewPopup] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [navbarConfig, setNavbarConfig] = useState(NavConfig2); // default to freelancer



  useEffect(() => {
    const role = localStorage.getItem('role');
    switch (role) {
      case 'admin':
        setNavbarConfig(NavConfig4);
        break;
      case 'client':
        setNavbarConfig(NavConfig3);
        break;
      case 'freelancer':
      default:
        setNavbarConfig(NavConfig2);
    }
  }, []);
  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/freelancer/profile/${id}`);
        if (data?.profileImageUrl) {
          data.profileImageUrl = `http://localhost:5000${data.profileImageUrl}`;
        }
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
            </div>
          </div>
          <button
            className="contact-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/freelancermessages');
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
            <div className="basic-info">
              <p><strong>Name:</strong> {freelancer.fullName}</p>
              <p><strong>ID:</strong> {freelancer.studentId}</p>
              <p><strong>Major:</strong> {freelancer.major}</p>
            </div>

            <div className="bio-info">
              <h4>Biography</h4>
              <p>{freelancer.bio || 'No biography provided yet.'}</p>
            </div>


            <div className="skills-info">
              <h4>Skills</h4>
              <p>{freelancer.skills?.join(', ') || 'No skills added yet.'}</p>
            </div>
          </div>
        ) : (
          <div className="portfolio-section9">
            <div className="portfolio-grid99">
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
            </div>
          </div>
        )}
      </div>

      {/* View Popup */}
      {viewPopup && (
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
