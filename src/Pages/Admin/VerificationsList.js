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

const VerificationsList = () => {
  const [allFreelancers, setAllFreelancers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [polytechStatusMap, setPolytechStatusMap] = useState({});
  const [confirmData, setConfirmData] = useState(null);

  const checkAllStudentIds = async (freelancers) => {
    const map = {};
    for (const user of freelancers) {
      if (user.studentId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/polytech/check/${user.studentId}`);
          map[user._id] = res.data.exists;
        } catch (err) {
          console.error(`Error checking ID ${user.studentId}:`, err);
          map[user._id] = false;
        }
      }
    }
    setPolytechStatusMap(map);
  };

  const fetchFreelancers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/freelancer/pending');
      setAllFreelancers(res.data);
      checkAllStudentIds(res.data);
    } catch (err) {
      console.error('Error loading pending freelancers:', err);
    }
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  const confirmVerify = async () => {
    if (!confirmData) return;
    try {
      const res = await axios.post('http://localhost:5000/api/admin/verify', {
        freelancerId: confirmData.freelancerId,
      });
      showAlert(res.data.message);
      fetchFreelancers();
    } catch (err) {
      console.error('Verification error:', err);
      showAlert(err.response?.data?.message || 'Verification failed.');
    } finally {
      setConfirmData(null);
    }
  };

  const filteredList = allFreelancers.filter((user) => {
    const matchFilter = filter === 'all' || user.userType === filter;
    const matchSearch = user.fullName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="graduates-page">
      <Navbar links={NavConfig4} />
      <div className="graduates-container">
        <div className="graduates-content">
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

            <div className="filter-wrapper3">
              <label>Filter:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="student">Students</option>
                <option value="graduate">Graduates</option>
              </select>
            </div>
          </div>

          <div className="graduates-results">
            {filteredList.map((user) => (
              <div className="graduates-card" key={user._id}>
                <div className="graduates-info">
                  <div>
                    <h3>{user.fullName}</h3>
                    <p>{user.userType}</p>
                    <p>{user.email}</p>
                    <p>{user.studentId && `Student ID: ${user.studentId}`}</p>
                    {user.userType === 'graduate' && user.cprImageUrl && (
                      <p>
                        <a href={user.cprImageUrl} target="_blank" rel="noopener noreferrer">
                          View CPR
                        </a>
                      </p>
                    )}
                  </div>
                </div>
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
                      disabled={polytechStatusMap[user._id] === false}
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

      {confirmData && (
        <ConfirmationModal
          message={confirmData.message}
          onConfirm={confirmVerify}
          onCancel={() => setConfirmData(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default VerificationsList;
