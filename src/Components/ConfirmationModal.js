import React from 'react';
import '../Style/ConfirmationModal.css';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-overlay44">
      <div className="confirmation-box44">
        <p>{message}</p>
        <div className="confirmation-buttons44">
          <button className="confirm-btn44" onClick={onConfirm}>Yes</button>
          <button className="cancel-btn44" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
