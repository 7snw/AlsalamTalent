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

const UsersList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/client');
        setUsersData(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = usersData.filter(
    (user) => user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page">
      <Navbar links={NavConfig4} />
      <div className="users-container">
        <div className="users-content">
    
          
        

          {/* RIGHT - Search & Results */}
          <div className="users-results"> 
           
            <div className="search-add-wrapper">
                <h1 className="page-title">Clients</h1>
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
                    <h3>{user.fullName}</h3>
                    <p>{user.occupation || 'N/A'}</p>
                  </div>
                </div>

                <div className="users-meta">
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edituser/${user._id}`);
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
      <Footer />
    </div>
  );
};

export default UsersList;
