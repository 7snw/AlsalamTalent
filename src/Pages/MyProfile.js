// src/Pages/MyProfile.js
import React from 'react';
import Navbar from '../Components/Navbar';
//import FreelancerProfileSection from '../../Components/Profile/FreelancerProfileSection';
import ClientProfileSection from '../Components/ClientProfileSection';
import AdminProfileSection from '../Components/AdminProfileSection';
import {  NavConfig2, NavConfig3, NavConfig4 } from '../Data/NavbarConfigs';
import '../Style/Navbar.css';
import '../Style/ProfilePage.css';

const getNavConfig = (role) => {
  switch (role) {
    case 'freelancer':
      return NavConfig2;
    case 'client':
      return NavConfig3;
    case 'admin':
      return NavConfig4;
    default:
      return NavConfig2;
  }
};

const MyProfile = ({ role }) => {
  const userRole = role || localStorage.getItem('role') ;

  return (
    <div className="profile-page">
      <Navbar links={getNavConfig(userRole)} />

      <div className="profile-container">
        {userRole === 'freelancer'/* && <FreelancerProfileSection />*/}
        {userRole === 'client' && <ClientProfileSection />}
        {userRole === 'admin' && <AdminProfileSection />}
      </div>
    </div>
  );

};


export default MyProfile;
