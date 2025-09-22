// src/Components/Footer.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Style/Footer.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import CtrlzLogo from "../Assets/ctrlz-logo.png";

const Footer = ({ forceWave, forceNoWave }) => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const [showWave, setShowWave] = useState(true);

  // Compute auth + role on every render (keeps it reactive without extra state)
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const role = (storedUser?.role || "").toLowerCase();
  const isAuthed = !!storedUser;

  // Role-based Home path
  const homePath = isAuthed
    ? role === "freelancer"
      ? "/freelancer-home"
      : role === "client"
      ? "/clienthome"
      : role === "admin"
      ? "/analyticsadmin"
      : "/landingpage"
    : "/landingpage";

  useEffect(() => {
    // explicit overrides win
    if (forceWave === true) return void setShowWave(true);
    if (forceNoWave === true) return void setShowWave(false);

    // auto-detect: look for common wave containers
    const check = () => {
      const hasPageWaves = !!document.querySelector(
        ".fh-bg, .wavy-bg, [data-has-waves='true']"
      );
      setShowWave(!hasPageWaves);
    };

    check(); // on mount / route change

    // observe DOM in case waves mount after footer
    const mo = new MutationObserver(() => check());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, [location.pathname, forceWave, forceNoWave]);

  const handleLogoClick = () => {
    // If logged in, sign out then go to landing page
    if (isAuthed) {
      localStorage.clear();
    }
    navigate("/landingpage");
  };

  const handleLogoKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLogoClick();
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate(homePath);
  };

  return (
    <footer className={`site-footer ${showWave ? "has-wave" : "is-transparent"}`}>
      {/* wave */}
      {showWave && (
        <div className="footer-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 180" preserveAspectRatio="none">
            <path
              className="wave-fill"
              d="M0,90 C220,150 520,150 720,130 C960,105 1200,60 1440,30 L1440,180 L0,180 Z"
            />
            <path
              className="wave-line wave-line--blue"
              d="M0,85 C220,145 520,145 720,125 C960,100 1200,55 1440,25"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="wave-line wave-line--accent"
              d="M0,70 C220,130 520,130 720,112 C960,90 1200,47 1440,15"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      <div className="footer-inner">
        <div className="foot-col">
          <div
            className="foot-logo"
            role="button"
            tabIndex={0}
            onClick={handleLogoClick}
            onKeyDown={handleLogoKey}
            aria-label="ctrlZ logo (click to go to Home)"
          >
           <img src={CtrlzLogo} alt="Logo" className="logo-image22" />
          </div>
          <p className="foot-tagline">"Undo Limits | Redo Possibilities"</p>
          <p className="foot-copy">© {year} ctrlZ. All rights reserved.</p>
        </div>

        <div className="foot-col">
          <h4 className="foot-title">Platform</h4>
          <ul className="foot-list">
            {/* Home is dynamic based on auth/role */}
            <li>
              <a href={homePath} onClick={handleHomeClick}>
                Home
              </a>
            </li>
            <li>
              <a href="/aboutus" onClick={(e) => { e.preventDefault(); navigate("/aboutus"); }}>
                About us
              </a>
            </li>
          </ul>
        </div>

        <div className="foot-col">
          <h4 className="foot-title">Contact</h4>
          <ul className="foot-list">
            <li>
              <a href="mailto:control@ctrlz.bh">control@ctrlz.bh</a>
            </li>
            <li>
              <a href="tel:+97300000000">+973 0000 0000</a>
            </li>
          </ul>

          <h4 className="foot-title mt12">Location</h4>
          <address className="foot-address">
            Bahrain Polytechnic, Campus B
            <div className="foot-subaddress">Building 25 | 1st Floor | Room 25.228</div>
          </address>
        </div>

        <div className="foot-col">
          <h4 className="foot-title1">Get Socials</h4>
          <ul className="foot-social-icons">
            <li>
              <a
                href="https://instagram.com/yourhandle"
                target="_blank"
                rel="noreferrer"
                className="icon-link"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/yourhandle"
                target="_blank"
                rel="noreferrer"
                className="icon-link"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@yourhandle"
                target="_blank"
                rel="noreferrer"
                className="icon-link"
                aria-label="TikTok"
              >
                <SiTiktok />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
