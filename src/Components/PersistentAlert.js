import React from "react";
import "../Style/PersistentAlert.css";

const PersistentAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="persistent-alert">
      <div className="alert-content">
        <p>{message}</p>
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default PersistentAlert;
