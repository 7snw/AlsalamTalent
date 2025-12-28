import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Login.css";
import axios from "axios";
import { showAlert } from "../utils/toastMessages";
import LandingPage from "./LandingPage";
import SignInArt from "../Assets/A.png";

const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.VITE_API_BASE || process.env.REACT_APP_API_BASE)) ||
  (typeof window !== "undefined" && window.API_BASE) ||
  "http://localhost:5000";

const normalizeEmail = (v = "") => String(v).trim().toLowerCase();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPw] = useState(false);

  // OTP after login
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Forgot/reset
  const [forgotStep, setForgotStep] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !password) {
      showAlert("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/users/login`, {
        email: cleanEmail,
        password,
      });

      if (data.step === "otp_required") {
        showAlert("OTP sent to your email");
        setOtpStep(true);
        return;
      }
      processLoginSuccess(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      showAlert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode)) return showAlert("Enter a valid 6-digit OTP.");
    try {
      const { data } = await axios.post(`${API_BASE}/api/users/verify-login-otp`, {
        email,
        code: otpCode,
      });
      processLoginSuccess(data);
    } catch (err) {
      showAlert(err?.response?.data?.message || "OTP verification failed.");
    }
  };

  // ---------- Forgot / Reset uses unified /api/users/* ----------
  const handleSendResetCode = async () => {
    const clean = normalizeEmail(resetEmail);
    if (!clean) return showAlert("Enter your registered email.");
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE}/api/users/forgot-password`, {
        email: clean,
      });
      showAlert(res.data.message); // generic message
    } catch (err) {
      showAlert(err?.response?.data?.message || "Failed to send reset code.");
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async () => {
    const clean = normalizeEmail(resetEmail);
    if (!clean || !resetOtp || !newPw) {
      return showAlert("Please fill all fields.");
    }
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE}/api/users/reset-password`, {
        email: clean,
        code: resetOtp.trim(),
        newPassword: newPw.trim(), // NO oldPassword
      });
      showAlert(res.data.message);
      // clean up UI
      setForgotStep(false);
      setResetEmail("");
      setResetOtp("");
      setNewPw("");
    } catch (err) {
      showAlert(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setSending(false);
    }
  };

  const processLoginSuccess = (data) => {
    const userId = data._id || data.id;
    const role = (data.role || "").toLowerCase();
    const user = {
      _id: userId,
      id: userId,
      fullName: data.fullName || data.name,
      email: data.email,
      role,
    };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userId", userId);
    localStorage.setItem("role", role);
    switch (role) {
      case "admin":
        navigate("/analyticsadmin");
        break;
      case "client":
        navigate("/clienthome");
        break;
      case "freelancer":
        navigate("/freelancer-home");
        break;
      default:
        showAlert("Unknown role. Please contact support.");
    }
  };

  return (
    <div className="login-body">
      <div className="login-bg-live" aria-hidden="true">
        <LandingPage />
      </div>
      <div className="login-dim" aria-hidden="true" />

      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-left">
          {/* 🔐 FORGOT PASSWORD FLOW */}
          {forgotStep ? (
            <div className="reset-section">
              <h2 className="reset-title">
                Reset Your Password
                <button
                  className="code-close"
                  aria-label="Close"
                  onClick={() => navigate("/landingPage")}
                >
                  ×
                </button>
              </h2>

              <label className="reset-label">Email</label>
              <input
                className="reset-input reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />

              <button
                onClick={handleSendResetCode}
                className="reset-btn"
                disabled={sending}
              >
                {sending ? "Sending..." : "Send Reset Code"}
              </button>

              <label className="reset-label">OTP Code</label>
              <input
                className="reset-input reset-otp"
                type="text"
                maxLength={6}
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
              />

              <label className="reset-label">New Password</label>
              <input
                className="reset-input reset-newpw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />

              <small className="reset-note">
                Must include uppercase, lowercase, number, and special character.
              </small>

              <button
                onClick={handleResetPassword}
                className="reset-btn"
                disabled={sending}
              >
                {sending ? "Processing..." : "Reset Password"}
              </button>

              <p className="reset-back" onClick={() => setForgotStep(false)}>
                Back to Login
              </p>
            </div>
          ) : !otpStep ? (
            <div className="login-section">
              <h2 className="login-title">
                Sign in to your Account
                <button
                  className="signin-close1"
                  aria-label="Close"
                  onClick={() => navigate("/landingPage")}
                >
                  ×
                </button>
              </h2>

              <form onSubmit={handleSubmit} className="login-form">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
                <label>Password</label>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />

                <p
                  className="forgot-link"
                  onClick={() => setForgotStep(true)}
                  style={{
                    fontSize: "13px",
                    marginTop: "5px",
                    color: "#f1633a",
                    cursor: "pointer",
                    textAlign: "right",
                  }}
                >
                  Forgot Password?
                </p>

                <button type="submit" className="login-btn" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <p className="register-link">
                I don’t have an account?{" "}
                <span onClick={() => navigate("/signup")}>Register</span>
              </p>
            </div>
          ) : (
            <div className="otp-section">
              <h2 className="otp-title1">
                <span className="accent">Verify</span> your OTP
                <button
                  className="otpp-close"
                  aria-label="Close"
                  onClick={() => navigate("/landingPage")}
                >
                  ×
                </button>
              </h2>
              <p className="otp-subtext1">Enter the 6-digit code sent to {email}</p>
              <input
                type="text"
                maxLength={6}
                className="otp-input1"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              />

              <button onClick={handleVerifyOtp} className="otp-btn">
                Verify & Continue
              </button>
            </div>
          )}
        </div>
        <div className="login-split" />
        <div className="login-right">
          <img src={SignInArt} alt="Sign in illustration" />
        </div>
      </div>
    </div>
  );
}
