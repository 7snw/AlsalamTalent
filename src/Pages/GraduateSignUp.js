import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/GraduateSignUp.css";
import axios from "axios";
import { showAlert } from "../utils/toastMessages";
import LandingPage from "./LandingPage";
import TermsContent from "../Components/TermsContent";

const API = "http://localhost:5000/api/freelancer";

/* ---------- Options ---------- */
const expertiseOptions = [
    "Marketing",
  "Graphic Design", 
   "Content Creation",
   "Product Design",
  "Web Design",
   "Photography",
     "Video & Motion",
  "Reports & Presentations"
];
const majors = [
  "School of ICT",
  "School of Creative Media",
  "School of Business",
  "School of Logistics",
  "School of Engineering",
  "School of Foundation",
];

/* ---------- Helpers (IBAN + CV) ---------- */
const normalizeIban = (s = "") => s.replace(/\s+/g, "").toUpperCase();
const isValidBHIban = (s = "") => /^BH\d{2}[A-Z]{4}\d{14}$/.test(normalizeIban(s));
const formatIban = (s = "") => normalizeIban(s).replace(/(.{4})/g, "$1 ").trim();

const CV_MAX_BYTES = 10 * 1024 * 1024;
const CV_ALLOWED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/* ===== Terms modal (reuses TermsContent) ===== */
const GsTermsModal = ({ open, onClose, onAccept }) => {
  const boxRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => { if (!open) { setAtEnd(false); setChecked(false); } }, [open]);
  const onScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setAtEnd(nearBottom);
  };
  if (!open) return null;
  return (
    <div className="gs-tc-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="gs-tc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gs-tc-head">
          <h3>Terms &amp; Conditions</h3>
          <button className="gs-tc-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="gs-tc-body" onScroll={onScroll} ref={boxRef}>
          <TermsContent hideTitle />
          <div style={{ height: 16 }} />
        </div>
        <div className={`gs-tc-consent ${atEnd ? "show" : ""}`}>
          <label className="gs-tc-check">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <span>I read, I understand, and I agree to the Terms &amp; Conditions</span>
          </label>
        </div>
        <div className="gs-tc-actions">
          <button className="gs-tc-accept" disabled={!checked} onClick={() => { onAccept(); onClose(); }}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------- OTP Modal --------------------------- */
/* OtpModal.jsx (or inline) */
const OtpModal = ({ open, onClose, regId, email }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => { if (!open) setCode(""); }, [open]);
  if (!open) return null;

  const API =
  import.meta.env.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:5000";
  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return showAlert("Enter the OTP code.");
    try {
      setLoading(true);
      const res = await axios.post(
  `${API}/verify-otp`,
  { regId, code },
  { withCredentials: true }   // ✅ keep session cookie active
);
      showAlert(res.data?.message || "Verified!");
      window.location.href = "/signin";
    } catch (e) {
      showAlert(e.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      setResending(true);
      await axios.post(`${API}/resend-otp`, { regId }); // 👈 use regId
      showAlert("OTP resent to your email.");
    } catch (e) {
      showAlert(e.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-head">
          <h3>Email Verification</h3>
          <button className="otp-x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="otp-body">
          <p>We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.</p>
          <input
            className="otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="______"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <div className="otp-actions">
            <button onClick={verify} disabled={loading} className="otp-primary">
              {loading ? "Verifying…" : "Verify"}
            </button>
            <button onClick={resend} disabled={resending} className="otp-secondary">
              {resending ? "Resending…" : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ------------------------------ Page ------------------------------ */
const GraduateSignUp = () => {
  const [formData, setFormData] = useState({
    studentId: "", fullName: "", email: "", password: "",
    major: "", phone: "", iban: "", expertise: [], agreeTerms: false,
    cpr: ""
  });
  const [cvFile, setCvFile] = useState(null);

  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [otpModal, setOtpModal] = useState({ open: false, regId: null });

  const expertiseRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDown = (e) => {
      if (showExpertiseDropdown && expertiseRef.current && !expertiseRef.current.contains(e.target)) {
        setShowExpertiseDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showExpertiseDropdown]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") navigate("/landingpage"); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "iban") {
      const formatted = formatIban(value);
      setFormData((p) => ({ ...p, iban: formatted }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleExpertiseChange = (value) => {
    setFormData((prev) => {
      const has = prev.expertise.includes(value);
      return { ...prev, expertise: has ? prev.expertise.filter((v) => v !== value) : [...prev.expertise, value] };
    });
  };

  const handleCvChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return setCvFile(null);
    if (!CV_ALLOWED.includes(f.type)) { showAlert("Please upload a PDF, DOC, or DOCX file."); e.target.value = ""; return; }
    if (f.size > CV_MAX_BYTES) { showAlert("CV must be 10MB or less."); e.target.value = ""; return; }
    setCvFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) return showAlert("Full Name is required.");
    if (formData.password.length < 8) return showAlert("Password must be at least 8 characters long.");
    if (!formData.major) return showAlert("Please select your Major.");
    if (!/^[0-9]{8}$/.test(formData.phone)) return showAlert("Phone number must be exactly 8 digits.");
    if (formData.expertise.length === 0) return showAlert("Please select at least one area of expertise.");
    if (!formData.agreeTerms) return showAlert("Please accept the Terms & Conditions to continue.");
    if (!formData.cpr.trim()) return showAlert("CPR is required."); 

    const cleanIban = normalizeIban(formData.iban);
    if (formData.iban && !isValidBHIban(formData.iban)) return showAlert("Please enter a valid Bahrain IBAN.");

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("studentId", formData.studentId);
      fd.append("fullName", formData.fullName);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("major", formData.major);
      fd.append("phone", formData.phone);
      fd.append("iban", cleanIban);
      fd.append("cpr", formData.cpr); 
      fd.append("expertise", JSON.stringify(formData.expertise));
      if (cvFile) fd.append("cv", cvFile);

      const res = await axios.post(`${API}/graduate-register`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.status === 200 || res.status === 201) {
        showAlert("OTP sent to your email.");
        setOtpModal({ open: true, regId: res.data.regId });

      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gs-body">
      <div className="gs-bg-live" aria-hidden="true"><LandingPage /></div>
      <div className="gs-dim" aria-hidden="true" onClick={() => navigate("/landingpage")} />

      <div className="gs-container" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="gs-title">Create your Account</h2>

        <form onSubmit={handleSubmit} className="gs-form">
          {/* LEFT */}
          <div className="gs-col">
            <div>
              <label>Student ID</label>
              <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} />
            </div>

            <div>
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} minLength="8" required />
            </div>

            <div>
              <label>CPR</label>
              <input type="text" name="cpr" value={formData.cpr} onChange={handleChange} required />
            </div>

           
          </div>

          <div className="gs-divider" aria-hidden="true" />

          {/* RIGHT */}
          <div className="gs-col">
            <div>
              <label>Major</label>
              <select name="major" value={formData.major} onChange={handleChange} className="gs-select" required>
                <option value="">Select Major</option>
                {majors.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="gs-expertise" ref={expertiseRef}>
              <p>Expertise</p>
              <div
                className="gs-expertise-trigger"
                onClick={() => setShowExpertiseDropdown((s) => !s)}
                role="button"
                aria-expanded={showExpertiseDropdown}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowExpertiseDropdown((s) => !s)}
              >
                {formData.expertise.length ? formData.expertise.join(", ") : "Select Expertise"}
              </div>
              {showExpertiseDropdown && (
                <div className="gs-expertise-list">
                  {expertiseOptions.map((option) => (
                    <label key={option} className="gs-expertise-item">
                      <input
                        type="checkbox"
                        checked={formData.expertise.includes(option)}
                        onChange={() => handleExpertiseChange(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label>IBAN Number</label>
              <input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                
              />
            </div>

            <div>
              <label>Contact Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{8}"
                inputMode="numeric"
                required
              />
            </div>

             <div className="gs-file">
              <label>Upload CV</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} />
            </div>

            <button type="submit" className="gs-create" disabled={submitting || !formData.agreeTerms}>
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>

        <div className="gs-terms center">
          <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
          <span>
            I read, I understand, and I agree to the{" "}
            <button type="button" className="gs-terms-link" onClick={() => setShowTerms(true)}>
              Terms &amp; Conditions
            </button>
          </span>
        </div>

        <p className="gs-signin">I have an account? <span onClick={() => navigate("/signin")}>Sign In</span></p>
      </div>

      <GsTermsModal open={showTerms} onClose={() => setShowTerms(false)} onAccept={() => setFormData((p) => ({ ...p, agreeTerms: true }))} />

      {/* OTP Modal */}
      <OtpModal
        open={otpModal.open}
        onClose={() => setOtpModal({ open: false, id: null })}
        regId={otpModal.regId}
        email={formData.email}
      />
    </div>
  );
};

export default GraduateSignUp;
