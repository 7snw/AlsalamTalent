// src/Pages/ClientHome.js

import React from 'react';
import '../../Style/Clients/ClientHome.css';
import '../../Style/Navbar.css';
import Navbar from '../../Components/Navbar';
import { NavConfig3 } from '../../Data/NavbarConfigs';
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

const ClientHome = () => {
  const navigate = useNavigate();
  const allProjects = ProjectsData.deitailes;
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  

  const categories = ['All', 'Marketing', 'Graphic Design', 'Illustration', 'Product Design', 'Web Design'];

  const filteredProjects = allProjects.filter((proj) => {
    const matchesCategory = activeCategory === 'All' || proj.category === activeCategory;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  

  return (
    <div className="client-home">
      <div className="client-container">
        <Navbar links={NavConfig3} />

        <header className="hero">
          <h1><span className="highlight">Explore</span> Real-World Projects</h1>
          <p>Find top freelancers to get your project done with quality and efficiency.</p>
          <div className="search-bar">
            <input type="text" placeholder="What are you looking for?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
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
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ClientHome;
