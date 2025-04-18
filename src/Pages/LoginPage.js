// src/pages/LoginPage.js 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Login.css';
import LoginPhoto from '../Assets/LoginPhoto.png'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate login logic
    console.log('User logged in:', { email, password });

    // Redirect to FreelancerHome page
    navigate('/freelancer-home');
  };

  return (
    <div className="login-body">
      <div className="login-wrapper">
        <div className="login-container">
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
              <button type="submit" className="login-btn">Sign In</button>
            </form>
            <p className="register-link">
              I Don’t have an account? 
              <span onClick={() => navigate('/studentgraduate')}> Register</span>
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
