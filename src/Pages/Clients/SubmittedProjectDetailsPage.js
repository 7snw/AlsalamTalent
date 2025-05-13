// Payment design modal with PaymentMockModal component
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../Style/Clients/SubmittedProjectDetailsPage.css';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { NavConfig3 } from '../../Data/NavbarConfigs';
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';
import PaymentMockModal from '../../Components/PaymentMockModal';

const SubmittedProjectDetailsPage = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMockPaymentUI, setShowMockPaymentUI] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assignments/${id}`);
        setAssignment(res.data);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  const handleAction = async (actionType) => {
    if (!assignment) return;
    try {
      const statusUpdate =
        actionType === 'approve'
          ? 'Completed'
          : actionType === 'revise'
          ? 'Re-submit'
          : 'Declined';

      await axios.put(`http://localhost:5000/api/assignments/${assignment._id}/update-status`, {
        status: statusUpdate,
        rating: actionType === 'approve' ? rating : undefined,
        feedback,
      });

      alert('Action submitted successfully.');
      setSubmitted(true);
      if (actionType === 'approve') {
        setPaymentEnabled(true);
      }
    } catch (err) {
      console.error('Error submitting action:', err);
    }
  };

  const handleMockPayment = (method) => {
    setPaymentMethod(method);
    setShowModal(true);
  };

  const confirmMockPayment = () => {
    setShowModal(false);
    setShowMockPaymentUI(true);
  };

  const closeMockUI = () => setShowMockPaymentUI(false);

  if (loading) return <p>Loading project...</p>;
  if (!assignment || !assignment.projectId) return <p>Project not found</p>;

  return (
    <div className="project-progress-page">
      <Navbar links={NavConfig3} />
      <div className="progress-container">
        <h2>{assignment.projectId?.title || 'Submitted Project'}</h2>

        <div className="top-section">
          <div className="left-section">
            <h4>Client Files:</h4>
            {assignment.projectId.files?.length > 0 ? (
              <ul className="attached-files-list3">
                {assignment.projectId.files.map((file, idx) => (
                  <li key={idx} className="attached-file-item3">
                    {file.name}
                    <button onClick={() => window.open(file.url, '_blank')}>
                      <FiDownload size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No project files provided by the client.</p>
            )}

            <h4>Freelancer Submitted Files:</h4>
            {assignment.docs?.length > 0 ? (
              <ul className="attached-files-list3">
                {assignment.docs.map((file, idx) => (
                  <li key={idx} className="attached-file-item3">
                    {file.name}
                    <button onClick={() => window.open(file.url, '_blank')}>
                      <FiDownload size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files submitted by the freelancer.</p>
            )}

            <h4>Review:*</h4>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={rating >= star ? 'filled' : ''}
                >
                  ★
                </span>
              ))}
            </div>

            <h4>Feedback/Comments:*</h4>
            <textarea
              placeholder="Write your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>

            <div className="actions">
              <button className="approve" disabled={!rating || !feedback || submitted} onClick={() => handleAction('approve')}>
                Approve
              </button>
              <button className="revise" disabled={submitted} onClick={() => handleAction('revise')}>
                Request Revision
              </button>
              <button className="decline" disabled={submitted} onClick={() => handleAction('reject')}>
                Decline
              </button>
            </div>

            {paymentEnabled && (
              <div className="payment-section">
                <h4>Proceed to Payment</h4>
                <p>Select a payment method:</p>
                <div className="payment-buttons">
                  <button className="alsalam-pay-btn" onClick={() => handleMockPayment("AlSalam Bank")}>Pay via AlSalam Bank</button>
                  <button className="benefit-pay-btn" onClick={() => handleMockPayment("BENEFIT Gateway")}>Pay via BENEFIT Gateway</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Payment</h3>
            <p>Proceed with <strong>{paymentMethod}</strong> mock payment?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmMockPayment}>Confirm</button>
              <button className="cancel-btn4" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showMockPaymentUI && (
        <PaymentMockModal
          method={paymentMethod}
          onClose={closeMockUI}
          amount={assignment.projectId.budget}
        />
      )}

      <Footer />
    </div>
  );
};

export default SubmittedProjectDetailsPage;
