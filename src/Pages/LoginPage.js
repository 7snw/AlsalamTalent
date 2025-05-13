import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import "../Style/Login.css";
import LoginPhoto from "../Assets/LoginPhoto.png";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { showAlert } from '../utils/toastMessages';


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("📤 Attempting login with:", { email, password });

  try {
    const response = await axios.post(
      "http://localhost:5000/api/users/login",
      { email: email.toLowerCase(), password }
    );

      const userData = response.data;
      console.log("✅ Login response received:", userData); // ✅ Confirm response

      if (!userData || !userData.id || !userData.role) {
        showAlert("Invalid response from server.");
        return;
      }

      const user = {
        _id: userData.id,
        fullName: userData.name,
        email: userData.email,
        role: userData.role,
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);

      // 🔁 Redirect based on role
      if (user.role === "admin") {
        navigate("/analyticsadmin");
      } else if (user.role === "client") {
        navigate("/clienthome");
      } else if (user.role === "freelancer") {
        navigate("/freelancer-home");
      } else {
        showAlert("Unknown role detected");
      }
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      showAlert(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="login-body">
      <div className="login-wrapper">
        <div className="login-container">
          <button
            className="back-btn"
            onClick={() => navigate("/studentgraduate")}
          >
            <FaArrowLeft />
          </button>

          <div className="login-left">
            <h2>Sign in to your Account</h2>
            <form onSubmit={handleSubmit} className="login-form">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="login-btn">
                Sign In
              </button>
            </form>
            <p className="register-link">
              I don’t have an account?{" "}
              <span
                onClick={() => navigate("/studentgraduate")}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                Register
              </span>
            </p>
          </div>

          <div className="divider"></div>

          <div className="login-right">
            <img src={LoginPhoto} alt="Student dev" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;