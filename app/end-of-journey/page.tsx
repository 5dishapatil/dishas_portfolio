"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * End of Journey — Final Farewell Webpage
 * Route: /end-of-journey
 * Loops /assets/endvideo.mp4 endlessly with bespoke editorial & calligraphic typography.
 */

export default function EndOfJourneyPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center select-none">
      {/* Embedded Unique Editorial & Calligraphic Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Great+Vibes&family=Italiana&display=swap');

        .font-farewell-display {
          font-family: 'Italiana', 'Cinzel Decorative', 'Cormorant Garamond', Georgia, serif;
        }
        .font-farewell-editorial {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-farewell-script {
          font-family: 'Great Vibes', 'Alex Brush', cursive;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(244, 180, 180, 0.55)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(251, 207, 232, 0.9)); }
        }
        .animate-float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
        .animate-heart-glow {
          display: inline-block;
          animation: heartPulse 3.2s ease-in-out infinite;
        }
      `}</style>

      {/* Endless Looping Foreground Video */}
      <video
        ref={videoRef}
        src="/assets/endvideo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none"
      />

      {/* Subtle Cinematic Vignette & Soft Radial Scrim for Typography Legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(6, 4, 10, 0.36) 0%, rgba(4, 3, 8, 0.62) 100%)",
        }}
      />

      {/* Farewell Typography Centerpiece */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 px-6 py-12 text-center flex flex-col items-center max-w-4xl mx-auto animate-float-slow"
      >
        {/* Top Ornamental Star Divider */}
        <div className="mb-7 flex items-center gap-4 opacity-85">
          <span className="h-[1px] w-14 sm:w-24 bg-gradient-to-r from-transparent via-[#F5E1B9]/75 to-[#F5E1B9]" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 text-[#F8E4BE] drop-shadow-[0_0_10px_rgba(248,228,190,0.8)]"
          >
            <path
              d="M12 0C12.8 7.5 15 10.8 24 12C15 13.2 12.8 16.5 12 24C11.2 16.5 9 13.2 0 12C9 10.8 11.2 7.5 12 0Z"
              fill="currentColor"
            />
          </svg>
          <span className="h-[1px] w-14 sm:w-24 bg-gradient-to-l from-transparent via-[#F5E1B9]/75 to-[#F5E1B9]" />
        </div>

        {/* Line 1: Goodbye! See you soon! */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.3, ease: "easeOut" }}
          style={{
            textShadow:
              "0 4px 28px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 225, 185, 0.35)",
          }}
          className="font-farewell-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-normal tracking-[0.06em] text-[#FFFDF9] leading-[1.12]"
        >
          Goodbye!{" "}
          <span className="font-farewell-editorial italic font-light text-[#F7E3BC]">
            See you soon!
          </span>
        </motion.h1>

        {/* Line 2: Lots of Love <3 */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.75, ease: "easeOut" }}
          style={{
            textShadow:
              "0 3px 20px rgba(0, 0, 0, 0.9), 0 0 26px rgba(251, 207, 232, 0.35)",
          }}
          className="mt-6 sm:mt-8 font-farewell-editorial italic text-2xl sm:text-4xl md:text-[2.65rem] font-light tracking-[0.08em] text-[#F9EFE0]"
        >
          Lots of Love{" "}
          <span className="not-italic font-normal text-[#F9C6D3] animate-heart-glow ml-1">
            &lt;3
          </span>
        </motion.p>

        {/* Line 3: From Disha */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 1.2, ease: "easeOut" }}
          className="mt-5 sm:mt-7 flex flex-col items-center"
        >
          <span
            style={{
              textShadow:
                "0 4px 24px rgba(0, 0, 0, 0.92), 0 0 34px rgba(232, 207, 160, 0.5)",
            }}
            className="font-farewell-script text-5xl sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8EC] via-[#F5DCAB] to-[#FAD2E1] py-2 px-4"
          >
            From Disha
          </span>

          {/* Subtle Bottom Filigree Line */}
          <div className="mt-4 h-[1px] w-36 sm:w-48 bg-gradient-to-r from-transparent via-[#E8CFA0]/65 to-transparent" />
        </motion.div>
      </motion.div>
    </main>
  );
}

