// src/Components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Navbar.css';
import Logo from '../Assets/Logo.jpg';
import ChatIcon from '../Assets/Chat.png';
import BellIcon from '../Assets/Bell.png';
import UserIcon from '../Assets/User.png';

const Navbar = ({ links = [] }) => {
  const navigate = useNavigate();
  const showIcons = links.showIcons === true;
  const hideSignIn = links.hideSignIn === true;
  const showSignIn = !hideSignIn;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo-title">
          <img src={Logo} alt="Logo" className="logo-image" />
          <span className="site-name">Al Salam Talents</span>
        </div>

        <ul className="nav-links">
          {links.map((link, index) => (
            <li key={index} className={`nav-item ${link.dropdown ? 'has-dropdown' : ''}`}>
              {link.path ? (
                <span onClick={() => navigate(link.path)} className="nav-link">
                  {link.label}
                </span>
              ) : (
                <span className="nav-link">{link.label}</span> // non-clickable parent
              )}

              {link.dropdown && (
                <ul className="dropdown">
                  {link.dropdown.map((sub, subIndex) => (
                    <li
                      key={subIndex}
                      className="dropdown-item"
                      onClick={() => navigate(sub.path)}
                    >
                      {sub.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {showIcons && (
        <div className="nav-icons">
          <img src={ChatIcon} alt="Chat" className="nav-icon" onClick={() => navigate('/freelancermessages')} />
          <img src={BellIcon} alt="Bell" className="nav-icon" onClick={() => navigate('/freelancernotifications')}/>
          <img src={UserIcon} alt="User" className="nav-icon" onClick={() => navigate('/myprofile')}/>
        </div>
      )}

      {showSignIn && (
        <button className="sign-in-btn" onClick={() => navigate('/signin')}>
          Sign In
        </button>
      )}
    </nav>
  );
};

export default Navbar;
