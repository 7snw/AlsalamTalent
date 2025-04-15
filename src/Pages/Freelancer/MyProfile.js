// src/pages/FreelancerProfile2.js
import React, { useState } from 'react';
import '../../Style/Freelancer/MyProfile.css';
import Navbar from '../../Components/Navbar';
import '../../Style/Navbar.css';
import { NavConfig2 } from '../../Data/NavbarConfigs';
import userIcon from '../../Assets/ProfileIcon.png';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedFiles([...uploadedFiles, imageUrl]);
    }
  };
  

  return (
    <div className="freelancer-profile2">
      <Navbar links={NavConfig2} />
      <div className="profile-container2">
        <div className="profile-header2">
          <div className="left-profile2">
            <img src={userIcon} alt="User Icon" className="profile-image2" />
            <div className="profile-info2">
              <h2>Fatema Almutawa</h2>
            </div>
          </div>
          <button className="edit-profile" >Edit Profile</button>
        </div>

        <div className="tab-buttons2">
          <button
            className={activeTab === 'about' ? 'active' : ''}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={activeTab === 'portfolio' ? 'active' : ''}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
        </div>
        <hr />

        {activeTab === 'about' ? (
          <div className="about-section2">
            <div className="basic-info2">
              <p><strong>Name:</strong> Fatema Almutawa</p>
              <p><strong>ID:</strong> 202100888</p>
              <p><strong>Major:</strong> Web Media</p>
            </div>

            <div className="bio-info2">
              <h4>Biography</h4>
              <p>
                I'm a passionate Web Media student with a focus on creating visually compelling and user-friendly websites.
                Skilled in HTML, CSS, and JavaScript, I specialize in designing responsive websites that enhance user experience.
                Currently freelancing, I help clients bring their digital visions to life with custom, innovative web solutions.
              </p>
            </div>

            <div className="skills-info2">
              <h4>Skills</h4>
              <p>Branding, Marketing, Web Design, Photography</p>
            </div>

            <div className="specialties-info2">
              <h4>Specialties</h4>
              <p>Marketing, Web Design</p>
            </div>
          </div>
        ) : (
          <div className="portfolio-section2">
            <div className="portfolio-grid2">
              <div className="portfolio-card2 card21"></div>
              <div className="portfolio-card2 card22"></div>

              
              {uploadedFiles.map((url, index) => (
  <div key={index} className="portfolio-card2 uploaded-image-card">
    <img src={url} alt={`upload-${index}`} className="uploaded-image" />
  </div>
))}

              <label className="add-portfolio-card">
                +
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
