// src/Pages/StudentGraduate.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/StudentGraduate.css'; // Styles for this page
import Graduate from '../Assets/Graduate.png'; 
import Student from '../Assets/Student.png';
import Footer from '../Components/Footer';
import Navbar from '../Components/Navbar';
import { NavConfig1 } from '../Data/NavbarConfigs';

const StudentGraduate = () => {
  const navigate = useNavigate(); // Hook to navigate between pages

  // Optional: For NavBar sign in button (if applicable)
  const handleSignIn = () => {
    navigate('/freelancer-home');
  };

  return (
    <div className="container">
      {/* Top navigation bar for guests */}
      <Navbar links={NavConfig1} onSignIn={handleSignIn} />

      <main className="main">
        <h1>Are you a Student or a Graduate?</h1>

        {/* Card layout for selection */}
        <div className="cards">
          {/* Card for Student Sign Up */}
          <div className="student-card" onClick={() => navigate('/signup')}>
            <img src={Student} alt="Student" />
            <h4>I’m a Student</h4>
            <p>
              Join as a current student and explore live projects to grow your portfolio.
            </p>       
          </div>

          {/* Card for Graduate Sign Up */}
          <div className="graduate-card" onClick={() => navigate('/graduatesignup')}>
            <img src={Graduate} alt="Graduate" />
            <h4>I’m a Graduate</h4>
            <p>
              Sign up as a graduate and collaborate on real-world freelance work.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom footer */}
      <Footer />
    </div>
  );
};

export default StudentGraduate;
