// src/Pages/Library.js
import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Style/Library.css";
import {
  NavConfig1,
  NavConfig2,
  NavConfig3,
  NavConfig4,
} from "../Data/NavbarConfigs";

import slide1 from "../Assets/resources/1.png";
import slide2 from "../Assets/resources/2.png";
import slide3 from "../Assets/resources/3.png";
import slide4 from "../Assets/resources/4.png";
import slide5 from "../Assets/resources/5.png";
import slide6 from "../Assets/resources/6.png";


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

import Guidline from "../Assets/resources/Guidelines.png";
import Library1 from "../Assets/resources/Resources.png";
import Tutorial from "../Assets/resources/Steps.png";

import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";

/* ---------- DATA ---------- */

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

/* ---------- Helpers ---------- */

const pickLinkFromResource = (r) => {
  // Preferred open target: externalUrl, else first file, else image, else '#'
  if (r?.externalUrl) return r.externalUrl;
  if (Array.isArray(r?.files) && r.files[0]?.url) return r.files[0].url;
  if (r?.imageUrl) return r.imageUrl;
  return "#";
};

const Library = () => {
  const [navbarConfig, setNavbarConfig] = useState(NavConfig1);
  const [activeTab, setActiveTab] = useState("platform"); // platform | resources | bank

  // Dynamic data
  const [resLoading, setResLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [resourcesList, setResourcesList] = useState([]); // section=resources
  const [bankList, setBankList] = useState([]); // section=bank

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role;
    switch (role) {
      case "freelancer":
        setNavbarConfig(NavConfig2);
        break;
      case "client":
        setNavbarConfig(NavConfig3);
        break;
      case "admin":
        setNavbarConfig(NavConfig4);
        break;
      default:
        setNavbarConfig(NavConfig1);
    }
  }, []);

  // Load Freelancers Resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        setResLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/resources",
          { params: { section: "resources" } }
        );
        setResourcesList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load resources:", e);
        setResourcesList([]);
      } finally {
        setResLoading(false);
      }
    };
    loadResources();
  }, []);

  // Load AlSalam Bank Guidelines
  useEffect(() => {
    const loadBank = async () => {
      try {
        setBankLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/resources",
          { params: { section: "bank" } }
        );
        setBankList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load bank guidelines:", e);
        setBankList([]);
      } finally {
        setBankLoading(false);
      }
    };
    loadBank();
  }, []);

  // Hero slider (unchanged)
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3800,
    arrows: false,
    pauseOnHover: true,
  };

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
    <div className="library-page">
      <Navbar links={navbarConfig} />

      {/* Top hero slider */}
      <div className="library-slider">
        <Slider {...sliderSettings}>
          <div>
            <img src={slide1} alt="Tutorial Slide 1" />
          </div>
          <div>
            <img src={slide2} alt="Tutorial Slide 2" />
          </div>
          <div>
            <img src={slide3} alt="Tutorial Slide 3" />
          </div>
          <div>
            <img src={slide4} alt="Tutorial Slide 4" />
          </div>
          <div>
            <img src={slide5} alt="Tutorial Slide 5" />
          </div>
          <div>
            <img src={slide6} alt="Tutorial Slide 6" />
          </div>
        </Slider>
      </div>

      {/* Title */}
      <div className="lib-hero-inner">
        <h1 className="lib-title">
          <span> Freelancers Resource Library</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="lib-linkbar">
        <button
          className={`lib-link ${activeTab === "platform" ? "is-active" : ""}`}
          onClick={() => setActiveTab("platform")}
        >
          <img src={Tutorial} alt="" className="lib-link-ico" />
          <span>Platform Tutorial</span>
        </button>
        <button
          className={`lib-link ${
            activeTab === "resources" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("resources")}
        >
          <img src={Library1} alt="" className="lib-link-ico" />
          <span>Freelancers Resources</span>
        </button>
        <button
          className={`lib-link ${activeTab === "bank" ? "is-active" : ""}`}
          onClick={() => setActiveTab("bank")}
        >
          <img src={Guidline} alt="" className="lib-link-ico" />
          <span>AlSalam Bank Guidelines</span>
        </button>
      </div>

      {/* Content */}
      <div className="library-container">
        <AnimatePresence mode="wait">
          {/* ===== PLATFORM: STEP CAROUSEL ===== */}
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

          {/* ===== RESOURCES: dynamic (API) ===== */}
          {activeTab === "resources" && (
            <motion.section
              key="resources"
              className="lib-section"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
            >
              {resLoading ? (
                <div className="lib-loading">Loading resources…</div>
              ) : (
                <div className="library-grid">
                  {resourcesList.map((r, idx) => (
                    <motion.div
                      className="library-card"
                      key={r._id || idx}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                    >
                      {r.imageUrl ? (
                        <div className="card-thumb">
                          <img src={r.imageUrl} alt={r.title} />
                        </div>
                      ) : null}
                      <div className="card-content">
                        <h3>{r.title}</h3>
                        {r.description ? <p>{r.description}</p> : null}
                        <a
                          href={pickLinkFromResource(r)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Resource
                        </a>
                      </div>
                    </motion.div>
                  ))}
                  {resourcesList.length === 0 && !resLoading && (
                    <div className="lib-empty">No resources posted yet.</div>
                  )}
                </div>
              )}
            </motion.section>
          )}

          {/* ===== BANK: dynamic (API) ===== */}
          {activeTab === "bank" && (
            <motion.section
              key="bank"
              className="lib-section"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
            >
              {bankLoading ? (
                <div className="lib-loading">Loading guidelines…</div>
              ) : (
                <div className="lib-grid lib-grid--bank">
                  {bankList.map((g, i) => (
                    <motion.a
                      href={pickLinkFromResource(g)}
                      key={g._id || i}
                      className="lib-card lib-card--bank"
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="lib-card-ico">📄</div>
                      <div className="lib-card-body">
                        <h3>{g.title}</h3>
                        {g.description ? (
                          <p>{g.description}</p>
                        ) : (
                          <p>Open document</p>
                        )}
                        <span className="lib-card-link">Open Document</span>
                      </div>
                    </motion.a>
                  ))}
                  {bankList.length === 0 && !bankLoading && (
                    <div className="lib-empty">No guidelines posted yet.</div>
                  )}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default Library;
