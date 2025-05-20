import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import "../Style/Login.css";
import LoginPhoto from "../Assets/LoginPhoto.png";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { showAlert } from '../utils/toastMessages';

const LoginPage = () => {
  // State to hold email and password input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Handles login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Attempting login with:", { email, password });

    try {
      // Send login credentials to backend
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        { email: email.toLowerCase(), password }
      );

      const userData = response.data;
      console.log("Login response received:", userData); // Confirm response

      // Validate required fields in response
      if (!userData || !userData.id || !userData.role) {
        showAlert("Invalid response from server.");
        return;
      }

      // Save user data in localStorage
      const user = {
        _id: userData.id,
        fullName: userData.name,
        email: userData.email,
        role: userData.role,
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role", user.role);

      // Redirect user based on role
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
      console.error("Login error:", err.response?.data || err.message);
      showAlert(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="login-body">
      <div className="login-wrapper">
        <div className="login-container">
          {/* Back navigation button */}
          <button
            className="back-btn"
            onClick={() => navigate("/studentgraduate")}
          >
            <FaArrowLeft />
          </button>

          {/* Login form section */}
          <div className="login-left">
            <h2>Sign in to your Account</h2>
            <form onSubmit={handleSubmit} className="login-form">
              <label>Personal Email</label>
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

            {/* Redirect to registration */}
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

          {/* Divider between form and image */}
          <div className="divider"></div>

          {/* Right image display */}
          <div className="login-right">
            <img src={LoginPhoto} alt="Student dev" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
