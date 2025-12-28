"use client";
import React, { useEffect, useMemo } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "../lib/utils";


const TextGenerateEffect = ({
  words = "",
  segments,                
  as: Tag = "div",         
  className,
  filter = true,
  duration = 0.5,
  staggerDelay = 0.06,    
  wordClassName,          
}) => {
  const [scope, animate] = useAnimate();


  const items = useMemo(() => {
    if (Array.isArray(segments) && segments.length) {
      return segments.flatMap((seg, si) =>
        String(seg.text || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((w, wi) => ({
            key: `s${si}-${wi}-${w}`,
            w,
            segClass: seg.className || "",
          }))
      );
    }
    return String(words || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w, i) => ({ key: `w-${i}-${w}`, w, segClass: "" }));
  }, [words, segments]);

  useEffect(() => {
   
    animate(
      "[data-word]",
      { opacity: 1, filter: filter ? "blur(0px)" : "none" },
      { duration: duration || 0.5, delay: stagger(staggerDelay) }
    );
  }, [animate, filter, duration, staggerDelay, items.length]);

  return (
    <Tag ref={scope} className={cn(className)}>
      {items.map(({ key, w, segClass }) => (
        <motion.span
          key={key}
          data-word
          className={cn("opacity-0", wordClassName, segClass)}
          style={{ filter: filter ? "blur(4px)" : "none" }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </Tag>
  );
};

export default TextGenerateEffect;
