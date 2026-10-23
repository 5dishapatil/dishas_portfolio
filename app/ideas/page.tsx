"use client";

/**
 * Visual Playground (Explorations / Ideas) — Disha Portfolio
 * Dependencies: react, framer-motion, tailwindcss
 * Fonts used: Inter (body) & Instrument Serif (display italic)
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { EXPLORATION_ITEMS, ExplorationItem } from '@/data/ideas/explorations';

// --- 1. Dynamic Interactive Canvas Background ---
const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for dynamic interaction
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle nodes for ambient field
    const PARTICLE_COUNT = 55;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    // Floating dynamic color orbs
    const orbs = [
      { x: width * 0.25, y: height * 0.3, radius: 340, color: 'rgba(78, 133, 191, 0.08)', vx: 0.2, vy: 0.15 },
      { x: width * 0.75, y: height * 0.6, radius: 420, color: 'rgba(137, 170, 204, 0.06)', vx: -0.15, vy: -0.2 },
      { x: width * 0.5, y: height * 0.8, radius: 360, color: 'rgba(90, 80, 160, 0.05)', vx: 0.1, vy: -0.15 },
    ];

    let time = 0;

    const render = () => {
      time += 0.008;

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Dark background fill
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, width, height);

      // Flowing ambient glow orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx + Math.sin(time) * 0.3;
        orb.y += orb.vy + Math.cos(time) * 0.3;

        if (orb.x < -100) orb.x = width + 100;
        if (orb.x > width + 100) orb.x = -100;
        if (orb.y < -100) orb.y = height + 100;
        if (orb.y > height + 100) orb.y = -100;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(8, 8, 8, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Interactive mouse follow illumination
      const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
      mouseGrad.addColorStop(0, 'rgba(137, 170, 204, 0.055)');
      mouseGrad.addColorStop(0.5, 'rgba(78, 133, 191, 0.02)');
      mouseGrad.addColorStop(1, 'rgba(8, 8, 8, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 280, 0, Math.PI * 2);
      ctx.fill();

      // Subtle dynamic particle constellation
      ctx.strokeStyle = 'rgba(137, 170, 204, 0.07)';
      ctx.lineWidth = 0.8;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(220, 230, 245, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};

// --- 2. Main Page Component ---
export default function VisualPlaygroundPage() {
  const [selectedItem, setSelectedItem] = useState<ExplorationItem | null>(null);

  // Framer Motion smooth scroll tracking for buttery parallax on side cards
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 0.5,
    restDelta: 0.001,
  });

  // Independent vertical parallax transforms for left and right columns
  const leftParallaxY = useTransform(smoothProgress, [0, 1], [0, -180]);
  const rightParallaxY = useTransform(smoothProgress, [0, 1], [100, -320]);

  const leftColItems = useMemo(
    () => [EXPLORATION_ITEMS[0], EXPLORATION_ITEMS[2], EXPLORATION_ITEMS[4]].filter(Boolean),
    []
  );
  const rightColItems = useMemo(
    () => [EXPLORATION_ITEMS[1], EXPLORATION_ITEMS[3], EXPLORATION_ITEMS[5]].filter(Boolean),
    []
  );

  return (
    <div
      className="relative min-h-[230vh] bg-[#0a0a0a] text-[#f5f5f5] selection:bg-[#4E85BF]/30 selection:text-white overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Inline styles for Instrument Serif and Inter fonts */}
      <style jsx global>{`
        .font-instrument {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
        }
      `}</style>

      {/* Dynamic Animated Canvas Background */}
      <DynamicBackground />

      {/* Top Left Navigation: Go back to my worlds */}
      <header className="fixed top-5 left-5 sm:top-7 sm:left-8 z-50">
        <Link
          href="/#worlds"
          aria-label="Go back to my worlds"
          className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono tracking-[0.2em] uppercase bg-[#141414]/85 hover:bg-[#1f1f1f] border border-white/15 hover:border-white/40 text-[#EAE0D0] hover:text-white backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.03]"
        >
          <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span className="font-medium">Go back to my worlds</span>
        </Link>
      </header>

      {/* Fixed Center Title: "EXPLORATIONS", "Visual playground", subtext (Completely stationary, never scrolls) */}
      <section className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10 select-none">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <span className="text-xs text-white/50 uppercase tracking-[0.3em] font-mono mb-4">
            EXPLORATIONS
          </span>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white font-light mb-4 leading-none">
            Visual <span className="font-instrument font-normal">playground</span>
          </h1>

          <p className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed font-light">
            Unconstrained lab experiments in generative shaders, kinetic letterforms, and procedural physics.
          </p>
        </div>
      </section>

      {/* Scrolling Side Cards with Framer Motion Parallax */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-[14vh] pb-[28vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-32 lg:gap-56 w-full">
          
          {/* Left Column: smoothly moves up as user scrolls */}
          <motion.div
            style={{ y: leftParallaxY }}
            className="flex flex-col gap-28 sm:gap-44 items-center sm:items-start"
          >
            {leftColItems.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                whileHover={{ scale: 1.035, rotate: item.rotation * 0.6 }}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square w-full max-w-[280px] sm:max-w-[330px] lg:max-w-[360px] rounded-3xl overflow-hidden border border-white/10 hover:border-white/35 bg-[#121212]/95 backdrop-blur-md cursor-pointer shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(78,133,191,0.2)]"
                style={{
                  transform: `rotate(${item.rotation}deg)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                <div className="absolute top-4 left-4 right-4 z-10">
                  <span className="text-[9px] font-mono text-white/70 uppercase tracking-widest block drop-shadow-md">
                    {item.medium}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <h2 className="text-2xl sm:text-3xl font-instrument text-white tracking-tight">
                    {item.title}
                  </h2>
                </div>

                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white text-xs">
                    ↗
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Right Column: smoothly moves up with offset as user scrolls */}
          <motion.div
            style={{ y: rightParallaxY }}
            className="flex flex-col gap-28 sm:gap-44 items-center sm:items-end pt-20 sm:pt-48"
          >
            {rightColItems.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.12 }}
                whileHover={{ scale: 1.035, rotate: item.rotation * 0.6 }}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square w-full max-w-[280px] sm:max-w-[330px] lg:max-w-[360px] rounded-3xl overflow-hidden border border-white/10 hover:border-white/35 bg-[#121212]/95 backdrop-blur-md cursor-pointer shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(78,133,191,0.2)]"
                style={{
                  transform: `rotate(${item.rotation}deg)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                <div className="absolute top-4 left-4 right-4 z-10">
                  <span className="text-[9px] font-mono text-white/70 uppercase tracking-widest block drop-shadow-md">
                    {item.medium}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <h2 className="text-2xl sm:text-3xl font-instrument text-white tracking-tight">
                    {item.title}
                  </h2>
                </div>

                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white text-xs">
                    ↗
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

        </div>
      </div>

      {/* High-Resolution Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-3xl w-full bg-[#121212] border border-white/15 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row my-auto"
            >
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="Close lightbox"
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="w-full md:w-3/5 aspect-square bg-black relative flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
                    {selectedItem.medium}
                  </span>
                  <h3 className="text-3xl font-instrument text-white">
                    {selectedItem.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    {selectedItem.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedItem.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-white/40">Lab Experiment</span>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
