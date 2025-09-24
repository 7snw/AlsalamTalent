// src/Pages/Clients/BookingsTable.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io as socketIO } from "socket.io-client";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig3 } from "../../Data/NavbarConfigs";
import "../../Style/Clients/BookingsTable.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function BookingsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [spaceType, setSpaceType] = useState("");
  const [dateISO, setDateISO] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/bookings`, {
        params: { q, spaceType, dateISO, limit: 300 },
      });
      setRows(res.data?.items || []);
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setLoading(false);
    }
  }, [q, spaceType, dateISO]); // API_BASE is a constant; do not include it

  useEffect(() => {
    fetchData();
  }, [fetchData]);

 
  useEffect(() => {
    const socket = socketIO(API_BASE, { transports: ["websocket"] });

    socket.on("booking:created", (payload) => {
      const b = payload?.booking || payload;
      if (!b?._id) return;

      // check against current UI filters
      const matchesText =
        !q ||
        (b.freelancerName || "").toLowerCase().includes(q.toLowerCase()) ||
        (b.freelancerEmail || "").toLowerCase().includes(q.toLowerCase());
      const matchesSpace = !spaceType || b.spaceType === spaceType;
      const matchesDate = !dateISO || b.dateISO === dateISO;

      if (matchesText && matchesSpace && matchesDate) {
        setRows((prev) => (prev.some((r) => r._id === b._id) ? prev : [b, ...prev]));
      }
    });

    return () => socket.disconnect();
  }, [q, spaceType, dateISO]);

  return (
    <div className="bklist-wrap">
      <Navbar links={NavConfig3} />
      <div className="bklist-content">
        <h1 className="baaa-title">
          Space Bookings</h1>

        <div className="bklist-filters">
          <input
            className="bklist-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by freelancer name/email…"
          />
          <select
            className="bklist-input"
            value={spaceType}
            onChange={(e) => setSpaceType(e.target.value)}
          >
            <option value="">All spaces</option>
            <option value="desk">Desk</option>
            <option value="studio">Studio</option>
            <option value="podcast">Podcast</option>
          </select>
          <input
            className="bklist-input"
            type="date"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
          <button className="bklist-btn" onClick={fetchData}>Filter</button>
        </div>

        <div className="bklist-tablewrap">
          {loading ? (
            <div className="bklist-loading">Loading…</div>
          ) : (
            <table className="bklist-table">
              <thead>
                <tr>
                  <th>Freelancer Name</th>
                  <th>Freelancer ID</th>
                  <th>Space</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b._id}>
                    <td>{b.freelancerName}</td>
                    <td className="mono">{b.freelancerId}</td>
                    <td className="cap">{b.spaceType}</td>
                    <td>{b.dateISO}</td>
                    <td>{b.timeRange}</td>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="bklist-empty">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
