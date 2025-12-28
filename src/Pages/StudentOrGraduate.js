import React from "react";
import { useNavigate } from "react-router-dom";
import "../Style/StudentGraduate.css";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import { NavConfig1 } from "../Data/NavbarConfigs";
import { FaFileAlt, FaGraduationCap } from "react-icons/fa";
import WavesBG from "../Assets/hero-waves1.png";

const StudentGraduate = () => {
  const navigate = useNavigate();
  const handleSignIn = () => navigate("/freelancer-home");

  return (
    <div className="sg-container">
      <Navbar links={NavConfig1} onSignIn={handleSignIn} />

      {/* HERO WITH WAVES */}
      <section className="sg-hero" style={{ backgroundImage: `url(${WavesBG})` }}>
        <h1 className="sg-title">
          Are you a Student or a Graduate?
        </h1>

        <div className="sg-cards">
          {/* Student tile */}
          <button
            className="sg-card sg-card--student"
            onClick={() => navigate("/signup")}
            aria-label="Sign up as a student"
          >
            <div className="sg-icon-wrap is-accent">
              <FaFileAlt className="sg-icon" />
            </div>
            <div className="sg-card-body">
              <h3 className="sg-card-title">Student</h3>
              <p className="sg-card-text">
                Gain experience, build your portfolio, and work on live projects.
              </p>
            </div>
          </button>

          {/* Graduate tile */}
          <button
            className="sg-card sg-card--grad"
            onClick={() => navigate("/graduatesignup")}
            aria-label="Sign up as a graduate"
          >
            <div className="sg-icon-wrap is-teal">
              <FaGraduationCap className="sg-icon" />
            </div>
            <div className="sg-card-body">
              <h3 className="sg-card-title">Graduate</h3>
              <p className="sg-card-text">
                Collaborate on real freelance work and grow your career.
              </p>
            </div>
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StudentGraduate;
