import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";                 // ⬅️ NEW
import "../Style/AboutUs.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig1, NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";

// Team photos
import Team1 from "../Assets/team1.png";
import Team2 from "../Assets/team2.png";
import Team3 from "../Assets/team3.png";
import Team4 from "../Assets/team4.png";
import Team5 from "../Assets/team5.png";

// Icons
import EmpowermentIcon from "../Assets/empowerment.png";
import FlexibilityIcon from "../Assets/flexibility.png";
import CreativityIcon from "../Assets/creativity.png";
import TrustIcon from "../Assets/trust.png";

/* ===== Motion variants (reusable) ===== */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};
const fade = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};
const stagger = (delay = 0.12) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.1 } }
});

const AboutUs = () => {
  const [navbarConfig, setNavbarConfig] = useState();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role;
    switch (role) {
      case "freelancer": setNavbarConfig(NavConfig2); break;
      case "client":     setNavbarConfig(NavConfig3); break;
      case "admin":      setNavbarConfig(NavConfig4); break;
      default:           setNavbarConfig(NavConfig1);
    }
  }, []);

  const VALUES = [
    { title: "Empowerment", text: "Build financial freedom while growing professionally.", variant: "orange", icon: EmpowermentIcon },
    { title: "Flexibility", text: "Work on your terms, wherever and whenever you choose.", variant: "peach",  icon: FlexibilityIcon },
    { title: "Creativity", text: "Express your boldest ideas with confidence in a risk-friendly zone.", variant: "navy",   icon: CreativityIcon },
    { title: "Trust",      text: "Experience fairness, transparency, and support at every step.",     variant: "teal",   icon: TrustIcon },
  ];

  return (
    <div className="about-body">
      <Navbar links={navbarConfig} />




  {/* ===== Values (animated) ===== */}
      <section className="values-wrap">
        <motion.h2
          className="values-title"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          It’s your time to <span className="accent">shine!</span>
        </motion.h2>

        <motion.div
          className="values-grid"
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {VALUES.map((v) => (
            <motion.article
              key={v.title}
              className={`value-card v-${v.variant}`}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 12px 28px rgba(0,0,0,.12)" }}
              whileTap={{ scale: 0.99 }}
            >
              {v.icon ? (
                <div className="value-icon">
                  <img src={v.icon} alt={`${v.title} icon`} />
                </div>
              ) : (
                <div className="value-icon" />
              )}
              <h3 className="value-title">{v.title}</h3>
              <p className="value-text">{v.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>
      

      
      {/* ===== About 2×2 panels (animated) ===== */}
      <section className="about-grid">
        <motion.div
          className="panel panel--sky"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          whileHover={{ y: -4, boxShadow: "0 10px 24px rgba(0,0,0,.10)" }}
        >
          <div className="panel-header"><span className="dash" /><h3>Who are we?</h3></div>
          <p>a freelancing platform built exclusively for Bahrain Polytechnic students and graduates. Backed by Al Salam Bank, we connect young talent with real projects that build confidence and careers.</p>
        </motion.div>

        <motion.div
          className="panel panel--navy"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          whileHover={{ y: -4, boxShadow: "0 10px 24px rgba(0,0,0,.10)" }}
        >
          <div className="panel-header"><span className="dash" /><h3>The ctrlZ way</h3></div>
          <p className="panel-light">Who needs office hours when you’ve got ctrlZ? Real work, real pay, real chances to flex your Gen-Z genius.</p>
        </motion.div>

        <motion.div
          className="panel panel--softteal"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          whileHover={{ y: -4, boxShadow: "0 10px 24px rgba(0,0,0,.10)" }}
        >
          <div className="panel-header"><span className="dash" /><h3>The Playground</h3></div>
          <p>Design, write, shoot, edit — whatever your talent, ctrlZ is your creative playground. It’s where wild ideas, crazy concepts, and “what ifs” come alive without limits.</p>
        </motion.div>

        <motion.div
          className="panel panel--orange"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          whileHover={{ y: -4, boxShadow: "0 10px 24px rgba(0,0,0,.10)" }}
        >
          <div className="panel-header"><span className="dash1" /><h3>The Future</h3></div>
          <p className="panel-light">We see a world where students call the shots: choosing projects, building independence, and shaping their own future. With ctrlZ, you’re not just freelancing, you’re in ctrl.</p>
        </motion.div>
      </section>


      
      {/* ===== Team (animated) ===== */}
      <section className="team-hero">
        <motion.header
          className="team-hdr"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          <h2><span className="ink">Meet the team</span></h2>
        </motion.header>

        <motion.div
          className="team-gallery"
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {[
            { name: "Maryam Yousif", img: Team1 },
            { name: "Malak Sami", img: Team2 },
            { name: "Sawsan Alarrayedh", img: Team3 },
            { name: "Haifa", img: Team4 },
            { name: "Reem Albitar", img: Team5 },
          ].map((m) => (
            <motion.figure
              key={m.name}
              className="member"
              variants={fadeUp}
              whileHover={{ y: -6, rotate: -0.3, boxShadow: "0 14px 28px rgba(0,0,0,.12)" }}
              whileTap={{ scale: 0.98 }}
            >
              {m.img ? <img src={m.img} alt={m.name} /> : <div className="img-fallback" />}
              <figcaption>{m.name}</figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
