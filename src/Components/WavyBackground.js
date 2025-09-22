"use client";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * Canvas-based animated wavy background.
 * - Big blurred waves (configurable)
 * - Optional thin accent lines drawn crisp on top (e.g. orange + light blue)
 */
const WavyBackground = ({
  // fat waves
  colors = ["#0EA5E9", "#38BDF8", "#7EC8D6", "#F15C2E"],
  waveWidth = 120,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.45,
  backgroundFill, // optional tint

  // NEW: accent lines
  accentColors = ["#F1633A", "#9FD8FF"], // orange, light blue
  accentWidth = 3,
  accentOpacity = 0.95,
  accentVertical = -40, // shift lines up/down from center
  accentSpacing = 8,    // vertical spacing between the two lines

  // layout class (let CSS control fixed/inset sizing)
  containerClassName = "",
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [isSafari, setIsSafari] = useState(false);

  const getSpeed = () =>
    speed === "slow" ? 0.001 : speed === "fast" ? 0.002 : 0.001;

  let nt = 0;

  const resize = () => {
    const canvas = canvasRef.current;
    const ctx = (ctxRef.current = canvas.getContext("2d"));
    sizeRef.current.w = ctx.canvas.width = window.innerWidth;
    sizeRef.current.h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
  };

  const drawFatWaves = (n) => {
    const ctx = ctxRef.current;
    const { w, h } = sizeRef.current;
    nt += getSpeed();

    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth;
      ctx.strokeStyle = colors[i % colors.length];
      ctx.globalAlpha = waveOpacity;
      for (let x = 0; x < w; x += 5) {
        const y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5);
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  // draw two crisp accent lines above the fat waves
  const drawAccents = () => {
    const ctx = ctxRef.current;
    const { w, h } = sizeRef.current;

    const prevFilter = ctx.filter;     // temporarily disable blur for crisp lines
    ctx.filter = "none";
    ctx.globalAlpha = accentOpacity;

    accentColors.forEach((col, j) => {
      ctx.beginPath();
      ctx.lineWidth = accentWidth;
      ctx.strokeStyle = col;

      // use a slightly different noise channel for each line
      const channel = 1.1 + j * 0.25;
      const verticalShift = accentVertical + j * accentSpacing;

      for (let x = 0; x < w; x += 3) {
        const y = noise(x / 900, channel, nt) * 85; // gentle amplitude
        ctx.lineTo(x, y + h * 0.5 + verticalShift);
      }

      ctx.stroke();
      ctx.closePath();
    });

    ctx.filter = prevFilter;
  };

  const render = () => {
    const ctx = ctxRef.current;
    const { w, h } = sizeRef.current;

    // transparent frame
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, w, h);

    if (backgroundFill) {
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, w, h);
    }

    drawFatWaves(5);
    drawAccents();
    rafRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div className={containerClassName}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
    </div>
  );
};

export default WavyBackground;
