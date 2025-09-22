import React from "react";
import "../Style/Clients/SubmittedProjectDetailsPage.css";

export default function PaymentInfoModal({
  open,
  onClose,
  info,          // expected to include at least { iban } (optional)
  projectTitle,  // string
  amount,        // number
  onAccept,      // function
}) {
  if (!open) return null;

  return (
    <div className="pi-overlay">
      <div className="pi-dialog" role="dialog" aria-modal="true" aria-label="Invoice">
        <h3 className="pi-title">Invoice</h3>

        <div className="pi-body">
          <div className="pi-item">
            <span className="pi-label">Subject:</span>
            <span className="pi-value">{projectTitle || "—"}</span>
          </div>

          <div className="pi-item">
            <span className="pi-label">IBAN:</span>
            <span className="pi-value">{info?.iban || "—"}</span>
          </div>

          <div className="pi-item">
            <span className="pi-label">Amount:</span>
            <span className="pi-value">BHD {amount ?? "—"}</span>
          </div>

          <div className="pi-item">
            <span className="pi-label">Method:</span>
            <span className="pi-value">Bank Transfer</span>
          </div>
        </div>

        <div className="pi-actions">
          <button className="pi-accept" onClick={onAccept}>Accept</button>
          <button className="pi-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
