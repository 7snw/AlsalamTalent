import React, { useEffect, useState } from 'react';
import '../Style/AboutUs.css';
import Navbar from '../Components/Navbar';
import { NavConfig1, NavConfig2, NavConfig3, NavConfig4 } from '../Data/NavbarConfigs';
import '../Style/Navbar.css';
import Footer from '../Components/Footer';


const AboutUs = () => {
  const [navbarConfig, setNavbarConfig] = useState(NavConfig1); // default

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?._id;
    switch (role) {
      case 'freelancer':
        setNavbarConfig(NavConfig2);
        break;
      case 'client':
        setNavbarConfig(NavConfig3);
        break;
      case 'admin':
        setNavbarConfig(NavConfig4);
        break;
      default:
        setNavbarConfig(NavConfig1);
    }
  }, []);

  return (
    <div className="about-body">
      <div className="about-container">
        <Navbar links={navbarConfig} />
        <h1>
          Students <span className="highlight">destination</span> for real-world practical project
        </h1>
        <p>
          Al Salam Talents is a digital platform designed to connect Bahrain Polytechnic students with real-world opportunities from Al Salam Bank. <br />
          Created to bridge the gap between education and industry, our platform allows students to work on real-world projects, <br />
          build their portfolios, and gain valuable experience in a professional environment.
       <br/>
       <br/>
      
          Driven by a mission to empower young talent, we provide a space where innovation meets collaboration. <br />
          Whether it’s digital content, branding, or strategy development, students can apply their skills <br />
          to meaningful projects that contribute directly to business goals.
        </p>
        <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>
       <br/>


      </div>
      <Footer/>
    </div>
  );
};

export default AboutUs;
