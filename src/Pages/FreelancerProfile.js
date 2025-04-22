// src/pages/FreelancerProfile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/FreelancerProfile.css';
import Navbar from '../Components/Navbar';
import '../Style/Navbar.css';
import { NavConfig2 } from '../Data/NavbarConfigs';
import ViewPortfolioPopup from '../Pages/Freelancer/ViewPortfolioPopup';
import userIcon from '../Assets/ProfileIcon.png';
import ProjectsData from '../Data/ProjectsData';
import Footer from '../Components/Footer';


const FreelancerProfile = () => {
  const [viewPopup, setViewPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const navigate = useNavigate(); 
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="freelancer-profile">
      <Navbar links={NavConfig2} />
      <div className="profile-container">
      <div className="profile-header">
  <div className="left-profile">
    <img src={userIcon} alt="User Icon" className="profile-image" />
    <div className="profile-info">
      <h2>Fatema Almutawa</h2>
    </div>
  </div>
  <button 
        className="contact-btn" 
        onClick={(e) => {
          e.stopPropagation(); // Prevents card click from firing
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
           <p><strong>Name:</strong> Fatema Almutawa</p>
           <p><strong>ID:</strong> 202100888</p>
           <p><strong>Major:</strong> Web Media</p>
         </div>
     
         <div className="bio-info">
           <h4>Biography</h4>
           <p>
             I'm a passionate Web Media student with a focus on creating visually compelling and user-friendly websites.
             Skilled in HTML, CSS, and JavaScript, I specialize in designing responsive websites that enhance user experience.
             Currently freelancing, I help clients bring their digital visions to life with custom, innovative web solutions.
           </p>
         </div>
     
         <div className="skills-info">
           <h4>Skills</h4>
           <p>Branding, Marketing, Web Design, Photography</p>
         </div>
     
         <div className="specialties-info">
           <h4>Specialties</h4>
           <p>Marketing, Web Design</p>
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
      <Footer/>
    </div>
    
  );
};

export default FreelancerProfile;
