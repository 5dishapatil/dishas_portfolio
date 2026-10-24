"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import BelowHeroSections from "./components/BelowHeroSections";

const TOTAL_FRAMES = 150;

function getFramePath(index: number): string {
  const clamped = Math.min(Math.max(index + 1, 1), TOTAL_FRAMES);
  const padded = String(clamped).padStart(3, "0");
  return `/frames/ezgif-frame-${padded}.png`;
}

const NAV_ITEMS = [
  { label: "Home", href: "#", active: true },
  { label: "About", href: "#about", active: false },
  { label: "Music", href: "/music", active: false },
  { label: "Books", href: "/books", active: false },
  { label: "Tech", href: "/tech", active: false },
  { label: "Ideas", href: "/ideas", active: false },
  { label: "Playground", href: "/playground", active: false },
  { label: "More", href: "#worlds", active: false, hasDropdown: true },
];

/** Four-pointed elongated golden star with subtle horizontal flare (top-left brand icon) */
function BrandStarIcon({ className = "w-6 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 0C14.7 9.2 16.4 13.8 26 17C16.4 20.2 14.7 24.8 14 34C13.3 24.8 11.6 20.2 2 17C11.6 13.8 13.3 9.2 14 0Z"
        fill="url(#brandStarGrad)"
      />
      <path
        d="M0 17C8.5 16.5 11.5 16 14 14.2C16.5 16 19.5 16.5 28 17C19.5 17.5 16.5 18 14 19.8C11.5 18 8.5 17.5 0 17Z"
        fill="#EED4A3"
        fillOpacity="0.85"
      />
      <defs>
        <linearGradient
          id="brandStarGrad"
          x1="14"
          y1="0"
          x2="14"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F4DFB4" />
          <stop offset="50%" stopColor="#D8B77E" />
          <stop offset="100%" stopColor="#B89356" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Crisp 4-point golden star for dividers, buttons, and the 'i' dot */
function FourPointStar({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 0C12.7 7.6 14.8 10.9 24 12C14.8 13.1 12.7 16.4 12 24C11.3 16.4 9.2 13.1 0 12C9.2 10.9 11.3 7.6 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Subtle stationary dotted trail left at the "Ideas" perch when the butterfly is at home,
 * fading out smoothly as the butterfly takes flight toward the cursor.
 */
function ButterflyHomeTrail({
  className = "",
  visible = true,
}: {
  className?: string;
  visible?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 130 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <path
        d="M52 84C38 102 22 118 4 134"
        stroke="#E6D0A8"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="1.2 4.5"
        opacity="0.55"
      />
    </svg>
  );
}

/**
 * Live animated SVG butterfly with independent 3D flapping forewings/hindwings,
 * counter-phased far wing, and subtle thorax/antennae recoil.
 */
function AnimatedButterflySVG({
  nearWingRef,
  farWingRef,
  bodyGroupRef,
}: {
  nearWingRef: React.RefObject<SVGGElement | null>;
  farWingRef: React.RefObject<SVGGElement | null>;
  bodyGroupRef: React.RefObject<SVGGElement | null>;
}) {
  return (
    <svg
      viewBox="0 0 130 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full overflow-visible drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
      aria-hidden="true"
    >
      <g ref={bodyGroupRef} transform="translate(26, 8)">
        {/* Background (far) upper wing */}
        <g ref={farWingRef}>
          <path
            d="M32 45C33 25 41 8 50 4C57 1 61 9 58 22C55 33 45 44 35 50"
            stroke="#EAD5B0"
            strokeWidth="1.15"
            strokeLinecap="round"
            opacity="0.82"
          />
          <path
            d="M36 44C40 29 46 16 52 11"
            stroke="#EAD5B0"
            strokeWidth="0.85"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>

        {/* Foreground (near) main swept forewing & hindwing (flaps in 3D) */}
        <g ref={nearWingRef}>
          <path
            d="M33 48C44 26 62 12 73 14C80 15 80 23 76 30C81 31 82 37 76 43C80 45 78 51 71 54C61 58 46 57 34 54"
            stroke="#F7EAD3"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Forewing delicate interior cells & veins */}
          <path
            d="M36 50C47 34 61 22 70 21C75 21 75 26 69 32C61 40 48 47 36 51"
            stroke="#ECD8B6"
            strokeWidth="0.95"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M50 38C59 33 68 32 74 35"
            stroke="#ECD8B6"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M46 45C56 42 66 42 73 46"
            stroke="#ECD8B6"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M42 50C52 49 62 50 68 52"
            stroke="#ECD8B6"
            strokeWidth="0.85"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Lower Hindwing */}
          <path
            d="M34 54C46 56 61 61 64 69C66 74 60 78 53 76C49 79 42 79 39 74C35 69 33 61 33 55"
            stroke="#F7EAD3"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36 57C45 60 55 64 57 69C58 72 53 74 47 71C41 68 37 62 36 57Z"
            stroke="#ECD8B6"
            strokeWidth="0.9"
            opacity="0.8"
          />
          <path
            d="M35 60C41 65 45 71 44 75"
            stroke="#ECD8B6"
            strokeWidth="0.85"
            opacity="0.75"
          />
        </g>

        {/* Antennae */}
        <path
          d="M28 44C23 32 16 25 9 23C6.5 22.3 6 24 8 25"
          stroke="#F4E6CC"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M31 43C29 31 24 23 18 20C16 19 15 20.5 17 21.5"
          stroke="#F4E6CC"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Small Left / Forward Wing edge */}
        <path
          d="M31 48C22 49 16 55 18 62C20 67 26 67 32 61"
          stroke="#EAD5B0"
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Butterfly Body (Head, Thorax, Abdomen) */}
        <path
          d="M29 43C31 49 33 57 32 68"
          stroke="#FFF5E4"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** Hand-drawn heart + curved arrow pointing down-right (left margin annotation) */
function LeftHandDrawnArrow({
  className = "w-20 h-20",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 95 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hand-drawn heart */}
      <path
        d="M20 12C17 6 9 6 9 13C9 19 16 24 20 29C24 24 31 19 31 13C31 6 23 6 20 12Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Curved arrow down-right */}
      <path
        d="M23 42C24 62 39 77 69 78"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M62 72C65 75 68 77 71 78C68 79 64 81 61 84"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hand-drawn heart + curved arrow pointing down-left (right margin annotation) */
function RightHandDrawnArrow({
  className = "w-20 h-20",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hand-drawn heart */}
      <path
        d="M48 11C45 5 38 5 38 12C38 17 44 22 48 26C52 22 58 17 58 12C58 5 51 5 48 11Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Curved arrow down-left */}
      <path
        d="M48 36C49 54 38 69 16 71"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M23 65C20 68 17 70 14 71C17 72 21 74 24 77"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [isButterflyAtHome, setIsButterflyAtHome] = useState(true);

  const scrollTrackRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive single butterfly refs
  const butterflyAnchorRef = useRef<HTMLSpanElement | null>(null);
  const butterflyMoverRef = useRef<HTMLDivElement | null>(null);
  const nearWingRef = useRef<SVGGElement | null>(null);
  const farWingRef = useRef<SVGGElement | null>(null);
  const bodyGroupRef = useRef<SVGGElement | null>(null);
  const cursorHistoryRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const butterflyAtHomeRef = useRef<boolean>(true);
  const butterflyStateRef = useRef({
    initialized: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facing: 1,
    targetFacing: 1,
    bank: 0,
    flapPhase: 0,
    lastTime: 0,
  });

  // Persistent animation state refs
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  const loadedRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const forceRedrawRef = useRef<boolean>(true);
  const reducedMotionRef = useRef<boolean>(false);
  const heroVisibleRef = useRef<boolean>(false);
  const skipVisibleRef = useRef<boolean>(true);

  /** Draw a given frame index onto the sticky full-screen canvas with object-cover scaling and Retina DPR */
  const renderCanvasFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return false;

    // Find the requested frame, or the nearest already-loaded frame to avoid any blank flicker
    let img: HTMLImageElement | null = null;
    if (loadedRef.current[frameIndex] && imagesRef.current[frameIndex]) {
      img = imagesRef.current[frameIndex];
    } else {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prevIdx = frameIndex - offset;
        if (
          prevIdx >= 0 &&
          loadedRef.current[prevIdx] &&
          imagesRef.current[prevIdx]
        ) {
          img = imagesRef.current[prevIdx];
          break;
        }
        const nextIdx = frameIndex + offset;
        if (
          nextIdx < TOTAL_FRAMES &&
          loadedRef.current[nextIdx] &&
          imagesRef.current[nextIdx]
        ) {
          img = imagesRef.current[nextIdx];
          break;
        }
      }
    }

    if (!img || !img.naturalWidth || !img.naturalHeight) {
      return false;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetWidth = Math.round(vw * dpr);
    const targetHeight = Math.round(vh * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill deep luxury dark-gold background before drawing
    ctx.fillStyle = "#120d08";
    ctx.fillRect(0, 0, vw, vh);

    // Compute exact "object-cover object-center" dimensions
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = vw / vh;
    let drawWidth = vw;
    let drawHeight = vh;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = vw;
      drawHeight = vw / imgRatio;
      offsetX = 0;
      offsetY = (vh - drawHeight) / 2;
    } else {
      drawHeight = vh;
      drawWidth = vh * imgRatio;
      offsetX = (vw - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    return true;
  }, []);

  /** Skip button handler: jump straight to the last frame (150) and reveal the Hero Page */
  const handleSkipToHero = useCallback(() => {
    const track = scrollTrackRef.current;
    if (track) {
      const maxScroll = Math.max(0, track.offsetHeight - window.innerHeight);
      window.scrollTo({ top: maxScroll, behavior: "instant" });
    }
    targetFrameRef.current = TOTAL_FRAMES - 1;
    currentFrameRef.current = TOTAL_FRAMES - 1;
    forceRedrawRef.current = true;
    renderCanvasFrame(TOTAL_FRAMES - 1);

    if (skipVisibleRef.current) {
      skipVisibleRef.current = false;
      setShowSkipButton(false);
    }
    if (!heroVisibleRef.current) {
      heroVisibleRef.current = true;
      setIsHeroVisible(true);
    }
  }, [renderCanvasFrame]);

  /** Smoothly scroll straight to the Bento Worlds Grid section */
  const handleExploreWorlds = useCallback(() => {
    const worldsSection = document.getElementById("worlds");
    if (worldsSection) {
      worldsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let rafId = 0;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Progressive Frame Preloader
    // Order: Frame 1 & Frame 150 immediately -> coarse keyframes -> even frames -> odd frames
    const loadOrder: number[] = [];
    const seen = new Set<number>();
    const enqueue = (idx: number) => {
      if (idx >= 0 && idx < TOTAL_FRAMES && !seen.has(idx)) {
        seen.add(idx);
        loadOrder.push(idx);
      }
    };

    enqueue(0);
    enqueue(TOTAL_FRAMES - 1);
    for (let i = 0; i < TOTAL_FRAMES; i += 6) enqueue(i);
    for (let i = 0; i < TOTAL_FRAMES; i += 2) enqueue(i);
    for (let i = 0; i < TOTAL_FRAMES; i++) enqueue(i);

    let queueCursor = 0;
    const CONCURRENCY = 8;

    const loadSingleFrame = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        if (isCancelled || loadedRef.current[index]) {
          resolve();
          return;
        }
        const img = new window.Image();
        img.decoding = "async";
        img.src = getFramePath(index);
        img.onload = () => {
          if (isCancelled) {
            resolve();
            return;
          }
          imagesRef.current[index] = img;
          loadedRef.current[index] = true;
          // Trigger redraw if the loaded frame is near the current frame
          if (Math.abs(index - Math.round(currentFrameRef.current)) <= 6) {
            forceRedrawRef.current = true;
          }
          resolve();
        };
        img.onerror = () => {
          resolve();
        };
      });
    };

    const runWorker = async () => {
      while (!isCancelled && queueCursor < loadOrder.length) {
        const nextIndex = loadOrder[queueCursor++];
        await loadSingleFrame(nextIndex);
      }
    };

    // Launch initial frame 1 & frame 150 immediately, then concurrent workers
    loadSingleFrame(0).then(() => {
      forceRedrawRef.current = true;
    });
    loadSingleFrame(TOTAL_FRAMES - 1);

    for (let w = 0; w < CONCURRENCY; w++) {
      runWorker();
    }

    // Scroll progress reader
    const updateScrollTarget = () => {
      const track = scrollTrackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
      const scrolled = Math.min(Math.max(0, -rect.top), maxScroll);
      const rawProgress = scrolled / maxScroll; // 0.0 -> 1.0
      const progress = rawProgress >= 0.985 ? 1 : rawProgress / 0.985;

      // Map 0% scroll -> frame 1 (index 0), 100% scroll -> frame 150 (index 149)
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    };

    const handleResize = () => {
      forceRedrawRef.current = true;
      updateScrollTarget();
    };

    // Record cursor movements for the 1-second-delayed butterfly flight tracker
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroVisibleRef.current) return;
      const now = performance.now();
      const history = cursorHistoryRef.current;

      if (history.length === 0) {
        const anchor = butterflyAnchorRef.current;
        if (anchor) {
          const rect = anchor.getBoundingClientRect();
          const homeX = rect.left + rect.width * 0.5;
          const homeY = rect.top + rect.height * 0.5;
          history.push({ x: homeX, y: homeY, t: now - 16 });
        }
      } else {
        const last = history[history.length - 1];
        // Preserve stationary pauses so moving after stopping always waits a full 1.0s before taking off
        if (now - last.t > 48) {
          history.push({ x: last.x, y: last.y, t: now - 16 });
        }
      }

      history.push({ x: e.clientX + 18, y: e.clientY - 22, t: now });
    };

    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    updateScrollTarget();

    // Persistent requestAnimationFrame loop with smooth lerp interpolation & live butterfly flight
    const tick = (now: number) => {
      if (isCancelled) return;

      updateScrollTarget();
      const target = targetFrameRef.current;
      const lerpFactor = reducedMotionRef.current ? 0.35 : 0.14;
      const diff = target - currentFrameRef.current;

      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * lerpFactor;
      } else {
        currentFrameRef.current = target;
      }

      const displayFrame = Math.min(
        Math.max(Math.round(currentFrameRef.current), 0),
        TOTAL_FRAMES - 1
      );

      if (
        forceRedrawRef.current ||
        displayFrame !== lastDrawnFrameRef.current
      ) {
        const drawn = renderCanvasFrame(displayFrame);
        if (drawn) {
          lastDrawnFrameRef.current = displayFrame;
          forceRedrawRef.current = false;
        }
      }

      // Show Skip button on the first image frame (and early opening frames before scrolling away)
      const shouldShowSkip =
        displayFrame <= 3 && target <= 4 && !heroVisibleRef.current;
      if (shouldShowSkip !== skipVisibleRef.current) {
        skipVisibleRef.current = shouldShowSkip;
        setShowSkipButton(shouldShowSkip);
      }

      // Reveal the Hero Page ONLY after reaching the last frame (ezgif-frame-150.png, index 149)
      const shouldShowHero =
        displayFrame >= TOTAL_FRAMES - 1 && target >= TOTAL_FRAMES - 1.2;
      const shouldHideHero = target < TOTAL_FRAMES - 3;

      if (!heroVisibleRef.current && shouldShowHero) {
        heroVisibleRef.current = true;
        setIsHeroVisible(true);
      } else if (heroVisibleRef.current && shouldHideHero) {
        heroVisibleRef.current = false;
        setIsHeroVisible(false);
        cursorHistoryRef.current = [];
        butterflyStateRef.current.initialized = false;
        if (!butterflyAtHomeRef.current) {
          butterflyAtHomeRef.current = true;
          setIsButterflyAtHome(true);
        }
      }

      // Update live wing-flapping butterfly & 1-second-delayed cursor flight
      const anchor = butterflyAnchorRef.current;
      const mover = butterflyMoverRef.current;
      if (anchor && mover) {
        const bState = butterflyStateRef.current;
        const dt = bState.lastTime
          ? Math.min(0.05, Math.max(0.001, (now - bState.lastTime) / 1000))
          : 1 / 60;
        bState.lastTime = now;

        const rect = anchor.getBoundingClientRect();
        const homeX = rect.left + rect.width * 0.5;
        const homeY = rect.top + rect.height * 0.5;
        const width = rect.width || 112;
        const height = rect.height || 112;

        if (!bState.initialized || !heroVisibleRef.current) {
          bState.x = homeX;
          bState.y = homeY;
          bState.vx = 0;
          bState.vy = 0;
          bState.facing = 1;
          bState.targetFacing = 1;
          bState.bank = 0;
          bState.initialized = true;
        }

        // Look up cursor position from 0.5 seconds (500ms) ago
        const DELAY_MS = 500;
        const delayedTime = now - DELAY_MS;
        const history = cursorHistoryRef.current;

        let delayedTargetX = homeX;
        let delayedTargetY = homeY;
        let hasLeftHome = false;

        if (history.length > 0 && delayedTime > history[0].t) {
          hasLeftHome = true;
          if (delayedTime >= history[history.length - 1].t) {
            delayedTargetX = history[history.length - 1].x;
            delayedTargetY = history[history.length - 1].y;
            if (history.length > 2) {
              history.splice(0, history.length - 2);
            }
          } else {
            let idx = 0;
            for (let i = 0; i < history.length - 1; i++) {
              if (
                history[i].t <= delayedTime &&
                history[i + 1].t >= delayedTime
              ) {
                idx = i;
                break;
              }
            }
            const p0 = history[idx];
            const p1 = history[idx + 1];
            const span = Math.max(1, p1.t - p0.t);
            const alpha = Math.min(1, Math.max(0, (delayedTime - p0.t) / span));
            delayedTargetX = p0.x + (p1.x - p0.x) * alpha;
            delayedTargetY = p0.y + (p1.y - p0.y) * alpha;

            if (idx > 2) {
              history.splice(0, idx - 1);
            }
          }
        }

        if (butterflyAtHomeRef.current === hasLeftHome) {
          butterflyAtHomeRef.current = !hasLeftHome;
          setIsButterflyAtHome(!hasLeftHome);
        }

        // Gentle organic hover float + smooth steering pursuit toward the 0.5s-delayed cursor point
        const hoverX = Math.sin(now * 0.0028) * 3.2;
        const hoverY = Math.cos(now * 0.0036) * 4.2;

        const pathDx = delayedTargetX - bState.x;
        const pathDy = delayedTargetY - bState.y;
        const pathDist = Math.hypot(pathDx, pathDy);

        const dx = delayedTargetX + hoverX - bState.x;
        const dy = delayedTargetY + hoverY - bState.y;
        const dist = Math.hypot(dx, dy);

        const maxSpeed = 920;
        const pull = 5.4;
        const rawSpeed = dist * pull;
        const scale = rawSpeed > maxSpeed ? maxSpeed / rawSpeed : 1;

        const desiredVx = dx * pull * scale;
        const desiredVy = dy * pull * scale;
        const steer = Math.min(1, dt * 8.5);

        bState.vx += (desiredVx - bState.vx) * steer;
        bState.vy += (desiredVy - bState.vy) * steer;
        bState.x += bState.vx * dt;
        bState.y += bState.vy * dt;

        const flightSpeed = Math.hypot(bState.vx, bState.vy);

        // Orient butterfly head & antennae along the flight path toward the cursor:
        // In the default SVG (scaleX = 1), the head/antennae point up-left at ~ -130 deg.
        // When mirrored (scaleX = -1), the head/antennae point up-right at ~ -50 deg.
        let targetAngle = 0;
        if (!hasLeftHome && pathDist < 8) {
          bState.targetFacing = 1;
          targetAngle = 0;
        } else if (pathDist > 10 || flightSpeed > 22) {
          const headVecX = pathDx * 0.65 + bState.vx * 0.35;
          const headVecY = pathDy * 0.65 + bState.vy * 0.35;

          if (Math.abs(headVecX) > 12) {
            bState.targetFacing = headVecX >= 0 ? -1 : 1;
          }

          const flightDeg = Math.atan2(headVecY, headVecX) * (180 / Math.PI);
          if (bState.targetFacing < 0) {
            // Facing right (mirrored): unrotated head is at -50 deg
            targetAngle = ((flightDeg + 50 + 540) % 360) - 180;
          } else {
            // Facing left (default): unrotated head is at -130 deg
            targetAngle = ((flightDeg + 130 + 540) % 360) - 180;
          }
        } else {
          // Hovering at the cursor: gently relax extreme vertical dive angles while keeping inclination
          targetAngle = Math.max(-25, Math.min(25, bState.bank * 0.85));
        }

        bState.facing +=
          (bState.targetFacing - bState.facing) * Math.min(1, dt * 11);

        const angleDiff = ((targetAngle - bState.bank + 540) % 360) - 180;
        bState.bank += angleDiff * Math.min(1, dt * 9.5);

        // Continuous phase-integrated 3D wing flapping (faster while flying, slow & graceful while hovering)
        const flapFreq = 2.5 + Math.min(flightSpeed / 85, 1) * 6.5;
        bState.flapPhase += dt * flapFreq * Math.PI * 2;
        const flap = Math.sin(bState.flapPhase);

        if (nearWingRef.current) {
          const wingScaleX = 0.24 + 0.76 * (0.5 + 0.5 * flap);
          const wingScaleY = 0.92 + 0.08 * (0.5 + 0.5 * flap);
          const wingRotate = (1 - flap) * -12;
          nearWingRef.current.style.transformOrigin = "33px 51px";
          nearWingRef.current.style.transform = `rotate(${wingRotate.toFixed(2)}deg) scale(${wingScaleX.toFixed(3)}, ${wingScaleY.toFixed(3)})`;
        }

        if (farWingRef.current) {
          const farFlap = Math.sin(bState.flapPhase - 0.6);
          const farScaleX = 0.38 + 0.62 * (0.5 + 0.5 * farFlap);
          const farRotate = (1 - farFlap) * 10;
          farWingRef.current.style.transformOrigin = "33px 50px";
          farWingRef.current.style.transform = `rotate(${farRotate.toFixed(2)}deg) scaleX(${farScaleX.toFixed(3)})`;
        }

        if (bodyGroupRef.current) {
          const liftY = -Math.sin(bState.flapPhase) * 1.8;
          bodyGroupRef.current.setAttribute(
            "transform",
            `translate(26, ${(8 + liftY).toFixed(2)})`
          );
        }

        const left = bState.x - width * 0.5;
        const top = bState.y - height * 0.5;
        mover.style.width = `${width}px`;
        mover.style.height = `${height}px`;
        mover.style.transform = `translate3d(${left.toFixed(2)}px, ${top.toFixed(2)}px, 0) rotate(${bState.bank.toFixed(2)}deg) scaleX(${bState.facing.toFixed(3)})`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [renderCanvasFrame]);

  return (
    <>
      <div
        ref={scrollTrackRef}
        className="relative h-[500vh] w-full bg-[#120d08] text-[#F5EFE6]"
      >
      {/* =====================================================================
          STICKY FULL-SCREEN VIEWPORT (PINNED DURING SCROLL)
         ===================================================================== */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#120d08]">
        {/* -------------------------------------------------------------------
            1. SCROLL-LINKED HTML5 CANVAS (FRAMES 001 -> 150)
           ------------------------------------------------------------------- */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0 block h-full w-full"
        />

        {/* -------------------------------------------------------------------
            2. SKIP BUTTON ON FIRST IMAGE FRAME
           ------------------------------------------------------------------- */}
        <div
          className={`absolute inset-x-0 bottom-8 sm:bottom-10 z-30 flex items-center justify-between px-6 sm:px-12 lg:px-16 transition-all duration-500 ${
            showSkipButton && !isHeroVisible
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {/* Subtle scroll prompt on first frame */}
          <div className="flex items-center gap-3 text-[#EAE0D0]/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            <span className="h-[1px] w-8 bg-[#D8B77E]/75" />
            <span className="font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.28em]">
              Scroll to Enter
            </span>
          </div>

          {/* Skip Button -> Jumps directly to Frame 150 & Hero Page */}
          <button
            type="button"
            onClick={handleSkipToHero}
            className="group inline-flex items-center gap-2.5 rounded-full border border-[#D8B77E]/75 bg-[#120d08]/70 px-5 py-2.5 sm:px-6 sm:py-2.5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-[#F0D7A7] hover:bg-[#22180E]/85 cursor-pointer"
          >
            <span className="font-sans text-[11.5px] sm:text-[12.5px] uppercase tracking-[0.22em] text-[#F5EFE6]">
              Skip
            </span>
            <svg
              viewBox="0 0 18 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3 text-[#DFC28C] transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path
                d="M1 6H16.5M16.5 6L11.5 1M16.5 6L11.5 11"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* -------------------------------------------------------------------
            3. BACKGROUNDLESS HERO PAGE (VISIBLE ONLY ON LAST FRAME ezgif-frame-150.png)
               The sticky canvas directly behind provides the ezgif-frame-150.png background
           ------------------------------------------------------------------- */}
        <div
          aria-hidden={!isHeroVisible}
          className={`relative z-20 h-screen w-full max-w-[100vw] overflow-x-hidden bg-transparent transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isHeroVisible
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Subtle warm dark radial vignette for crisp text contrast over the canvas frame */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(ellipse 44% 40% at 50% 50%, rgba(16, 10, 5, 0.42) 0%, rgba(16, 10, 5, 0.15) 62%, transparent 100%),
                linear-gradient(180deg, rgba(10, 6, 3, 0.48) 0%, rgba(10, 6, 3, 0.1) 15%, transparent 30%, transparent 78%, rgba(10, 6, 3, 0.6) 100%)
              `,
            }}
          />

          {/* Single Live Wing-Flapping Butterfly (tracks cursor with 1s delay) */}
          <div
            ref={butterflyMoverRef}
            className="pointer-events-none fixed top-0 left-0 z-50 will-change-transform"
          >
            <AnimatedButterflySVG
              nearWingRef={nearWingRef}
              farWingRef={farWingRef}
              bodyGroupRef={bodyGroupRef}
            />
          </div>

          {/* =================================================================
              MAIN HERO CONTAINER (EXACT HERO LAYOUT & UI)
             ================================================================= */}
          <div className="relative z-10 flex h-screen w-full flex-col justify-between overflow-hidden px-4 py-5 sm:px-8 sm:py-6 md:px-10 lg:px-14 lg:py-7">
            {/* TOP NAVIGATION BAR */}
            <header className="flex w-full items-center justify-between gap-2 sm:gap-4">
              {/* Left: Brand Lockup (DISHA - A special direction to your life) */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 xl:flex-initial">
                <BrandStarIcon className="w-5 h-6 sm:w-6 sm:h-7 shrink-0" />
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline gap-x-2.5 gap-y-0 leading-tight min-w-0">
                  <span className="font-serif text-[15px] sm:text-[18px] xl:text-[20px] font-normal uppercase tracking-[0.23em] text-[#F5EFE6]">
                    DISHA
                  </span>
                  <span className="font-script text-[14.5px] sm:text-[18px] xl:text-[20px] font-normal tracking-[0.02em] text-[#DFC28F] truncate sm:overflow-visible">
                    - A special direction to your life
                  </span>
                </div>
              </div>

              {/* Center: Navigation Links (Desktop) */}
              <nav
                aria-label="Primary Navigation"
                className="hidden xl:flex items-center gap-6 2xl:gap-8"
              >
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`group relative flex items-center gap-1 py-1.5 font-sans text-[14px] tracking-[0.03em] transition-colors ${
                      item.active
                        ? "text-[#E6C994]"
                        : "text-[#EFE7DA]/90 hover:text-[#E6C994]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className="w-3 h-3 text-[#D8B77E]/80 mt-0.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 4.5L6 8L9.5 4.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {/* Ornate Active Underline with Center Diamond Star */}
                    {item.active && (
                      <span className="pointer-events-none absolute -bottom-1 left-0 right-0 flex items-center justify-center">
                        <span className="h-[1px] flex-1 bg-[#D8B77E]/85" />
                        <FourPointStar className="w-2.5 h-2.5 text-[#E5C68E] -mx-0.5 shrink-0" />
                        <span className="h-[1px] flex-1 bg-[#D8B77E]/85" />
                      </span>
                    )}
                  </a>
                ))}
              </nav>

              {/* Right: "Let's Explore" Pill Button + Mobile Menu Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExploreWorlds}
                  className="group flex items-center gap-2 sm:gap-2.5 rounded-full border border-[#D8B77E]/65 bg-[#16100A]/55 px-3.5 py-1.5 sm:px-6 sm:py-2.5 backdrop-blur-sm transition-all hover:border-[#E8CFA0] hover:bg-[#241A10]/70 cursor-pointer"
                >
                  <FourPointStar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DFC28C] transition-transform duration-300 group-hover:rotate-45 shrink-0" />
                  <span className="font-sans text-[12px] sm:text-[14px] tracking-[0.03em] text-[#F5EFE6] whitespace-nowrap">
                    Let&apos;s Explore
                  </span>
                </button>

                {/* Mobile/Tablet Menu Toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label="Toggle navigation menu"
                  className="flex xl:hidden h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#D8B77E]/55 bg-[#16100A]/65 text-[#E6C994] backdrop-blur-sm transition-colors hover:border-[#E8CFA0] shrink-0 cursor-pointer"
                >
                  {mobileMenuOpen ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 7h16M4 12h16M4 17h12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </header>

            {/* Mobile / Tablet Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="xl:hidden mt-3 rounded-xl border border-[#D8B77E]/40 bg-[#140E08]/90 p-3.5 backdrop-blur-md shadow-2xl">
                <nav
                  aria-label="Mobile Navigation"
                  className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5"
                >
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`relative flex items-center gap-1 py-1 font-sans text-[13.5px] tracking-[0.04em] ${
                        item.active
                          ? "text-[#E6C994] font-medium"
                          : "text-[#EFE7DA]/85"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hasDropdown && <span className="text-xs">⌄</span>}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* CENTER HERO SECTION & MARGIN HANDWRITTEN ANNOTATIONS */}
            <main className="relative my-auto flex w-full flex-col items-center justify-center py-6 sm:py-10">
              {/* LEFT HANDWRITTEN MARGIN NOTE (Desktop Absolute) */}
              <aside className="hidden lg:flex flex-col items-start absolute left-[2%] xl:left-[3.5%] top-[20%] -rotate-[9deg] z-20">
                <div className="font-script text-[21px] xl:text-[24px] font-normal leading-[1.18] tracking-[0.01em] text-[#EFE4D2]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                  <div>same girl...</div>
                  <div>just a little</div>
                  <div>more curious</div>
                </div>
                <LeftHandDrawnArrow className="w-20 h-20 text-[#EFE3CE]/85 mt-1 ml-6" />
              </aside>

              {/* RIGHT HANDWRITTEN MARGIN NOTE (Desktop Absolute) */}
              <aside className="hidden lg:flex flex-col items-start absolute right-[0%] xl:right-[0.6%] top-[36%] -rotate-[6deg] z-20">
                <div className="font-script text-[18px] xl:text-[20.5px] font-normal leading-[1.22] tracking-[0.01em] text-[#EFE4D2]/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
                  <div>books,</div>
                  <div>ideas,</div>
                  <div>late night thoughts,</div>
                  <div>and everything</div>
                  <div>in between...</div>
                </div>
                <RightHandDrawnArrow className="w-20 h-20 text-[#EFE3CE]/85 mt-0.5 ml-6" />
              </aside>

              {/* CENTER EDITORIAL LOCKUP */}
              <div className="flex w-full max-w-4xl flex-col items-center text-center mx-auto px-2 sm:px-6">
                {/* Overline / Eyebrow */}
                <div className="flex w-full flex-col items-center font-sans text-[9.5px] sm:text-[11px] md:text-[12.5px] font-normal uppercase tracking-[0.24em] sm:tracking-[0.28em] leading-[1.9] text-[#EDE3D2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                  <p>A CURIOUS MIND</p>
                  <p>IN A BIG, BEAUTIFUL WORLD</p>
                </div>

                {/* Golden Ornamental Divider */}
                <div
                  className="my-2.5 sm:my-3.5 flex items-center justify-center gap-3"
                  aria-hidden="true"
                >
                  <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#D8B77E]/75 to-[#D8B77E]" />
                  <FourPointStar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DFC28C]" />
                  <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#D8B77E]/75 to-[#D8B77E]" />
                </div>

                {/* Oversized Serif Heading: "Ideas / Live Here." */}
                <h1 className="relative mt-0.5 flex w-full flex-col items-center font-display font-normal text-[#FAF6F0] tracking-[-0.02em] leading-[0.91] drop-shadow-[0_6px_28px_rgba(0,0,0,0.55)]">
                  {/* Line 1: Ideas + Home Perch Anchor for the Single Live Butterfly */}
                  <span className="relative inline-flex items-center">
                    <span className="text-[3.5rem] sm:text-[5.5rem] md:text-[6.8rem] lg:text-[8.1rem] xl:text-[8.7rem]">
                      Ideas
                    </span>
                    <span
                      ref={butterflyAnchorRef}
                      className="pointer-events-none absolute -right-12 -top-2 w-16 h-16 sm:-right-16 sm:-top-3 sm:w-24 sm:h-24 md:-right-20 md:-top-3 md:w-28 md:h-28 lg:-right-24 lg:-top-2 lg:w-32 lg:h-32"
                    >
                      <ButterflyHomeTrail
                        className="w-full h-full"
                        visible={isButterflyAtHome}
                      />
                    </span>
                  </span>

                  {/* Line 2: Live Here. (with 4-point golden star over the 'i' in Live) */}
                  <span className="mt-0.5 text-[3.5rem] sm:text-[5.5rem] md:text-[6.8rem] lg:text-[8.1rem] xl:text-[8.7rem] whitespace-nowrap">
                    L
                    <span className="relative inline-block -mx-[0.015em]">
                      ı
                      <FourPointStar className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[0.12em] w-[0.19em] h-[0.19em] text-[#E3C58E] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
                    </span>
                    ve Here.
                  </span>
                </h1>

                {/* Subtitle Paragraph */}
                <div className="mt-4 sm:mt-6 w-full max-w-[330px] sm:max-w-2xl px-1 font-serif text-[15.5px] sm:text-[19px] md:text-[21.5px] lg:text-[23px] font-normal leading-[1.42] tracking-[0.01em] text-[#F2EAE0] drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                  <p>A little bit of code, a little bit of music,</p>
                  <p>
                    a lot of questions, and a lifelong love for beautiful
                    things.
                  </p>
                </div>

                {/* Primary CTA Button: "EXPLORE MY WORLD ->" */}
                <div className="mt-6 sm:mt-8">
                  <button
                    type="button"
                    onClick={handleExploreWorlds}
                    className="group relative inline-flex items-center gap-3 sm:gap-3.5 border border-[#D8BA85]/80 bg-[#5C472B]/50 px-6 py-3 sm:px-9 sm:py-3.5 backdrop-blur-[2px] shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#F0D7A7] hover:bg-[#705735]/65 cursor-pointer"
                  >
                    <span className="font-sans text-[11px] sm:text-[12.5px] font-normal uppercase tracking-[0.22em] text-[#F5EFE6]">
                      EXPLORE MY WORLD
                    </span>
                    <svg
                      viewBox="0 0 20 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-3 text-[#E5C896] transition-transform duration-300 group-hover:translate-x-1 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 6H18.5M18.5 6L13.5 1M18.5 6L13.5 11"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* MOBILE / TABLET HANDWRITTEN NOTES */}
              <div className="mt-8 grid w-full max-w-[340px] sm:max-w-md grid-cols-2 gap-3 px-2 lg:hidden mx-auto">
                <div className="flex flex-col items-start -rotate-[5deg]">
                  <div className="font-script text-[16px] sm:text-[19px] leading-[1.18] text-[#EFE4D2]/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                    <div>same girl...</div>
                    <div>just a little</div>
                    <div>more curious</div>
                  </div>
                  <LeftHandDrawnArrow className="w-12 h-12 sm:w-16 sm:h-16 text-[#EFE3CE]/85 mt-0.5 ml-2" />
                </div>

                <div className="flex flex-col items-end -rotate-[4deg]">
                  <div className="font-script text-[15px] sm:text-[18px] leading-[1.18] text-left text-[#EFE4D2]/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                    <div>books,</div>
                    <div>ideas,</div>
                    <div>late night thoughts,</div>
                    <div>and everything</div>
                    <div>in between...</div>
                  </div>
                  <RightHandDrawnArrow className="w-12 h-12 sm:w-16 sm:h-16 text-[#EFE3CE]/85 mt-0.5 mr-3" />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      </div>

      {/* =====================================================================
          SECTIONS BELOW HERO: INFINITE DUAL CAROUSEL & BENTO WORLDS GRID
         ===================================================================== */}
      <BelowHeroSections />
    </>
  );
}
