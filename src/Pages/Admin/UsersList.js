// src/pages/UsersList.js
import React, { useState } from 'react';
import '../../Style/Admin/UsersList.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import { useNavigate } from 'react-router-dom';
import AddUser from '../../Assets/AddUser.png';

const usersData = [
  { name: 'Sarah Ahmed Isa', title: 'Marketing Executive', type: 'Client' },
  { name: 'Muneera Mohamed', title: 'Marketing Executive', type: 'Admin' },
  { name: 'Ahmed Rashed', title: 'Marketing Executive', type: 'Client' },
  { name: 'Lulwa Khalid', title: 'Marketing Executive', type: 'Admin' },
  { name: 'Ahmed Rashed', title: 'Marketing Executive', type: 'Client' },
  { name: 'Ahmed Rashed', title: 'Marketing Executive', type: 'Client' },
  { name: 'Ahmed Rashed', title: 'Marketing Executive', type: 'Admin' },
  { name: 'Ahmed Rashed', title: 'Marketing Executive', type: 'Client' }
];

const UsersList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: [] });
  const [search, setSearch] = useState('');

  const handleCheckbox = (value) => {
    setFilters((prev) => {
      const updatedType = prev.type.includes(value)
        ? prev.type.filter((v) => v !== value) 
        : [...prev.type, value];             
  
      return { ...prev, type: updatedType }; 
    });
  };
  

  const filteredUsers = usersData.filter(
    (user) =>
      (filters.type.length === 0 || filters.type.includes(user.type)) &&
      user.name.toLowerCase().includes(search.toLowerCase())
  );

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
                <label>
                  <input
                    type="checkbox"
                    checked={filters.type.includes('Admin')}
                    onChange={() => handleCheckbox('Admin')}
                  />{' '}
                  Admin
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={filters.type.includes('Client')}
                    onChange={() => handleCheckbox('Client')}
                  />{' '}
                  Client
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT - Search & Results */}
          <div className="users-results">
            <div className="search-add-wrapper">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Who are you looking for?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <img src={SearchIcon} alt="search" className="search-icon" />
              </div>

              <button className="add-user-btn" onClick={() => navigate('/addusers')}>
                <img src={AddUser} alt="Add User" className="add-user-icon" />
              </button>
            </div>

            {filteredUsers.map((user, i) => (
              <div className="users-card" key={i}>
                <div className="users-info">
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.title}</p>
                  </div>
                </div>

                <div className="users-meta">
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/edituser');
                    }}
                  >
                    Edit Profile
                  </button>
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
