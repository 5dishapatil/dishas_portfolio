"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface MindCardItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  glow: string;
  tags: string[];
  href?: string;
  isSpecial?: boolean;
  ctaText?: string;
}

export const MIND_CARDS: MindCardItem[] = [
  {
    id: "psychology",
    number: "01",
    title: "Psychology",
    subtitle: "The Architecture of Thought & Choice",
    description:
      "Unpacking behavioral biases, perception engines, heuristics, and the hidden mechanics governing human decision-making under uncertainty.",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
    tags: ["Cognition", "Biases", "Behavior", "Mental Models"],
  },
  {
    id: "finance",
    number: "02",
    title: "Finance",
    subtitle: "Asymmetric Bets, Markets & Compounding",
    description:
      "Decoupled capital allocation, market reflexivity, risk asymmetry, and exponential wealth creation over multi-decadal horizons.",
    accent: "#10b981",
    glow: "rgba(16, 185, 129, 0.35)",
    tags: ["Markets", "Capital", "Asymmetry", "Compounding"],
  },
  {
    id: "brain-and-biology",
    number: "03",
    title: "Brain and Biology",
    subtitle: "Genomics, DNA & Neural Topology",
    description:
      "Find out what your DNA says about you. An interactive real-time 3D double helix simulation exploring genomics, ancestral codes, and neurobiology.",
    accent: "#46d3db",
    glow: "rgba(70, 211, 219, 0.55)",
    tags: ["3D DNA Helix", "Genomics", "Ancestry", "Neuroscience"],
    href: "/mind/brain-and-biology",
    isSpecial: true,
    ctaText: "Launch 3D DNA Simulation ↗",
  },
  {
    id: "systems",
    number: "04",
    title: "Systems",
    subtitle: "Cybernetics, Feedback Loops & Emergence",
    description:
      "Complex adaptive networks, self-organizing dynamics, nonlinear feedback loops, and systemic leverage points under chaotic environments.",
    accent: "#a855f7",
    glow: "rgba(168, 85, 247, 0.35)",
    tags: ["Cybernetics", "Networks", "Emergence", "Complexity"],
  },
];

interface MindCardsShowcaseProps {
  onCardClick?: (item: MindCardItem) => void;
  isModal?: boolean;
}

export default function MindCardsShowcase({
  onCardClick,
  isModal = false,
}: MindCardsShowcaseProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 4 Floating Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
        {MIND_CARDS.map((card, idx) => {
          const CardInner = (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              whileHover={{
                y: -8,
                scale: 1.025,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              style={
                {
                  "--card-glow": card.glow,
                  "--card-accent": card.accent,
                } as React.CSSProperties
              }
              className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-[#0c101d]/85 backdrop-blur-xl border transition-all duration-500 shadow-2xl cursor-pointer overflow-hidden ${
                card.isSpecial
                  ? "border-[#46d3db]/50 hover:border-[#46d3db] hover:shadow-[0_20px_50px_rgba(70,211,219,0.25)]"
                  : "border-white/10 hover:border-white/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
              }`}
            >
              {/* Subtle ambient corner gradient glow */}
              <div
                className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ backgroundColor: card.accent }}
              />

              {/* Top metadata row */}
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: card.accent,
                      boxShadow: `0 0 10px ${card.accent}`,
                    }}
                  />
                  <span
                    className="font-mono text-xs uppercase tracking-[0.25em] font-semibold"
                    style={{ color: card.accent }}
                  >
                    No. {card.number}
                  </span>
                </div>

                {card.isSpecial ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#46d3db]/15 border border-[#46d3db]/40 text-[#46d3db] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#46d3db]" />
                    Interactive 3D
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                    Vertical
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="relative z-10 space-y-2 mb-4">
                <h3
                  className={`text-2xl sm:text-3xl font-bold tracking-tight text-white transition-colors duration-300 ${
                    card.isSpecial ? "group-hover:text-[#46d3db]" : "group-hover:text-white"
                  }`}
                >
                  {card.title}
                </h3>
                <p className="font-mono text-xs text-white/60 tracking-wider">
                  // {card.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="relative z-10 text-sm text-zinc-300 leading-relaxed font-light mb-6">
                {card.description}
              </p>

              {/* Tags & Action Button */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-white/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {card.ctaText && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#46d3db] group-hover:translate-x-1 transition-transform">
                    {card.ctaText}
                  </span>
                )}
              </div>
            </motion.div>
          );

          if (card.href) {
            return (
              <Link
                key={card.id}
                href={card.href}
                onClick={() => onCardClick?.(card)}
                className="block"
              >
                {CardInner}
              </Link>
            );
          }

          return (
            <div
              key={card.id}
              onClick={() => onCardClick?.(card)}
              className="block"
            >
              {CardInner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
