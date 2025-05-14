import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Navbar.css';
import Logo from '../Assets/Logo.png';
import ChatIcon from '../Assets/Chat.png';
import BellIcon from '../Assets/Bell.png';
import BellIconNew from '../Assets/Bell2.png';
import DefaultUserIcon from '../Assets/User.png';
import axios from 'axios';
import { showError, showInfo, showAlert } from '../utils/toastMessages';

const Navbar = ({ links = [] }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(DefaultUserIcon);
  const [redirectPath, setRedirectPath] = useState('/');
  const [hasNotifications, setHasNotifications] = useState(false);

  const showIcons = links.showIcons === true;
  const hideSignIn = links.hideSignIn === true;
  const showSignIn = !hideSignIn;

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?._id;
  const role = storedUser?.role;

  useEffect(() => {
    if (role) {
      const normalizedRole = role.toLowerCase();
      if (normalizedRole === 'admin') setRedirectPath('/adminallprojects');
      else if (normalizedRole === 'client') setRedirectPath('/clienthome');
      else if (normalizedRole === 'freelancer') setRedirectPath('/freelancer-home');
    }
  }, [role]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (role && userId) {
        try {
          let apiUrl = '';
          if (role === 'freelancer') {
            apiUrl = `http://localhost:5000/api/freelancer/profile/${userId}`;
          }

          if (apiUrl) {
            const { data } = await axios.get(apiUrl);
            if (data?.profileImageUrl) {
              setProfileImage(data.profileImageUrl);
            }
          }
        } catch (error) {
          showError(error);
          setProfileImage(DefaultUserIcon);
        }
      }
    };

    const fetchNotifications = async () => {
      if (!userId || !role) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/notifications/${userId}/${role.toLowerCase()}`
        );
        setHasNotifications(res.data.length > 0);
      } catch (err) {
        console.warn('🔔 Failed to load notifications icon state:', err);
      }
    };

    fetchProfileImage();
    fetchNotifications();
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
    showInfo('Signed out successfully!');
    navigate('/landingpage');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div
          className="logo-title"
          onClick={() => navigate(redirectPath)}
          style={{ cursor: 'pointer' }}
        >
          <img src={Logo} alt="Logo" className="logo-image" />
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
            onClick={() => navigate('/messages')}
          />
          <img
            src={hasNotifications ? BellIconNew : BellIcon}
            alt="Notifications"
            className="nav-icon"
            onClick={() => {
              if (role === 'freelancer') navigate('/freelancer-notifications');
              else if (role === 'client') navigate('/client-notifications');
              else if (role === 'admin') navigate('/admin-notifications');
              else showAlert('Unknown role. Cannot open notifications.');
            }}
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
        <button className="sign-in-btn2" onClick={() => navigate('/signin')}>
          Sign In
        </button>
      )}
    </nav>
  );
};

export default Navbar;
