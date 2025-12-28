import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import axios from "axios";
import "../../Style/Clients/PaymentsLedger.css";
import { jsPDF } from "jspdf";

const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");

export default function PaymentsLedger() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");          // 🔎 search text
 

  const client = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  }, []);

  const reload = async () => {
    if (!client?._id) return;
    try {
      setLoading(true);
      const params = { from, to };
      if (q.trim()) params.q = q.trim();   // send q to backend
      const { data } = await axios.get(`${API_BASE}/api/payments/by-client/${client._id}`, { params });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // fetch on first load and whenever filters/search change (debounced for q)
  useEffect(() => {
    const t = setTimeout(reload, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, from, to, q]);

  const fmtIBAN = (iban = "") =>
    String(iban).replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();

   const exportPDF = () => {
    const doc = new jsPDF();
    let y = 14;

    doc.setFontSize(12);
    doc.text("Freelancer Payments", 14, y);
    y += 8;

    if (from || to) {
      doc.setFontSize(9);
      doc.text(`Range: ${from || "—"} to ${to || "—"}`, 14, y);
      y += 5;
    }

    doc.setFontSize(8);
    doc.text("Date", 14, y);
    doc.text("Project", 48, y);
    doc.text("Freelancer", 100, y);
    doc.text("IBAN", 140, y);
    doc.text("Amount", 190, y, { align: "right" });
    y += 4;
    doc.line(14, y, 196, y);
    y += 3;

    rows.forEach((r) => {
      const dt = new Date(r.createdAt || r.date).toLocaleDateString();

      const projectWrapped    = doc.splitTextToSize(r.projectTitle || "", 50);
      const freelancerWrapped = doc.splitTextToSize(r.freelancerName || "", 35);
      const ibanWrapped       = doc.splitTextToSize(r.iban || "—", 40);

      const lines = Math.max(projectWrapped.length, freelancerWrapped.length, ibanWrapped.length);

      for (let i = 0; i < lines; i++) {
        if (i === 0) doc.text(dt, 14, y);
        if (projectWrapped[i])    doc.text(projectWrapped[i], 48, y);
        if (freelancerWrapped[i]) doc.text(freelancerWrapped[i], 100, y);
        if (ibanWrapped[i])       doc.text(ibanWrapped[i], 140, y);

        if (i === 0) {
          doc.text(`${r.amount} ${r.currency || "BHD"}`, 190, y, { align: "right" });
        }
        y += 4;
      }

      y += 1;
      if (y > 280) { doc.addPage(); y = 14; }
    });

    doc.save("freelancer-payments.pdf");
  };

 
  return (
    <div className="ledger-page">
      <Navbar links={NavConfig3} />
      <div className="ledger-hero" aria-hidden />

      <div className="ledger-container">
        <div className="ledger-head">
          <div>
            <h1 className="paa-title">Payments</h1>
          </div>

          <div className="filters">
            {/* Search by freelancer or payment ID */}
            <label className="input-wrap1">
             
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
              />
            </label>

            <label className="input-wrap">
              <span>From&nbsp;</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>

            <label className="input-wrap">
              <span>To&nbsp;</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>

            <button className="export-btn" onClick={exportPDF}>Export PDF</button>
          </div>
        </div>

        {loading ? (
          <div className="ledger-loading"><div className="spinner" /> Loading payments…</div>
        ) : rows.length === 0 ? (
          <div className="ledger-empty">
            <div className="illustration" aria-hidden />
            <h4>No payments found</h4>
            <p>Try changing the date range or search.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Freelancer</th>
                  <th>IBAN</th>
                  <th className="col-amount">Amount</th>
               
                  <th>Payment ID</th>
                 
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.createdAt || r.date).toLocaleDateString()}</td>
                    <td className="col-project">{r.projectTitle}</td>
                    <td>{r.freelancerName}</td>
                    <td className="mono">{fmtIBAN(r.iban)}</td>
                    <td className="col-amount">{r.amount} {r.currency || "BHD"}</td>
                   
                    <td className="mono">{r.paymentId || "—"}</td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
