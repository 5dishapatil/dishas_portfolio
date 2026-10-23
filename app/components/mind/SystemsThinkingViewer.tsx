"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Systems Thinking — Self-Contained Single-File 3D Immersion Zen Mode Experience
 *
 * Dependencies required in host project:
 *   three @types/three framer-motion lucide-react
 *   (plus Tailwind CSS configured in your project)
 *
 * Everything else — Google Fonts ('Fraunces', 'Quicksand', 'Outfit', 'Caveat'),
 * custom CSS utilities (.font-display, .font-sans, .font-script, .digital-grid-bg, .scanlines-overlay),
 * timeline kinematics, 3D cubic facet typography math, audio-reactive CSS bloom metrics,
 * bioluminescent glow wake particle physics, faint cursor trail physics, Web Audio synth,
 * custom GLSL shaders, procedural 3D jellyfish geometry, and glassmorphic modals —
 * is 100% self-contained in this single file.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

// ============================================================================
// 1. EMBEDDED FONTS & SELF-CONTAINED CSS UTILITIES
// ============================================================================

const EMBEDDED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&family=Quicksand:wght@400;500;600;700&display=swap');

  .st-zen-root {
    font-family: 'Quicksand', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .font-display {
    font-family: 'Fraunces', Georgia, serif;
    font-variation-settings: "SOFT" 100, "WONK" 1;
  }

  .font-condensed {
    font-family: 'Outfit', 'Quicksand', sans-serif;
  }

  .font-script {
    font-family: 'Caveat', cursive;
  }

  .font-tech {
    font-family: 'Quicksand', 'Outfit', sans-serif;
  }

  .font-sans {
    font-family: 'Quicksand', 'Outfit', sans-serif;
  }

  .digital-grid-bg {
    background-image: radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
    background-size: 8px 8px;
  }

  .scanlines-overlay {
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%,
      rgba(0, 0, 0, 0.03) 50%
    );
    background-size: 100% 4px;
  }

  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

// ============================================================================
// 2. TIMELINE, CUBIC TYPOGRAPHY, BLOOM & PARTICLE TRAIL LOGIC
// ============================================================================

export interface ChapterInfo {
  index: number;
  id: string;
  name: string;
  headline: string;
  subtitle: string;
  icon: 'lightning' | 'vr' | 'sparkle';
  startProgress: number;
  endProgress: number;
}

export const CHAPTERS: ChapterInfo[] = [
  {
    index: 1,
    id: '01',
    name: 'Systems Thinking',
    headline: 'Systems Thinking',
    subtitle: 'Exploring interconnected patterns, living feedback loops, and emergent harmony',
    icon: 'lightning',
    startProgress: 0.0,
    endProgress: 0.22,
  },
  {
    index: 2,
    id: '02',
    name: 'Holistic Dynamics',
    headline: 'See the Whole, Feedback Loops, Emergence and Synergy',
    subtitle: 'Follow the living network as isolated elements weave into self-organizing wholes',
    icon: 'vr',
    startProgress: 0.22,
    endProgress: 0.72,
  },
  {
    index: 3,
    id: '03',
    name: 'Leverage & Emergence',
    headline: 'Living Systems',
    subtitle: 'Shifting from linear cause-and-effect to gentle, interconnected mental models',
    icon: 'sparkle',
    startProgress: 0.72,
    endProgress: 1.0,
  },
];

export function getActiveChapter(progress: number): ChapterInfo {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped < 0.22) return CHAPTERS[0];
  if (clamped < 0.72) return CHAPTERS[1];
  return CHAPTERS[2];
}

export interface CubicWordState {
  word: string;
  centerProgress: number;
  rotateY: number;
  translateZ: number;
  translateXPercent: number;
  opacity: number;
  scale: number;
  isVisible: boolean;
}

export const CUBIC_WORDS = [
  { word: 'See the Whole,', center: 0.27 },
  { word: 'Feedback Loops', center: 0.40 },
  { word: 'Emergence', center: 0.53 },
  { word: 'and Synergy', center: 0.66 },
];

export function calculateCubicWordTransform(centerProgress: number, progress: number): CubicWordState {
  const diff = progress - centerProgress;
  const span = 0.14;
  const rel = diff / span;

  const isVisible = Math.abs(rel) <= 1.4;
  const clampedRel = Math.max(-1.5, Math.min(1.5, rel));

  const cubicAngle = clampedRel === 0 ? 0 : clampedRel * 48;
  const translateZ = clampedRel === 0 ? 0 : -Math.abs(clampedRel) * 220;
  const translateXPercent = clampedRel === 0 ? 0 : clampedRel * -90;
  const opacity = Math.max(0, 1 - Math.pow(Math.abs(clampedRel) / 1.15, 2));
  const scale = Math.max(0.7, 1 - Math.abs(clampedRel) * 0.2);

  return {
    word: '',
    centerProgress,
    rotateY: cubicAngle,
    translateZ,
    translateXPercent,
    opacity,
    scale,
    isVisible,
  };
}

export function calculateJellyfishScale(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped <= 0.65) {
    return 1.0;
  }
  const t = (clamped - 0.65) / (1.0 - 0.65);
  return 1.0 + t * 0.16;
}

export interface JellyfishRotation3D {
  rotY: number;
  rotX: number;
  rotZ: number;
}

export function calculateJellyfishRotation3D(
  progress: number,
  pointerX = 0,
  pointerY = 0,
  userYawOffset = 0,
  userPitchOffset = 0
): JellyfishRotation3D {
  const clamped = Math.max(0, Math.min(1, progress));
  const baseRotY = (clamped - 0.15) * Math.PI * 1.85;
  const baseRotX = -0.18 + Math.sin(clamped * Math.PI) * 0.28;
  const baseRotZ = -0.14 + Math.cos(clamped * Math.PI * 1.5) * 0.16;

  return {
    rotY: baseRotY + pointerX * 0.35 + userYawOffset,
    rotX: baseRotX + pointerY * 0.25 + userPitchOffset,
    rotZ: baseRotZ - pointerX * 0.12,
  };
}

export function dampValue(current: number, target: number, lambda: number, deltaSeconds: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaSeconds));
}

export function getAudioHarmonics(progress: number): { baseFreq: number; filterFreq: number; resonance: number } {
  const baseFreq = 55 + progress * 20;
  const filterFreq = 300 + Math.sin(progress * Math.PI) * 450;
  const resonance = 4 + progress * 3;
  return { baseFreq, filterFreq, resonance };
}

export interface AudioBloomMetrics {
  bassEnergy: number;
  midEnergy: number;
  highEnergy: number;
  overallIntensity: number;
  cssFilter: string;
}

export function calculateAudioBloomMetrics(
  frequencyData: ArrayLike<number> | null | undefined,
  timeSeconds: number,
  isMuted: boolean
): AudioBloomMetrics {
  let bass = 0;
  let mid = 0;
  let high = 0;

  if (!isMuted && frequencyData && frequencyData.length >= 16) {
    const len = frequencyData.length;
    const bassEnd = Math.max(1, Math.floor(len * 0.15));
    const midEnd = Math.max(bassEnd + 1, Math.floor(len * 0.5));

    let bassSum = 0;
    for (let i = 0; i < bassEnd; i++) {
      bassSum += frequencyData[i] || 0;
    }
    bass = Math.min(1, bassSum / (bassEnd * 255));

    let midSum = 0;
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += frequencyData[i] || 0;
    }
    mid = Math.min(1, midSum / ((midEnd - bassEnd) * 255));

    let highSum = 0;
    for (let i = midEnd; i < len; i++) {
      highSum += frequencyData[i] || 0;
    }
    high = Math.min(1, highSum / ((len - midEnd) * 255));
  }

  const synthPulse = 0.5 + 0.5 * Math.sin(timeSeconds * 2.6) * Math.cos(timeSeconds * 1.1);
  const effectiveBass = isMuted ? synthPulse * 0.45 : Math.max(synthPulse * 0.35, bass);
  const effectiveMid = isMuted ? (0.5 + 0.5 * Math.sin(timeSeconds * 3.8 + 1.0)) * 0.4 : Math.max(0.25, mid);
  const effectiveHigh = isMuted ? (0.5 + 0.5 * Math.cos(timeSeconds * 5.2)) * 0.35 : Math.max(0.2, high);

  const overallIntensity = Math.min(
    1,
    effectiveBass * 0.5 + effectiveMid * 0.35 + effectiveHigh * 0.15
  );

  const cyanRadius = Math.round(14 + overallIntensity * 32);
  const magentaRadius = Math.round(24 + effectiveBass * 48);
  const coralRadius = Math.round(10 + effectiveMid * 26);
  const cyanAlpha = (0.32 + overallIntensity * 0.48).toFixed(2);
  const magentaAlpha = (0.28 + effectiveBass * 0.52).toFixed(2);
  const coralAlpha = (0.18 + effectiveMid * 0.38).toFixed(2);
  const brightness = (1.03 + overallIntensity * 0.22).toFixed(2);
  const saturate = (1.08 + overallIntensity * 0.35).toFixed(2);

  const cssFilter = [
    `drop-shadow(0 0 ${cyanRadius}px rgba(56, 189, 248, ${cyanAlpha}))`,
    `drop-shadow(0 4px ${magentaRadius}px rgba(217, 70, 239, ${magentaAlpha}))`,
    `drop-shadow(0 -2px ${coralRadius}px rgba(251, 146, 60, ${coralAlpha}))`,
    `brightness(${brightness})`,
    `saturate(${saturate})`,
  ].join(' ');

  return {
    bassEnergy: effectiveBass,
    midEnergy: effectiveMid,
    highEnergy: effectiveHigh,
    overallIntensity,
    cssFilter,
  };
}

export interface WakeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  decay: number;
  colorRgb: string;
}

const BIOLUM_WAKE_COLORS = [
  '56, 189, 248',   // Electric Cyan (#38bdf8)
  '217, 70, 239',   // Bioluminescent Magenta (#d946ef)
  '59, 130, 246',   // Royal Electric Blue (#3b82f6)
  '168, 85, 247',   // Neon Violet (#a855f7)
  '251, 146, 60',   // Inner Core Coral-Gold (#fb923c)
];

export function spawnGlowWakeParticles(
  centerX: number,
  centerY: number,
  angularVelocityY: number,
  angularVelocityX: number,
  count: number,
  timeSeconds: number
): WakeParticle[] {
  const spawned: WakeParticle[] = [];
  const safeCount = Math.max(0, Math.min(24, Math.floor(count)));

  for (let i = 0; i < safeCount; i++) {
    const angle = (i / Math.max(1, safeCount)) * Math.PI * 2 + timeSeconds * 1.7;
    const radialDist = 32 + (i % 3) * 26;
    const offsetX = Math.cos(angle) * radialDist;
    const offsetY = Math.sin(angle) * (radialDist * 0.75) + (i % 2 === 0 ? 24 : -14);

    const wakeVx = -angularVelocityY * 140 + Math.cos(angle + 1.57) * 18;
    const wakeVy = -angularVelocityX * 90 + Math.sin(angle) * 14 + 12;

    const safeTimeTick = Number.isFinite(timeSeconds) ? Math.max(0, Math.floor(timeSeconds * 10)) : 0;
    const colorIdx = Math.abs(i + safeTimeTick) % BIOLUM_WAKE_COLORS.length;
    const colorRgb = BIOLUM_WAKE_COLORS[colorIdx] || '56, 189, 248';

    spawned.push({
      x: centerX + offsetX,
      y: centerY + offsetY,
      vx: wakeVx,
      vy: wakeVy,
      radius: 10 + (i % 4) * 7,
      life: 1.0,
      decay: 0.65 + (i % 3) * 0.2,
      colorRgb,
    });
  }

  return spawned;
}

export function updateGlowWakeParticles(
  particles: WakeParticle[],
  dtSeconds: number,
  timeSeconds: number
): WakeParticle[] {
  const clampedDt = Math.max(0.001, Math.min(0.1, dtSeconds));
  const alive: WakeParticle[] = [];

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const nextLife = p.life - p.decay * clampedDt;
    if (nextLife <= 0.01) continue;

    const curlX = Math.sin(timeSeconds * 2.5 + p.y * 0.02) * 12;
    const curlY = Math.cos(timeSeconds * 2.0 + p.x * 0.02) * 8;

    alive.push({
      ...p,
      x: p.x + (p.vx + curlX) * clampedDt,
      y: p.y + (p.vy + curlY) * clampedDt,
      vx: p.vx * Math.pow(0.92, clampedDt * 60),
      vy: p.vy * Math.pow(0.92, clampedDt * 60),
      radius: p.radius * (1 + clampedDt * 0.25),
      life: nextLife,
    });
  }

  return alive;
}

export interface CursorTrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  decay: number;
  colorRgb: string;
}

export function spawnCursorTrailParticles(
  prevX: number,
  prevY: number,
  currX: number,
  currY: number,
  timeSeconds: number
): CursorTrailParticle[] {
  const dx = currX - prevX;
  const dy = currY - prevY;
  const dist = Math.hypot(dx, dy);
  if (dist < 1.5) return [];

  const steps = Math.min(4, Math.max(1, Math.ceil(dist / 14)));
  const spawned: CursorTrailParticle[] = [];
  const baseTick = Number.isFinite(timeSeconds) ? Math.max(0, Math.floor(timeSeconds * 16)) : 0;

  for (let i = 0; i < steps; i++) {
    const t = (i + 1) / steps;
    const px = prevX + dx * t;
    const py = prevY + dy * t;

    const angle = timeSeconds * 3.1 + i * 2.1;
    const spread = 2.5 + (i % 2) * 2.0;
    const colorIdx = Math.abs(baseTick + i) % BIOLUM_WAKE_COLORS.length;
    const colorRgb = BIOLUM_WAKE_COLORS[colorIdx] || '56, 189, 248';

    spawned.push({
      x: px + Math.cos(angle) * spread,
      y: py + Math.sin(angle) * spread,
      vx: -dx * 0.12 + Math.cos(angle) * 8,
      vy: -dy * 0.12 + Math.sin(angle) * 8 - 4,
      radius: 4.5 + (i % 3) * 2.2,
      life: 1.0,
      decay: 1.45 + (i % 2) * 0.35,
      colorRgb,
    });
  }

  return spawned;
}

export function updateCursorTrailParticles(
  particles: CursorTrailParticle[],
  dtSeconds: number,
  timeSeconds: number
): CursorTrailParticle[] {
  const clampedDt = Math.max(0.001, Math.min(0.1, dtSeconds));
  const alive: CursorTrailParticle[] = [];

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const nextLife = p.life - p.decay * clampedDt;
    if (nextLife <= 0.01) continue;

    const driftX = Math.sin(timeSeconds * 3.0 + p.y * 0.03) * 6;
    const driftY = Math.cos(timeSeconds * 2.4 + p.x * 0.03) * 6;

    alive.push({
      ...p,
      x: p.x + (p.vx + driftX) * clampedDt,
      y: p.y + (p.vy + driftY) * clampedDt,
      vx: p.vx * Math.pow(0.9, clampedDt * 60),
      vy: p.vy * Math.pow(0.9, clampedDt * 60),
      radius: p.radius * (1 + clampedDt * 0.18),
      life: nextLife,
    });
  }

  return alive;
}

// ============================================================================
// 3. CUSTOM GLSL SHADERS FOR THE 3D BIOLUMINESCENT JELLYFISH
// ============================================================================

const BELL_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAudioBass;
  uniform float uRotVelocityY;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalPos;
  varying float vScallop;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float theta = atan(pos.z, pos.x);
    float rimFactor = smoothstep(0.15, 1.0, uv.y);

    // 16 scalloped marginal lappets + 32 fine radial ridges matching the reference jellyfish
    float lappetWave = sin(theta * 16.0) * 0.055 * smoothstep(0.55, 1.0, uv.y);
    float radialRibs = cos(theta * 32.0) * 0.018 * smoothstep(0.2, 0.95, uv.y);
    vScallop = cos(theta * 24.0);

    // Rhythmic propulsion contraction wave (jellyfish stays vertically anchored in place)
    float pulseCycle = sin(uTime * 2.5 - uv.y * 2.6);
    float audioBoost = 1.0 + uAudioBass * 0.18;
    float radialExpand = (1.0 + pulseCycle * 0.075 * rimFactor * audioBoost);

    pos.x *= radialExpand;
    pos.z *= radialExpand;
    pos.x += normalize(pos.xz + vec2(0.0001)).x * radialRibs;
    pos.z += normalize(pos.xz + vec2(0.0001)).y * radialRibs;
    pos.y += lappetWave - pulseCycle * 0.04 * rimFactor;

    // Subtle rotational inertia sway at the lower margin
    pos.x -= uRotVelocityY * 0.14 * rimFactor * rimFactor;

    vLocalPos = pos;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const BELL_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAudioIntensity;
  uniform float uAudioBass;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalPos;
  varying float vScallop;

  // High-frequency procedural hash for bioluminescent speckles on the bell
  float hash31(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) {
      normal = -normal;
    }
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel rim illumination
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.1);
    float rimHighlight = pow(1.0 - abs(dot(normal, viewDir)), 4.2);

    // Exact Reference Color Palette:
    // Crown: Electric Royal Blue (#1d4ed8) -> Cyan Rim (#38bdf8)
    // Mid-Bell: Luminous Violet (#8b5cf6) -> Neon Magenta/Pink (#d946ef / #f472b6)
    // Inner Core Transmission: Warm Coral-Orange-Gold (#fb923c / #fde047)
    vec3 royalBlue = vec3(0.11, 0.32, 0.92);
    vec3 electricCyan = vec3(0.18, 0.78, 0.98);
    vec3 deepViolet = vec3(0.55, 0.22, 0.94);
    vec3 neonMagenta = vec3(0.92, 0.26, 0.88);
    vec3 hotPink = vec3(0.98, 0.42, 0.76);
    vec3 coralGold = vec3(1.0, 0.62, 0.24);

    float h = clamp(vUv.y, 0.0, 1.0);

    // Base vertical gradient from crown (h=0) to scalloped lappet margin (h=1)
    vec3 baseColor = mix(royalBlue, deepViolet, smoothstep(0.18, 0.62, h));
    baseColor = mix(baseColor, neonMagenta, smoothstep(0.52, 0.92, h));
    baseColor = mix(baseColor, hotPink, smoothstep(0.82, 1.0, h));

    // Radial muscle striation veins (prominent when looking from side or underside)
    float veinPattern = smoothstep(0.2, 0.95, vScallop) * smoothstep(0.1, 0.95, h);
    baseColor += mix(electricCyan, hotPink, h) * veinPattern * 0.28;

    // Warm coral-orange subsurface glow radiating from the inner apex core
    float innerCoreGlow = (1.0 - smoothstep(0.0, 0.68, h)) * (1.0 - fresnel * 0.6);
    if (!gl_FrontFacing) {
      // Underside subumbrella view shows stronger coral-orange to magenta radial ribs
      innerCoreGlow *= 1.65;
      baseColor = mix(coralGold, neonMagenta, smoothstep(0.08, 0.75, h));
      baseColor = mix(baseColor, royalBlue, smoothstep(0.75, 1.0, h));
      baseColor += coralGold * veinPattern * 0.42 * (1.0 - h * 0.5);
    } else {
      baseColor = mix(baseColor, coralGold, innerCoreGlow * 0.38);
    }

    // Cyan & turquoise Fresnel rim glow on the upper-to-mid bell
    vec3 rimColor = mix(electricCyan, hotPink, smoothstep(0.45, 0.95, h));
    baseColor += rimColor * fresnel * (0.85 + uAudioIntensity * 0.55);
    baseColor += vec3(0.85, 0.97, 1.0) * rimHighlight * 0.75;

    // Fine glowing bioluminescent speckles across the bell surface
    vec3 cellCoord = floor(vLocalPos * 38.0);
    float speckleSeed = hash31(cellCoord);
    float speckleMask = smoothstep(0.925, 0.99, speckleSeed);
    float twinkle = 0.65 + 0.35 * sin(uTime * 4.5 + speckleSeed * 62.8);
    vec3 speckleColor = mix(electricCyan, vec3(1.0, 0.88, 0.98), step(0.5, fract(speckleSeed * 13.7)));
    baseColor += speckleColor * speckleMask * twinkle * (1.1 + uAudioIntensity * 0.9);

    // Audio-reactive bioluminescent surge
    baseColor *= (1.0 + uAudioIntensity * 0.28);

    // Translucent jellyfish alpha: denser at rim, ribs, and inner core
    float alpha = clamp(
      0.52 + fresnel * 0.38 + innerCoreGlow * 0.25 + veinPattern * 0.12 + speckleMask * 0.3,
      0.0,
      0.96
    );

    gl_FragColor = vec4(baseColor, alpha);
  }
`;

const ORAL_ARM_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAudioBass;
  uniform float uRotVelocityY;
  uniform float uRotVelocityX;

  attribute float aArmSeed;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vRuffleEdge;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // vUv.y = 0 at top core attachment, 1 at bottom tip
    // vUv.x = 0..1 across ribbon width
    float depth = vUv.y;
    float widthCentered = (vUv.x - 0.5) * 2.0; // -1..1
    vRuffleEdge = abs(widthCentered);

    // Fluid swimming undulation + rotational drag lag as the jellyfish rotates
    float wavePhase = uTime * 2.6 - depth * 5.2 + aArmSeed * 6.28;
    float swayX = sin(wavePhase) * (0.14 * depth + 0.12 * depth * depth);
    float swayZ = cos(wavePhase * 0.85 + 1.1) * (0.14 * depth + 0.12 * depth * depth);

    // High-frequency 3D frill / ruffle wave along the ribbon outer edges
    float ruffleWave = sin(depth * 48.0 - uTime * 3.2 + aArmSeed * 12.0) * 0.085 * pow(vRuffleEdge, 1.25);
    float secondaryRuffle = cos(depth * 92.0 + aArmSeed * 7.0) * 0.032 * pow(vRuffleEdge, 1.6);

    pos.x += swayX + ruffleWave - uRotVelocityY * 0.45 * pow(depth, 1.35);
    pos.z += swayZ + secondaryRuffle;
    pos.y += uRotVelocityX * 0.22 * depth + sin(uTime * 2.5 - depth * 3.0) * 0.04 * (1.0 + uAudioBass * 0.4);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ORAL_ARM_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAudioIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vRuffleEdge;

  void main() {
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) normal = -normal;
    vec3 viewDir = normalize(vViewPosition);

    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 1.8);
    float depth = clamp(vUv.y, 0.0, 1.0);

    // Exact Oral Arm Color Gradient:
    // Top (0.0 .. 0.32): Warm glowing coral-orange & salmon-rose (#fb923c -> #fb7185 -> #f472b6)
    // Middle (0.32 .. 0.68): Vibrant neon magenta & orchid purple (#e879f9 -> #a855f7 -> #7c3aed)
    // Lower Tips (0.68 .. 1.0): Deep electric royal blue & cyan highlights (#3b82f6 -> #1d4ed8 -> #38bdf8)
    vec3 warmCoral = vec3(1.0, 0.54, 0.25);
    vec3 rosePink = vec3(0.98, 0.38, 0.68);
    vec3 neonOrchid = vec3(0.86, 0.28, 0.95);
    vec3 deepPurple = vec3(0.48, 0.20, 0.92);
    vec3 electricBlue = vec3(0.14, 0.38, 0.98);
    vec3 cyanTip = vec3(0.22, 0.78, 1.0);

    vec3 col = mix(warmCoral, rosePink, smoothstep(0.0, 0.28, depth));
    col = mix(col, neonOrchid, smoothstep(0.24, 0.52, depth));
    col = mix(col, deepPurple, smoothstep(0.48, 0.74, depth));
    col = mix(col, electricBlue, smoothstep(0.68, 0.96, depth));

    // Glowing ruffled edge highlight (frilled margins catch bright bioluminescence)
    float edgeGlow = smoothstep(0.45, 1.0, vRuffleEdge);
    vec3 edgeColor = mix(
      vec3(1.0, 0.78, 0.55),
      mix(vec3(1.0, 0.55, 0.95), cyanTip, smoothstep(0.45, 0.95, depth)),
      smoothstep(0.15, 0.5, depth)
    );

    col = mix(col, edgeColor, edgeGlow * 0.62);
    col += edgeColor * fresnel * (0.65 + uAudioIntensity * 0.45);

    // Traveling bioluminescent pulse down the oral arms
    float pulseWave = 0.5 + 0.5 * sin(uTime * 3.2 - depth * 7.0);
    col *= (0.92 + pulseWave * 0.18 + uAudioIntensity * 0.28);

    float alpha = clamp(0.68 + edgeGlow * 0.26 + fresnel * 0.2, 0.0, 0.96);
    // Soft taper at very bottom tip
    alpha *= (1.0 - smoothstep(0.93, 1.0, depth));

    gl_FragColor = vec4(col, alpha);
  }
`;

const TENTACLE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAudioBass;
  uniform float uRotVelocityY;

  attribute float aTentacleSeed;

  varying vec2 vUv;
  varying float vSeed;

  void main() {
    vUv = uv;
    vSeed = aTentacleSeed;
    vec3 pos = position;

    float depth = vUv.y; // 0 at bell margin, 1 at trailing tip
    float phase = uTime * 2.8 - depth * 6.5 + aTentacleSeed * 6.283;

    // Graceful sweeping harmonic wave + rotational lag
    float waveX = sin(phase) * (0.18 * depth + 0.22 * depth * depth);
    float waveZ = cos(phase * 0.9 + 0.8) * (0.18 * depth + 0.22 * depth * depth);

    pos.x += waveX - uRotVelocityY * 0.65 * pow(depth, 1.4);
    pos.z += waveZ;
    pos.y += sin(uTime * 2.5 - depth * 4.0) * 0.035 * (1.0 + uAudioBass * 0.5);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const TENTACLE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAudioIntensity;

  varying vec2 vUv;
  varying float vSeed;

  void main() {
    float depth = clamp(vUv.y, 0.0, 1.0);

    // Margin pink/violet transitioning into electric blue/cyan along the filament
    vec3 topPink = vec3(0.95, 0.35, 0.85);
    vec3 midViolet = vec3(0.58, 0.25, 0.96);
    vec3 bottomBlue = vec3(0.16, 0.48, 1.0);
    vec3 beadCyan = vec3(0.65, 0.92, 1.0);

    vec3 col = mix(topPink, midViolet, smoothstep(0.0, 0.4, depth));
    col = mix(col, bottomBlue, smoothstep(0.35, 0.9, depth));

    // Periodic glowing bioluminescent bead nodes along the tentacle length
    float beadPattern = pow(0.5 + 0.5 * sin(depth * 56.0 - uTime * 3.6 + vSeed * 15.0), 10.0);
    col = mix(col, beadCyan, beadPattern * (0.75 + uAudioIntensity * 0.4));
    col *= (1.0 + uAudioIntensity * 0.35);

    float alpha = (0.62 + beadPattern * 0.35) * (1.0 - smoothstep(0.88, 1.0, depth));
    gl_FragColor = vec4(col, alpha);
  }
`;

// ============================================================================
// 4. PROCEDURAL 3D GEOMETRY BUILDERS FOR RUFFLED ORAL ARMS & FILAMENTS
// ============================================================================

function createRuffledOralArmGeometry(
  armIndex: number,
  totalArms: number,
  length: number,
  maxWidth: number
): THREE.BufferGeometry {
  const uSegs = 12;
  const vSegs = 90;
  const geometry = new THREE.BufferGeometry();

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const seeds: number[] = [];

  const armAngle = (armIndex / totalArms) * Math.PI * 2;
  const radiusOffset = armIndex < 4 ? 0.16 : 0.34;
  const seedVal = (armIndex * 1.37) % 1.0;

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs; // 0 (top under bell) -> 1 (bottom tip)
    const widthEnvelope = Math.sin(Math.pow(v, 0.65) * Math.PI) * maxWidth * (1.05 - 0.25 * v);
    const twistAngle = armAngle + v * 3.6 + Math.sin(v * 9.0 + armIndex) * 0.45;

    const radialSpread = radiusOffset + Math.sin(v * Math.PI * 0.85) * 0.26 * (1.0 - v * 0.4);
    const spineX = Math.cos(armAngle) * radialSpread;
    const spineZ = Math.sin(armAngle) * radialSpread;
    const spineY = 0.55 - v * length;

    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs; // 0..1 across width
      const wCentered = (u - 0.5) * 2.0; // -1..1
      const edgeDist = Math.abs(wCentered);

      const fold1 = Math.sin(v * 42.0 + armIndex * 2.1) * 0.095 * Math.pow(edgeDist, 1.3);
      const fold2 = Math.cos(v * 78.0 - armIndex * 1.4) * 0.042 * Math.pow(edgeDist, 1.7);

      const localX = wCentered * widthEnvelope;
      const localZ = fold1 + fold2;

      const cosT = Math.cos(twistAngle);
      const sinT = Math.sin(twistAngle);

      const px = spineX + localX * cosT - localZ * sinT;
      const pz = spineZ + localX * sinT + localZ * cosT;
      const py = spineY + Math.cos(wCentered * Math.PI * 0.5) * 0.03;

      positions.push(px, py, pz);
      uvs.push(u, v);
      seeds.push(seedVal);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * (uSegs + 1) + iu;
      const b = a + 1;
      const c = (iv + 1) * (uSegs + 1) + iu;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('aArmSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geometry.computeVertexNormals();

  return geometry;
}

function createMarginalTentacleGeometry(
  tentacleIndex: number,
  totalTentacles: number,
  length: number
): THREE.BufferGeometry {
  const uSegs = 3;
  const vSegs = 56;
  const geometry = new THREE.BufferGeometry();

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const seeds: number[] = [];

  const angle = (tentacleIndex / totalTentacles) * Math.PI * 2;
  const baseRadius = 1.24 + (tentacleIndex % 2) * 0.08;
  const seedVal = (tentacleIndex * 0.73) % 1.0;

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    const r = baseRadius * (1.0 - v * 0.22) + Math.sin(v * Math.PI * 1.5 + tentacleIndex) * 0.08;
    const cx = Math.cos(angle) * r;
    const cz = Math.sin(angle) * r;
    const cy = 0.22 - v * length;

    const ribbonHalfWidth = 0.016 * (1.0 - v * 0.65);
    const tangentX = -Math.sin(angle);
    const tangentZ = Math.cos(angle);

    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      const offset = (u - 0.5) * 2.0 * ribbonHalfWidth;

      positions.push(cx + tangentX * offset, cy, cz + tangentZ * offset);
      uvs.push(u, v);
      seeds.push(seedVal);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * (uSegs + 1) + iu;
      const b = a + 1;
      const c = (iv + 1) * (uSegs + 1) + iu;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('aTentacleSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geometry.computeVertexNormals();

  return geometry;
}

// ============================================================================
// 5. MAIN SELF-CONTAINED IMMERSION ZEN MODE COMPONENT
// ============================================================================

export default function SystemsThinkingViewer() {
  // Navigation & timeline state (fixed in Immersion Zen Mode)
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playbackSpeed = 1;
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'principles' | 'models' | null>(null);

  // Refs for smooth animation, 3D interaction & audio-reactive bloom
  const containerRef = useRef<HTMLDivElement>(null);
  const webglMountRef = useRef<HTMLDivElement>(null);
  const jellyfishBloomWrapperRef = useRef<HTMLDivElement>(null);
  const wakeCanvasRef = useRef<HTMLCanvasElement>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);

  const progressTargetRef = useRef<number>(0);
  const progressCurrentRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(true);

  // Interactive 3D drag rotation offsets
  const isDraggingJellyfishRef = useRef<boolean>(false);
  const dragLastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const userYawOffsetRef = useRef<number>(0);
  const userPitchOffsetRef = useRef<number>(0);

  const mousePosRef = useRef<{ x: number; y: number; normalizedX: number; normalizedY: number }>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });
  const cursorScreenPosRef = useRef<{ x: number; y: number; hasMoved: boolean }>({
    x: -100,
    y: -100,
    hasMoved: false,
  });
  const pendingCursorTrailRef = useRef<CursorTrailParticle[]>([]);
  const touchStartYRef = useRef<number>(0);

  // Web Audio Synth + AnalyserNode references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqDataRef = useRef<Uint8Array | null>(null);
  const synthNodesRef = useRef<{
    subOsc?: OscillatorNode;
    droneOsc?: OscillatorNode;
    shimmerOsc?: OscillatorNode;
    lfoOsc?: OscillatorNode;
    filter?: BiquadFilterNode;
    gain?: GainNode;
  } | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // -------------------------------------------------------------
  // PROCEDURAL WEB AUDIO ENGINE + ANALYSER NODE FOR BLOOM SYNC
  // -------------------------------------------------------------
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      analyserRef.current = analyser;
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.001, ctx.currentTime);

      // Deep sub-bass ocean pulse (55Hz)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, ctx.currentTime);

      // Oceanic drone harmonics (110Hz)
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(110, ctx.currentTime);

      // Bioluminescent high harmonic shimmer (220Hz)
      const shimmerOsc = ctx.createOscillator();
      shimmerOsc.type = 'sawtooth';
      shimmerOsc.frequency.setValueAtTime(220, ctx.currentTime);

      // Rhythmic LFO pulsing the filter cutoff so frequency spectrum breathes organically
      const lfoOsc = ctx.createOscillator();
      lfoOsc.type = 'sine';
      lfoOsc.frequency.setValueAtTime(0.85, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(240, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, ctx.currentTime);
      filter.Q.setValueAtTime(5.5, ctx.currentTime);

      lfoOsc.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.22, ctx.currentTime);

      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.08, ctx.currentTime);

      subOsc.connect(filter);
      droneOsc.connect(droneGain);
      droneGain.connect(filter);
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(filter);

      filter.connect(analyser);
      analyser.connect(mainGain);
      mainGain.connect(ctx.destination);

      subOsc.start();
      droneOsc.start();
      shimmerOsc.start();
      lfoOsc.start();

      synthNodesRef.current = {
        subOsc,
        droneOsc,
        shimmerOsc,
        lfoOsc,
        filter,
        gain: mainGain,
      };
    } catch {
      // AudioContext unavailable
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (isMuted) {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (synthNodesRef.current?.gain && audioCtxRef.current) {
        synthNodesRef.current.gain.gain.linearRampToValueAtTime(0.2, audioCtxRef.current.currentTime + 0.4);
      }
      setIsMuted(false);
    } else {
      if (synthNodesRef.current?.gain && audioCtxRef.current) {
        synthNodesRef.current.gain.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.3);
      }
      setIsMuted(true);
    }
  }, [isMuted, initAudio]);

  const playUiClick = useCallback(() => {
    if (!audioCtxRef.current || isMuted) return;
    try {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, audioCtxRef.current.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.08);
      osc.connect(gain);
      if (analyserRef.current) {
        gain.connect(analyserRef.current);
      } else {
        gain.connect(audioCtxRef.current.destination);
      }
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.09);
    } catch {
      // Ignore click audio failure
    }
  }, [isMuted]);

  // -------------------------------------------------------------
  // AMBIENT BACKGROUND DEBRIS CUBES CANVAS LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = ambientCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particleCount = 34;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 4 + Math.random() * 7,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -0.18 - Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.018,
      opacity: 0.2 + Math.random() * 0.55,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.rot += p.rotSpeed;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(140, 205, 255, ${p.opacity * 0.42})`;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // -------------------------------------------------------------
  // TRUE 3D THREE.JS JELLYFISH + BIOLUMINESCENT GLOW WAKE + CURSOR TRAIL
  // -------------------------------------------------------------
  useEffect(() => {
    const mount = webglMountRef.current;
    const wakeCanvas = wakeCanvasRef.current;
    if (!mount || !wakeCanvas) return;

    const wakeCtx = wakeCanvas.getContext('2d');
    let width = (wakeCanvas.width = window.innerWidth);
    let height = (wakeCanvas.height = window.innerHeight);

    // 1. Initialize Three.js Scene, Camera & Transparent Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, -0.18, 6.6);
    camera.lookAt(0, -0.22, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    // Detect Software WebGL to pace frame loop safely
    const gl = renderer.getContext();
    const debugBasic = gl.getParameter(gl.RENDERER) || '';
    const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
    const debugUnmasked = debugExt ? gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) || '' : '';
    const rendererInfo = `${debugBasic} ${debugUnmasked}`;
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|SoftPipe/i.test(rendererInfo);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 2. Construct the 3D Bioluminescent Jellyfish Assembly Group
    const jellyfishRoot = new THREE.Group();
    jellyfishRoot.position.set(0, 0.08, 0);
    scene.add(jellyfishRoot);

    const sharedUniforms = {
      uTime: { value: 0 },
      uAudioIntensity: { value: 0.35 },
      uAudioBass: { value: 0.3 },
      uRotVelocityY: { value: 0 },
      uRotVelocityX: { value: 0 },
    };

    // 2A. Outer Translucent Exumbrella Dome + Underside Radial Subumbrella
    const bellGeo = new THREE.SphereGeometry(1.48, 84, 56, 0, Math.PI * 2, 0, Math.PI * 0.57);
    bellGeo.scale(1.0, 0.78, 1.0);

    const bellMat = new THREE.ShaderMaterial({
      vertexShader: BELL_VERTEX_SHADER,
      fragmentShader: BELL_FRAGMENT_SHADER,
      uniforms: sharedUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const bellMesh = new THREE.Mesh(bellGeo, bellMat);
    bellMesh.position.y = 0.2;
    jellyfishRoot.add(bellMesh);

    // 2B. Inner Bioluminescent Coral-Orange-Gold Core & Subumbrella Radial Gonad Rings
    const coreGeo = new THREE.SphereGeometry(0.62, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.65);
    coreGeo.scale(1.0, 0.65, 1.0);
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: BELL_VERTEX_SHADER,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uAudioIntensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vScallop;
        void main() {
          vec3 normal = normalize(vNormal);
          if (!gl_FrontFacing) normal = -normal;
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 1.5);
          vec3 goldCore = vec3(1.0, 0.76, 0.22);
          vec3 coralOrange = vec3(0.98, 0.38, 0.20);
          vec3 warmMagenta = vec3(0.92, 0.22, 0.72);
          vec3 col = mix(goldCore, coralOrange, smoothstep(0.0, 0.55, vUv.y));
          col = mix(col, warmMagenta, smoothstep(0.5, 1.0, vUv.y));
          float rib = 0.5 + 0.5 * vScallop;
          col = mix(col, goldCore, rib * 0.32);
          col *= (0.98 + uAudioIntensity * 0.28);
          float alpha = clamp(0.68 + fresnel * 0.22, 0.0, 0.90) * (1.0 - smoothstep(0.82, 1.0, vUv.y));
          gl_FragColor = vec4(col, alpha);
        }
      `,
      uniforms: sharedUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.32;
    jellyfishRoot.add(coreMesh);

    // 2C. 12 Heavily Ruffled / Frilled 3D Oral Arms
    const oralArmsGroup = new THREE.Group();
    const oralArmMat = new THREE.ShaderMaterial({
      vertexShader: ORAL_ARM_VERTEX_SHADER,
      fragmentShader: ORAL_ARM_FRAGMENT_SHADER,
      uniforms: sharedUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const totalOralArms = 12;
    const armGeometries: THREE.BufferGeometry[] = [];
    for (let i = 0; i < totalOralArms; i++) {
      const isInnerArm = i < 4;
      const armLen = isInnerArm ? 2.35 : 2.85 + (i % 3) * 0.22;
      const armWidth = isInnerArm ? 0.34 : 0.42;
      const armGeo = createRuffledOralArmGeometry(i, totalOralArms, armLen, armWidth);
      armGeometries.push(armGeo);
      const armMesh = new THREE.Mesh(armGeo, oralArmMat);
      oralArmsGroup.add(armMesh);
    }
    jellyfishRoot.add(oralArmsGroup);

    // 2D. 36 Delicate Beaded Marginal Filaments / Tentacles
    const tentaclesGroup = new THREE.Group();
    const tentacleMat = new THREE.ShaderMaterial({
      vertexShader: TENTACLE_VERTEX_SHADER,
      fragmentShader: TENTACLE_FRAGMENT_SHADER,
      uniforms: sharedUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const totalTentacles = 36;
    const tentacleGeometries: THREE.BufferGeometry[] = [];
    for (let i = 0; i < totalTentacles; i++) {
      const len = 2.6 + (i % 4) * 0.35;
      const tGeo = createMarginalTentacleGeometry(i, totalTentacles, len);
      tentacleGeometries.push(tGeo);
      const tMesh = new THREE.Mesh(tGeo, tentacleMat);
      tentaclesGroup.add(tMesh);
    }
    jellyfishRoot.add(tentaclesGroup);

    // 2E. Volumetric Internal Bioluminescent Spore Cloud (Points)
    const sporeCount = 220;
    const sporePositions = new Float32Array(sporeCount * 3);
    const sporeColors = new Float32Array(sporeCount * 3);
    const palette = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#d946ef'),
      new THREE.Color('#fb923c'),
      new THREE.Color('#60a5fa'),
    ];
    for (let i = 0; i < sporeCount; i++) {
      const r = 0.2 + Math.random() * 1.25;
      const theta = Math.random() * Math.PI * 2;
      const y = 1.1 - Math.random() * 3.4;
      const spread = y > 0.2 ? r * 0.85 : r * (0.55 + (0.2 - y) * 0.18);
      sporePositions[i * 3] = Math.cos(theta) * spread;
      sporePositions[i * 3 + 1] = y;
      sporePositions[i * 3 + 2] = Math.sin(theta) * spread;

      const c = palette[i % palette.length];
      sporeColors[i * 3] = c.r;
      sporeColors[i * 3 + 1] = c.g;
      sporeColors[i * 3 + 2] = c.b;
    }
    const sporeGeo = new THREE.BufferGeometry();
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));
    sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));
    const sporeMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sporePoints = new THREE.Points(sporeGeo, sporeMat);
    jellyfishRoot.add(sporePoints);

    // 3. Bioluminescent Glow Wake & Cursor Trail Particle State
    let wakeParticles: WakeParticle[] = [];
    let cursorParticles: CursorTrailParticle[] = [];
    let currentRotY = 0;
    let currentRotX = -0.15;
    let currentRotZ = -0.12;
    let currentScale = 1.0;

    const handleResize = () => {
      width = wakeCanvas.width = window.innerWidth;
      height = wakeCanvas.height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Track pointer movements globally for the faint bioluminescent cursor trail
    const handleWindowPointerMove = (e: PointerEvent) => {
      const elapsedSec = (performance.now() - startTime) / 1000;
      const prev = cursorScreenPosRef.current;
      if (prev.hasMoved) {
        const spawned = spawnCursorTrailParticles(
          prev.x,
          prev.y,
          e.clientX,
          e.clientY,
          elapsedSec
        );
        if (spawned.length > 0) {
          pendingCursorTrailRef.current.push(...spawned);
        }
      }
      cursorScreenPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        hasMoved: true,
      };
    };
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });

    // 4. Master Render Loop
    let animId = 0;
    let stopped = false;
    let lastTime = performance.now();
    const startTime = lastTime;

    const afterDraw = (cb: () => void) => {
      if (!isSoftwareGl) {
        cb();
        return;
      }
      const gl2 = gl as WebGL2RenderingContext;
      if (typeof gl2.fenceSync === 'function') {
        const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl2.flush();
        const poll = () => {
          if (stopped) return;
          if (!sync) {
            cb();
            return;
          }
          const status = gl2.clientWaitSync(sync, 0, 0);
          if (status === gl2.TIMEOUT_EXPIRED) {
            setTimeout(poll, 16);
          } else {
            gl2.deleteSync(sync);
            cb();
          }
        };
        setTimeout(poll, 60);
      } else {
        setTimeout(cb, 100);
      }
    };

    const renderFrame = (now: number) => {
      if (stopped) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      // A. Sample Web Audio AnalyserNode Frequency Data & Compute CSS + Shader Bloom
      if (analyserRef.current && freqDataRef.current && !isMutedRef.current) {
        analyserRef.current.getByteFrequencyData(freqDataRef.current as unknown as Uint8Array<ArrayBuffer>);
      }
      const bloomMetrics = calculateAudioBloomMetrics(
        freqDataRef.current,
        elapsed,
        isMutedRef.current
      );

      if (jellyfishBloomWrapperRef.current) {
        jellyfishBloomWrapperRef.current.style.filter = bloomMetrics.cssFilter;
      }

      sharedUniforms.uTime.value = elapsed;
      sharedUniforms.uAudioIntensity.value = bloomMetrics.overallIntensity;
      sharedUniforms.uAudioBass.value = bloomMetrics.bassEnergy;

      // B. Compute 3D Rotation Target (Left-to-Right Scroll Rotation + Interactive Drag)
      const prog = progressCurrentRef.current;

      const targetRot = calculateJellyfishRotation3D(
        prog,
        mousePosRef.current.normalizedX,
        mousePosRef.current.normalizedY,
        userYawOffsetRef.current,
        userPitchOffsetRef.current
      );

      const prevRotY = currentRotY;
      const prevRotX = currentRotX;
      currentRotY = dampValue(currentRotY, targetRot.rotY, 7.5, dt);
      currentRotX = dampValue(currentRotX, targetRot.rotX, 7.5, dt);
      currentRotZ = dampValue(currentRotZ, targetRot.rotZ, 7.5, dt);

      const rotVelY = (currentRotY - prevRotY) / Math.max(0.008, dt);
      const rotVelX = (currentRotX - prevRotX) / Math.max(0.008, dt);

      sharedUniforms.uRotVelocityY.value = Math.max(-2.5, Math.min(2.5, rotVelY * 0.35));
      sharedUniforms.uRotVelocityX.value = Math.max(-2.0, Math.min(2.0, rotVelX * 0.35));

      // Apply 3D orientation & steady vertical hover
      jellyfishRoot.rotation.set(currentRotX, currentRotY, currentRotZ);
      jellyfishRoot.position.y = 0.08 + Math.sin(elapsed * 2.5) * 0.036;

      const targetScale = calculateJellyfishScale(prog);
      currentScale = dampValue(currentScale, targetScale, 6.0, dt);
      jellyfishRoot.scale.setScalar(currentScale * 0.48);

      renderer.render(scene, camera);

      // C. Update & Render Canvas-Based Bioluminescent Glow Wake Trail + Faint Cursor Trail
      if (wakeCtx) {
        wakeCtx.clearRect(0, 0, width, height);
        const speedMagnitude = Math.hypot(rotVelY, rotVelX);
        const spawnCount = speedMagnitude > 0.15 ? Math.min(8, Math.ceil(speedMagnitude * 2.5)) : 2;
        const newWake = spawnGlowWakeParticles(
          width * 0.5 + Math.sin(currentRotY) * 28,
          height * 0.5,
          rotVelY * 0.45,
          rotVelX * 0.45,
          spawnCount,
          elapsed
        );
        wakeParticles = updateGlowWakeParticles([...wakeParticles, ...newWake], dt, elapsed);
        if (wakeParticles.length > 140) {
          wakeParticles = wakeParticles.slice(wakeParticles.length - 140);
        }

        if (pendingCursorTrailRef.current.length > 0) {
          cursorParticles.push(...pendingCursorTrailRef.current);
          pendingCursorTrailRef.current = [];
        }
        cursorParticles = updateCursorTrailParticles(cursorParticles, dt, elapsed);
        if (cursorParticles.length > 90) {
          cursorParticles = cursorParticles.slice(cursorParticles.length - 90);
        }

        wakeCtx.save();
        wakeCtx.globalCompositeOperation = 'screen';

        // 1. Jellyfish glow wake particles
        for (let i = 0; i < wakeParticles.length; i++) {
          const wp = wakeParticles[i];
          const rgb = wp.colorRgb || '56, 189, 248';
          const alpha = Math.max(0, Math.min(1, wp.life * (0.28 + bloomMetrics.overallIntensity * 0.32)));
          const grad = wakeCtx.createRadialGradient(wp.x, wp.y, 0, wp.x, wp.y, wp.radius);
          grad.addColorStop(0, `rgba(${rgb}, ${alpha})`);
          grad.addColorStop(0.5, `rgba(${rgb}, ${alpha * 0.45})`);
          grad.addColorStop(1, `rgba(${rgb}, 0)`);
          wakeCtx.fillStyle = grad;
          wakeCtx.beginPath();
          wakeCtx.arc(wp.x, wp.y, wp.radius, 0, Math.PI * 2);
          wakeCtx.fill();
        }

        // 2. Faint bioluminescent cursor trail droplets + soft connecting wisp
        if (cursorParticles.length > 1) {
          wakeCtx.lineCap = 'round';
          wakeCtx.lineJoin = 'round';
          for (let i = 1; i < cursorParticles.length; i++) {
            const prevCp = cursorParticles[i - 1];
            const cp = cursorParticles[i];
            const segDist = Math.hypot(cp.x - prevCp.x, cp.y - prevCp.y);
            if (segDist < 48) {
              const lineAlpha = Math.min(prevCp.life, cp.life) * 0.14;
              wakeCtx.strokeStyle = `rgba(${cp.colorRgb}, ${lineAlpha})`;
              wakeCtx.lineWidth = Math.max(1, cp.radius * 0.35 * cp.life);
              wakeCtx.beginPath();
              wakeCtx.moveTo(prevCp.x, prevCp.y);
              wakeCtx.lineTo(cp.x, cp.y);
              wakeCtx.stroke();
            }
          }
        }

        for (let i = 0; i < cursorParticles.length; i++) {
          const cp = cursorParticles[i];
          const rgb = cp.colorRgb || '56, 189, 248';
          const alpha = Math.max(0, Math.min(1, cp.life * 0.28));
          const r = cp.radius * 1.6;
          const grad = wakeCtx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, r);
          grad.addColorStop(0, `rgba(${rgb}, ${alpha})`);
          grad.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.45})`);
          grad.addColorStop(1, `rgba(${rgb}, 0)`);
          wakeCtx.fillStyle = grad;
          wakeCtx.beginPath();
          wakeCtx.arc(cp.x, cp.y, r, 0, Math.PI * 2);
          wakeCtx.fill();
        }

        wakeCtx.restore();
      }

      afterDraw(() => {
        if (!stopped) {
          animId = requestAnimationFrame(renderFrame);
        }
      });
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      stopped = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      bellGeo.dispose();
      bellMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      oralArmMat.dispose();
      armGeometries.forEach(g => g.dispose());
      tentacleMat.dispose();
      tentacleGeometries.forEach(g => g.dispose());
      sporeGeo.dispose();
      sporeMat.dispose();
      renderer.dispose();
    };
  }, []);

  // -------------------------------------------------------------
  // MASTER TIMELINE INTERPOLATION & SMOOTH VELOCITY LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const dt = Math.min((stamp - lastStamp) / 1000, 0.05);
      lastStamp = stamp;

      if (isPlaying) {
        progressTargetRef.current = Math.min(1.0, progressTargetRef.current + dt * 0.065 * playbackSpeed);
        if (progressTargetRef.current >= 1.0) {
          setIsPlaying(false);
        }
      }

      const prev = progressCurrentRef.current;
      const next = dampValue(prev, progressTargetRef.current, 8.5, dt);
      progressCurrentRef.current = next;

      if (Math.abs(next - prev) > 0.0001 || isPlaying) {
        setProgress(next);

        if (synthNodesRef.current?.filter && audioCtxRef.current) {
          const { baseFreq, filterFreq, resonance } = getAudioHarmonics(next);
          synthNodesRef.current.filter.frequency.setTargetAtTime(
            filterFreq,
            audioCtxRef.current.currentTime,
            0.05
          );
          synthNodesRef.current.filter.Q.setTargetAtTime(
            resonance,
            audioCtxRef.current.currentTime,
            0.05
          );
          if (synthNodesRef.current.subOsc) {
            synthNodesRef.current.subOsc.frequency.setTargetAtTime(
              baseFreq,
              audioCtxRef.current.currentTime,
              0.08
            );
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  // Wheel and trackpad handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isPlaying) setIsPlaying(false);
      const delta = e.deltaY * 0.0008;
      progressTargetRef.current = Math.max(0, Math.min(1, progressTargetRef.current + delta));
    },
    [isPlaying]
  );

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = touchStartYRef.current - e.touches[0].clientY;
    touchStartYRef.current = e.touches[0].clientY;
    if (isPlaying) setIsPlaying(false);
    progressTargetRef.current = Math.max(0, Math.min(1, progressTargetRef.current + diff * 0.0025));
  };

  // Pointer drag handlers for interactive 3D rotation of the jellyfish
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, select')) return;
    isDraggingJellyfishRef.current = true;
    dragLastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mousePosRef.current = {
      x: e.clientX - w / 2,
      y: e.clientY - h / 2,
      normalizedX: (e.clientX / w - 0.5) * 2,
      normalizedY: (e.clientY / h - 0.5) * 2,
    };

    if (isDraggingJellyfishRef.current) {
      const dx = e.clientX - dragLastPosRef.current.x;
      const dy = e.clientY - dragLastPosRef.current.y;
      dragLastPosRef.current = { x: e.clientX, y: e.clientY };
      userYawOffsetRef.current += dx * 0.009;
      userPitchOffsetRef.current = Math.max(
        -Math.PI * 0.48,
        Math.min(Math.PI * 0.48, userPitchOffsetRef.current + dy * 0.007)
      );
    }
  };

  const handlePointerUp = () => {
    isDraggingJellyfishRef.current = false;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal) {
        if (e.key === 'Escape') setActiveModal(null);
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (isPlaying) setIsPlaying(false);
        progressTargetRef.current = Math.min(1, progressTargetRef.current + 0.05);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (isPlaying) setIsPlaying(false);
        progressTargetRef.current = Math.max(0, progressTargetRef.current - 0.05);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleAudio();
      } else if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, isPlaying, toggleAudio]);

  // Chapter navigation jump (used from modal cards and bottom nav)
  const jumpToChapter = (chap: ChapterInfo) => {
    if (isPlaying) setIsPlaying(false);
    if (chap.id === '01') {
      progressTargetRef.current = 0.0;
    } else if (chap.id === '02') {
      progressTargetRef.current = 0.27;
    } else {
      progressTargetRef.current = 0.82;
    }
    playUiClick();
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="st-zen-root relative w-screen h-screen overflow-hidden select-none flex flex-col justify-between cursor-grab active:cursor-grabbing bg-[#040508] text-white"
    >
      {/* Embedded Fonts & CSS Utilities so this single file works anywhere */}
      <style dangerouslySetInnerHTML={{ __html: EMBEDDED_STYLES }} />

      {/* 1. Subtle Abyssal Grid & Scanline Texture */}
      <div className="absolute inset-0 pointer-events-none z-1 digital-grid-bg opacity-15 invert" />
      <div className="absolute inset-0 scanlines-overlay pointer-events-none z-1 opacity-40" />

      {/* 2. Floating Ambient Debris Cubes Canvas Layer */}
      <canvas ref={ambientCanvasRef} className="absolute inset-0 z-2 pointer-events-none" />

      {/* 3. Top Navigation Header (GO TO MY MIND + Quick Actions) */}
      <header className="fixed top-5 left-5 right-5 z-40 flex items-center justify-between pointer-events-none">
        <Link
          href="/mind"
          className="group inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-mono uppercase tracking-[0.18em] font-semibold bg-[#0c101d]/85 hover:bg-[#161d33] border border-cyan-400/35 hover:border-cyan-300 text-cyan-300 hover:text-white backdrop-blur-xl shadow-[0_0_25px_rgba(56,189,248,0.25)] transition-all duration-300 hover:scale-105 pointer-events-auto"
          title="Go to My Mind"
        >
          <span className="text-base transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span>GO TO MY MIND</span>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Modal launchers */}
          <button
            onClick={() => {
              playUiClick();
              setActiveModal('principles');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-cyan-400/40 backdrop-blur-md transition-all shadow-lg"
          >
            Principles
          </button>
          <button
            onClick={() => {
              playUiClick();
              setActiveModal('models');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-purple-400/40 backdrop-blur-md transition-all shadow-lg"
          >
            Mental Models
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            aria-label={isMuted ? 'Unmute procedural soundscape' : 'Mute soundscape'}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono font-medium text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            {isMuted ? (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Sound ON</span>
              </>
            )}
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(p => !p)}
            aria-label={isPlaying ? 'Pause auto-flow' : 'Play auto-flow'}
            className="px-3 sm:px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold text-white bg-gradient-to-r from-cyan-500/30 to-purple-500/30 hover:from-cyan-500/50 hover:to-purple-500/50 border border-cyan-400/40 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
        </div>
      </header>

      {/* 4. CUBIC 3D KINETIC TYPOGRAPHY LAYER (AT THE BACK — z-3) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-3 overflow-hidden"
        style={{
          perspective: '1400px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phase 1 (01): Friendly, Organic Fraunces Soft-Serif Title in 3D Cubic Receding Transition */}
        {progress < 0.24 && (
          <div
            className="absolute inset-0 flex items-center justify-center will-change-transform px-4"
            style={{
              transform: `translateZ(${-progress * 480}px) rotateX(${progress * 30}deg) scale(${
                1 - progress * 0.25
              })`,
              opacity: Math.max(0, 1 - progress * 4.4),
              transition: 'transform 0.1s cubic-bezier(0.2, 0.9, 0.4, 1), opacity 0.1s ease',
            }}
          >
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-light tracking-[0.06em] leading-tight text-center select-none text-white/95 drop-shadow-[0_6px_32px_rgba(0,0,0,0.95)]">
              Systems{' '}
              <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200">
                Thinking
              </span>
            </h1>
          </div>
        )}

        {/* Phase 2 (02): 3D Cubic Facet Carousel for "See the Whole,", "Feedback Loops", "Emergence", "and Synergy" */}
        {progress >= 0.16 && progress <= 0.72 && (
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
            style={{
              perspective: '1400px',
              transformStyle: 'preserve-3d',
            }}
          >
            {CUBIC_WORDS.map(item => {
              const t = calculateCubicWordTransform(item.center, progress);
              if (!t.isVisible) return null;
              return (
                <div
                  key={item.word}
                  className="absolute flex items-center justify-center will-change-transform"
                  style={{
                    transform: `translateX(${t.translateXPercent}vw) translateZ(${t.translateZ}px) rotateY(${t.rotateY}deg) scale(${t.scale})`,
                    opacity: t.opacity,
                    transformOrigin: 'center center -160px',
                    transition: 'transform 0.12s cubic-bezier(0.2, 0.9, 0.4, 1), opacity 0.12s ease',
                  }}
                >
                  <span className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-light italic tracking-[0.05em] whitespace-nowrap px-6 sm:px-12 select-none text-white/95 drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]">
                    {item.word}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Phase 3 (03): Friendly, Airy Narrative Cards Framing the Forefront 3D Jellyfish */}
        {progress > 0.71 && (
          <div className="absolute inset-0 w-full max-w-[1360px] mx-auto px-12 sm:px-16 flex flex-col md:flex-row justify-between items-center pointer-events-auto transition-opacity duration-300 select-none">
            <motion.div
              initial={{ opacity: 0, x: -50, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-xs sm:max-w-[340px] rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 sm:p-6 mb-6 md:mb-0 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-cyan-300/90 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Living Interdependence
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-light leading-snug text-white/95 mb-2">
                Every living system breathes through{' '}
                <span className="italic text-purple-200">feedback loops</span> and dynamic flows.
              </h3>
              <p className="font-sans text-xs sm:text-sm font-normal text-slate-300/80 leading-relaxed">
                Rather than isolated fragments, nature organizes itself as a responsive web of relationships in continuous motion.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-xs sm:max-w-[340px] rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 sm:p-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-pink-300/90 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                Emergent Harmony
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-light leading-snug text-white/95 mb-2">
                Small shifts at the right node ripple across the{' '}
                <span className="italic text-cyan-200">entire network</span>.
              </h3>
              <p className="font-sans text-xs sm:text-sm font-normal text-slate-300/80 leading-relaxed mb-4">
                Explore the mental models behind emergence, resilience, and high-leverage transformation.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => {
                  playUiClick();
                  setActiveModal('models');
                }}
                className="inline-flex items-center gap-2 font-sans text-xs font-medium tracking-wide px-4 py-2 rounded-full transition-all bg-gradient-to-r from-cyan-400/20 via-purple-500/25 to-pink-500/20 hover:from-cyan-400/35 hover:to-pink-500/35 border border-cyan-300/30 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                Explore Mental Models <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>

      {/* 5. FOREFRONT BIOLUMINESCENT GLOW WAKE + CURSOR TRAIL CANVAS + TRUE 3D THREE.JS JELLYFISH (z-10) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center">
        {/* 5A. Canvas-Based Bioluminescent Glow Wake & Cursor Trail */}
        <canvas
          ref={wakeCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* 5B. True 3D Three.js Bioluminescent Jellyfish with Audio-Reactive CSS Bloom */}
        <div
          ref={jellyfishBloomWrapperRef}
          className="relative w-full h-full flex items-center justify-center pointer-events-none will-change-[filter]"
        >
          <div ref={webglMountRef} className="w-full h-full pointer-events-none" />
        </div>
      </div>

      {/* 6. BOTTOM CHAPTER SCRUBBER & DOCK */}
      <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#070b16]/80 backdrop-blur-xl border border-white/10 pointer-events-auto shadow-2xl">
        {CHAPTERS.map(chap => {
          const isActive = progress >= chap.startProgress && progress <= chap.endProgress;
          return (
            <button
              key={chap.id}
              onClick={() => jumpToChapter(chap)}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-mono transition-all ${
                isActive
                  ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="font-semibold">{chap.id}</span>
              <span className="hidden md:inline font-sans text-[11px] text-slate-300">{chap.name}</span>
            </button>
          );
        })}
      </footer>

      {/* 7. BIOLUMINESCENT GLASSMORPHIC MODALS FOR PRINCIPLES & MENTAL MODELS */}
      <AnimatePresence>
        {activeModal !== null && (
          <motion.div
            key="modal-unified-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-[#020307]/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pointer-events-auto"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              key={activeModal}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340, mass: 0.85 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-4xl rounded-3xl bg-[#070b16]/85 backdrop-blur-2xl border border-white/12 shadow-[0_24px_90px_rgba(14,165,233,0.18)] text-white overflow-hidden max-h-[88vh] flex flex-col"
            >
              {/* Subtle Ambient Bioluminescent Orbs inside the Modal */}
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

              {/* Top Navigation Bar inside Modal */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 pt-6 pb-4 border-b border-white/[0.08]">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-light text-2xl tracking-tight text-white">
                    systems
                  </span>
                  <span className="font-script text-2xl -rotate-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">
                    thinking
                  </span>
                </div>

                {/* Interactive Mode Switcher Pill */}
                <div className="flex items-center p-1 rounded-full bg-white/[0.05] border border-white/10">
                  <button
                    onClick={() => {
                      playUiClick();
                      setActiveModal('principles');
                    }}
                    className={`px-4 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                      activeModal === 'principles'
                        ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-300/30 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
                        : 'text-slate-300/75 hover:text-white'
                    }`}
                  >
                    Core Principles
                  </button>
                  <button
                    onClick={() => {
                      playUiClick();
                      setActiveModal('models');
                    }}
                    className={`px-4 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                      activeModal === 'models'
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-300/30 shadow-[0_0_16px_rgba(192,132,252,0.2)]'
                        : 'text-slate-300/75 hover:text-white'
                    }`}
                  >
                    Mental Models
                  </button>
                </div>

                <button
                  onClick={() => {
                    playUiClick();
                    setActiveModal(null);
                  }}
                  aria-label="Close modal"
                  className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.14] border border-white/10 transition-colors text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="relative z-10 px-6 sm:px-8 py-6 overflow-y-auto">
                {activeModal === 'principles' ? (
                  <div>
                    {/* Editorial Intro */}
                    <div className="max-w-2xl mb-7">
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-cyan-300/90 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        Foundations of Holistic Complexity
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-light tracking-tight text-white mb-3 leading-snug">
                        Seeing the living web behind{' '}
                        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200">
                          isolated events
                        </span>
                      </h2>
                      <p className="font-sans text-sm sm:text-base font-normal text-slate-300/85 leading-relaxed">
                        Systems thinking invites us to look past surface symptoms and observe how interconnected elements communicate, adapt, and co-evolve over time.
                      </p>
                    </div>

                    {/* 4 Bioluminescent Glass Cards with Custom SVG System Diagrams */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Principle 01 */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] via-white/[0.02] to-transparent border border-cyan-400/20 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-200 border border-cyan-400/25">
                              01 · Interconnectedness
                            </span>
                            <svg className="w-9 h-9 text-cyan-300" viewBox="0 0 40 40" fill="none">
                              <circle cx="10" cy="20" r="3" fill="currentColor" />
                              <circle cx="28" cy="10" r="3" fill="currentColor" />
                              <circle cx="30" cy="29" r="3" fill="currentColor" />
                              <circle cx="20" cy="20" r="4" fill="#e879f9" />
                              <path d="M10 20L20 20M20 20L28 10M20 20L30 29M10 20L28 10M10 20L30 29" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
                            </svg>
                          </div>
                          <h3 className="font-display text-xl font-normal text-white mb-2">
                            Everything lives in relationship
                          </h3>
                          <p className="font-sans text-xs sm:text-sm text-slate-300/85 leading-relaxed mb-4">
                            No organism or decision acts alone. Every node is tethered to a wider ecology of mutual influence and shared currents.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-cyan-200/80">
                          <span>Living parallel: Deep-sea symbiosis</span>
                          <span>Network topology</span>
                        </div>
                      </motion.div>

                      {/* Principle 02 */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl bg-gradient-to-br from-purple-500/[0.08] via-white/[0.02] to-transparent border border-purple-400/20 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-400/15 text-purple-200 border border-purple-400/25">
                              02 · Feedback Loops
                            </span>
                            <svg className="w-9 h-9 text-purple-300" viewBox="0 0 40 40" fill="none">
                              <path
                                d="M13 20C13 16 9 14 6 17C3 20 5 25 9 25C14 25 26 15 31 15C35 15 37 20 34 23C31 26 27 24 27 20"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                              <circle cx="20" cy="20" r="2.5" fill="#38bdf8" />
                            </svg>
                          </div>
                          <h3 className="font-display text-xl font-normal text-white mb-2">
                            Circular flows shape stability
                          </h3>
                          <p className="font-sans text-xs sm:text-sm text-slate-300/85 leading-relaxed mb-4">
                            Reinforcing loops amplify momentum while balancing loops restore gentle equilibrium—like the rhythmic pulse of a jellyfish bell.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-purple-200/80">
                          <span>Living parallel: Homeostatic pulse</span>
                          <span>Cybernetic rhythm</span>
                        </div>
                      </motion.div>

                      {/* Principle 03 */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl bg-gradient-to-br from-pink-500/[0.08] via-white/[0.02] to-transparent border border-pink-400/20 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-pink-400/15 text-pink-200 border border-pink-400/25">
                              03 · Emergence & Synergy
                            </span>
                            <svg className="w-9 h-9 text-pink-300" viewBox="0 0 40 40" fill="none">
                              <circle cx="20" cy="20" r="3" fill="currentColor" />
                              <circle cx="20" cy="20" r="8" stroke="currentColor" strokeOpacity="0.65" strokeWidth="1.3" />
                              <circle cx="20" cy="20" r="14" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="3 3" />
                            </svg>
                          </div>
                          <h3 className="font-display text-xl font-normal text-white mb-2">
                            The whole transcends its parts
                          </h3>
                          <p className="font-sans text-xs sm:text-sm text-slate-300/85 leading-relaxed mb-4">
                            When simple rules interact locally, spontaneous beauty and intelligence emerge that could never be predicted by dissecting individual pieces.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-pink-200/80">
                          <span>Living parallel: Bioluminescent waves</span>
                          <span>Self-organization</span>
                        </div>
                      </motion.div>

                      {/* Principle 04 */}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-white/[0.02] to-transparent border border-amber-400/20 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-200 border border-amber-400/25">
                              04 · Leverage Points
                            </span>
                            <svg className="w-9 h-9 text-amber-300" viewBox="0 0 40 40" fill="none">
                              <path d="M7 24L33 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              <path d="M16 28L20 20L24 28H16Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.3" />
                              <circle cx="31" cy="12" r="3" fill="#38bdf8" />
                            </svg>
                          </div>
                          <h3 className="font-display text-xl font-normal text-white mb-2">
                            Gentle shifts, profound ripples
                          </h3>
                          <p className="font-sans text-xs sm:text-sm text-slate-300/85 leading-relaxed mb-4">
                            Instead of forcing change through sheer effort, tuning a system&apos;s information flows or guiding mindset transforms the entire structure effortlessly.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-amber-200/80">
                          <span>Living parallel: Keystone catalysts</span>
                          <span>Systemic acupuncture</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Footer Action inside Principles Modal */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                      <p className="font-sans text-xs text-slate-400">
                        Tip: Move your cursor or drag the 3D jellyfish to observe how local impulses ripple through its filaments.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playUiClick();
                          setActiveModal('models');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-medium bg-gradient-to-r from-cyan-400/25 via-purple-500/25 to-pink-500/25 hover:from-cyan-400/40 hover:to-pink-500/40 border border-cyan-300/30 text-white transition-all shrink-0"
                      >
                        <span>Explore Mental Models</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-200" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Editorial Intro for Mental Models */}
                    <div className="max-w-2xl mb-5">
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-purple-300/90 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        Lenses for Navigating Complexity
                      </span>
                      <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight text-white mb-2 leading-snug">
                        Mental models for decoding{' '}
                        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200">
                          adaptive systems
                        </span>
                      </h2>
                      <p className="font-sans text-xs sm:text-sm font-normal text-slate-300/85 leading-relaxed">
                        Each mental model acts as a lens—helping us recognize hidden bottlenecks, time delays, and self-organizing harmony before we intervene.
                      </p>
                    </div>

                    {/* 4 Rich Visual Mental Model Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {[
                        {
                          id: '01',
                          title: 'Reinforcing & Balancing Loops',
                          subtitle: 'Cybernetics & Equilibrium',
                          accent: 'from-cyan-500/[0.09] border-cyan-400/25 text-cyan-200',
                          badgeBg: 'bg-cyan-400/15 border-cyan-400/30 text-cyan-200',
                          desc: 'Positive feedback accelerates change into compounding waves, while negative balancing loops resist perturbation to anchor resilient homeostasis.',
                          detail: 'Compound growth & biological setpoints',
                          diagram: (
                            <svg className="w-9 h-9 text-cyan-300" viewBox="0 0 40 40" fill="none">
                              <circle cx="14" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                              <circle cx="26" cy="20" r="8" stroke="#38bdf8" strokeWidth="1.5" />
                              <path d="M26 12L28 14L26 16" fill="currentColor" />
                            </svg>
                          ),
                        },
                        {
                          id: '02',
                          title: 'The Iceberg Model',
                          subtitle: 'Events to Mental Models',
                          accent: 'from-purple-500/[0.09] border-purple-400/25 text-purple-200',
                          badgeBg: 'bg-purple-400/15 border-purple-400/30 text-purple-200',
                          desc: 'Above the waterline lie surface events. Beneath lie recurring behavioral patterns, systemic structures, and deep unconscious mental paradigms generating reality.',
                          detail: 'Events → Patterns → Structures → Beliefs',
                          diagram: (
                            <svg className="w-9 h-9 text-purple-300" viewBox="0 0 40 40" fill="none">
                              <line x1="5" y1="18" x2="35" y2="18" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                              <polygon points="20,8 14,18 26,18" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2" />
                              <polygon points="14,18 26,18 29,32 11,32" fill="currentColor" fillOpacity="0.75" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                          ),
                        },
                        {
                          id: '03',
                          title: 'Stocks, Flows & Delays',
                          subtitle: 'Accumulation & Latency',
                          accent: 'from-pink-500/[0.09] border-pink-400/25 text-pink-200',
                          badgeBg: 'bg-pink-400/15 border-pink-400/30 text-pink-200',
                          desc: 'Stocks are reservoirs of trust, talent, or capital. Inflows and outflows govern them, while latency in sensory feedback causes overshoot and erratic oscillations.',
                          detail: 'Oscillation traps & reservoir inertia',
                          diagram: (
                            <svg className="w-9 h-9 text-pink-300" viewBox="0 0 40 40" fill="none">
                              <rect x="12" y="14" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
                              <line x1="4" y1="21" x2="12" y2="21" stroke="#38bdf8" strokeWidth="1.8" />
                              <line x1="28" y1="21" x2="36" y2="21" stroke="#38bdf8" strokeWidth="1.8" />
                            </svg>
                          ),
                        },
                        {
                          id: '04',
                          title: "Donella Meadows' Leverage Points",
                          subtitle: 'High-Impact Intervention',
                          accent: 'from-amber-500/[0.09] border-amber-400/25 text-amber-200',
                          badgeBg: 'bg-amber-400/15 border-amber-400/30 text-amber-200',
                          desc: 'Parameters and taxes are the weakest levers. Maximum transformative power lies in changing the system’s goals, information rules, and mindset paradigms.',
                          detail: 'Paradigm shifts & self-transcendence',
                          diagram: (
                            <svg className="w-9 h-9 text-amber-300" viewBox="0 0 40 40" fill="none">
                              <polygon points="17,30 20,23 23,30" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
                              <line x1="8" y1="26" x2="32" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              <circle cx="30" cy="14" r="3" fill="#38bdf8" />
                            </svg>
                          ),
                        },
                      ].map(model => (
                        <motion.div
                          key={model.id}
                          whileHover={{ y: -3 }}
                          className={`rounded-2xl bg-gradient-to-br ${model.accent} via-white/[0.02] to-transparent border p-4 sm:p-5 flex flex-col justify-between`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${model.badgeBg}`}>
                                {model.id} · {model.subtitle}
                              </span>
                              {model.diagram}
                            </div>
                            <h3 className="font-display text-lg sm:text-xl font-normal text-white mb-1.5">
                              {model.title}
                            </h3>
                            <p className="font-sans text-xs sm:text-sm text-slate-300/85 leading-relaxed mb-3">
                              {model.desc}
                            </p>
                          </div>
                          <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-300/80">
                            <span>{model.detail}</span>
                            <span className="font-mono text-cyan-300/80">Systems Lens</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Footer Action inside Models Modal */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                      <p className="font-sans text-xs text-slate-400">
                        Synthesizing complexity into simple, actionable vantage points.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playUiClick();
                          setActiveModal('principles');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-medium bg-gradient-to-r from-purple-500/25 via-pink-500/25 to-cyan-400/25 hover:from-purple-500/40 hover:to-cyan-400/40 border border-purple-300/30 text-white transition-all shrink-0"
                      >
                        <span>View Core Principles</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-200" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
