import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

import "../Style/LandingPage.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig1 } from "../Data/NavbarConfigs";
import IntroVideo from "../Assets/intro.mp4";

import { FaPlay } from "react-icons/fa";
import WavyBackground from "../Components/WavyBackground";

import HeroImage from "../Assets/landing-hero.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const scrollToVideo = () => videoRef.current?.scrollIntoView({ behavior: "smooth" });
  const handleSignIn = () => navigate("/freelancer-home");

 
  return (
    <div className="landing-body">
      <div className="landing-container">
        <Navbar links={NavConfig1} onSignIn={handleSignIn} />

        {/* HERO */}
        <section className="landing-hero">
          {/* Waves inside the hero */}
          <WavyBackground
            colors={["#111c2f", "#111c2f", "#111c2f", "#111c2f"]}
            waveOpacity={0.8}
            waveWidth={300}
            blur={0}
            speed="fast"
            accentColors={["#f1633a", "#9FD8FF"]}
            accentWidth={3}
            accentOpacity={0.4}
            accentVertical={-220}
            accentSpacing={10}
            containerClassName="lp-hero-bg"
          />

          <div className="landing-content">
            {/* LEFT: static text (no generation effect) */}
            <div className="text-section">
             
         
        <p className="subheading">Undo Limits | Redo Possibilities</p>

              <h1 className="hero-title">
                Your <span className="highlight">Freelancing</span>{" "}
           Journey Starts     <span className="swoosh"> Here.</span>
              </h1>

              <div className="button-group">
                <button className="primary-btn" onClick={() => navigate("/signup")}>
                  Join the Community
                </button>
                <button
                  className="secondary-btn tutorial-btn"
                  onClick={scrollToVideo}
                  aria-label="Watch tutorial"
                >
                  <span className="play-wrap" aria-hidden="true">
                    <FaPlay className="play-icon" />
                  </span>
                  <span className="tut-span">Tutorial</span>
                </button>
              </div>
            </div>

            {/* RIGHT: hero image */}
            <div className="art-section">
              <img
                src={HeroImage}
                alt="Freelancer working at a desk"
                loading="eager"
                decoding="async"
                draggable="false"
              />
              <div className="art-blob" aria-hidden />
            </div>
          </div>
        </section>

        {/* Tutorial / video */}
        <section className="video-section" ref={videoRef}>
          <h2 className="video-heading">Let&apos;s Get Started</h2>
          <div className="video-frame">
            <video controls preload="metadata" className="video-el">
              <source src={IntroVideo} type="video/mp4" />
              Your browser doesn’t support HTML5 video.
            </video>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
