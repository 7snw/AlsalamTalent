// src/Components/SignUpNavbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components/SignUpNavbar.css';
import Logo from '../Assets/Logo.jpg';

const SignUpNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="SignUpNavbar">
      <div className="nav-left">
        <div className="logo-title">
          <img src={Logo} alt="Logo" className="logo-image" />
          <span className="site-name">Al Salam Talents</span>
        </div>
        <ul className="nav-links">
          <li onClick={() => navigate('/')}>Home</li>
          <li onClick={() => navigate('/about')}>About us</li>
        </ul>
      </div>
    </nav>
  );
};

export default SignUpNavbar;
