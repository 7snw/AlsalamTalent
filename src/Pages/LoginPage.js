// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Login.css';
import LoginPhoto from '../Assets/LoginPhoto.png';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });

      const { role } = response.data;
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/analyticsadmin');
      } else if (role === 'client') {
        navigate('/clienthome');
      } else if (role === 'freelancer') {
        navigate('/freelancer-home');
      } else {
        alert('Unknown role');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Invalid credentials or server error');
    }
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
