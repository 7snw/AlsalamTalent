import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../Style/AboutUs.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { NavConfig1, NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";

// Icons
import EmpowermentIcon from "../Assets/empowerment.png";
import FlexibilityIcon from "../Assets/flexibility.png";
import CreativityIcon from "../Assets/creativity.png";
import TrustIcon from "../Assets/trust.png";


const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const AboutUs = () => {
  const [navbarConfig, setNavbarConfig] = useState();

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

  const VALUES = [
    {
      title: "Empowerment",
      text: "Build financial freedom while growing professionally.",
      variant: "orange",
      icon: EmpowermentIcon,
    },
    {
      title: "Flexibility",
      text: "Work on your terms, wherever and whenever you choose.",
      variant: "peach",
      icon: FlexibilityIcon,
    },
    {
      title: "Creativity",
      text: "Express your boldest ideas with confidence in a risk-friendly zone.",
      variant: "navy",
      icon: CreativityIcon,
    },
    {
      title: "Trust",
      text: "Experience fairness, transparency, and support at every step.",
      variant: "teal",
      icon: TrustIcon,
    },
  ];

  return (
    <div className="about-body">
      <Navbar links={navbarConfig} />

      {/* ===== Values (static, no hover animation) ===== */}
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

        <div className="values-grid">
          {VALUES.map((v) => (
            <div key={v.title} className={`value-card v-${v.variant}`}>
              <div className="value-icon">
                {v.icon && <img src={v.icon} alt={`${v.title} icon`} />}
              </div>
              <h3 className="value-title">{v.title}</h3>
              <p className="value-text">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== About 2×2 panels (keep subtle animation) ===== */}
      <section className="about-grid">
        <motion.div
          className="panel panel--sky"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="panel-header">
            <span className="dash" />
            <h3>Who are we?</h3>
          </div>
          <p>
            A freelancing platform built exclusively for Bahrain Polytechnic
            students and graduates. Backed by Al Salam Bank, we connect young
            talent with real projects that build confidence and careers.
          </p>
        </motion.div>

        <motion.div
          className="panel panel--navy"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="panel-header">
            <span className="dash" />
            <h3>The ctrlZ way</h3>
          </div>
          <p className="panel-light">
            Who needs office hours when you’ve got ctrlZ? Real work, real pay,
            and real chances to flex your Gen-Z genius.
          </p>
        </motion.div>

        <motion.div
          className="panel panel--softteal"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="panel-header">
            <span className="dash" />
            <h3>The Playground</h3>
          </div>
          <p>
            Design, write, shoot, and edit. Whatever your talent, ctrlZ is your
            creative playground. It’s where wild ideas, crazy concepts, and
            “what ifs” come alive without limits.
          </p>
        </motion.div>

        <motion.div
          className="panel panel--orange"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="panel-header">
            <span className="dash1" />
            <h3>The Future</h3>
          </div>
          <p className="panel-light">
            We see a world where students call the shots: choosing projects,
            building independence, and shaping their own future. With ctrlZ,
            you’re not just freelancing, you’re in ctrl.
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
