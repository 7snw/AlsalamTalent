import React from 'react';
import '../../Style/Freelancer/FreelancerHome.css';
import '../../Style/Navbar.css';
import Navbar from '../../Components/Navbar';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';     

const projects = [
  {
    name: 'Logo Redesign',
    image: require('../../Assets/Projects/Design.png'),
    price: '35 BHD',
  },
  {
    name: 'Website Banner',
    image: require('../../Assets/Projects/banner.png'),
    price: '45 BHD',
  },
  {
    name: 'Illustration for a Book',
    image: require('../../Assets/Projects/illustration.png'),
    price: '60 BHD',
  },
  {
    name: 'Social Media Templates',
    image: require('../../Assets/Projects/socialmedia.png'),
    price: '40 BHD',
  },
  {
    name: 'Packaging Design',
    image: require('../../Assets/Projects/packaging.png'),
    price: '55 BHD',
  },
  {
    name: 'Illustration for a Book',
    image: require('../../Assets/Projects/illustration.png'),
    price: '60 BHD',
  },
  {
    name: 'Social Media Templates',
    image: require('../../Assets/Projects/socialmedia.png'),
    price: '40 BHD',
  },
  {
    name: 'Packaging Design',
    image: require('../../Assets/Projects/packaging.png'),
    price: '55 BHD',
  },
];

const FreelancerHome = () => {
  return (
    <div className="freelancer-home">
      <div className="freelancer-container">
        <Navbar links={NavConfig2} />

        <header className="hero">
          <h1><span className="highlight">Explore</span> Real-World Projects</h1>
          <p>Take on your next project, Build your portfolio, and develop your skills.</p>
          <div className="search-bar">
            <input type="text" placeholder="What are you looking for?" />
          
              <img src={SearchIcon} alt="Search" className="search-icon" />
            
          </div>
          <br />
          <div className="categories">
            <button>Marketing</button>
            <button className="active">Graphic Design</button>
            <button>Illustration</button>
            <button>Product Design</button>
            <button>Web Design</button>
          </div>
        </header>

        <section className="project-grid">
          {projects.map((project, index) => (
            <div className="project-card" key={index}>
              <img src={project.image} alt={project.name} />
              <h4>{project.name}</h4>
              <p>{project.price}</p>
              <span className="bookmark">🔖</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default FreelancerHome;
