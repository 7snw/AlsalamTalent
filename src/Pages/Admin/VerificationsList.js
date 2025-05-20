import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../../Style/Admin/VerificationsList.css';
import Footer from '../../Components/Footer';
import '../../Style/Navbar.css';
import '../../Style/PageContents.css';
import { NavConfig4 } from '../../Data/NavbarConfigs';
import SearchIcon from '../../Assets/search.png';
import Navbar from '../../Components/Navbar';
import { showAlert } from '../../utils/toastMessages';
import ConfirmationModal from '../../Components/ConfirmationModal';

// Admin page for verifying student or graduate freelancers
const VerificationsList = () => {
  const [allFreelancers, setAllFreelancers] = useState([]); // All pending freelancers
  const [filter, setFilter] = useState('all');              // Filter: all, student, graduate
  const [search, setSearch] = useState('');                 // Search input
  const [polytechStatusMap, setPolytechStatusMap] = useState({}); // Map to track student ID status
  const [confirmData, setConfirmData] = useState(null);     // Data for confirmation modal

  // Check student IDs with Polytech API and update map
  const checkAllStudentIds = async (freelancers) => {
    const map = {};
    for (const user of freelancers) {
      if (user.studentId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/polytech/check/${user.studentId}`);
          map[user._id] = res.data.exists; // True if student exists in Polytech
        } catch (err) {
          console.error(`Error checking ID ${user.studentId}:`, err);
          map[user._id] = false;
        }
      }
    }
    setPolytechStatusMap(map); // Update state with map
  };

  // Fetch pending freelancers from backend
  const fetchFreelancers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/freelancer/pending');
      setAllFreelancers(res.data); // Set freelancer list
      checkAllStudentIds(res.data); // Check student ID validity
    } catch (err) {
      console.error('Error loading pending freelancers:', err);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  // Confirm verification
  const confirmVerify = async () => {
    if (!confirmData) return;
    try {
      const res = await axios.post('http://localhost:5000/api/admin/verify', {
        freelancerId: confirmData.freelancerId,
      });
      showAlert(res.data.message); // Show success message
      fetchFreelancers(); // Refresh list
    } catch (err) {
      console.error('Verification error:', err);
      showAlert(err.response?.data?.message || 'Verification failed.');
    } finally {
      setConfirmData(null); // Close modal
    }
  };

  // Filter and search freelancers
  const filteredList = allFreelancers.filter((user) => {
    const matchFilter = filter === 'all' || user.userType === filter;
    const matchSearch = user.fullName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="graduates-page">
      <Navbar links={NavConfig4} /> {/* Admin navbar */}

      <div className="graduates-container">
        <div className="graduates-content">
          {/* Top Bar: Title, Search, Filter */}
          <div className="search-add-wrapper3">
            <h1 className="page-title3">Pending Verifications</h1>

            <div className="search-wrapper3">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img src={SearchIcon} alt="search" className="search-icon3" />
            </div>

            {/* Filter by user type */}
            <div className="filter-wrapper3">
              <label>Filter:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="student">Students</option>
                <option value="graduate">Graduates</option>
              </select>
            </div>
          </div>

          {/* List of cards */}
          <div className="graduates-results">
            {filteredList.map((user) => (
              <div className="graduates-card" key={user._id}>
                <div className="graduates-info9">
                  <div>
                    <h3>{user.fullName}</h3>
                    <p>{user.userType}</p>
                    <p>{user.email}</p>
                    <p>{user.studentId && `Student ID: ${user.studentId}`}</p>

                    {/* View CPR for graduates */}
                    {user.userType === 'Graduate' && user.cprImageUrl && (
                      <p>
                        <a href={user.cprImageUrl} target="_blank" rel="noopener noreferrer">
                          View CPR
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Verify Button */}
                <div className="graduates-meta">
                  {!user.isVerified && (
                    <button
                      className="verify-btn"
                      onClick={() =>
                        setConfirmData({
                          freelancerId: user._id,
                          message: 'Are you sure you want to verify this freelancer?',
                        })
                      }
                      disabled={polytechStatusMap[user._id] === false} // Disable if not validated
                      style={{
                        opacity: polytechStatusMap[user._id] === false ? 0.6 : 1,
                        cursor: polytechStatusMap[user._id] === false ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmData && (
        <ConfirmationModal
          message={confirmData.message}
          onConfirm={confirmVerify}
          onCancel={() => setConfirmData(null)}
        />
      )}

      <Footer /> {/* Footer */}
    </div>
  );
};

export default VerificationsList;
