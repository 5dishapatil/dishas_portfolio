"use client";

import React from "react";
import Link from "next/link";
import MindCardsShowcase from "@/app/components/mind/MindCardsShowcase";

/**
 * Mind & More Hub Page
 * Route: /mind
 * Displays the 4 floating cards (Psychology, Finance, Brain and Biology, Systems)
 */

export default function MindAndMorePage() {
  return (
    <div className="relative min-h-screen w-full bg-[#050811] text-[#f5f5f5] selection:bg-[#46d3db]/30 selection:text-white overflow-x-hidden font-sans">
      {/* Background ambient radial gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0d2140]/40 blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-[#1e2d4c]/30 blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#46d3db]/05 blur-[180px]" />
      </div>

      {/* Top Left Navigation: Go back to my worlds */}
      <header className="fixed top-5 left-5 sm:top-7 sm:left-8 z-50">
        <Link
          href="/#worlds"
          aria-label="Go back to my worlds"
          className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono tracking-[0.2em] uppercase bg-[#0c101d]/85 hover:bg-[#161d33] border border-white/15 hover:border-[#46d3db]/50 text-[#EAE0D0] hover:text-white backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.03]"
        >
          <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span className="font-medium">Go back to my worlds</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full pt-28 sm:pt-36 pb-24 px-6 flex flex-col items-center">
        {/* Header Title Section */}
        <div className="max-w-2xl mx-auto text-center mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-[0.25em] bg-white/5 border border-white/10 text-[#46d3db]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#46d3db] animate-pulse" />
            05 • Mind &amp; More
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white">
            Worlds Inside <span className="italic font-serif text-[#46d3db]">My Head</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed font-light">
            Psychology, finance, the brain, systems, and everything in between. Four distinct pillars of human curiosity.
          </p>
        </div>

        {/* 4 Floating Cards */}
        <MindCardsShowcase />
      </main>
    </div>
  );
}

