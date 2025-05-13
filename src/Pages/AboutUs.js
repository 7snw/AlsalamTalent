import React, { useEffect, useState } from 'react';
import '../Style/AboutUs.css';
import Navbar from '../Components/Navbar';
import { NavConfig1, NavConfig2, NavConfig3, NavConfig4 } from '../Data/NavbarConfigs';
import '../Style/Navbar.css';
import Footer from '../Components/Footer';


const AboutUs = () => {
  const [navbarConfig, setNavbarConfig] = useState(); // default

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role; 
  
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
  Empowering <span className="highlight">Bahrain's Talent</span> through Creativity & Flexibility
</h1>
<p>
  CTRL+Z is a purpose-driven freelancing platform exclusively for Bahrain Polytechnic students and graduates. 
  We connect tech-savvy, entrepreneurial Gen Z individuals with real-world projects from Al Salam Bank, offering them 
  the opportunity to build portfolios, gain financial independence, and showcase their talents.<br/><br/>
  Our mission is to bridge the gap between academia and industry by enabling young professionals to thrive in a supportive, 
  trusted environment. Whether you're into graphic design, video editing, or strategy development — this is your zone to 
  unleash creativity without limits. <br/><br/>
 
</p>
<div className="ctrl">
<h4> Undo limits. Redo possibilities. </h4>
 </div>


<h2 className="section-title">Our Mission</h2>
<p>
  At CTRL+Z, we provide Bahrain Polytechnic students and graduates with meaningful opportunities 
  to gain experience through flexible freelance projects. We empower young talent to express their creativity, 
  grow professionally, and contribute to real-world business needs.
</p>

<h2 className="section-title">Our Vision</h2>
<p>
  We envision a future where every Bahrain Polytechnic student shapes their journey with fearless flexibility — 
  unleashing bold creativity, seizing opportunities, and thriving in a trusted community backed by Al Salam Bank.
</p>

<h2 className="section-title">What We Value</h2>
<ul className="value-list">
  <li><strong>Empowerment:</strong> Build financial freedom while growing professionally.</li>
  <li><strong>Flexibility:</strong> Work on your terms, wherever and whenever you choose.</li>
  <li><strong>Creativity:</strong> Express your boldest ideas with confidence in a risk-friendly zone.</li>
  <li><strong>Trust:</strong> Experience fairness, transparency, and support at every step.</li>
</ul>

      </div>
      <Footer/>
    </div>
  );
};

export default AboutUs;
