import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Navbar.css';
import Logo from '../Assets/Logo.jpg';
import ChatIcon from '../Assets/Chat.png';
import BellIcon from '../Assets/Bell.png';
import DefaultUserIcon from '../Assets/User.png';
import axios from 'axios';

const Navbar = ({ links = [] }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(DefaultUserIcon);

  const showIcons = links.showIcons === true;
  const hideSignIn = links.hideSignIn === true;
  const showSignIn = !hideSignIn;

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (role && userId) {
        try {
          let apiUrl = '';
          if (role === 'freelancer') {
            apiUrl = `http://localhost:5000/api/freelancer/profile/${userId}`;
          }
          // You can add for client/admin if needed.

          if (apiUrl) {
            const { data } = await axios.get(apiUrl);
            if (data?.profileImageUrl) {
              setProfileImage(data.profileImageUrl); // No need to add http://localhost:5000 manually
            }
          }
        } catch (error) {
          console.error('Error fetching profile image:', error);
          setProfileImage(DefaultUserIcon);
        }
      }
    };

    fetchProfileImage();
  }, [role, userId]);

  // Paths depending on user role
  let profilePath = '/';
  let editProfilePath = null;
  let addProfilePath = null;
  let auditProfilePath = null;

  if (role === 'freelancer') {
    profilePath = '/myprofile';
    editProfilePath = '/profilesettings';
  } else if (role === 'client') {
    profilePath = '/profilesettingsclint';
  } else if (role === 'admin') {
    profilePath = '/adminprofilesettings';
    addProfilePath = '/AddUsers';
    auditProfilePath = '/AuditLogs';
  }

  const handleSignOut = () => {
    localStorage.clear();
    alert('Signed out');
    navigate('/landingpage');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
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
                <span className="nav-link">{link.label}</span>
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
          <img
            src={ChatIcon}
            alt="Chat"
            className="nav-icon"
            onClick={() => navigate('/freelancermessages')}
          />
          <img
            src={BellIcon}
            alt="Bell"
            className="nav-icon"
            onClick={() => navigate('/freelancernotifications')}
          />

          <div className="user-dropdown-wrapper">
            <img
              src={profileImage || DefaultUserIcon}
              alt="User"
              className="nav-icon profile-icon-navbar"
            />
            <div className="user-dropdown">
              <div className="dropdown-item" onClick={() => navigate(profilePath)}>Profile</div>
              {editProfilePath && (
                <div className="dropdown-item" onClick={() => navigate(editProfilePath)}>Edit Profile</div>
              )}
              {addProfilePath && (
                <div className="dropdown-item" onClick={() => navigate(addProfilePath)}>Add a new account</div>
              )}
              {auditProfilePath && (
                <div className="dropdown-item" onClick={() => navigate(auditProfilePath)}>Audit Logs</div>
              )}
              <div className="dropdown-item" onClick={handleSignOut}>Sign Out</div>
            </div>
          </div>
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
