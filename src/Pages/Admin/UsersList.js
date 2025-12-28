import React, { useState, useEffect } from "react";
import "../../Style/Admin/UsersList.css";
import "../../Style/Navbar.css";
import "../../Style/PageContents.css";
import Navbar from "../../Components/Navbar";
import { NavConfig4 } from "../../Data/NavbarConfigs";
import SearchIcon from "../../Assets/search.png";
import { useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer";
import axios from "axios";
import { FaPlus } from "react-icons/fa";

const UsersList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/client");
        setUsersData(data || []);
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = usersData.filter((u) =>
    (u.fullName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page">
      <Navbar links={NavConfig4} />

      <div className="users-container">
        {/* Header row: title + Add Client */}
        <div className="clients-header">
          <h2 className="clients-title">Clients</h2>
          <button className="add-client-btn" onClick={() => navigate("/addusers")}>
            <FaPlus className="plus" />
            Add Client
          </button>
        </div>

        {/* Big rounded search bar */}
        <div className="clients-search">
          <input
            type="text"
            placeholder="Who are you looking for?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <img src={SearchIcon} alt="Search" className="clients-search-icon" />
        </div>

        {/* List */}
        <div className="users-results">
          {filteredUsers.map((user) => (
            <div className="users-card" key={user._id}>
              <div className="users-info">
                <div>
                  <h3>{user.fullName}</h3>
                  <p>{user.occupation || "Marketing & Communications"}</p>
                </div>
              </div>

              <div className="users-meta">
                <button
                  className="client-edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edituser/${user._id}`);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UsersList;
