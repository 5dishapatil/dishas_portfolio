"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Hls from "hls.js";
import TechStackShowcase from "@/app/components/tech/TechStackShowcase";
import ProjectShowcase from "@/app/components/tech/ProjectShowcase";

/**
 * Tech World Page — Disha Portfolio
 * 
 * 1. Mindloop Dynamic Journey CTA Hero (with HLS video stream & Liquid Glass)
 * 2. Interactive Cinematic Tech Stack Showcase (immediately below)
 * 3. Single-File Pitch Black Project Showcase (seamless blending endless videos)
 */

export default function TechPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const techStackRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // 1. Dynamic Video Setup (HLS via hls.js with native Safari fallback)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl =
      "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

    let hlsInstance: Hls | null = null;

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsVideoReady(true);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS for Safari and iOS
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
        setIsVideoReady(true);
      });
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, []);

  const handleScrollToTechStack = () => {
    techStackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* Self-contained styles for Liquid Glass & Serif Typography */}
      <style jsx global>{`
        .mindloop-container {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .mindloop-serif {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
          font-weight: 400;
        }
        .mindloop-liquid-glass {
          background: rgba(255, 255, 255, 0.05);
          background-blend-mode: luminosity;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15);
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .mindloop-liquid-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0) 60%,
            rgba(255, 255, 255, 0.2) 80%,
            rgba(255, 255, 255, 0.5) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .mindloop-liquid-glass:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }
      `}</style>

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

      {/* =========================================================================
          SECTION 1: HERO — MINDLOOP DYNAMIC JOURNEY CTA PAGE
          ========================================================================= */}
      <section className="mindloop-container min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black text-white">
        {/* Dynamic Streaming Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
            isVideoReady ? "opacity-90" : "opacity-40"
          }`}
        />

        {/* Dark Ambient Vignette for High Text Legibility */}
        <div className="absolute inset-0 bg-black/45 z-[1] pointer-events-none" />

        {/* Centered Journey Content */}
        <main className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center py-20">
          {/* Concentric Circles Logo */}
          <div
            className="w-10 h-10 rounded-full border-2 border-white/70 flex items-center justify-center mb-8 bg-black/20 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105"
            aria-hidden="true"
          >
            <div className="w-5 h-5 rounded-full border border-white/70" />
          </div>

          {/* Heading: "Technology for the Living" */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl tracking-tight leading-[1.08] mb-6">
            <span className="mindloop-serif text-white">Technology for the Living</span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-300 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Ideas can turn into actions only when they are prepared to be executed.
          </p>

          {/* Action Buttons: View Tech Stack & View Projects */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* View Tech Stack Button */}
            <button
              type="button"
              onClick={handleScrollToTechStack}
              className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-black font-semibold text-sm tracking-wide rounded-lg px-8 py-3.5 transition-all duration-200 hover:bg-zinc-200 active:scale-95 cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <span>View Tech Stack</span>
              <span className="text-sm transition-transform duration-300 group-hover:translate-y-0.5">
                ↓
              </span>
            </button>

            {/* View Projects Button (replaces Start Writing) */}
            <button
              type="button"
              onClick={handleScrollToProjects}
              className="mindloop-liquid-glass group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg text-white font-semibold text-sm tracking-wide px-8 py-3.5 active:scale-95 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              <span>View Projects</span>
              <span className="text-sm transition-transform duration-300 group-hover:translate-y-0.5">
                ↓
              </span>
            </button>
          </div>
        </main>

        {/* Motion Graphics Scroll Indicator */}
        <motion.button
          onClick={handleScrollToTechStack}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer group"
          aria-label="Scroll to view tech stack"
        >
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] group-hover:text-white transition-colors">
            Scroll to Tech Stack
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1 group-hover:border-white/50 transition-colors"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-1 h-2 rounded-full bg-white/70"
            />
          </motion.div>
        </motion.button>
      </section>

      {/* =========================================================================
          SECTION 2: TECH STACK SHOWCASE (RIGHT BELOW HERO)
          ========================================================================= */}
      <section
        id="tech-stack"
        ref={techStackRef}
        className="relative w-full min-h-screen bg-[#111] overflow-hidden"
      >
        {/* Quick jump navigation buttons */}
        <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-30 flex items-center gap-2">
          <button
            onClick={handleScrollToTop}
            aria-label="Return to journey top"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase bg-black/60 hover:bg-black/90 border border-white/15 text-white/70 hover:text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
            <span>Journey</span>
          </button>
          <button
            onClick={handleScrollToProjects}
            aria-label="Scroll to projects"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase bg-black/60 hover:bg-black/90 border border-white/15 text-white/70 hover:text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <span>Projects</span>
            <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
          </button>
        </div>

        {/* Interactive Cinematic Tech Stack */}
        <TechStackShowcase />

        {/* Bottom prompt to scroll down to Projects */}
        <button
          onClick={handleScrollToProjects}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 hover:bg-black/95 border border-white/20 text-white/70 hover:text-white font-mono text-[11px] uppercase tracking-widest backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-xl"
        >
          <span>Scroll to Projects</span>
          <span className="text-xs">↓</span>
        </button>
      </section>

      {/* =========================================================================
          SECTION 3: PITCH BLACK PROJECT SHOWCASE (RIGHT BELOW TECH STACK)
          ========================================================================= */}
      <section
        id="projects"
        ref={projectsRef}
        className="relative w-full min-h-screen bg-black overflow-hidden"
      >
        {/* Quick jump navigation buttons */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 flex items-center gap-2.5">
          <button
            onClick={handleScrollToTechStack}
            aria-label="Return to tech stack"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase bg-black/60 hover:bg-black/90 border border-white/15 text-white/70 hover:text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
            <span>Stack</span>
          </button>
          <button
            onClick={handleScrollToTop}
            aria-label="Return to journey top"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase bg-black/60 hover:bg-black/90 border border-white/15 text-white/70 hover:text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
            <span>Top</span>
          </button>
        </div>

        {/* Pitch Black Borderless Video Projects */}
        <ProjectShowcase />
      </section>
    </div>
  );
}
