import React from 'react';
import '../Style/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3 className="footer-logo">Al Salam Talents</h3>
          <p>Empowering Bahrain Polytechnic students with real-world experiences.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Platform</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/aboutUs">About Us</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Al Salam Talents. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
