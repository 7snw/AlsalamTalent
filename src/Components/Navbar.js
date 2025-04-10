// src/Components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Navbar.css';
import Logo from '../Assets/Logo.jpg';

const Navbar = ({ links = [] }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo-title">
          <img src={Logo} alt="Logo" className="logo-image" />
          <span className="site-name">Al Salam Talents</span>
        </div>
        <ul className="nav-links">
          {links.map((link, index) => (
            <li key={index} onClick={() => navigate(link.path)}>
              {link.label}
              {link.dropdown && (
                <ul className="dropdown">
                  {link.dropdown.map((sub, subIndex) => (
                    <li key={subIndex} onClick={() => navigate(sub.path)}>
                      {sub.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button className="sign-in-btn" onClick={() => navigate('/signin')}>
        Sign In
      </button>
    </nav>
  );
};

export default Navbar;
