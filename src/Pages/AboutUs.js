// src/Pages/AboutUs.js 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/AboutUs.css';
import Logo from '../Assets/Logo.jpg';

const AboutUs = () => {
  const navigate = useNavigate(); 

  return (
    <div className="about-body">
      <div className="about-container">
      <nav className="navbar">
          <div className="nav-left">
            <div className="logo-title">
              <img src={Logo} alt="Logo" className="logo-image" />
              <span className="site-name">Al Salam Talents</span>
            </div>
            <ul className="nav-links">
              <li onClick={() => navigate('/')}>Home</li>
              <li onClick={() => navigate('/AboutUs')}>About us</li>
            </ul>
          </div>
          <button className="sign-in-btn" onClick={() => navigate('/signin')}>Sign In</button>
        </nav>
        <h1>
          Students <span className="highlight">destination</span> for real-world practical project
        </h1>
        <p>
          Al Salam Talents is a digital platform designed to connect Bahrain Polytechnic students with real-world opportunities from Al Salam Bank. <br />Created to bridge the gap between education and industry, our platform allows students to work on real-world projects, <br /> build their portfolios, and gain valuable experience in a professional environment.
        </p>
        <p>
          Driven by a mission to empower young talent, we provide a space where innovation meets collaboration.<br /> Whether it’s digital content, branding, or strategy development, students can apply their skills <br />to meaningful projects that contribute directly to business goals.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
