// src/Pages/MyProfile.js
import React from 'react';
import '../Style/ProfilePage.css';
import Navbar from '../Components/Navbar';
import { NavConfig2, NavConfig3, NavConfig4 } from '../Data/NavbarConfigs';
import AdminProfileSection from '../Components/AdminProfileSection';
import ClientProfileSection from '../Components/ClientProfileSection';
import FreelancerProfileSection from '../Components/FreelancerProfileSection';

const MyProfile = () => {
  const role = localStorage.getItem('role');
  const user = {
    role,
    name: 'Maryam Yusuf',
    email: 'maryam.yusuf@alsalambank.com',
  };

  const renderProfileForm = () => {
    switch (user.role) {
      case 'freelancer':
        return <FreelancerProfileSection user={user} />;
      case 'admin':
        return <AdminProfileSection user={user} />;
      case 'client':
        return <ClientProfileSection user={user} />;
      default:
        return null;
    }
  };

  const getNavbarConfig = () => {
    switch (user.role) {
      case 'freelancer':
        return NavConfig2;
      case 'admin':
        return NavConfig4;
      case 'client':
        return NavConfig3;
      default:
        return [];
    }
  };

  return (
    <div className="profile-page">
      <Navbar links={getNavbarConfig()} />
      <div className="profile-container">
        {renderProfileForm()}
      </div>
    </div>
  );
};

export default MyProfile;
