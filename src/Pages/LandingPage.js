import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Library.css";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";
import "../Style/LandingPage.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig1 } from "../Data/NavbarConfigs";
import i1 from "../Assets/resources/platformTutorials.png";
import i2 from "../Assets/Library/2.jpg";
import i3 from "../Assets/Library/3.jpg";
import i4 from "../Assets/Library/4.jpg";
import i5 from "../Assets/Library/5.jpg";
import i55 from "../Assets/Library/55.png";
import i6 from "../Assets/Library/6.jpg";
import i7 from "../Assets/Library/7.jpg";
import i8 from "../Assets/Library/8.jpg";
import i9 from "../Assets/Library/9.jpg";
import i10 from "../Assets/Library/10.jpg";
import iap from "../Assets/Library/ap.png";
import i12 from "../Assets/Library/12.jpg";
import i13 from "../Assets/Library/13.jpg";
import i14 from "../Assets/Library/14.jpg";
import i16 from "../Assets/Library/16.jpg";
import i17 from "../Assets/Library/17.jpg";
import i18 from "../Assets/Library/18.jpg";
import i19 from "../Assets/Library/19.jpg";
import i20 from "../Assets/Library/20.jpg";

import i22 from "../Assets/Library/22.jpg";

import { FaPlay } from "react-icons/fa";
import WavyBackground from "../Components/WavyBackground";

//import HeroImage from "../Assets/landing-hero.png";
import HeroImage from "../Assets/A.png";


const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
 const [activeTab] = useState("platform"); // platform | resources | bank
  const scrollToVideo = () => videoRef.current?.scrollIntoView({ behavior: "smooth" });
  const handleSignIn = () => navigate("/freelancer-home");

 // (A) Step images for Platform flow (kept static)
const platformSteps = [
    {
    step: 0,
    title: "Landing Page",
    desc: "Watch the tutorial before you start.",
    img: i1,
  },
  {
    step: 1,
    title: "Create your account",
    desc: "Sign up and verify your identity.",
    img: i2,
  },
  {
    step: 2,
    title: "Terms & Conditions",
    desc: " Students cannot register unless they agree to the t&c",
    img: i3,
  },
  {
    step: 3,
    title: "Email Verification",
    desc: " An OTP code will be sent to their email to verify their identity.",
    img: i4,
  },
  {
    step: 4,
    title: "Sign In",
    desc: "Once they verify their identity, they can sign in using their student email and password.",
    img: i5,
  },
   {
    step: 44,
    title: "Verify OTP",
    desc: "An OTP code will be sent to your email for Multi-factor Authetication",
    img: i55,
  },
  {
    step: 6,
    title: "Complete your profile (1)",
    desc: "They must add their biography,  date of birth, skills to be able to apply for projects.",
    img: i6,
  },
  {
    step: 7,
    title: "Complete your profile (2)",
    desc: "They must add their portfolio work.",
    img: i7,
  },{
    step: 8,
    title: "Find your Match",
    desc: " Once they complete their profile, they can navigate to the Explore Projects Page, where they can see a personalized Project Matches list.",
    img: i8,
  },{
    step: 9,
  title: "Find a project",
    desc: "Explore projects and campaigns.",
    img: i9,
  },{
    step: 10,
    title: "View Poject Details",
    desc: "Freelancers cannot download a project unless they're assigned to it.",
    img: i10,
  },{
    step: 11,
    title: "Applications",
    desc: "The client will review the freelancer's profile/potfolio before assigning or canceling their application.",
    img: iap,
  },{
    step: 12,
    title: "Assigned Projects",
    desc: " The freelancer can find the project in the Assigned Projects Page.",
    img: i12,
  },{
    step: 13,
    title: "Project Details",
    desc: "The freelancer can download the project files once they're assigned.",
    img: i13,
  },{
    step: 14,
    title: "Submit Projects",
    desc: "Upload files, get approval, and receive payment.",
    img: i14,
  },{
    step: 22,
    title: "Payment History",
    desc: "The freelancer can see their total earnings from ctrlz, and the payment transactions.",
    img: i22,
  },
  {
    step: 16,
    title: "Save Projects",
    desc: "The freelancer can save projects for later.",
    img: i16,
  },{
    step: 17,
    title: "Find Freelancers",
    desc: "The freelancer can find other freelancers, search, and filter according to their expertise or ratings.",
    img: i17,
  },{
    step: 19,
    title: "Library",
    desc: " A  library of learning materials and guides that help freelancers improve their abilities while working on projects.",
    img: i19,
  },
  
  {
    step: 18,
    title: "Real-time Chat",
    desc: "The freelancer can get in touch with other freelancers.",
    img: i18,
  },
{
    step: 20,
    title: "Notifications",
    desc: "Freelancer’s notifications page for submissions and applications updates.",
    img: i20,
  }

];

 // Platform steps slider (images with next/prev)
  const stepSliderSettings = {
    arrows: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    appendDots: (dots) => <ul className="steps-dots">{dots}</ul>,
  };

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
          <AnimatePresence mode="wait">
          {/* ===== PLATFORM: STEP CAROUSEL ===== */}
           <section className="video-section" ref={videoRef}>
          <h2 className="video-heading">Let&apos;s Get Started</h2>
          {activeTab === "platform" && (
            <motion.section
              key="platform"
              className="lib-section"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="steps-wrap">
                <Slider {...stepSliderSettings}>
                  {platformSteps.map((s) => (
                    <div className="step-card" key={s.step}>
                      <div className="step-media">
                        <img src={s.img} alt={`Step ${s.step}: ${s.title}`} />
                      </div>
                      <div className="step-meta">
                        <h3>{s.title}</h3>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </motion.section>
          )}
          </section>
          </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
