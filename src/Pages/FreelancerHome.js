// src/Pages/FreelancerPages/FreelancerHome.js
import React from 'react';
import '../Style/FreelancerHome.css';
import '../Style/Navbar.css';
import Navbar from '../Components/Navbar';
import { NavConfig2 } from '../Data/NavbarConfigs';


const FreelancerHome = () => {
  return (
    <div className="freelancer-home">
      <div className="freelancer-container">
      <Navbar links={NavConfig2} /> {}
      <header className="hero">
        <h1><span className="highlight">Explore</span> Real-World Projects</h1>
        <p>Take on your next project, Build your portfolio, and develop your skills.</p>
        <div className="search-bar">
          <input type="text" placeholder="What are you looking for?" />
          <button>🔍</button>
        </div>
        <br/>
        <div className="categories">
          <button>Marketing</button>
          <button className="active">Graphic Design</button>
          <button>Illustration</button>
          <button>Product Design</button>
          <button>Web Design</button>
        </div>
      </header>

      <section className="project-grid">
        {Array.from({ length: 20 }, (_, i) => (
          <div className="project-card" key={i}>
            <img src="https://via.placeholder.com/300x200" alt="Project" />
            <h4>Branding for potential merch</h4>
            <p>50 BHD</p>
            <span className="bookmark">🔖</span>
          </div>
        ))}
      </section>
      </div>
    </div>
  );
};

export default FreelancerHome;
