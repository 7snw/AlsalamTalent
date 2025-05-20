
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/LandingPage.css';
import LandingPhoto from '../Assets/LandingPhoto.jpg'; 
import Briefcase from '../Assets/Briefcase.png';
import GraduationCap from '../Assets/GradCap.png';
import ChatApp from '../Assets/ChatApp.png';
import Footer from '../Components/Footer';
import Navbar from '../Components/Navbar';
import { NavConfig1 } from '../Data/NavbarConfigs';

const LandingPage = () => {
  // Setup navigation and scrolling reference
  const navigate = useNavigate();
  const cardsRef = useRef(null);

  // Scrolls to the feature cards section
  const scrollToCards = () => {
    cardsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Navigates to freelancer home (temporary placeholder for sign-in)
  const handleSignIn = () => {
    navigate('/freelancer-home');
  };

  return (
    <div className="landing-body">
      <div className="landing-container">

        {/* Top navigation bar with config and sign-in handler */}
        <Navbar links={NavConfig1} onSignIn={handleSignIn} />

        {/* Hero section with intro text, call-to-action buttons, and image */}
        <div className="landing-content">
          <div className="text-section">
            <p className="subheading">"Undo limits, redo possibilities"</p>
            <h1>
              Your <span className="highlight">Freelancing</span><br />
              Journey Starts <br /> Here.
            </h1>
            <p className="description">
              Ctrl-Z connects Bahrain Polytechnic students and graduates <br/>
              with exciting freelance opportunities. Find your match, and collaborate!
            </p>
            <div className="button-group">
              {/* Button to join as a student or graduate */}
              <button className="primary-btn" onClick={() => navigate('/studentgraduate')}>
                Join the Community
              </button>
              {/* Button to scroll to feature cards */}
              <button className="secondary-btn" onClick={scrollToCards}>See More</button>
            </div>
          </div>

          {/* Hero image on the right side */}
          <div className="image-section">
            <img src={LandingPhoto} alt="Freelancer Illustration" />
          </div>
        </div>

        {/* Mid-page section with 3 feature cards */}
        <div className="cards-section" ref={cardsRef}>
          <h2 className="cards-heading">It’s Your Time to <span className="highlight">Shine</span></h2>
          <div className="feature-cards">
            {/* Card 1: Portfolio and experience */}
            <div className="feature-card">
              <img src={Briefcase} alt="Experience" />
              <h3>Unlock Real-World <br />Experience</h3>
              <p>Build your portfolio, develop your skills, and prepare for a successful career.</p>
            </div>
            {/* Card 2: Matching with opportunities */}
            <div className="feature-card">
              <img src={GraduationCap} alt="Opportunities" />
              <h3>Discover Opportunities <br />That Match Your Skills</h3>
              <p>Find projects tailored to your expertise and career goals. Search, apply, and save.</p>
            </div>
            {/* Card 3: Real-time collaboration */}
            <div className="feature-card">
              <img src={ChatApp} alt="Collaboration" />
              <h3>Collaborate Seamlessly,<br /> Anytime, Anywhere</h3>
              <p>Stay connected with your team and clients through real-time chat, files sharing.</p>
            </div>
          </div>
        </div>
      </div>

      {/*footer*/}
      <Footer/>
    </div>
  );
};

export default LandingPage;
