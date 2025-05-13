// PaymentMockModal.js
import React from 'react';
import '../Style/Clients/PaymentMockModal.css';

const PaymentMockModal = ({ method, onClose }) => {
  return (
    <div className="payment-mock-overlay">
      <div className="payment-mock-modal">
        <div className="mock-header">
          <h3>{method === 'BENEFIT Gateway' ? 'BENEFIT PAYMENT GATEWAY' : 'Al Salam Bank Payment'}</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="mock-content">
          {method === 'BENEFIT Gateway' ? (
            <div className="benefit-form">
              <label>Amount:</label>
              <input type="text" value="BHD 100.000" disabled />
              <label>Card Type:</label>
              <input type="text" value="Debit" disabled />
              <label>Card Number:</label>
              <input type="text" placeholder="Enter card number" />
              <label>Expiry Date:</label>
              <div className="row">
                <select><option>12</option></select>
                <select><option>2027</option></select>
              </div>
              <label>Card Holder Name:</label>
              <input type="text" placeholder="Enter name" />
              <label>PIN:</label>
              <input type="password" placeholder="••••" />
              <button className="pay-btn">Pay</button>
            </div>
          ) : (
            <div className="alsalam-form">
              <label>Transfer To:</label>
              <input type="text" placeholder="Mobile Number or IBAN" />
              <label>Amount:</label>
              <input type="text" placeholder="Enter Amount" />
              <label>Description:</label>
              <textarea placeholder="Payment Description" rows="3"></textarea>
              <button className="pay-btn">Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMockModal;
