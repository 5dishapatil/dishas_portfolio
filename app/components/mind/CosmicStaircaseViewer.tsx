"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Self-contained implementation of the Cosmic Staircase webpage for Mind & More.
 * Includes all data, scroll physics, Bezier step interpolation, starfield particle canvas,
 * glassmorphic staircase cards with dynamic shifting light reflections, embedded styles,
 * and direct navigation links to the 4 discipline webpages:
 *   - Systems -> /mind/systems
 *   - Brain & Biology -> /mind/brain-and-biology
 *   - Finance -> /mind/finance
 *   - Psychology -> /mind/psychology
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

export interface DisciplineStep {
  id: string;
  index: number; // 0 = Systems, 1 = Brain & Biology, 2 = Finance, 3 = Psychology
  cardTitle: string;
  stepNumeral: string;
  href: string;
  theme: {
    primaryGlow: string;
    secondaryGlow: string;
    orbCore: string;
    orbHalo: string;
    cardBgGradient: string;
    borderGradient: string;
    waveStrokePrimary: string;
    waveStrokeSecondary: string;
  };
}

export interface StepAnchor {
  slotIndex: number;
  xPercent: number;
  yPercent: number;
  scale: number;
  rotateZ: number;
  skewX: number;
  opacity: number;
  textOpacity: number;
  shadowIntensity: number;
  blurPx: number;
  zIndex: number;
}

export interface CardTransformState {
  cardIndex: number;
  continuousSlot: number;
  nearestSlot: number;
  isFrontCard: boolean;
  frontProximity: number;
  transitionProgress: number;
  xPercent: number;
  yPercent: number;
  scale: number;
  rotateZ: number;
  skewX: number;
  opacity: number;
  textOpacity: number;
  textTranslateY: number;
  shadowIntensity: number;
  sheenOffsetPercent: number;
  reflectionAngleDeg: number;
  reflectionIntensity: number;
  blurPx: number;
  zIndex: number;
}

export interface CosmicStaircaseProps {
  videoSrc?: string;
  backdropImageSrc?: string;
}

// ============================================================================
// 2. CARD DISCIPLINE DATA & THEMES
// ============================================================================

export const TOTAL_STEPS = 4;

export const DISCIPLINE_STEPS: DisciplineStep[] = [
  {
    id: 'systems',
    index: 0,
    cardTitle: 'Systems',
    stepNumeral: '01',
    href: '/mind/systems',
    theme: {
      primaryGlow: 'rgba(147, 51, 234, 0.48)',
      secondaryGlow: 'rgba(234, 179, 8, 0.35)',
      orbCore: '#f5d0fe',
      orbHalo: '#a855f7',
      cardBgGradient:
        'linear-gradient(135deg, rgba(28, 17, 54, 0.84) 0%, rgba(58, 28, 105, 0.76) 55%, rgba(76, 29, 149, 0.82) 100%)',
      borderGradient:
        'linear-gradient(135deg, rgba(216, 180, 254, 0.65) 0%, rgba(147, 51, 234, 0.45) 55%, rgba(250, 204, 21, 0.75) 100%)',
      waveStrokePrimary: '#c084fc',
      waveStrokeSecondary: '#facc15',
    },
  },
  {
    id: 'brain-biology',
    index: 1,
    cardTitle: 'Brain & Biology',
    stepNumeral: '02',
    href: '/mind/brain-and-biology',
    theme: {
      primaryGlow: 'rgba(56, 189, 248, 0.48)',
      secondaryGlow: 'rgba(59, 130, 246, 0.35)',
      orbCore: '#e0f2fe',
      orbHalo: '#38bdf8',
      cardBgGradient:
        'linear-gradient(135deg, rgba(12, 29, 48, 0.84) 0%, rgba(18, 53, 86, 0.76) 55%, rgba(29, 78, 137, 0.82) 100%)',
      borderGradient:
        'linear-gradient(135deg, rgba(186, 230, 253, 0.75) 0%, rgba(56, 189, 248, 0.5) 55%, rgba(251, 191, 36, 0.6) 100%)',
      waveStrokePrimary: '#38bdf8',
      waveStrokeSecondary: '#93c5fd',
    },
  },
  {
    id: 'finance',
    index: 2,
    cardTitle: 'Finance',
    stepNumeral: '03',
    href: '/mind/finance',
    theme: {
      primaryGlow: 'rgba(34, 197, 94, 0.46)',
      secondaryGlow: 'rgba(16, 185, 129, 0.32)',
      orbCore: '#dcfce7',
      orbHalo: '#4ade80',
      cardBgGradient:
        'linear-gradient(135deg, rgba(10, 34, 24, 0.84) 0%, rgba(16, 58, 38, 0.76) 55%, rgba(20, 83, 45, 0.82) 100%)',
      borderGradient:
        'linear-gradient(135deg, rgba(187, 247, 208, 0.72) 0%, rgba(74, 222, 128, 0.48) 55%, rgba(250, 204, 21, 0.55) 100%)',
      waveStrokePrimary: '#4ade80',
      waveStrokeSecondary: '#86efac',
    },
  },
  {
    id: 'psychology',
    index: 3,
    cardTitle: 'Psychology',
    stepNumeral: '04',
    href: '/mind/psychology',
    theme: {
      primaryGlow: 'rgba(245, 158, 11, 0.48)',
      secondaryGlow: 'rgba(217, 119, 6, 0.35)',
      orbCore: '#fef3c7',
      orbHalo: '#fbbf24',
      cardBgGradient:
        'linear-gradient(135deg, rgba(38, 24, 10, 0.84) 0%, rgba(66, 38, 13, 0.78) 55%, rgba(92, 52, 16, 0.82) 100%)',
      borderGradient:
        'linear-gradient(135deg, rgba(253, 230, 138, 0.78) 0%, rgba(245, 158, 11, 0.52) 55%, rgba(251, 191, 36, 0.7) 100%)',
      waveStrokePrimary: '#fbbf24',
      waveStrokeSecondary: '#fde68a',
    },
  },
];

// ============================================================================
// 3. STAIRCASE STEP ANCHORS & SCROLL INTERPOLATION PHYSICS
// ============================================================================

export const STEP_ANCHORS: readonly StepAnchor[] = [
  {
    slotIndex: 0,
    xPercent: 60.5,
    yPercent: 74.8,
    scale: 1.0,
    rotateZ: -4.2,
    skewX: -3.5,
    opacity: 1.0,
    textOpacity: 1.0,
    shadowIntensity: 1.0,
    blurPx: 0,
    zIndex: 40,
  },
  {
    slotIndex: 1,
    xPercent: 38.6,
    yPercent: 58.2,
    scale: 0.76,
    rotateZ: -2.0,
    skewX: -2.0,
    opacity: 0.94,
    textOpacity: 0.95,
    shadowIntensity: 0.75,
    blurPx: 0,
    zIndex: 30,
  },
  {
    slotIndex: 2,
    xPercent: 26.8,
    yPercent: 47.7,
    scale: 0.57,
    rotateZ: -0.8,
    skewX: -0.8,
    opacity: 0.88,
    textOpacity: 0.9,
    shadowIntensity: 0.52,
    blurPx: 0.15,
    zIndex: 20,
  },
  {
    slotIndex: 3,
    xPercent: 18.5,
    yPercent: 41.5,
    scale: 0.42,
    rotateZ: 0.0,
    skewX: 0.0,
    opacity: 0.82,
    textOpacity: 0.84,
    shadowIntensity: 0.35,
    blurPx: 0.25,
    zIndex: 12,
  },
];

export function wrapModulo(value: number, modulus: number = TOTAL_STEPS): number {
  return ((value % modulus) + modulus) % modulus;
}

export function shortestSignedDistance(
  current: number,
  target: number,
  modulus: number = TOTAL_STEPS
): number {
  const diff = wrapModulo(target - current, modulus);
  return diff > modulus / 2 ? diff - modulus : diff;
}

export function softStepEase(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  const smooth = clamped * clamped * (3 - 2 * clamped);
  return clamped * 0.5 + smooth * 0.5;
}

function quadBezier(p0: number, p1: number, p2: number, t: number): number {
  const inv = 1 - t;
  return inv * inv * p0 + 2 * inv * t * p1 + t * t * p2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getCardTransformState(
  cardIndex: number,
  scrollProgress: number
): CardTransformState {
  const continuousSlot = wrapModulo(cardIndex - scrollProgress, TOTAL_STEPS);
  const distFromFront = Math.abs(shortestSignedDistance(continuousSlot, 0, TOTAL_STEPS));
  const frontProximity = Math.max(0, 1 - distFromFront);
  const nearestSlot = wrapModulo(Math.round(continuousSlot), TOTAL_STEPS);
  const isFrontCard = nearestSlot === 0 && distFromFront <= 0.5;

  // Advancing forward down the staircase (Slot 3 -> 2 -> 1 -> 0)
  if (continuousSlot <= 3.0001) {
    const clampedSlot = Math.max(0, Math.min(3, continuousSlot));
    const lowerIndex = Math.min(2, Math.floor(clampedSlot));
    const upperIndex = lowerIndex + 1;
    const rawAdvanceT = upperIndex - clampedSlot;
    const t = softStepEase(rawAdvanceT);
    const sinWave = Math.sin(rawAdvanceT * Math.PI);

    const fromAnchor = STEP_ANCHORS[upperIndex];
    const toAnchor = STEP_ANCHORS[lowerIndex];

    const midX = (fromAnchor.xPercent + toAnchor.xPercent) * 0.5 - 1.2;
    const midY = (fromAnchor.yPercent + toAnchor.yPercent) * 0.5 + 1.5;

    const baseScale = lerp(fromAnchor.scale, toAnchor.scale, t);
    const kineticScale = baseScale * (1 + 0.035 * sinWave);
    const baseTextOpacity = lerp(fromAnchor.textOpacity, toAnchor.textOpacity, t);
    const textFadeDip = baseTextOpacity * (1 - 0.42 * sinWave);
    const textDriftY = (0.5 - rawAdvanceT) * 5 * sinWave;

    const normalizedStepDepth = 1 - clampedSlot / 3;
    const sheenOffsetPercent = Number((-35 + normalizedStepDepth * 100 + sinWave * 28).toFixed(2));
    const reflectionAngleDeg = Number((108 + normalizedStepDepth * 18 + sinWave * 8).toFixed(2));
    const reflectionIntensity = Number(
      Math.min(1, 0.32 + normalizedStepDepth * 0.46 + sinWave * 0.22).toFixed(4)
    );

    return {
      cardIndex,
      continuousSlot,
      nearestSlot,
      isFrontCard,
      frontProximity,
      transitionProgress: Number(sinWave.toFixed(4)),
      xPercent: quadBezier(fromAnchor.xPercent, midX, toAnchor.xPercent, t),
      yPercent: quadBezier(fromAnchor.yPercent, midY, toAnchor.yPercent, t),
      scale: kineticScale,
      rotateZ: lerp(fromAnchor.rotateZ, toAnchor.rotateZ, t),
      skewX: lerp(fromAnchor.skewX, toAnchor.skewX, t),
      opacity: lerp(fromAnchor.opacity, toAnchor.opacity, t) * (1 - 0.08 * sinWave),
      textOpacity: Number(textFadeDip.toFixed(4)),
      textTranslateY: Number(textDriftY.toFixed(2)),
      shadowIntensity:
        lerp(fromAnchor.shadowIntensity, toAnchor.shadowIntensity, t) * (1 + 0.25 * sinWave),
      sheenOffsetPercent,
      reflectionAngleDeg,
      reflectionIntensity,
      blurPx: lerp(fromAnchor.blurPx, toAnchor.blurPx, t) + 0.35 * sinWave,
      zIndex: Math.round(lerp(fromAnchor.zIndex, toAnchor.zIndex, t)),
    };
  }

  // Cycling from Slot 0 (Front) back to Slot 3 (Back of staircase)
  const rawReturnT = 4 - continuousSlot;
  const t = softStepEase(rawReturnT);
  const frontAnchor = STEP_ANCHORS[0];
  const backAnchor = STEP_ANCHORS[3];

  const arcControlX = 19.5;
  const arcControlY = 63.0;
  const sinArc = Math.sin(rawReturnT * Math.PI);

  const sheenOffsetPercent = Number((65 - t * 100 - sinArc * 20).toFixed(2));
  const reflectionAngleDeg = Number((126 - t * 18).toFixed(2));
  const reflectionIntensity = Number((lerp(0.78, 0.32, t) * (1 - 0.35 * sinArc)).toFixed(4));

  return {
    cardIndex,
    continuousSlot,
    nearestSlot,
    isFrontCard,
    frontProximity,
    transitionProgress: Number(sinArc.toFixed(4)),
    xPercent: quadBezier(frontAnchor.xPercent, arcControlX, backAnchor.xPercent, t),
    yPercent: quadBezier(frontAnchor.yPercent, arcControlY, backAnchor.yPercent, t),
    scale: lerp(frontAnchor.scale, backAnchor.scale, t) * (1 - 0.1 * sinArc),
    rotateZ: lerp(frontAnchor.rotateZ, backAnchor.rotateZ, t),
    skewX: lerp(frontAnchor.skewX, backAnchor.skewX, t),
    opacity: lerp(frontAnchor.opacity, backAnchor.opacity, t) * (1 - 0.45 * sinArc),
    textOpacity: Number(
      (lerp(frontAnchor.textOpacity, backAnchor.textOpacity, t) * (1 - 0.78 * sinArc)).toFixed(4)
    ),
    textTranslateY: Number((Math.cos(rawReturnT * Math.PI) * 6 * sinArc).toFixed(2)),
    shadowIntensity:
      lerp(frontAnchor.shadowIntensity, backAnchor.shadowIntensity, t) * (1 - 0.4 * sinArc),
    sheenOffsetPercent,
    reflectionAngleDeg,
    reflectionIntensity,
    blurPx: lerp(frontAnchor.blurPx, backAnchor.blurPx, t) + 2.4 * sinArc,
    zIndex: 6,
  };
}

export function stepDampedSpring(
  current: number,
  velocity: number,
  target: number,
  dtSeconds: number,
  stiffness: number = 110,
  damping: number = 21
): { value: number; velocity: number } {
  const safeDt = Math.min(0.05, Math.max(0.001, dtSeconds));
  const force = (target - current) * stiffness;
  const nextVelocity = (velocity + force * safeDt) * Math.exp(-damping * safeDt);
  const nextValue = current + nextVelocity * safeDt;

  if (Math.abs(target - nextValue) < 0.0002 && Math.abs(nextVelocity) < 0.001) {
    return { value: target, velocity: 0 };
  }
  return { value: nextValue, velocity: nextVelocity };
}

// ============================================================================
// 4. SUBTLE TWINKLING COSMIC STARFIELD CANVAS
// ============================================================================

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  driftX: number;
  driftY: number;
  tint: string;
}

const StarfieldCanvas: React.FC<{ scrollVelocity?: number }> = ({ scrollVelocity = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const velocityRef = useRef<number>(scrollVelocity);
  velocityRef.current = scrollVelocity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let seed = 4219;
    const nextRand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const starTints = ['255, 255, 255', '245, 243, 255', '224, 242, 254', '254, 243, 199'];

    const stars: StarParticle[] = Array.from({ length: 135 }, () => ({
      x: nextRand(),
      y: Math.pow(nextRand(), 1.35) * 0.88,
      radius: 0.45 + nextRand() * 1.15,
      baseAlpha: 0.14 + nextRand() * 0.46,
      twinkleSpeed: 0.6 + nextRand() * 1.8,
      twinklePhase: nextRand() * Math.PI * 2,
      driftX: (nextRand() - 0.5) * 0.000018,
      driftY: (nextRand() - 0.5) * 0.000015,
      tint: starTints[Math.floor(nextRand() * starTints.length)],
    }));

    const render = (nowMs: number) => {
      const t = nowMs * 0.001;
      ctx.clearRect(0, 0, width, height);
      const subtleScrollShift = Math.max(-1, Math.min(1, velocityRef.current * 0.08));

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x = (s.x + s.driftX + 1) % 1;
        s.y = (s.y + s.driftY - subtleScrollShift * 0.00015 + 1) % 1;

        const px = s.x * width;
        const py = s.y * height;
        const verticalMask =
          py < height * 0.65 ? 1 : Math.max(0, 1 - (py - height * 0.65) / (height * 0.3));
        const twinkle = 0.65 + 0.35 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseAlpha * twinkle * verticalMask;

        if (alpha <= 0.02) continue;

        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.tint}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="starfield-canvas"
      className="pointer-events-none fixed inset-0 z-0 w-full h-full"
    />
  );
};

// ============================================================================
// 5. GLASSMORPHIC STAIRCASE CARD WITH DYNAMIC LIGHT REFLECTION & ROUTE LINK
// ============================================================================

interface StaircaseCardProps {
  step: DisciplineStep;
  transformState: CardTransformState;
}

const StaircaseCard: React.FC<StaircaseCardProps> = ({ step, transformState }) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    xPercent,
    yPercent,
    scale,
    rotateZ,
    skewX,
    opacity,
    textOpacity,
    textTranslateY,
    shadowIntensity,
    sheenOffsetPercent,
    reflectionAngleDeg,
    reflectionIntensity,
    blurPx,
    zIndex,
    isFrontCard,
    frontProximity,
    transitionProgress,
    nearestSlot,
  } = transformState;

  const interactiveScale = scale * (isHovered ? 1.055 : 1);
  const activeGlowMultiplier =
    0.45 + frontProximity * 0.55 + transitionProgress * 0.25 + (isHovered ? 0.25 : 0);

  const dropShadowBlur = Math.round(18 + shadowIntensity * 22 + transitionProgress * 12);
  const dropShadowY = Math.round(6 + shadowIntensity * 10);

  return (
    <Link
      href={step.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`staircase-card-${step.id}`}
      data-slot={nearestSlot}
      data-front={isFrontCard ? 'true' : 'false'}
      aria-label={`Open ${step.cardTitle} webpage (step ${nearestSlot + 1})`}
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        zIndex,
        opacity,
        filter: blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : 'none',
        transform: `translate3d(-50%, -50%, 0) scale(${interactiveScale.toFixed(
          4
        )}) rotateZ(${rotateZ.toFixed(2)}deg) skewX(${skewX.toFixed(2)}deg)`,
      }}
      className="group absolute w-[118px] h-[42px] sm:w-[132px] sm:h-[46px] rounded-[7px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 will-change-transform select-none text-left block"
    >
      {/* Dynamic ambient step shadow & glow */}
      <div
        aria-hidden="true"
        style={{
          background: `radial-gradient(65% 75% at 50% 62%, ${step.theme.primaryGlow}, ${step.theme.secondaryGlow} 58%, transparent 100%)`,
          opacity: Math.min(1, activeGlowMultiplier),
          transform: `scale(${1 + transitionProgress * 0.14})`,
        }}
        className="pointer-events-none absolute -inset-2 rounded-[12px] blur-md transition-opacity duration-200"
      />

      {/* 1px luminous rim border */}
      <div
        aria-hidden="true"
        style={{
          background: step.theme.borderGradient,
          boxShadow: `0 ${dropShadowY}px ${dropShadowBlur}px -4px rgba(0, 0, 0, 0.88), 0 0 ${Math.round(
            12 * shadowIntensity
          )}px ${step.theme.primaryGlow}`,
        }}
        className="pointer-events-none absolute inset-0 rounded-[7px] p-[1px]"
      >
        {/* Main dark tinted glassmorphic body */}
        <div
          style={{
            background: step.theme.cardBgGradient,
            boxShadow: `inset 0 1px 8px rgba(255, 255, 255, ${
              0.12 + transitionProgress * 0.14
            }), inset 0 -6px 16px ${step.theme.primaryGlow}`,
          }}
          className="relative w-full h-full rounded-[6px] backdrop-blur-md overflow-hidden"
        >
          {/* Base glass specular sheen */}
          <div
            aria-hidden="true"
            style={{
              opacity: 0.72 + transitionProgress * 0.25 + (isHovered ? 0.25 : 0),
            }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30 transition-opacity duration-200"
          />

          {/* Dynamic Shifting Light Reflection Sweep across the glass as the card moves through the steps */}
          <div
            aria-hidden="true"
            data-testid={`card-light-reflection-${step.id}`}
            style={{
              opacity: Math.min(1, reflectionIntensity + (isHovered ? 0.18 : 0)),
              transform: `translate3d(${sheenOffsetPercent}%, 0, 0) skewX(-22deg)`,
              background: `linear-gradient(${reflectionAngleDeg}deg, transparent 0%, rgba(255, 255, 255, 0.03) 30%, rgba(255, 255, 255, 0.28) 48%, ${step.theme.orbCore} 51%, rgba(255, 255, 255, 0.05) 68%, transparent 100%)`,
            }}
            className="pointer-events-none absolute -inset-y-2 -left-1/2 w-[140%] mix-blend-screen will-change-transform"
          />

          {/* Top-edge prismatic refraction line that shifts with step position */}
          <div
            aria-hidden="true"
            style={{
              opacity: 0.35 + frontProximity * 0.5 + transitionProgress * 0.15,
              background: `linear-gradient(90deg, transparent 5%, ${step.theme.orbCore} ${Math.max(
                18,
                Math.min(82, 40 + sheenOffsetPercent * 0.35)
              )}%, transparent 95%)`,
            }}
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          />

          {/* Glowing Star / Luminous Point Flare on the left side */}
          <div
            aria-hidden="true"
            style={{
              transform: `translate(-50%, -50%) scale(${
                1 + transitionProgress * 0.22 + (isHovered ? 0.15 : 0)
              })`,
            }}
            className="pointer-events-none absolute left-[14.5%] top-[44%] w-5 h-5 flex items-center justify-center animate-star-subtle"
          >
            <div
              style={{
                background: `radial-gradient(circle, ${step.theme.orbCore} 0%, ${step.theme.orbHalo} 42%, transparent 72%)`,
              }}
              className="absolute inset-0 rounded-full blur-[3px] opacity-95"
            />
            <div
              style={{ backgroundColor: step.theme.orbCore }}
              className="absolute w-3.5 h-[1px] opacity-85 blur-[0.2px] rotate-12"
            />
            <div
              style={{ backgroundColor: step.theme.orbCore }}
              className="absolute w-[1px] h-3.5 opacity-85 blur-[0.2px] rotate-12"
            />
            <div
              style={{
                backgroundColor: '#ffffff',
                boxShadow: `0 0 6px 1.2px ${step.theme.orbCore}, 0 0 11px 2.5px ${step.theme.orbHalo}`,
              }}
              className="relative w-1.5 h-1.5 rounded-full"
            />
          </div>

          {/* Twin Intertwining Luminous Sine-Wave Ribbons */}
          <svg
            aria-hidden="true"
            viewBox="0 0 240 44"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-[54%] overflow-visible"
          >
            <defs>
              <filter id={`wave-glow-${step.id}`} x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="2.0" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id={`wave-grad-1-${step.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={step.theme.waveStrokeSecondary} stopOpacity="0.4" />
                <stop offset="35%" stopColor={step.theme.waveStrokePrimary} stopOpacity="0.95" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.88" />
                <stop offset="100%" stopColor={step.theme.waveStrokePrimary} stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id={`wave-grad-2-${step.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={step.theme.waveStrokePrimary} stopOpacity="0.25" />
                <stop offset="45%" stopColor={step.theme.waveStrokeSecondary} stopOpacity="0.8" />
                <stop offset="85%" stopColor={step.theme.waveStrokePrimary} stopOpacity="0.9" />
                <stop offset="100%" stopColor={step.theme.waveStrokeSecondary} stopOpacity="0.35" />
              </linearGradient>
            </defs>

            <path
              d="M -10 38 C 35 18, 82 44, 138 28 C 178 15, 212 36, 250 18"
              fill="none"
              stroke={`url(#wave-grad-2-${step.id})`}
              strokeWidth="1.25"
              filter={`url(#wave-glow-${step.id})`}
              className="animate-wave-slow"
            />
            <path
              d="M -10 34 C 28 42, 74 14, 126 34 C 168 46, 198 10, 250 28"
              fill="none"
              stroke={`url(#wave-grad-1-${step.id})`}
              strokeWidth="1.65"
              filter={`url(#wave-glow-${step.id})`}
            />
          </svg>

          {/* Classical Editorial Serif Card Title */}
          <div className="relative z-10 w-full h-full flex items-center justify-center pl-[14%] pr-2">
            <span
              style={{
                opacity: textOpacity,
                transform: `translate3d(0, ${textTranslateY}px, 0)`,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 12px rgba(255, 255, 255, 0.22)',
              }}
              className="font-editorial text-[13px] sm:text-[14px] font-medium tracking-[0.01em] text-white whitespace-nowrap leading-none will-change-transform"
            >
              {step.cardTitle}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================================================
// 6. MAIN SELF-CONTAINED PAGE COMPONENT
// ============================================================================

export default function CosmicStaircaseViewer({
  videoSrc = '/assets/riverflow.mp4',
  backdropImageSrc = '/assets/backgroundriver.png',
}: CosmicStaircaseProps) {
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [scrollVelocity, setScrollVelocity] = useState<number>(0);

  const currentProgressRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const gestureStartStepRef = useRef<number>(0);
  const gestureAccumDeltaYRef = useRef<number>(0);
  const lastWheelTimeRef = useRef<number>(0);
  const snapTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleStepDelta = useCallback((deltaSteps: number) => {
    const baseStep = Math.round(targetProgressRef.current);
    targetProgressRef.current = baseStep + deltaSteps;
    gestureStartStepRef.current = targetProgressRef.current;
    gestureAccumDeltaYRef.current = 0;
  }, []);

  // Critically damped 60/120Hz spring loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      const { value, velocity } = stepDampedSpring(
        currentProgressRef.current,
        velocityRef.current,
        targetProgressRef.current,
        dt,
        105,
        20
      );

      if (Math.abs(value - currentProgressRef.current) > 0.0001 || Math.abs(velocity) > 0.0005) {
        currentProgressRef.current = value;
        velocityRef.current = velocity;
        setScrollProgress(value);
        setScrollVelocity(velocity);
      } else if (velocityRef.current !== 0) {
        velocityRef.current = 0;
        setScrollVelocity(0);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Ensure foreground video loops seamlessly
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  // Wheel & trackpad scroll handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = performance.now();
      const timeSinceLastWheel = now - lastWheelTimeRef.current;
      lastWheelTimeRef.current = now;

      if (timeSinceLastWheel > 220) {
        gestureStartStepRef.current = Math.round(targetProgressRef.current);
        gestureAccumDeltaYRef.current = 0;
      }

      const rawDelta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      gestureAccumDeltaYRef.current += rawDelta;

      const stepOffset = gestureAccumDeltaYRef.current / 360;
      targetProgressRef.current = gestureStartStepRef.current + stepOffset;

      if (snapTimerRef.current !== null) {
        window.clearTimeout(snapTimerRef.current);
      }

      snapTimerRef.current = window.setTimeout(() => {
        const totalDelta = gestureAccumDeltaYRef.current;
        if (Math.abs(totalDelta) >= 18 && Math.abs(totalDelta) < 180) {
          targetProgressRef.current =
            gestureStartStepRef.current + Math.sign(totalDelta);
        } else {
          targetProgressRef.current = Math.round(targetProgressRef.current);
        }
        gestureStartStepRef.current = targetProgressRef.current;
        gestureAccumDeltaYRef.current = 0;
      }, 130);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (snapTimerRef.current !== null) {
        window.clearTimeout(snapTimerRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleStepDelta(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handleStepDelta(-1);
      } else if (e.key === 'Enter') {
        const frontIndex = wrapModulo(Math.round(targetProgressRef.current), TOTAL_STEPS);
        const targetStep = DISCIPLINE_STEPS[frontIndex];
        if (targetStep?.href) {
          router.push(targetStep.href);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepDelta, router]);

  // Touch swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    touchStartYRef.current = e.touches[0].clientY;
    gestureStartStepRef.current = Math.round(targetProgressRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null || e.touches.length === 0) return;
    const deltaY = touchStartYRef.current - e.touches[0].clientY;
    targetProgressRef.current = gestureStartStepRef.current + deltaY / 220;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const deltaY = touchStartYRef.current - endY;
    touchStartYRef.current = null;

    if (Math.abs(deltaY) > 28) {
      targetProgressRef.current =
        gestureStartStepRef.current +
        Math.sign(deltaY) * Math.max(1, Math.round(Math.abs(deltaY) / 220));
    } else {
      targetProgressRef.current = Math.round(targetProgressRef.current);
    }
  };

  const activeStepIndex = wrapModulo(Math.round(scrollProgress), TOTAL_STEPS);

  return (
    <main
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="staircase-viewport"
      data-step-index={activeStepIndex}
      className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Embedded Font & Keyframe Definitions for Portable Single-File Integration */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        .font-editorial {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        @keyframes waveFlowSlow {
          0% { transform: translateX(0px) scaleY(1); }
          50% { transform: translateX(-8px) scaleY(1.08); }
          100% { transform: translateX(0px) scaleY(1); }
        }
        @keyframes starPulseSubtle {
          0%, 100% { transform: scale(1); opacity: 0.92; }
          50% { transform: scale(1.14); opacity: 1; }
        }
        .animate-wave-slow {
          animation: waveFlowSlow 5.5s ease-in-out infinite;
        }
        .animate-star-subtle {
          animation: starPulseSubtle 3.6s ease-in-out infinite;
        }
      `}</style>

      {/* Top-Left Navigation: Go back to my worlds */}
      <header className="fixed top-5 left-5 sm:top-7 sm:left-8 z-50">
        <Link
          href="/#worlds"
          aria-label="Go back to my worlds"
          className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono tracking-[0.2em] uppercase bg-[#0c101d]/75 hover:bg-[#161d33]/90 border border-white/15 hover:border-purple-300/50 text-[#EAE0D0] hover:text-white backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.03]"
        >
          <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span className="font-medium">Go back to my worlds</span>
        </Link>
      </header>

      {/* Full-Viewport 16:9 Cosmic Widescreen Stage */}
      <div
        data-testid="widescreen-cosmic-stage"
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        <div
          style={{ aspectRatio: '1672 / 941' }}
          className="relative min-w-full min-h-full w-auto h-auto max-w-none flex items-center justify-center"
        >
          {/* Base Layer: 16:9 High-Resolution Cosmic Staircase Outpaint */}
          <img
            src={backdropImageSrc}
            alt="Cosmic river staircase across starry space"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
          />

          {/* Subtle Animated Twinkling Starfield Layer */}
          <StarfieldCanvas scrollVelocity={scrollVelocity} />

          {/* Sub-Pixel Registered 9:16 Foreground Video Stage */}
          <div
            data-testid="video-staircase-stage"
            style={{
              left: '33.58%',
              top: '-3.15%',
              width: '35.25%',
              height: '110.2%',
            }}
            className="absolute z-10 pointer-events-auto"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              aria-label="Cosmic river staircase flowing through starlight"
              style={{
                WebkitMaskImage:
                  'radial-gradient(circle at 88% 89%, transparent 0%, transparent 5.5%, black 11%), linear-gradient(54deg, transparent 0%, transparent 18.5%, black 26.5%), linear-gradient(90deg, transparent 0%, black 6.5%, black 97.5%, transparent 100%), linear-gradient(180deg, transparent 0%, black 5%, black 96%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
                maskImage:
                  'radial-gradient(circle at 88% 89%, transparent 0%, transparent 5.5%, black 11%), linear-gradient(54deg, transparent 0%, transparent 18.5%, black 26.5%), linear-gradient(90deg, transparent 0%, black 6.5%, black 97.5%, transparent 100%), linear-gradient(180deg, transparent 0%, black 5%, black 96%, transparent 100%)',
                maskComposite: 'intersect',
              }}
              className="w-full h-full object-fill pointer-events-none select-none"
            />

            {/* 4 Compact Interactive Glassmorphic Cards on the Staircase Steps */}
            <div className="absolute inset-0 z-20">
              {DISCIPLINE_STEPS.map((step) => {
                const transformState = getCardTransformState(step.index, scrollProgress);
                return (
                  <StaircaseCard
                    key={step.id}
                    step={step}
                    transformState={transformState}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
