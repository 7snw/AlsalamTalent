import React, { useState, useEffect } from 'react';
import '../../Style/Admin/UsersList.css';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import Navbar from '../../Components/Navbar';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import { useNavigate } from 'react-router-dom';
import AddUser from '../../Assets/AddUser.png';
import Footer from '../../Components/Footer';
import axios from 'axios';

// Admin page for listing all clients (users)
const UsersList = () => {
  const navigate = useNavigate(); // Used for page navigation
  const [search, setSearch] = useState(''); // Search input state
  const [usersData, setUsersData] = useState([]); // List of users fetched

  // Fetch users from backend on page load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/client');
        setUsersData(response.data); // Set users data to state
      } catch (error) {
        console.error('Error fetching users:', error); // Log fetch error
      }
    };

    fetchUsers();
  }, []);

  // Filter users by search query
  const filteredUsers = usersData.filter(
    (user) => user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page">
      <Navbar links={NavConfig4} /> {/* Admin navbar */}

      <div className="users-container">
        <div className="users-content">

          {/* Search bar and Add user button */}
          <div className="users-results"> 
            <div className="search-add-wrapper">
              <h1 className="page-title">Clients</h1>

              {/* Search input field */}
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Who are you looking for?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <img src={SearchIcon} alt="search" className="search-icon" />
              </div>

              {/* Add new client button */}
              <button className="add-user-btn" onClick={() => navigate('/addusers')}>
                <img src={AddUser} alt="Add User" className="add-user-icon" />
              </button>
            </div>

            {/* Render filtered client cards */}
            {filteredUsers.map((user, i) => (
              <div className="users-card" key={i}>
                <div className="users-info">
                  <div>
                    <h3>{user.fullName}</h3>
                    <p>{user.occupation || 'N/A'}</p> {/* Show occupation or fallback */}
                  </div>
                </div>

                {/* Edit profile button */}
                <div className="users-meta">
                  <button
                    className="edit-btn1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edituser/${user._id}`); // Navigate to edit user page
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

      <Footer /> {/* Footer */}
    </div>
  );
};

export default UsersList;
