import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/SignUpPage.css";
import axios from "axios";
import { showAlert } from "../utils/toastMessages";
import LandingPage from "./LandingPage";
import TermsContent from "../Components/TermsContent";

const API = "http://localhost:5000/api/freelancer";

const expertiseOptions = [
  "Marketing",
  "Graphic Design",
  "Content Creation",
  "Product Design",
  "Web Design",
  "Photography",
  "Video & Motion",
  "Reports & Presentations",
];



const isPolyEmail = (e) => /^20\d{7}@student\.polytechnic\.bh$/i.test(String(e).trim());

const extractIdFromEmail = (email = "") => {
  const match = email.match(/^20\d{7}/);
  return match ? match[0] : null;
};


const isValidBHIBAN = (raw) => {
  const iban = String(raw || "").replace(/\s+/g, "").toUpperCase();
  return /^BH\d{2}[A-Z]{4}\d{14}$/.test(iban);
};


// Password Policy Validation
const isStrongPassword = (pwd) => {
  // 1. Length: at least 12 characters (fallback: 8 if system restriction)
  const minLength = 12;
  if (pwd.length < minLength) return false;

  // 2. Must include uppercase, lowercase, number, and special character
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  // 3. Disallow spaces or commonly weak passwords
  const hasSpace = /\s/.test(pwd);
  const commonWeak = ["Password123!", "Admin@123", "Welcome@123", "Qwerty@123"];
  const isWeak = commonWeak.some(w => pwd.toLowerCase() === w.toLowerCase());

  return hasUpper && hasLower && hasNumber && hasSpecial && !hasSpace && !isWeak;
};


const TermsModal = ({ open, onClose, onAccept }) => {
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
    <div className="tc-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="tc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tc-head">
          <h3>Terms &amp; Conditions</h3>
          <button className="tc-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="tc-body" onScroll={onScroll} ref={boxRef}>
          <TermsContent hideTitle />
          <div style={{ height: 16 }} />
        </div>
        <div className={`tc-consent ${atEnd ? "show" : ""}`}>
          <label className="tc-check">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <span>I read, I understand, and I agree to the Terms &amp; Conditions</span>
          </label>
        </div>
        <div className="tc-actions">
          <button className="tc-accept" disabled={!checked} onClick={() => { onAccept(); onClose(); }}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

const OtpModal = ({ open, onClose, regId, email }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => { if (!open) setCode(""); }, [open]);
  if (!open) return null;

 const verify = async () => {
  if (!/^\d{6}$/.test(code)) return showAlert("Enter the 6-digit code.");
  try {
    setLoading(true);
    const res = await axios.post(`${API}/verify-otp`, { regId, code });
    showAlert(res.data?.message || "Verified!");

    try { localStorage.setItem("cz_just_registered", "1"); } catch {}


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
      await axios.post(`${API}/resend-otp`, { regId });
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
            <p>Note: The code may also appear in your Junk folder.</p>
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

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    studentId: "", fullName: "", email: "", password: "",
    major: "", phone: "", expertise: [], iban: "", agreeTerms: false,
  });
  const [cvFile, setCvFile] = useState(null);
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showTermsWarning, setShowTermsWarning] = useState(false);

  const [submitting] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [otpModal, setOtpModal] = useState({ open: false, regId: null });
  const navigate = useNavigate();
  const expertiseRef = useRef(null);

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
    const onKey = (e) => { if (e.key === "Escape") navigate("/studentgraduate"); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    
    if (name === "iban") {
      const compact = value.replace(/[^0-9a-z]/gi, "").toUpperCase();
      const spaced = compact.replace(/(.{4})/g, "$1 ").trim();
      return setFormData((p) => ({ ...p, iban: spaced }));
    }

    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => setCvFile(e.target.files?.[0] ?? null);

  const handleExpertiseChange = (val) => {
    setFormData((p) => {
      const has = p.expertise.includes(val);
      return { ...p, expertise: has ? p.expertise.filter((v) => v !== val) : [...p.expertise, val] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field checks
    if (!formData.studentId.trim()) return showAlert("Student ID is required.");
    if (!isPolyEmail(formData.email)) {
      return showAlert("Please use your Polytechnic email (20xxxxxxx@student.polytechnic.bh).");
    }
    
 // Student ID validation
if (!/^20\d{7}$/.test(formData.studentId)) {
  return showAlert("Student ID must start with 20 and be followed by 7 digits (e.g., 20xxxxxxx).");
}

if (!isPolyEmail(formData.email)) {
  return showAlert("Please use your Polytechnic email (20xxxxxxx@student.polytechnic.bh).");
}

// Cross-check that the student ID matches the number in the email
const idFromEmail = extractIdFromEmail(formData.email);
if (idFromEmail !== formData.studentId) {
  return showAlert("Your Student ID must match your Polytechnic email address.");
}



  if (!formData.fullName.trim()) return showAlert("Full Name is required.");
 if (!isStrongPassword(formData.password)) {
  return showAlert("Password must be at least 12 characters long, include uppercase, lowercase, number, and special character, and must not contain spaces or common patterns.");
}

  if (!formData.major) return showAlert("Please select your Major.");
  if (!/^[0-9]{8}$/.test(formData.phone)) return showAlert("Phone number must be exactly 8 digits.");
  if (formData.expertise.length === 0) return showAlert("Please select at least one area of expertise.");
  if (!formData.iban.trim()) return showAlert("IBAN is required.");
  if (!isValidBHIBAN(formData.iban)) return showAlert("Please enter a valid Bahrain IBAN.");
  if (!cvFile) return showAlert("Please upload your CV.");
if (!formData.agreeTerms) {
  setShowTermsWarning(true);
  showAlert("You must agree to the Terms & Conditions before creating your account.");
  return;
}

    try {
      const fd = new FormData();
      const compactIBAN = formData.iban.replace(/\s+/g, "").toUpperCase();

      Object.entries({
        studentId: formData.studentId,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        major: formData.major,
        phone: formData.phone,
        iban: compactIBAN, // send compact IBAN
      }).forEach(([k, v]) => fd.append(k, v));

      fd.append("expertise", JSON.stringify(formData.expertise));
      fd.append("cv", cvFile); // required

      const res = await axios.post(`${API}/student-register`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200 || res.status === 201) {
        showAlert("OTP sent to your Polytechnic email.");
        setOtpModal({ open: true, regId: res.data.regId });
      }
    } catch (error) {
      showAlert(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-body">
      <div className="signup-bg-live" aria-hidden="true"><LandingPage /></div>
    <div className="signup-dim" aria-hidden="true" />

      <div className="signup-container" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="signup-title">Create your Account <button
  className="signup-close"
  aria-label="Close"
  onClick={() => navigate("/landingPage")}
>
  ×
</button>
</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="left-fields">
            <div>
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div>
              <label>Student Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} />
               <small style={{opacity: 0.7, display: 'block', marginTop: '2px', marginBottom: '-18px', fontSize: '12px' }}>
       Must be at least <strong>12 characters</strong> long, uppercase, lowercase, number, and special character.
    </small>
            </div>

            <div className="file-field">
              <label>Upload CV</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                aria-required="true"
                title="Please upload your CV (PDF, DOC, or DOCX)."
              />

            </div>
          </div>

          <div className="student-divider" aria-hidden="true" />

          <div className="right-fields">
              {/* Major */}
              <div className="majorr-field">
                <p>Major</p>
                <div className="majorr-display" onClick={() => setShowMajorDropdown(!showMajorDropdown)}>
                  {formData.major || "Select Major"}
                </div>
                {showMajorDropdown && (
                  <div className="majorr-dropdown-list">
                    {[
                      "School of ICT", "School of Creative Media", "School of Business",
                      "School of Logistics", "School of Engineering", "School of Foundation"
                    ].map((option, i) => (
                      <div
                        key={i}
                        className="majorr-option"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, major: option }));
                          setShowMajorDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            <div className="expertiseer9" ref={expertiseRef}>
              <p>Expertise</p>
              <div
                className="expertise-display9"
                onClick={() => setShowExpertiseDropdown((s) => !s)}
                role="button"
                aria-expanded={showExpertiseDropdown}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowExpertiseDropdown((s) => !s)}
              >
                {formData.expertise?.length ? formData.expertise.join(", ") : "Select Expertise"}
              </div>
              {showExpertiseDropdown && (
                <div className="expertise-dropdown-list9">
                  {expertiseOptions.map((opt) => (
                    <label key={opt} className="expertise-checkbox-item10">
                      <input
                        type="checkbox"
                        checked={formData.expertise?.includes(opt)}
                        onChange={() => handleExpertiseChange(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label>AlSalam Bank IBAN</label>
              <input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                required
                aria-required="true"
                placeholder="BH67 BMAG 0000 1299 1234 56"
                title="BH + 2 digits + 4 letters + 14 digits"
              />
            </div>

            <div>
              <label>Contact Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} pattern="[0-9]{8}" required />
            </div>

            <button type="submit" className="create-btn" >
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>

        <div className="terms-row center">
          <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required />
        <span style={{ color: showTermsWarning ? "#f1633a" : "inherit" }}>
  I read, I understand, and I agree to the{" "}
  <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>
    Terms &amp; Conditions
  </button>
</span>

        </div>

        <p className="signin-link">I have an account? <span onClick={() => navigate("/signin")}>Sign In</span></p>
      </div>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} onAccept={() => setFormData((p) => ({ ...p, agreeTerms: true }))} />

      <OtpModal
        open={otpModal.open}
        onClose={() => setOtpModal({ open: false, id: null })}
        regId={otpModal.regId}
        email={formData.email}
      />
    </div>
  );
};

export default SignUpPage;
