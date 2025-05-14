import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/PaymentHistoryMock.css';

const mockPayments = [
  {
    id: 1,
    method: 'BENEFIT Gateway',
    amount: '100.000 BHD',
    date: '2024-12-10',
    status: 'Completed',
  },
  {
    id: 2,
    method: 'Al Salam Bank',
    amount: '250.000 BHD',
    date: '2025-01-22',
    status: 'Pending',
  },
  {
    id: 3,
    method: 'BENEFIT Gateway',
    amount: '75.000 BHD',
    date: '2025-03-05',
    status: 'Pending',
  },
];

const PaymentHistoryMock = () => {
  const navigate = useNavigate();

  // Calculate total amount
  const totalAmount = mockPayments.reduce((sum, p) => {
    const numericValue = parseFloat(p.amount.split(' ')[0]); // '100.000 BHD' -> 100.000
    return sum + numericValue;
  }, 0).toFixed(3);

  return (
    <div className="ph-overlay">
      <div className="ph-modal">
        <div className="ph-header">
          <h3>Payment History</h3>
          <button onClick={() => navigate(-1)} className="ph-close-btn">✕</button>
        </div>

        <div className="ph-content">
          {mockPayments.length === 0 ? (
            <p>No payment records available.</p>
          ) : (
            <>
              <table className="ph-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{payment.method}</td>
                      <td>{payment.amount}</td>
                      <td>{payment.date}</td>
                      <td className={`ph-status ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ph-total">
                <strong>Total Amount:</strong> {totalAmount} BHD
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryMock;
