// src/Pages/LandingPage.js
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/LandingPage.css';
import LandingPhoto from '../Assets/LandingPhoto.jpg'; 
import Briefcase from '../Assets/Briefcase.png';
import GraduationCap from '../Assets/GradCap.png';
import ChatApp from '../Assets/ChatApp.png';

import Navbar from '../Components/Navbar';
import { NavConfig1 } from '../Data/NavbarConfigs';

const LandingPage = () => {
  const navigate = useNavigate();
  const cardsRef = useRef(null);

  const scrollToCards = () => {
    cardsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignIn = () => {
    navigate('/freelancer-home');
  };

  return (
    <div className="landing-body">
      <div className="landing-container">
        
        <Navbar links={NavConfig1} onSignIn={handleSignIn} /> {/* ← pass the handler */}

        <div className="landing-content">
          <div className="text-section">
            <p className="subheading">BUILD &nbsp; YOUR &nbsp; CAREER</p>
            <h1>
              Be A <span className="highlight">Freelancer</span><br />
              Easy & Unique <br /> Ways.
            </h1>
            <p className="description">
              Step into the world of professional excellence with<br />
              hands-on projects from Al Salam Bank.
            </p>
            <div className="button-group">
              <button className="primary-btn" onClick={() => navigate('/studentgraduate')}>
                Join the Community
              </button>
              <button className="secondary-btn" onClick={scrollToCards}>See More</button>
            </div>
          </div>

          <div className="image-section">
            <img src={LandingPhoto} alt="Freelancer Illustration" />
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="cards-section" ref={cardsRef}>
          <h2 className="cards-heading">It’s Your Time to <span className="highlight">Shine</span></h2>
          <div className="feature-cards">
            <div className="feature-card">
              <img src={Briefcase} alt="Experience" />
              <h3>Unlock Real-World <br />Experience</h3>
              <p>Build your portfolio, develop your skills, and prepare for a successful career.</p>
            </div>
            <div className="feature-card">
              <img src={GraduationCap} alt="Opportunities" />
              <h3>Discover Opportunities <br />That Match Your Skills</h3>
              <p>Find projects tailored to your expertise and career goals. Search, apply, and save.</p>
            </div>
            <div className="feature-card">
              <img src={ChatApp} alt="Collaboration" />
              <h3>Collaborate Seamlessly,<br /> Anytime, Anywhere</h3>
              <p>Stay connected with your team and clients through real-time chat, files sharing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
