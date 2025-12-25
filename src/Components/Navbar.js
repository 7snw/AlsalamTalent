import React, { useEffect, useRef, useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../Style/Navbar.css";
import Logo from "../Assets/LightBlue.png";
import ChatIcon from "../Assets/Chat.png";
import BellIcon from "../Assets/Bell.png";
import BellIconNew from "../Assets/Bell2.png";
import DefaultUserIcon from "../Assets/User.png";
import axios from "axios";
import { showError, showAlert } from "../utils/toastMessages";

const Navbar = ({ links = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef(null);

  const [profileImage, setProfileImage] = useState(DefaultUserIcon);
  const [redirectPath, setRedirectPath] = useState("/");
  const [hasNotifications, setHasNotifications] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    if (Array.isArray(links)) return links;
    if (links && Array.isArray(links.items)) return links.items;
    return [];
  }, [links]);

  const showIcons = links.showIcons === true;
  const hideSignIn = links.hideSignIn === true;
  const showSignIn = !hideSignIn;

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  const role = storedUser?.role;

  useEffect(() => {
    if (role) {
      const normalized = role.toLowerCase();
      if (normalized === "admin") setRedirectPath("/adminallprojects");
      else if (normalized === "client") setRedirectPath("/clienthome");
      else if (normalized === "freelancer") setRedirectPath("/freelancer-home");
    }
  }, [role]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (role && userId) {
        try {
          let apiUrl = "";
          if (role === "freelancer") {
            apiUrl = `http://localhost:5000/api/freelancer/profile/${userId}`;
          }
          if (apiUrl) {
            const { data } = await axios.get(apiUrl);
            if (data?.profileImageUrl) setProfileImage(data.profileImageUrl);
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
      } catch {
        console.warn("🔔 Failed to load notifications");
      }
    };

    fetchProfileImage();
    fetchNotifications();
  }, [role, userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setOpenDropdownIndex(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAnyChildActive = (dropdown = []) =>
    dropdown.some((d) => d?.path && location.pathname.startsWith(d.path));

  let profilePath = "/";
  let editProfilePath = null;
  let addProfilePath = null;
  let auditProfilePath = null;

  if (role === "freelancer") {
    profilePath = "/myprofile";
    editProfilePath = "/profilesettings";
  } else if (role === "client") {
    profilePath = "/profilesettingsclint";
  } else if (role === "admin") {
    profilePath = "/adminprofilesettings";
    addProfilePath = "/AddUsers";
    auditProfilePath = "/AuditLogs";
  }

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/landingpage");
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      {/* LEFT: logo + burger + links */}
      <div className="nav-left">
        <div
          className="logo-title"
          onClick={() => navigate(redirectPath)}
          style={{ cursor: "pointer" }}
        >
          <img src={Logo} alt="Logo" className="logo-image" />
        </div>

        {/* Hamburger menu */}
        <button
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map((link, index) => {
            const hasDropdown =
              Array.isArray(link.dropdown) && link.dropdown.length > 0;
            const parentActive =
              hasDropdown && isAnyChildActive(link.dropdown);

            return (
              <li
                key={index}
                className={`nav-item ${hasDropdown ? "has-dropdown" : ""} ${
                  parentActive ? "active" : ""
                } ${openDropdownIndex === index ? "open" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                {!hasDropdown && link.path ? (
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={() => {
                      setMenuOpen(false);
                      setOpenDropdownIndex(null);
                    }}
                    end={link.exact === true}
                  >
                    {link.label}
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    className={`nav-link nav-trigger ${
                      parentActive ? "active" : ""
                    }`}
                    onClick={() =>
                      setOpenDropdownIndex(
                        openDropdownIndex === index ? null : index
                      )
                    }
                    aria-expanded={openDropdownIndex === index}
                    aria-haspopup="true"
                  >
                    {link.label}
                  </button>
                )}

                {hasDropdown && openDropdownIndex === index && (
                  <ul className="dropdown stay-open" role="menu">
                    {link.dropdown.map((sub, subIndex) => (
                      <li key={subIndex}>
                        <NavLink
                          to={sub.path}
                          className={({ isActive }) =>
                            `dropdown-item ${isActive ? "active" : ""}`
                          }
                          onClick={() => {
                            setMenuOpen(false);
                            setOpenDropdownIndex(null);
                          }}
                          role="menuitem"
                        >
                          {sub.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT: icons + sign in */}
      <div className="nav-right">
        {showIcons && (
          <div className="nav-icons">
            <img
              src={ChatIcon}
              alt="Chat"
              className="nav-icon"
              onClick={() => navigate("/messages")}
            />
            <img
              src={hasNotifications ? BellIconNew : BellIcon}
              alt="Notifications"
              className="nav-icon"
              onClick={() => {
                if (role === "freelancer")
                  navigate("/freelancer-notifications");
                else if (role === "client")
                  navigate("/client-notifications");
                else if (role === "admin")
                  navigate("/admin-notifications");
                else showAlert("Unknown role. Cannot open notifications.");
              }}
            />
            <div
              className="user-dropdown-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={profileImage || DefaultUserIcon}
                alt="User"
                className="nav-icon profile-icon-navbar"
              />
              <div className="user-dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => navigate(profilePath)}
                >
                  Profile
                </div>
                {editProfilePath && (
                  <div
                    className="dropdown-item"
                    onClick={() => navigate(editProfilePath)}
                  >
                    Edit Profile
                  </div>
                )}
                {role === "freelancer" && (
                  <>
                    <div
                      className="dropdown-item"
                      onClick={() => navigate("/payment")}
                    >
                      Payment History
                    </div>

                    <div
                      className="dropdown-item"
                      onClick={() => navigate("/booking")}
                    >
                      Book a Space
                    </div>
                  </>
                )}
                {addProfilePath && (
                  <div
                    className="dropdown-item"
                    onClick={() => navigate(addProfilePath)}
                  >
                    Add a new account
                  </div>
                )}
                {auditProfilePath && (
                  <div
                    className="dropdown-item"
                    onClick={() => navigate(auditProfilePath)}
                  >
                    Audit Logs
                  </div>
                )}
                <div className="dropdown-item" onClick={handleSignOut}>
                  Sign Out
                </div>
              </div>
            </div>
          </div>
        )}

        {showSignIn && (
          <button
            className="sign-in-btn2"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
