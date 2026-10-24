"use client";

import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * =========================================================================
 * SINGLE-FILE PITCH BLACK SHOWCASE (NO BOXES / SEAMLESS BLEND)
 * =========================================================================
 * - Pure plain pitch-black background (#000000)
 * - Left side: Pure elegant typography & neon highlights
 * - Right side: Borderless, frameless video running endlessly in an infinite
 *   loop and blending seamlessly into the black background
 */

const VIDEO_PATHS = {
  project1: {
    primary: "/assets/final_butterfly.mp4",
    fallback: "/assets/final_butterfly.mp4",
  },
  project2: {
    primary: "/assets/final_cosmic_ring.mp4",
    fallback: "/assets/final%20cosmic%20ring.mp4",
  },
  project3: {
    primary: "/assets/final_blue_ring.mp4",
    fallback: "/assets/final%20blue%20ring.mp4",
  },
};

export interface Project {
  id: string;
  number: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  specs: { label: string; value: string }[];
  tags: string[];
  neonColor: string;
  neonTextClass: string;
  neonGlowStyle: string;
  videoSrc: { primary: string; fallback: string };
}

const PROJECTS: Project[] = [
  {
    id: "project-1",
    number: "01",
    category: "SPECTRAL PARTICLE SHADER",
    title: "LUMINESCENT METAMORPHOSIS",
    subtitle: "CYBERNETIC BIOLUMINESCENCE & PARTICULATE DISPERSAL",
    description:
      "A hyper-dimensional study of chromatic bioluminescence. Over 140,000 refractive micro-polygons oscillating along non-Euclidean flight vectors with real-time bloom dispersal and electromagnetic wing flutter.",
    specs: [
      { label: "Particles", value: "142,000+" },
      { label: "Latency", value: "3.8 ms" },
      { label: "Frame Pacing", value: "120 FPS Locked" },
    ],
    tags: ["WebGL 2.0", "Compute Shaders", "Bioluminescence"],
    neonColor: "#ff2d75",
    neonTextClass: "text-[#ff2d75]",
    neonGlowStyle: "0 0 25px rgba(255, 45, 117, 0.45)",
    videoSrc: VIDEO_PATHS.project1,
  },
  {
    id: "project-2",
    number: "02",
    category: "ASTROPHYSICAL VOID EVENT",
    title: "COSMIC SINGULARITY EVENT",
    subtitle: "EULERIAN ACCRETION & RELATIVISTIC PHOTON WARP",
    description:
      "Fluid simulation capturing relativistic photon decay around a gravitational boundary. Featuring relativistic beaming, Doppler wavelength drift, and particulate accretion rings collapsing toward zero-entropy.",
    specs: [
      { label: "Resolution", value: "4096 × 4096" },
      { label: "Fluid Substeps", value: "480 / sec" },
      { label: "Photon Radius", value: "r = 3M" },
    ],
    tags: ["Relativistic Physics", "Volumetric Raymarching", "Noise Turbulences"],
    neonColor: "#00ffaa",
    neonTextClass: "text-[#00ffaa]",
    neonGlowStyle: "0 0 25px rgba(0, 255, 170, 0.45)",
    videoSrc: VIDEO_PATHS.project2,
  },
  {
    id: "project-3",
    number: "03",
    category: "QUANTUM TOPOLOGY ARRAY",
    title: "QUANTUM ORBITAL RESONANCE",
    subtitle: "HARMONIC TOROIDAL SOLITONS & COHERENT NODES",
    description:
      "Observation of cyclic quantum dot clusters locked into harmonic toroidal orbits. Visualizing discrete phase rotations, tunneling probabilities, and electromagnetic resonance spikes isolated in a vacuum chamber.",
    specs: [
      { label: "Coherence", value: "99.98%" },
      { label: "Frequency", value: "432.18 Hz" },
      { label: "Quantum Nodes", value: "8-Phase Ring" },
    ],
    tags: ["Quantum Solitons", "Toroidal Topology", "Phase Modulation"],
    neonColor: "#00c3ff",
    neonTextClass: "text-[#00c3ff]",
    neonGlowStyle: "0 0 25px rgba(0, 195, 255, 0.45)",
    videoSrc: VIDEO_PATHS.project3,
  },
];

// Single Project Row: Text on the left, frameless endlessly looping video on the right
function ProjectRow({ project }: { project: Project }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure video runs and loops seamlessly
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});

    const handleVisibility = () => {
      if (!document.hidden && video.paused) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Parallax scrolling
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 25,
    restDelta: 0.001,
  });

  const textY = useTransform(smoothProgress, [0, 1], [45, -45]);
  const videoY = useTransform(smoothProgress, [0, 1], [-35, 35]);

  return (
    <section
      ref={rowRef}
      id={project.id}
      className="relative min-h-screen w-full flex items-center justify-center py-20 lg:py-28 px-6 sm:px-12 lg:px-20 bg-black overflow-hidden"
    >
      <div className="relative max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* ================= LEFT SIDE: PURE TEXT ================= */}
        <motion.div
          style={{ y: textY }}
          className="lg:col-span-5 flex flex-col justify-center space-y-6 z-10"
        >
          {/* Neon Category Pill / Tag */}
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: project.neonColor }}
            />
            <span
              className="font-mono-code text-xs tracking-[0.25em] uppercase font-semibold"
              style={{ color: project.neonColor, textShadow: project.neonGlowStyle }}
            >
              {project.category}
            </span>
          </div>

          {/* Number & Big Title */}
          <div className="space-y-3">
            <div
              className="font-mono-code text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight select-none leading-none"
              style={{ color: project.neonColor }}
            >
              {project.number}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              {project.title}
            </h2>
            <p
              className="font-mono-code text-xs sm:text-sm tracking-wider uppercase font-medium"
              style={{ color: project.neonColor }}
            >
              // {project.subtitle}
            </p>
          </div>

          {/* Description Paragraph */}
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed font-normal">
            {project.description}
          </p>

          {/* Minimal Metric Specs */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
            {project.specs.map((spec, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-mono-code text-[11px] text-zinc-500 tracking-wider uppercase">
                  {spec.label}
                </span>
                <span className="font-mono-code text-sm font-semibold text-zinc-200 mt-0.5">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          {/* Minimal Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="font-mono-code text-xs text-zinc-500 uppercase tracking-wider"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ================= RIGHT SIDE: NAKED VIDEO BLENDING WITH BLACK ================= */}
        {/* Completely frameless, no boxes, no borders. Radial feather ensures zero edge seam on black. */}
        <motion.div
          style={{ y: videoY }}
          className="lg:col-span-7 relative flex items-center justify-center w-full"
        >
          <video
            ref={videoRef}
            src={project.videoSrc.primary}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== project.videoSrc.fallback) {
                target.src = project.videoSrc.fallback;
                target.play().catch(() => {});
              }
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onEnded={(e) => {
              e.currentTarget.currentTime = 0;
              e.currentTarget.play().catch(() => {});
            }}
            className="w-full max-h-[82vh] object-contain select-none pointer-events-none"
            style={{
              backgroundColor: "#000000",
              maskImage:
                "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 74%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 74%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

// MAIN PROJECT SHOWCASE COMPONENT
export default function ProjectShowcase() {
  return (
    <div className="w-full bg-black text-white selection:bg-[#ff2d75] selection:text-black">
      <style jsx global>{`
        .font-mono-code {
          font-family: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
      `}</style>

      {/* Header section divider */}
      <div className="w-full pt-16 pb-8 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d75] animate-pulse" />
          <span className="font-mono-code text-xs uppercase tracking-[0.3em] text-white/50">
            Selected Lab Projects & Simulations
          </span>
        </div>
        <span className="font-mono-code text-xs uppercase tracking-widest text-white/30 hidden sm:block">
          03 Features
        </span>
      </div>

      {/* Three project sections: text on left, frameless blending video on right */}
      <main className="w-full bg-black">
        {PROJECTS.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </main>
    </div>
  );
}

