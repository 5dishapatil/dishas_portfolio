"use client";

import React from "react";

interface StreetTravellerProps {
  /** Horizontal viewport percentage (e.g. 20 .. 76) */
  screenXPercent: number;
  /** Continuous walk cycle phase in radians, driven by scroll position */
  walkPhase: number;
  /** Current movement intensity in [0, 1] (0 = idle, 1 = brisk walk) */
  walkIntensity: number;
  /** 1 = facing right (scrolling down / progressing), -1 = facing left (scrolling up) */
  facing: 1 | -1;
  /** Entry state when approaching/entering a house */
  entryState: "idle" | "selecting" | "aligning" | "opening-door" | "entering" | "interior";
}

export default function StreetTraveller({
  screenXPercent,
  walkPhase,
  walkIntensity,
  facing,
  entryState,
}: StreetTravellerProps) {
  const isApproachingDoor =
    entryState === "opening-door" || entryState === "entering";
  const isWalkingToDoor = entryState === "aligning";

  const activeIntensity = isWalkingToDoor ? 0.95 : isApproachingDoor ? 0.15 : walkIntensity;

  // Articulated limb angles (degrees) driven by walkPhase & intensity
  const sin = Math.sin(walkPhase);
  const cos = Math.cos(walkPhase);

  const frontHipDeg = sin * 26 * activeIntensity;
  const backHipDeg = -sin * 26 * activeIntensity;

  // Knee bends more when leg swings back/lifts
  const frontKneeDeg = Math.max(0, -cos) * 28 * activeIntensity + 4;
  const backKneeDeg = Math.max(0, cos) * 28 * activeIntensity + 4;

  const frontArmDeg = -sin * 20 * activeIntensity;
  const backArmDeg = sin * 18 * activeIntensity;

  // Vertical stride bounce (2 bounces per full gait cycle)
  const bobY = Math.abs(sin) * -4.5 * activeIntensity;
  const torsoLean = 3.5 * activeIntensity;

  return (
    <div
      className="pointer-events-none absolute bottom-[34px] z-30 transition-opacity duration-500"
      style={{
        left: `${screenXPercent}%`,
        transform: `translate3d(-50%, ${ isApproachingDoor ? "-14px" : "0px" }, 0) scale(${
          isApproachingDoor ? 0.93 : 1
        })`,
        opacity: entryState === "interior" ? 0 : 1,
        transition:
          entryState === "aligning" || isApproachingDoor
            ? "left 480ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease"
            : "opacity 350ms ease",
      }}
      aria-hidden="true"
    >
      {/* Warm Ground Shadow & Cobblestone Rim Reflection */}
      <div
        className="mx-auto w-16 h-3.5 rounded-full blur-[3px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8, 8, 16, 0.85) 0%, rgba(8, 8, 16, 0.35) 60%, transparent 100%)",
          transform: `scaleX(${1 - Math.abs(sin) * 0.12 * activeIntensity})`,
        }}
      />

      {/* Articulated Human Reader Silhouette with Warm Rim Lighting */}
      <svg
        viewBox="0 0 100 165"
        className="w-[74px] h-[122px] -mt-2 overflow-visible drop-shadow-[0_6px_14px_rgba(0,0,0,0.75)]"
      >
        <defs>
          <linearGradient id="travellerCoatGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#262B44" />
            <stop offset="55%" stopColor="#16192B" />
            <stop offset="100%" stopColor="#0D0F1C" />
          </linearGradient>
          <linearGradient id="travellerScarfGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D89B56" />
            <stop offset="100%" stopColor="#A65E2E" />
          </linearGradient>
        </defs>

        <g
          transform={`translate(50, ${84 + bobY}) scale(${facing}, 1) rotate(${torsoLean})`}
        >
          {/* BACK ARM (Swinging behind torso) */}
          <g transform={`translate(-2, -32) rotate(${backArmDeg})`}>
            <path
              d="M0 0 C2 12 4 22 6 30"
              stroke="#141726"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            {/* Leather Satchel / Book held in hand */}
            <rect
              x="1"
              y="26"
              width="12"
              height="15"
              rx="2"
              fill="#7A3E24"
              stroke="#E8C284"
              strokeWidth="1"
            />
          </g>

          {/* BACK LEG (Hip -> Thigh -> Knee -> Calf/Boot) */}
          <g transform={`translate(-2, 4) rotate(${backHipDeg})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="28"
              stroke="#121524"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <g transform={`translate(0, 28) rotate(${backKneeDeg})`}>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="28"
                stroke="#0F111E"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              {/* Boot */}
              <path
                d="M-3 26 H8 C10 26 11 29 9 30 H-4 Z"
                fill="#0B0C14"
                stroke="#D8AE68"
                strokeWidth="0.6"
                strokeOpacity="0.45"
              />
            </g>
          </g>

          {/* FRONT LEG (Hip -> Thigh -> Knee -> Calf/Boot) */}
          <g transform={`translate(2, 4) rotate(${frontHipDeg})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="28"
              stroke="#1C2035"
              strokeWidth="8.5"
              strokeLinecap="round"
            />
            <g transform={`translate(0, 28) rotate(${frontKneeDeg})`}>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="28"
                stroke="#161A2C"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Boot with subtle golden streetlamp highlight */}
              <path
                d="M-3 26 H9 C11 26 12 29 10 30 H-4 Z"
                fill="#121422"
                stroke="#F3D393"
                strokeWidth="0.8"
                strokeOpacity="0.65"
              />
            </g>
          </g>

          {/* TAILORED EVENING OVERCOAT & TORSO */}
          <path
            d={`M-11 -38 C-6 -41 6 -41 10 -38 L14 ${
              16 + Math.abs(sin) * 3 * activeIntensity
            } C6 19 -8 19 -16 ${
              15 - Math.abs(sin) * 2 * activeIntensity
            } Z`}
            fill="url(#travellerCoatGrad)"
            stroke="#F3D393"
            strokeWidth="0.9"
            strokeOpacity="0.55"
          />

          {/* Warm Amber Scarf trailing slightly in the breeze */}
          <path
            d={`M-7 -39 C0 -37 8 -37 11 -39 C8 -33 0 -33 -8 -35 Z`}
            fill="url(#travellerScarfGrad)"
          />
          <path
            d={`M-6 -36 C-14 -33 -20 ${-28 - sin * 3 * activeIntensity} -25 ${
              -22 + cos * 3 * activeIntensity
            }`}
            stroke="url(#travellerScarfGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* HEAD & PROFILE (Tilts slightly upward when admiring a doorway) */}
          <g
            transform={`translate(1, -48) rotate(${
              isApproachingDoor ? -12 : -3
            })`}
          >
            {/* Neck */}
            <rect x="-3" y="2" width="6" height="7" rx="2" fill="#2A2F4A" />
            {/* Head silhouette with warm rim light */}
            <circle
              cx="1"
              cy="-5"
              r="9.5"
              fill="#1B1F34"
              stroke="#F3D393"
              strokeWidth="0.9"
              strokeOpacity="0.7"
            />
            {/* Soft hair / beret silhouette */}
            <path
              d="M-8 -7 C-8 -15 4 -17 10 -11 C7 -12 -3 -11 -7 -4 Z"
              fill="#0F1221"
            />
          </g>

          {/* FRONT ARM (Swinging in foreground, holding a warm lantern-lit book) */}
          <g transform={`translate(2, -32) rotate(${frontArmDeg})`}>
            <path
              d="M0 0 C1 12 3 21 5 29"
              stroke="#232842"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M5 29 C6 29 7 30 6 31"
              stroke="#F3D393"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

