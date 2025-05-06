import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Login.css";
import LoginPhoto from "../Assets/LoginPhoto.png";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        }
      );

      const { role, id, name, email: userEmail } = response.data;

<<<<<<< Updated upstream
      // Confirm data format
      if (!userData || !userData.id || !userData.role) {
        alert("Invalid response from server.");
        return;
      }

      // ✅ Save entire user object to localStorage
      const user = {
        _id: userData.id,
        fullName: userData.name,
        email: userData.email,
        role: userData.role,
      };

      // ✅ Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id); // ✅ added
      localStorage.setItem("role", user.role); // ✅ added
      console.log("User saved to localStorage:", user);

      // 🔁 Redirect based on role
      if (user.role === "admin") {
        navigate("/analyticsadmin");
      } else if (user.role === "client") {
        navigate("/clienthome");
      } else if (user.role === "freelancer") {
        navigate("/freelancer-home");
=======
      // Save role & user info if needed
      localStorage.setItem('role', role);
      localStorage.setItem('userId', id);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', userEmail);

      // Redirect based on role
      if (role === 'admin') {
        navigate('/analyticsadmin');
      } else if (role === 'client') {
        navigate('/clienthome');
      } else if (role === 'freelancer') {
        navigate('/freelancer-home');
>>>>>>> Stashed changes
      } else {
        alert("Unknown role detected");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(
        err.response?.data?.message || "Invalid credentials or server error"
      );
    }
  };

  return (
    <div className="login-body">
      <div className="login-wrapper">
        <div className="login-container">
<<<<<<< Updated upstream
          <button
            className="back-btn"
            onClick={() => navigate("/studentgraduate")}
          >
            <FaArrowLeft />
          </button>

=======
           <button className="back-btn" onClick={() => navigate('/studentgraduate')}>
                    <FaArrowLeft />
                  </button>
>>>>>>> Stashed changes
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
