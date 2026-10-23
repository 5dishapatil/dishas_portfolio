"use client";

/**
 * Visual Playground (Explorations / Ideas) — Disha Portfolio
 * Dependencies: react, framer-motion, tailwindcss
 * Fonts used: Inter (body) & Instrument Serif (display italic)
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeTab, setActiveTab] = useState<'Home' | 'Work' | 'Resume'>('Work');
  const [isSayHiOpen, setIsSayHiOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftColItems = useMemo(
    () => [EXPLORATION_ITEMS[0], EXPLORATION_ITEMS[2], EXPLORATION_ITEMS[4]].filter(Boolean),
    []
  );
  const rightColItems = useMemo(
    () => [EXPLORATION_ITEMS[1], EXPLORATION_ITEMS[3], EXPLORATION_ITEMS[5]].filter(Boolean),
    []
  );

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hello@michaelsmith.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative min-h-[220vh] bg-[#0a0a0a] text-[#f5f5f5] selection:bg-[#4E85BF]/30 selection:text-white overflow-x-hidden"
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

      {/* Floating Pill Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 sm:pt-6 px-4 pointer-events-none">
        <nav
          aria-label="Navigation"
          className="pointer-events-auto inline-flex items-center rounded-full backdrop-blur-xl border border-white/10 bg-[#141414]/90 px-2 py-2 shadow-xl shadow-black/40 transition-all duration-300"
        >
          {/* Logo Circle: JA with gradient border (links back to Home) */}
          <Link
            href="/"
            aria-label="Return to Disha Home"
            className="group relative w-9 h-9 rounded-full flex items-center justify-center p-[1.5px] cursor-pointer hover:scale-105 transition-transform"
          >
            <div
              className="absolute inset-0 rounded-full transition-transform duration-500 group-hover:rotate-180"
              style={{ background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)' }}
            />
            <div className="relative w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
              <span className="font-instrument text-[14px] text-white tracking-tighter">
                JA
              </span>
            </div>
          </Link>

          <div className="w-px h-5 bg-white/10 mx-1.5 hidden sm:block" />

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
            <Link
              href="/#worlds"
              onClick={() => setActiveTab('Home')}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 transition-all cursor-pointer ${
                activeTab === 'Home'
                  ? 'text-white bg-white/15 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>

            <button
              onClick={() => {
                setActiveTab('Work');
                window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
              }}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 transition-all cursor-pointer ${
                activeTab === 'Work'
                  ? 'text-white bg-white/15 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Work
            </button>

            <button
              onClick={() => setActiveTab('Resume')}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 transition-all cursor-pointer ${
                activeTab === 'Resume'
                  ? 'text-white bg-white/15 font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Resume
            </button>
          </div>

          <div className="w-px h-5 bg-white/10 mx-1.5" />

          {/* "Say hi" button with hover gradient glow */}
          <button
            onClick={() => setIsSayHiOpen(true)}
            className="group relative inline-flex items-center text-xs sm:text-sm rounded-full px-3.5 sm:px-4 py-1.5 transition-all cursor-pointer"
          >
            <span
              className="absolute -inset-[1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)' }}
            />
            <span className="relative z-10 inline-flex items-center gap-1.5 bg-[#141414] rounded-full px-2.5 py-0.5 text-white font-medium">
              Say hi <span className="text-[13px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </span>
          </button>
        </nav>
      </header>

      {/* Center Pinned Header ("EXPLORATIONS", "Visual playground", subtext, Dribbble CTA) */}
      <section className="sticky top-0 h-screen w-full flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <span className="text-xs text-white/50 uppercase tracking-[0.3em] font-mono mb-4">
            EXPLORATIONS
          </span>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white font-light mb-4">
            Visual <span className="font-instrument font-normal">playground</span>
          </h1>

          <p className="text-sm sm:text-base text-white/60 max-w-md mb-8 leading-relaxed font-light">
            Unconstrained lab experiments in generative shaders, kinetic letterforms, and procedural physics.
          </p>

          <a
            href="https://dribbble.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on Dribbble"
            className="pointer-events-auto group relative inline-flex items-center rounded-full text-xs font-medium px-6 py-3 transition-transform duration-300 hover:scale-105"
          >
            <span
              className="absolute -inset-[1.5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)' }}
            />
            <span className="relative z-10 inline-flex items-center gap-2 bg-[#121212]/90 backdrop-blur-md border border-white/10 group-hover:border-transparent rounded-full px-6 py-3 -mx-6 -my-3 text-white transition-colors">
              <span>Follow on Dribbble</span>
              <span className="text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                ↗
              </span>
            </span>
          </a>
        </div>
      </section>

      {/* Parallax Cards Grid */}
      <div className="relative z-20 pointer-events-none -mt-[100vh]">
        <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-48">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-36 w-full">
            
            {/* Left Column */}
            <div
              className="flex flex-col gap-28 sm:gap-48 items-center sm:items-start transition-transform duration-300 ease-out"
              style={{ transform: `translateY(${-scrollY * 0.12}px)` }}
            >
              {leftColItems.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="pointer-events-auto group relative aspect-square w-full max-w-[280px] sm:max-w-[340px] rounded-3xl overflow-hidden border border-white/10 bg-[#121212] cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 hover:border-white/30"
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-transparent to-transparent opacity-85 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-4 left-4 right-4 z-10">
                    <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest block drop-shadow-md">
                      {item.medium}
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-10">
                    <h2 className="text-2xl font-instrument text-white tracking-tight">
                      {item.title}
                    </h2>
                  </div>

                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs">
                      ↗
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Right Column */}
            <div
              className="flex flex-col gap-28 sm:gap-48 items-center sm:items-end sm:pt-40 transition-transform duration-300 ease-out"
              style={{ transform: `translateY(${-scrollY * 0.22}px)` }}
            >
              {rightColItems.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="pointer-events-auto group relative aspect-square w-full max-w-[280px] sm:max-w-[340px] rounded-3xl overflow-hidden border border-white/10 bg-[#121212] cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 hover:border-white/30"
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-transparent to-transparent opacity-85 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-4 left-4 right-4 z-10">
                    <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest block drop-shadow-md">
                      {item.medium}
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-10">
                    <h2 className="text-2xl font-instrument text-white tracking-tight">
                      {item.title}
                    </h2>
                  </div>

                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs">
                      ↗
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>
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

      {/* Say Hi Direct Contact Modal */}
      <AnimatePresence>
        {isSayHiOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSayHiOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-auto space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-instrument text-white">
                  Say Hello
                </h3>
                <button
                  onClick={() => setIsSayHiOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-light">
                Interested in working together or discussing generative design systems? Drop a note directly to:
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                <span className="font-mono text-sm sm:text-base text-white block">
                  hello@michaelsmith.com
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="text-xs text-[#89AACC] hover:underline cursor-pointer"
                >
                  {copied ? '✓ Copied to clipboard' : 'Click to copy email address'}
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <a
                  href="mailto:hello@michaelsmith.com"
                  className="rounded-full bg-white text-black px-6 py-2.5 text-xs font-semibold hover:bg-white/90 transition-colors"
                >
                  Open Email Client ↗
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
