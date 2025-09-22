// src/Pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Login.css";
import axios from "axios";
import { showAlert } from "../utils/toastMessages";
import LandingPage from "./LandingPage";
import SignInArt from "../Assets/LoginPhoto.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// ✅ Works in CRA/Webpack or Node envs (no import.meta)
const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.VITE_API_BASE || process.env.REACT_APP_API_BASE)) ||
  (typeof window !== "undefined" && window.API_BASE) ||
  "http://localhost:5000";

const normalizeEmail = (v = "") => String(v).trim().toLowerCase();

// ---- Onboarding helpers ----

// Optional API: GET /api/freelancers/me/onboarding
// Returns (suggested): { profileCompleted: boolean, portfolioCount: number, missing: string[] }
async function fetchFreelancerOnboarding(token) {
  try {
    const { data } = await axios.get(`${API_BASE}/api/freelancers/me/onboarding`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const profileCompleted = !!data?.profileCompleted;
    const portfolioCount = Number.isFinite(data?.portfolioCount)
      ? data.portfolioCount
      : Array.isArray(data?.portfolio)
      ? data.portfolio.length
      : 0;

    return {
      profileCompleted,
      portfolioCount,
      missing: Array.isArray(data?.missing) ? data.missing : [],
    };
  } catch {
    return null; // silent fallback
  }
}

// Decide if this user is "just registered"
function isJustRegistered(loginPayloadUser) {
  // 1) Primary: flag set by Sign-Up success
  try {
    const flag = localStorage.getItem("cz_just_registered");
    if (flag === "1") return true;
  } catch {}

  // 2) Fallback: if backend gives createdAt and it’s within N days (e.g., 3)
  const createdAt = loginPayloadUser?.createdAt || loginPayloadUser?.created_at;
  if (createdAt) {
    const created = new Date(createdAt).getTime();
    if (!Number.isNaN(created)) {
      const DAYS = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - created <= DAYS) return true;
    }
  }

  return false;
}

// Clear the "just registered" one-time flag
function clearJustRegisteredFlag() {
  try {
    localStorage.removeItem("cz_just_registered");
  } catch {}
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") navigate("/landingpage");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate]);

  const normalizeLoginResponse = (data) => {
    // Accept flexible API shapes
    const userBlob = data?.user ? data.user : data || {};
    const id = userBlob._id || userBlob.id;
    const fullName = userBlob.fullName || userBlob.name || "";
    const role = (userBlob.role || "").toLowerCase();
    const mail = userBlob.email || "";
    const token = data?.token || userBlob?.token || null;

    // Optional pass-throughs we might use
    const createdAt = userBlob.createdAt || userBlob.created_at || null;
    const profileCompleted =
      typeof userBlob.profileCompleted === "boolean" ? userBlob.profileCompleted : undefined;

    return { id, fullName, email: mail, role, token, createdAt, profileCompleted, rawUser: userBlob };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !password) {
      showAlert("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const url = `${API_BASE}/api/users/login`;
      const payload = { email: cleanEmail, password: String(password) };

      const { data } = await axios.post(url, payload /* , { withCredentials: true } */);
      const norm = normalizeLoginResponse(data);

      if (!norm.id || !norm.role) {
        showAlert("Invalid response from server.");
        setSubmitting(false);
        return;
      }

      const user = {
        _id: norm.id,
        fullName: norm.fullName,
        email: norm.email,
        role: norm.role,
        createdAt: norm.createdAt || undefined,
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);
      if (norm.token) localStorage.setItem("token", norm.token);

      switch (norm.role) {
        case "admin":
          navigate("/analyticsadmin");
          break;

        case "client":
          navigate("/clienthome");
          break;
case "freelancer": {
  const justRegistered = isJustRegistered({ createdAt: norm.createdAt });

  if (justRegistered) {
    const onboarding = await fetchFreelancerOnboarding(norm.token);

    // Decide when to alert
    let needsAttention = false;
    if (onboarding) {
      const needsPortfolio = (onboarding.portfolioCount || 0) < 1;
      const needsProfile = !onboarding.profileCompleted;
      needsAttention = needsPortfolio || needsProfile;
    } else if (typeof norm.profileCompleted === "boolean") {
      needsAttention = !norm.profileCompleted;
    } else {
      // ✅ If we can't verify, assume *not complete* for brand-new users
      needsAttention = true;
    }

    if (needsAttention) {
      showAlert("Welcome aboard! Complete your profile and add your portfolio to get personalized project matches.");
      // Give the toast a moment to render before leaving the page
      await new Promise((r) => setTimeout(r, 800));
    }

    clearJustRegisteredFlag();
  }

  navigate("/freelancer-home");
  break;
}


        default:
          showAlert("Unknown role. Please contact support.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        (status === 401 || status === 404
          ? "Email or password is incorrect."
          : "Login failed. Please try again.");
      showAlert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-bg-live" aria-hidden="true">
        <LandingPage />
      </div>

      <div
        className="login-dim"
        aria-hidden="true"
        onClick={() => navigate("/landingpage")}
      />

      <div
        className="login-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-left">
          <h2 className="login-title">
            <span className="accent">Sign in</span> to your Account
          </h2>

          <form onSubmit={handleSubmit} className="login-form">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />

            <label>Password</label>
            <div className="pw-field" style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  lineHeight: 0,
                }}
              >
                {showPw ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="register-link">
            I don’t have an account?{" "}
            <span onClick={() => navigate("/signup")}>Register</span>
          </p>
        </div>

        <div className="login-split" aria-hidden="true" />

        <div className="login-right">
          <img src={SignInArt} alt="Sign in illustration" />
        </div>
      </div>
    </div>
  );
}
