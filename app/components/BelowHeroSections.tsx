"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import EnchantedForestPlayground from "./playground/EnchantedForestPlayground";
import MindCardsShowcase from "./mind/MindCardsShowcase";

interface CarouselCard {
  src: string;
  alt: string;
  widthClass: string;
}

/**
 * TOP ROW (Row 1 — "01 THE FEELING"): Moves Left -> Right
 * Place 10 images in `assets/`: carousel-1-1.jpg through carousel-1-10.jpg
 */
const ROW_1_CARDS: CarouselCard[] = [
  {
    src: "/assets/carousel-1-1.jpg",
    alt: "Carousel Row 1 Image 1",
    widthClass: "w-[155px] sm:w-[175px]",
  },
  {
    src: "/assets/carousel-1-2.jpg",
    alt: "Carousel Row 1 Image 2",
    widthClass: "w-[180px] sm:w-[204px]",
  },
  {
    src: "/assets/carousel-1-3.jpg",
    alt: "Carousel Row 1 Image 3",
    widthClass: "w-[176px] sm:w-[200px]",
  },
  {
    src: "/assets/carousel-1-4.jpg",
    alt: "Carousel Row 1 Image 4",
    widthClass: "w-[195px] sm:w-[220px]",
  },
  {
    src: "/assets/carousel-1-5.jpg",
    alt: "Carousel Row 1 Image 5",
    widthClass: "w-[150px] sm:w-[170px]",
  },
  {
    src: "/assets/carousel-1-6.jpg",
    alt: "Carousel Row 1 Image 6",
    widthClass: "w-[156px] sm:w-[176px]",
  },
  {
    src: "/assets/carousel-1-7.jpg",
    alt: "Carousel Row 1 Image 7",
    widthClass: "w-[215px] sm:w-[244px]",
  },
  {
    src: "/assets/carousel-1-8.jpg",
    alt: "Carousel Row 1 Image 8",
    widthClass: "w-[202px] sm:w-[230px]",
  },
  {
    src: "/assets/carousel-1-9.jpg",
    alt: "Carousel Row 1 Image 9",
    widthClass: "w-[220px] sm:w-[250px]",
  },
  {
    src: "/assets/carousel-1-10.jpg",
    alt: "Carousel Row 1 Image 10",
    widthClass: "w-[155px] sm:w-[176px]",
  },
];

/**
 * SECOND ROW (Row 2 — "02 THE THINKING"): Moves Right -> Left
 * Place 10 images in `assets/`: carousel-2-1.jpg through carousel-2-9.jpg, carousel-2-10.png
 */
const ROW_2_CARDS: CarouselCard[] = [
  {
    src: "/assets/carousel-2-1.jpg",
    alt: "Carousel Row 2 Image 1",
    widthClass: "w-[140px] sm:w-[158px]",
  },
  {
    src: "/assets/carousel-2-2.jpg",
    alt: "Carousel Row 2 Image 2",
    widthClass: "w-[130px] sm:w-[148px]",
  },
  {
    src: "/assets/carousel-2-3.jpg",
    alt: "Carousel Row 2 Image 3",
    widthClass: "w-[192px] sm:w-[218px]",
  },
  {
    src: "/assets/carousel-2-4.jpg",
    alt: "Carousel Row 2 Image 4",
    widthClass: "w-[160px] sm:w-[182px]",
  },
  {
    src: "/assets/carousel-2-5.jpg",
    alt: "Carousel Row 2 Image 5",
    widthClass: "w-[164px] sm:w-[186px]",
  },
  {
    src: "/assets/carousel-2-6.jpg",
    alt: "Carousel Row 2 Image 6",
    widthClass: "w-[186px] sm:w-[212px]",
  },
  {
    src: "/assets/carousel-2-7.jpg",
    alt: "Carousel Row 2 Image 7",
    widthClass: "w-[170px] sm:w-[194px]",
  },
  {
    src: "/assets/carousel-2-8.jpg",
    alt: "Carousel Row 2 Image 8",
    widthClass: "w-[188px] sm:w-[214px]",
  },
  {
    src: "/assets/carousel-2-9.jpg",
    alt: "Carousel Row 2 Image 9",
    widthClass: "w-[150px] sm:w-[170px]",
  },
  {
    src: "/assets/carousel-2-10.png",
    alt: "Carousel Row 2 Image 10",
    widthClass: "w-[164px] sm:w-[186px]",
  },
];

interface BentoWorldItem {
  num: string;
  title: string;
  icon: "music" | "books" | "tech" | "ideas" | "mind" | "playground";
  image: string;
  href?: string;
  lines: [string, string, string];
}

/**
 * BENTO GRID ("EXPLORE & WANDER"):
 * Place 6 images in `assets/`: bento-1.jpg, bento-2.jpg, bento-3.png, bento-4.jpg, bento-5.jpg, bento-6.jpg
 */
const BENTO_WORLDS: BentoWorldItem[] = [
  {
    num: "01",
    title: "Music",
    icon: "music",
    image: "/assets/bento-1.jpg",
    href: "/music",
    lines: ["SONGS, SOUNDS", "AND STORIES", "THAT STAY."],
  },
  {
    num: "02",
    title: "Books",
    icon: "books",
    image: "/assets/bento-2.jpg",
    href: "/books",
    lines: ["FICTIONAL WORLDS", "REAL THOUGHTS", "BIGGER PERSPECTIVES."],
  },
  {
    num: "03",
    title: "Tech",
    icon: "tech",
    image: "/assets/bento-3.png",
    href: "/tech",
    lines: ["THINGS I BUILD", "THINGS I LEARN", "THINGS I'M EXCITED ABOUT."],
  },
  {
    num: "04",
    title: "Ideas",
    icon: "ideas",
    image: "/assets/bento-4.jpg",
    href: "/ideas",
    lines: ["RANDOM THOUGHTS", "HALF-FORMED PLANS", 'AND "WHAT IF?"'],
  },
  {
    num: "05",
    title: "Mind & More",
    icon: "mind",
    image: "/assets/bento-5.jpg",
    href: "/mind",
    lines: [
      "PSYCHOLOGY, FINANCE,",
      "THE BRAIN, SYSTEMS",
      "AND EVERYTHING IN BETWEEN.",
    ],
  },
  {
    num: "06",
    title: "Playground",
    icon: "playground",
    image: "/assets/bento-6.jpg",
    lines: ["A FOREST TO WANDER", "A DRAGON TO MEET", "A LITTLE MAGIC."],
  },
];

function BentoCategoryIcon({ type }: { type: BentoWorldItem["icon"] }) {
  switch (type) {
    case "music":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-[#D8B77E]"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        >
          <path d="M4 12v0M7.5 8v8M11 5v14M14.5 9v6M18 7v10M21 12v0" />
        </svg>
      );
    case "books":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-[#D8B77E]"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6.5C10.2 5.2 7.5 4.8 4.5 5.2C3.9 5.3 3.5 5.8 3.5 6.4V17.8C3.5 18.4 4 18.9 4.6 18.8C7.5 18.4 10.1 18.8 12 20.2M12 6.5C13.8 5.2 16.5 4.8 19.5 5.2C20.1 5.3 20.5 5.8 20.5 6.4V17.8C20.5 18.4 20 18.9 19.4 18.8C16.5 18.4 13.9 18.8 12 20.2M12 6.5V20.2" />
        </svg>
      );
    case "tech":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-[#D8B77E]"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="5" width="16" height="11" rx="1.5" />
          <path d="M2 18.5h20" />
        </svg>
      );
    case "ideas":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-[#D8B77E]"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.8 10.6c.6.5 1.1 1.3 1.2 2.1l.1.3h5l.1-.3c.1-.8.6-1.6 1.2-2.1A6 6 0 0 0 12 3Z" />
        </svg>
      );
    case "mind":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-[#D8B77E]"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5a3 3 0 0 0-5.9.8A3.5 3.5 0 0 0 4.5 9a3.5 3.5 0 0 0 .8 6.8A3 3 0 0 0 12 19V5Z" />
          <path d="M12 5a3 3 0 0 1 5.9.8A3.5 3.5 0 0 1 19.5 9a3.5 3.5 0 0 1-.8 6.8A3 3 0 0 1 12 19V5Z" />
          <path d="M9 9.5c1 .5 1.5 1.5 1.5 2.5M15 9.5c-1 .5-1.5 1.5-1.5 2.5" />
        </svg>
      );
    case "playground":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-[#D8B77E]"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          <path d="M8 8L16 16M16 8L8 16" strokeWidth="0.9" opacity="0.65" />
        </svg>
      );
  }
}

export default function BelowHeroSections() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [isMindModalOpen, setIsMindModalOpen] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const filterDropdownRef = useRef<HTMLDivElement | null>(null);
  const row1TrackRef = useRef<HTMLDivElement | null>(null);
  const row2TrackRef = useRef<HTMLDivElement | null>(null);

  // Close the filter dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // The main navigation points straight to the Playground experience.
  useEffect(() => {
    const selectFromHash = () => {
      if (window.location.hash === "#playground") {
        setSelectedFilter("Playground");
      }
    };

    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
  }, []);

  useEffect(() => {
    if (selectedFilter !== "Playground" || window.location.hash !== "#playground") return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedFilter]);

  // Continuous, hardware-accelerated infinite loop for the 2 carousel lines:
  // Top line (Row 1): Left -> Right
  // Bottom line (Row 2): Right -> Left
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();
    let offset1 = 0;
    let offset2 = 0;

    const SPEED_ROW_1 = 46; // px/sec (Left -> Right)
    const SPEED_ROW_2 = 42; // px/sec (Right -> Left)

    const animateMarquees = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const track1 = row1TrackRef.current;
      if (track1) {
        const halfWidth1 = track1.scrollWidth / 2;
        if (halfWidth1 > 0) {
          offset1 = (offset1 + SPEED_ROW_1 * dt) % halfWidth1;
          // Left -> Right movement: starts at -halfWidth1 and moves right toward 0
          const translateX1 = -halfWidth1 + offset1;
          track1.style.transform = `translate3d(${translateX1}px, 0, 0)`;
        }
      }

      const track2 = row2TrackRef.current;
      if (track2) {
        const halfWidth2 = track2.scrollWidth / 2;
        if (halfWidth2 > 0) {
          offset2 = (offset2 + SPEED_ROW_2 * dt) % halfWidth2;
          // Right -> Left movement: starts at 0 and moves left toward -halfWidth2
          const translateX2 = -offset2;
          track2.style.transform = `translate3d(${translateX2}px, 0, 0)`;
        }
      }

      rafId = requestAnimationFrame(animateMarquees);
    };

    rafId = requestAnimationFrame(animateMarquees);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const filterOptions = [
    { value: "All", label: "All Worlds", badge: "06" },
    { value: "The Feeling", label: "The Feeling", badge: "01–02" },
    { value: "The Thinking", label: "The Thinking", badge: "03–06" },
    { value: "Music", label: "Music", badge: "01" },
    { value: "Books", label: "Books", badge: "02" },
    { value: "Tech", label: "Tech", badge: "03" },
    { value: "Ideas", label: "Ideas", badge: "04" },
    { value: "Mind & More", label: "Mind & More", badge: "05" },
    { value: "Playground", label: "Playground", badge: "06" },
  ];

  const filteredWorlds = BENTO_WORLDS.filter((world) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "The Feeling") {
      return world.title === "Music" || world.title === "Books";
    }
    if (selectedFilter === "The Thinking") {
      return (
        world.title === "Tech" ||
        world.title === "Ideas" ||
        world.title === "Mind & More" ||
        world.title === "Playground"
      );
    }
    return world.title === selectedFilter;
  });

  const row1LoopItems = [...ROW_1_CARDS, ...ROW_1_CARDS];
  const row2LoopItems = [...ROW_2_CARDS, ...ROW_2_CARDS];

  return (
    <div className="relative z-30 w-full overflow-hidden bg-[#080604] text-[#F5EFE6]">
      {/* =====================================================================
          DARK COSMIC AMBIENT BACKGROUND & GLASSY GLOW NEBULAE
         ===================================================================== */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 35% at 18% 18%, rgba(216, 183, 126, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 82% 48%, rgba(184, 142, 79, 0.07) 0%, transparent 70%),
            radial-gradient(ellipse 65% 45% at 50% 88%, rgba(216, 183, 126, 0.09) 0%, transparent 75%),
            linear-gradient(180deg, #0b0805 0%, #070503 45%, #090604 100%)
          `,
        }}
      />

      {/* Subtle top transition border from Hero */}
      <div className="relative z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-[#D8B77E]/30 to-transparent" />

      {/* =====================================================================
          SECTION 1: INFINITE 2-LINE MARQUEE CAROUSEL
         ===================================================================== */}
      <section
        aria-label="The Feeling and The Thinking Infinite Carousels"
        className="relative z-10 w-full py-14 sm:py-20 lg:py-24"
      >
        <div className="mx-auto flex w-full flex-col gap-12 sm:gap-16">
          {/* -----------------------------------------------------------------
              LINE 1 (TOP): 01 THE FEELING (Moves continuously Left -> Right)
             ----------------------------------------------------------------- */}
          <div className="flex w-full flex-col gap-4 sm:gap-5">
            {/* Row 1 Editorial Header */}
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-10 lg:px-14">
              <div className="flex items-baseline gap-3 sm:gap-4 shrink-0">
                <span className="font-serif lining-nums text-[14px] sm:text-[17px] tracking-[0.18em] text-[#D8B77E]">
                  01
                </span>
                <h2 className="font-serif text-[14px] sm:text-[17px] font-normal uppercase tracking-[0.26em] text-[#F5EFE6]">
                  THE FEELING
                </h2>
              </div>

              {/* Long Horizontal Golden Hairline */}
              <div
                aria-hidden="true"
                className="hidden md:block h-[1px] flex-1 max-w-2xl bg-gradient-to-r from-[#D8B77E]/45 via-[#D8B77E]/20 to-transparent mx-4"
              />

              {/* Right Categories + Circular Arrow Indicators */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <p className="hidden sm:block font-sans text-[9.5px] md:text-[10.5px] uppercase tracking-[0.26em] text-[#CBB89D]/85">
                  MUSIC <span className="mx-1.5 text-[#D8B77E]/50">/</span>{" "}
                  BOOKS <span className="mx-1.5 text-[#D8B77E]/50">/</span>{" "}
                  FILMS <span className="mx-1.5 text-[#D8B77E]/50">/</span> ART{" "}
                  <span className="mx-1.5 text-[#D8B77E]/50">/</span> PLACES
                </p>
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#D8B77E]/35 bg-[#16100A]/60 text-[#D8B77E]/85 backdrop-blur-sm">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        d="M9.5 4L5.5 8L9.5 12"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#D8B77E]/35 bg-[#16100A]/60 text-[#D8B77E]/85 backdrop-blur-sm">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        d="M6.5 4L10.5 8L6.5 12"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Single Horizontal Line Track (Left -> Right Infinite Loop) */}
            <div className="relative w-full overflow-hidden marquee-edge-mask py-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 text-[#E5C896]/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                <svg viewBox="0 0 24 14" fill="none" className="w-5 h-3.5">
                  <path
                    d="M22 7H2M2 7L7 2M2 7L7 12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 text-[#E5C896]/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                <svg viewBox="0 0 24 14" fill="none" className="w-5 h-3.5">
                  <path
                    d="M2 7H22M22 7L17 2M22 7L17 12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div
                ref={row1TrackRef}
                className="flex flex-row flex-nowrap items-center w-max will-change-transform select-none"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  width: "max-content",
                }}
              >
                {row1LoopItems.map((card, idx) => (
                  <div
                    key={`row1-${idx}`}
                    aria-hidden={idx >= ROW_1_CARDS.length}
                    className={`group relative ${card.widthClass} h-[180px] sm:h-[206px] mr-3.5 sm:mr-4 shrink-0 overflow-hidden rounded-[12px] border border-[#D8B77E]/30 bg-[#140E09] shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-all duration-500 hover:border-[#E8CFA0]/80 hover:shadow-[0_12px_36px_rgba(216,183,126,0.2)]`}
                  >
                    <Image
                      unoptimized
                      src={card.src}
                      alt={card.alt}
                      fill
                      sizes="260px"
                      draggable={false}
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[12px] ring-1 ring-inset ring-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              LINE 2 (BOTTOM): 02 THE THINKING (Moves continuously Right -> Left)
             ----------------------------------------------------------------- */}
          <div className="flex w-full flex-col gap-4 sm:gap-5">
            {/* Row 2 Editorial Header */}
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-10 lg:px-14">
              <div className="flex items-baseline gap-3 sm:gap-4 shrink-0">
                <span className="font-serif lining-nums text-[14px] sm:text-[17px] tracking-[0.18em] text-[#D8B77E]">
                  02
                </span>
                <h2 className="font-serif text-[14px] sm:text-[17px] font-normal uppercase tracking-[0.26em] text-[#F5EFE6]">
                  THE THINKING
                </h2>
              </div>

              {/* Long Horizontal Golden Hairline */}
              <div
                aria-hidden="true"
                className="hidden md:block h-[1px] flex-1 max-w-2xl bg-gradient-to-r from-[#D8B77E]/45 via-[#D8B77E]/20 to-transparent mx-4"
              />

              {/* Right Categories + Circular Arrow Indicators */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <p className="hidden sm:block font-sans text-[9.5px] md:text-[10.5px] uppercase tracking-[0.26em] text-[#CBB89D]/85">
                  TECH <span className="mx-1.5 text-[#D8B77E]/50">/</span>{" "}
                  PSYCHOLOGY <span className="mx-1.5 text-[#D8B77E]/50">/</span>{" "}
                  FINANCE <span className="mx-1.5 text-[#D8B77E]/50">/</span>{" "}
                  SYSTEMS <span className="mx-1.5 text-[#D8B77E]/50">/</span>{" "}
                  EXPERIMENTS
                </p>
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#D8B77E]/35 bg-[#16100A]/60 text-[#D8B77E]/85 backdrop-blur-sm">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        d="M9.5 4L5.5 8L9.5 12"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#D8B77E]/35 bg-[#16100A]/60 text-[#D8B77E]/85 backdrop-blur-sm">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        d="M6.5 4L10.5 8L6.5 12"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Single Horizontal Line Track (Right -> Left Infinite Loop) */}
            <div className="relative w-full overflow-hidden marquee-edge-mask py-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 text-[#E5C896]/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                <svg viewBox="0 0 24 14" fill="none" className="w-5 h-3.5">
                  <path
                    d="M22 7H2M2 7L7 2M2 7L7 12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 text-[#E5C896]/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                <svg viewBox="0 0 24 14" fill="none" className="w-5 h-3.5">
                  <path
                    d="M2 7H22M22 7L17 2M22 7L17 12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div
                ref={row2TrackRef}
                className="flex flex-row flex-nowrap items-center w-max will-change-transform select-none"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  width: "max-content",
                }}
              >
                {row2LoopItems.map((card, idx) => (
                  <div
                    key={`row2-${idx}`}
                    aria-hidden={idx >= ROW_2_CARDS.length}
                    className={`group relative ${card.widthClass} h-[180px] sm:h-[206px] mr-3.5 sm:mr-4 shrink-0 overflow-hidden rounded-[12px] border border-[#D8B77E]/30 bg-[#140E09] shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-all duration-500 hover:border-[#E8CFA0]/80 hover:shadow-[0_12px_36px_rgba(216,183,126,0.2)]`}
                  >
                    <Image
                      unoptimized
                      src={card.src}
                      alt={card.alt}
                      fill
                      sizes="260px"
                      draggable={false}
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[12px] ring-1 ring-inset ring-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Subtle Cosmic Divider Between Carousels and Bento Worlds Grid */}
      <div className="relative z-10 mx-auto max-w-6xl px-8">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D8B77E]/25 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 2: BENTO WORLDS GRID ("EXPLORE & WANDER")
         ===================================================================== */}
      <section
        id="worlds"
        aria-label="Explore and Wander Worlds Grid"
        className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-8 sm:py-24 lg:px-12"
      >
        {/* Top Editorial Header Row (z-50 so Filter Dropdown is always above cards) */}
        <div className="relative z-50 mb-10 sm:mb-14 flex flex-col items-center justify-between gap-6 lg:flex-row">
          {/* Left: Filter Worlds Pill Button + Active Filter Reset */}
          <div
            ref={filterDropdownRef}
            className="relative z-50 order-2 lg:order-1 flex items-center gap-2.5"
          >
            <button
              type="button"
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
              onClick={() => setFilterOpen((prev) => !prev)}
              className="group inline-flex items-center gap-3.5 rounded-full border border-[#D8B77E]/45 bg-[#150F09]/80 px-5 py-2.5 text-[#EAE0D0] backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#E8CFA0] hover:bg-[#21170E] cursor-pointer"
            >
              {/* Funnel Filter Icon */}
              <svg
                viewBox="0 0 18 18"
                fill="none"
                className="w-4 h-4 text-[#D8B77E]"
                aria-hidden="true"
              >
                <path
                  d="M2.25 3.75H15.75L10.5 9.9V14.25L7.5 15.75V9.9L2.25 3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-sans text-[13px] tracking-[0.04em] text-[#F5EFE6]">
                {selectedFilter === "All" ? "Filter Worlds" : selectedFilter}
              </span>
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className={`w-3 h-3 text-[#D8B77E] transition-transform duration-300 ${
                  filterOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {selectedFilter !== "All" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter("All");
                  setFilterOpen(false);
                }}
                aria-label="Reset world filter"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D8B77E]/40 bg-[#1B130B]/85 px-3.5 py-2 font-sans text-[11.5px] uppercase tracking-[0.14em] text-[#E8CFA0] backdrop-blur-md transition-all hover:border-[#E8CFA0] hover:bg-[#2A1E12] cursor-pointer"
              >
                <span>Reset</span>
                <span aria-hidden="true" className="text-[13px] leading-none">
                  ×
                </span>
              </button>
            )}

            {/* Glassy Filter Dropdown */}
            {filterOpen && (
              <div
                role="listbox"
                aria-label="Filter Worlds Options"
                className="absolute left-0 top-full mt-2.5 z-50 flex flex-col w-56 rounded-xl border border-[#D8B77E]/50 bg-[#120C07]/95 p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
              >
                {filterOptions.map((opt) => {
                  const isActive = selectedFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setSelectedFilter(opt.value);
                        setFilterOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-left font-sans text-[12.5px] tracking-[0.05em] transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#D8B77E]/25 text-[#F5E1B9] font-medium"
                          : "text-[#EAE0D0]/85 hover:bg-white/10 hover:text-[#FAF6F0]"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="font-serif text-[11px] tracking-[0.1em] text-[#D8B77E]/80">
                        {opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Center: Overline + "EXPLORE & WANDER" */}
          <div className="order-1 lg:order-2 flex flex-col items-center text-center">
            <p className="font-sans text-[10.5px] sm:text-[12px] uppercase tracking-[0.3em] text-[#CBB89D]">
              WORLDS INSIDE MY HEAD
            </p>
            <h2 className="mt-1.5 font-display text-[2.25rem] sm:text-[3.25rem] xl:text-[3.75rem] font-normal uppercase tracking-[0.06em] leading-none text-[#F5EFE6] drop-shadow-[0_4px_24px_rgba(216,183,126,0.15)]">
              EXPLORE{" "}
              <span className="font-serif italic font-light text-[#E6C994]">
                &amp;
              </span>{" "}
              WANDER
            </h2>
          </div>

          {/* Right: Vertical Star Ornament + "Different rooms. Same curious mind." */}
          <div className="order-3 flex items-center gap-4">
            {/* Vertical Hairline with Center 4-Point Star */}
            <div
              aria-hidden="true"
              className="flex flex-col items-center justify-center h-11"
            >
              <span className="w-[1px] flex-1 bg-gradient-to-b from-transparent to-[#D8B77E]/75" />
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="w-2.5 h-2.5 text-[#E5C68E] -my-0.5 shrink-0"
              >
                <path
                  d="M8 0C8.5 5 10 7.2 16 8C10 8.8 8.5 11 8 16C7.5 11 6 8.8 0 8C6 7.2 7.5 5 8 0Z"
                  fill="currentColor"
                />
              </svg>
              <span className="w-[1px] flex-1 bg-gradient-to-t from-transparent to-[#D8B77E]/75" />
            </div>

            <div className="font-serif italic text-[16px] sm:text-[18px] leading-[1.28] text-[#DFC8A2]">
              <p>Different rooms.</p>
              <p>Same curious mind.</p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------
            6-COLUMN ASYMMETRIC EDITORIAL BENTO CARDS
            Fainter by default -> expands & becomes vivid on hover (or when actively filtered)
           ------------------------------------------------------------------- */}
        <div
          className={`grid gap-4 ${
            filteredWorlds.length === 1
              ? selectedFilter === "Playground"
                ? "grid-cols-1 max-w-[1240px] mx-auto"
                : "grid-cols-1 max-w-[360px] mx-auto"
              : filteredWorlds.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-[740px] mx-auto"
              : filteredWorlds.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-[1200px] mx-auto"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          }`}
        >
          {filteredWorlds.map((world) => {
            if (selectedFilter === "Playground" && world.title === "Playground") {
              return (
                <div key={world.num} id="playground" className="col-span-full scroll-mt-8">
                  <EnchantedForestPlayground />
                </div>
              );
            }

            const isActivelyFiltered = selectedFilter !== "All";

            return (
              <article
                key={world.num}
                onClick={() => {
                  if (world.title === "Mind & More") {
                    setIsMindModalOpen(true);
                  } else if (world.href) {
                    router.push(world.href);
                  } else if (world.title === "Playground") {
                    setSelectedFilter("Playground");
                  }
                }}
                className={`group relative flex min-h-[480px] sm:min-h-[520px] xl:min-h-[550px] flex-col justify-between overflow-hidden rounded-[4px] border bg-gradient-to-b from-[#140E08] via-[#0C0805] to-[#080503] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                  isActivelyFiltered
                    ? "opacity-100 brightness-105 saturate-105 border-[#E8CFA0]/75 shadow-[0_20px_50px_rgba(216,183,126,0.18)] hover:scale-[1.03] hover:-translate-y-2 hover:z-30 hover:border-[#E8CFA0]"
                    : "border-[#D8B77E]/25 opacity-60 brightness-[0.72] saturate-[0.75] hover:opacity-100 hover:brightness-110 hover:saturate-110 hover:scale-[1.035] hover:-translate-y-2 hover:z-30 hover:border-[#E8CFA0]/85 hover:shadow-[0_24px_60px_rgba(216,183,126,0.22),0_0_28px_rgba(216,183,126,0.14)]"
                }`}
              >
                {/* Top Card Bar: Number (01..06) & Circular Up-Right Arrow */}
                <div className="relative z-20 flex items-center justify-between p-4 sm:p-5">
                  <span className="font-serif lining-nums text-[16px] sm:text-[17px] tracking-[0.06em] text-[#EAE0D0] transition-colors duration-300 group-hover:text-[#FFF8EE]">
                    {world.num}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F5EFE6]/45 bg-[#120D08]/45 text-[#F5EFE6] backdrop-blur-sm transition-all duration-300 group-hover:border-[#E8CFA0] group-hover:bg-[#D8B77E]/25 group-hover:scale-110">
                    <svg
                      viewBox="0 0 14 14"
                      fill="none"
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      <path
                        d="M3.5 10.5L10.5 3.5M10.5 3.5H4.5M10.5 3.5V9.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                {/* Upper Artwork Layer with Smooth Bottom Vignette Fade */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[72%] overflow-hidden z-0">
                  <Image
                    unoptimized
                    src={world.image}
                    alt={world.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 18vw"
                    draggable={false}
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Top subtle dark scrim so 01..06 and arrow stay crisp */}
                  <div
                    className="absolute inset-x-0 top-0 h-20"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(10, 7, 4, 0.55) 0%, transparent 100%)",
                    }}
                  />
                  {/* Bottom gradient blending seamlessly into card footer */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-32"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 0%, rgba(11, 8, 5, 0.82) 55%, #090604 100%)",
                    }}
                  />
                </div>

                {/* Soft Cosmic Inner Glow on Hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 50% at 50% 85%, rgba(216, 183, 126, 0.14) 0%, transparent 70%)",
                  }}
                />

                {/* Bottom Editorial Typography & Icon */}
                <div className="relative z-20 mt-auto flex flex-col px-4 pb-5 pt-6 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-[26px] sm:text-[28px] xl:text-[26px] 2xl:text-[29px] font-normal tracking-[-0.01em] text-[#FAF6F0] transition-colors duration-300 group-hover:text-white">
                      {world.title}
                    </h3>
                    <div className="shrink-0 opacity-85 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-100">
                      <BentoCategoryIcon type={world.icon} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-1 font-sans text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] leading-[1.55] text-[#C8B89E]/85 transition-colors duration-300 group-hover:text-[#EFE4D2]">
                    {world.lines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  {/* Bottom Hairline Rule */}
                  <div className="mt-5 h-[1px] w-full bg-[#D8B77E]/30 transition-colors duration-500 group-hover:bg-[#E8CFA0]/80" />
                </div>
              </article>
            );
          })}
        </div>

        {/* Mind & More Floating Cards Modal */}
        <AnimatePresence>
          {isMindModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMindModalOpen(false)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-5xl w-full bg-[#070b16] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 my-auto overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsMindModalOpen(false)}
                  aria-label="Close modal"
                  className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>

                {/* Modal Header */}
                <div className="text-center mb-8 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-[#46d3db]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#46d3db] animate-pulse" />
                    05 • Mind &amp; More
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-white">
                    Worlds Inside <span className="italic font-serif text-[#46d3db]">My Head</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                    Select a pillar below. Click Brain &amp; Biology to enter the real-time 3D DNA simulation.
                  </p>
                </div>

                {/* 4 Floating Cards */}
                <MindCardsShowcase
                  isModal
                  onCardClick={(card) => {
                    if (card.href) {
                      setIsMindModalOpen(false);
                      router.push(card.href);
                    }
                  }}
                />

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span>4 Specialized Verticals</span>
                  <Link
                    href="/mind"
                    onClick={() => setIsMindModalOpen(false)}
                    className="text-[#46d3db] hover:underline"
                  >
                    Open Full Page ↗
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
