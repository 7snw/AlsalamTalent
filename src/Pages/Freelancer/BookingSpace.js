// src/Pages/Freelancer/BookingSpace.js
import React, { useMemo, useState } from "react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { NavConfig2 } from "../../Data/NavbarConfigs";
import "../../Style/Freelancer/BookingSpace.css";
import deskImg from "../../Assets/Booking/desk.png";
import studioImg from "../../Assets/Booking/studio.png";
import podcastImg from "../../Assets/Booking/podcast.png";


const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const SPACES = [ 
  { id: "studio", name: "Studio", img: studioImg, accent: "#7EC8D6" },
  { id: "desk", name: "Desk", img: deskImg, accent: "#F15C2E" },
  { id: "podcast", name: "Podcast Room", img: podcastImg, accent: "#F8CBB6" },
];

const TIME_SLOTS = ["9:00am–12:00pm", "12:00pm–3:00pm", "3:00pm–6:00pm", "6:00pm–9:00pm"];

const Toast = ({ kind = "info", message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`bk-toast ${kind}`}>
      <span>{message}</span>
      <button className="bk-toast-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
};

const BookingSpace = () => {
  const [selected, setSelected] = useState("desk");
  const [date, setDate] = useState(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ kind: "info", message: "" });

  const chosenSpace = useMemo(() => SPACES.find((s) => s.id === selected), [selected]);
  const showToast = (kind, message) => {
    setToast({ kind, message });
    setTimeout(() => setToast({ kind, message: "" }), 3500);
  };

  const checkAvailable = async (space, d, t) => {
    try {
      const url = `${API_BASE}/api/bookings/check?space=${encodeURIComponent(space)}&date=${encodeURIComponent(d)}&time=${encodeURIComponent(t)}`;
      const res = await fetch(url);
      const data = await res.json();
      return !!data.available;
    } catch (e) {
      console.error("Availability check failed:", e);
      return false;
    }
  };

  const createBooking = async (space, d, t) => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const freelancerId = storedUser?._id;
    if (!freelancerId) throw new Error("Not logged in as freelancer.");

    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ freelancerId, space, date: d, time: t }),
    });

    if (!res.ok) {
      const msg = (await res.json().catch(() => null))?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return true;
  };

  const handleBook = async () => {
    if (!date || !time || !selected) {
      showToast("warn", "Please choose a space, date, and time.");
      return;
    }
    setBusy(true);
    try {
      const available = await checkAvailable(selected, date, time);
      if (!available) {
        showToast("error", "That date & time is already booked.");
      } else {
        await createBooking(selected, date, time);
        showToast("success", `${chosenSpace?.name} booking confirmed!`);
      }
    } catch (e) {
      console.error("Booking failed:", e);
      showToast("error", `Failed to book: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bk-wrap">
      <section className="bk-container">
        <Navbar links={NavConfig2} />
        <h1 className="bk-title">Book a <span>Space</span></h1>

        <div className="bk-cards">
          {SPACES.map((s) => (
            <button key={s.id} className={`bk-card ${selected === s.id ? "active" : ""}`} onClick={() => setSelected(s.id)} aria-pressed={selected === s.id}>
              <div className="bk-card-art" style={{ background: s.id === "desk" ? "#0b172f" : s.id === "studio" ? "#0b172f" : "#0b172f" }}>
                <img src={s.img} alt={s.name} />
              </div>
              <div className="bk-card-name">{s.name}</div>
            </button>
          ))}
        </div>

        <div className="bk-form">
          <div className="bk-field1">
            <label>Date:</label>
            <div className="bk-input bk-icon-left">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            </div>
          </div>

          <div className="bk-field1">
            <label>Time:</label>
            <div className="bk-select bk-icon-left">
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
              <span className="bk-caret">▾</span>
            </div>
          </div>

          <div className="bk-action">
            <button className="bk-btn" onClick={handleBook} disabled={busy} aria-busy={busy}>
              {busy ? "Booking..." : "Book"}
            </button>
          </div>
        </div>
      </section>

      <Toast kind={toast.kind} message={toast.message} onClose={() => setToast({ kind: "info", message: "" })} />
      <Footer />
    </div>
  );
};

export default BookingSpace;
