// src/components/PageTransition.jsx
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function PageTransition({ children }) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
        exit:    { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE } },
      };

  return (
    <motion.main
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.main>
  );
}
