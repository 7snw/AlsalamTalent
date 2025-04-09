import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/StudentGraduate.css';
import Graduate from '../Assets/Graduate.png'; 
import Student from '../Assets/Student.png';
import Logo from '../Assets/Logo.jpg';

const StudentGraduate = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
       <nav className="navbar">
      <div className="nav-left">
      <div className="logo-title">
        <img src={Logo} alt="Logo" className="logo-image" />
           <span className="site-name">Al Salam Talents</span>
          </div>
        <ul className="nav-links">
          <li onClick={() => navigate('/')}>Home</li>
          <li onClick={() => navigate('/AboutUs')}>About us</li>
        </ul></div>
        <button className="sign-in-btn" onClick={() => navigate('/signin')}>Sign In</button>
      </nav>

      <main className="main">
        <h1>Are you a Student or a Graduate?</h1>
        <div className="cards">
        <div className="card student-card" onClick={() => navigate('/signup')}>
    <h2>I’m a Student</h2>
    <img src={Student} alt="Student" className="student-image" />
  </div>
  <div className="card graduate-card" onClick={() => navigate('/graduatesignup')}>
    <h2>I’m a Graduate</h2>
    <img src={Graduate} alt="Graduate" className="graduate-image" />
  </div>
</div>

      </main>
    </div>
  );
};

export default StudentGraduate;
