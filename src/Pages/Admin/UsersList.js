// src/pages/UsersList.js
import React from 'react';
import '../../Style/Admin/UsersList.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import { useNavigate } from 'react-router-dom';
import AddUser from '../../Assets/AddUser.png'; // Make sure this icon is added to your assets


const users = [


    {
      name: 'Sarah Ahmed Isa',
      title: 'Marketing Executive',
    },
    {
      name: 'Muneera Mohamed',
      title: 'Marketing Executive',
  
    },
    {
      name: 'Ahmed Rashed',
      title: 'Marketing Executive',
  
    },
    {
      name: 'Lulwa Khalid',
      title: 'Marketing Executive',
  
    },
    {
      name: 'Ahmed Rashed',
      title: 'Marketing Executive',
  
    }, 
    {
      name: 'Ahmed Rashed',
      title: 'Marketing Executive',
  
    },
    {
      name: 'Ahmed Rashed',
      title: 'Marketing Executive',
  
    },
    {
      name: 'Ahmed Rashed',
      title: 'Marketing Executive',
  
    }
  ];
  
  

  const UsersList = () => {
    
const navigate = useNavigate();
    return (
      <div className="users-page">
        <Navbar links={NavConfig4} />
        <div className="users-container">
          <div className="users-content">

            {/* LEFT - Filter */}
            <div className="users-left-panel">
              <h1 className="page-title">Users</h1>

              <div className="filter-section">
              <h3>Filter</h3>
              <p className="hint">Filter your Users according to their Type.</p>
  
              <div className="filter-group">
                <h4>Type</h4>
                <label><input type="checkbox" /> Admin </label>
                <label><input type="checkbox" defaultChecked /> Client </label>
              </div>
  
              </div>
            </div>
  
            {/* RIGHT - Search & Results */}
            <div className="users-results">
              
<div className="search-add-wrapper">
  <div className="search-wrapper">
    <input type="text" placeholder="Who are you looking for?" />
    <img src={SearchIcon} alt="search" className="search-icon" />
  </div>

  <button className="add-user-btn" onClick={() => navigate('/addusers')}>
    <img src={AddUser} alt="Add User" className="add-user-icon" />
  </button>
</div>
  
              {users.map((users, i) => (
               <div className="users-card" key={i}>
               <div className="users-info">
                 <div>
                   <h3>{users.name}</h3>
                   <p>{users.title}</p>
                 </div>
               </div>
             
               <div className="users-meta">
               <button className="edit-btn"  onClick={(e) => {  e.stopPropagation(); navigate('/edituser'); }}>Edit Profile</button>
             </div>
            
             </div>
              
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default UsersList;
  