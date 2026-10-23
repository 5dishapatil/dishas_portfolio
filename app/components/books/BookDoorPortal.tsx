"use client";

import React, { useEffect, useState } from "react";
import type { BookCatalogItem } from "./types";

interface BookDoorPortalProps {
  book: BookCatalogItem;
  phase: "zooming-in" | "unlatching" | "throwing-open" | "stepping-through" | "closing";
}

export default function BookDoorPortal({ book, phase }: BookDoorPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const { architecture, cover } = book;
  const houseNumber = String(book.streetOrder).padStart(2, "0");

  const isUnlatched =
    phase === "unlatching" ||
    phase === "throwing-open" ||
    phase === "stepping-through";
  const isThrownOpen =
    phase === "throwing-open" || phase === "stepping-through";
  const isSteppingThrough = phase === "stepping-through";

  // Camera 3D Z-dolly: approaches the door, pauses for the latch release, then glides right through the open doors
  const cameraTransform = !mounted
    ? "translate3d(0px, 28px, -460px) rotateX(2deg)"
    : phase === "zooming-in"
    ? "translate3d(0px, 6px, -90px) rotateX(1deg)"
    : phase === "unlatching"
    ? "translate3d(0px, 2px, -30px) rotateX(0.5deg)"
    : phase === "throwing-open"
    ? "translate3d(0px, 0px, 110px) rotateX(0deg)"
    : phase === "stepping-through"
    ? "translate3d(0px, -6px, 620px) rotateX(0deg)"
    : "translate3d(0px, 18px, -320px) rotateX(1deg)";

  // Left & Right heavy timber door leaf rotation angles (degrees)
  // Negative on left leaf swings inward-left; Positive on right leaf swings inward-right
  const leftDoorAngle = isSteppingThrough
    ? 112
    : isThrownOpen
    ? 102
    : isUnlatched
    ? 9
    : 0;
  const rightDoorAngle = isSteppingThrough
    ? -112
    : isThrownOpen
    ? -102
    : isUnlatched
    ? -9
    : 0;

  // Brass lever handle rotation when unlatching
  const handleTurnDeg = isUnlatched ? 28 : 0;

  return (
    <div
      className={`fixed inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        phase === "closing" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        perspective: "1150px",
        background:
          "radial-gradient(circle at 50% 54%, rgba(14, 15, 28, 0.72) 0%, rgba(5, 6, 12, 0.96) 75%)",
      }}
      aria-hidden="true"
    >
      {/* 3D WORLD CAMERA RIG */}
      <div
        className="relative w-[540px] h-[760px] flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transform: cameraTransform,
          transition:
            phase === "stepping-through"
              ? "transform 760ms cubic-bezier(0.22, 1, 0.36, 1)"
              : phase === "throwing-open"
              ? "transform 680ms cubic-bezier(0.16, 1, 0.3, 1)"
              : "transform 480ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* ===================================================================
            1. EXTERIOR TOWNHOUSE STONE WALL & CARRIAGE LANTERNS
           =================================================================== */}
        <div
          className="absolute -inset-x-[420px] -inset-y-[260px] flex items-center justify-center"
          style={{
            transform: "translateZ(-6px)",
            background: `linear-gradient(90deg, 
              ${architecture.secondaryColor} 0%, 
              ${architecture.primaryColor} 32%, 
              ${architecture.primaryColor} 68%, 
              ${architecture.secondaryColor} 100%)`,
            boxShadow: "inset 0 0 140px rgba(0,0,0,0.9)",
          }}
        >
          {/* Subtle architectural ashlar stone coursing lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(180deg, rgba(255,255,255,0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.35) 1px, transparent 1px)
              `,
              backgroundSize: "140px 64px",
            }}
          />

          {/* Gold-tooled book-spine vertical pilasters flanking the entrance */}
          <div
            className="absolute inset-y-0 left-[calc(50%-305px)] w-[18px] border-x opacity-65"
            style={{
              borderColor: architecture.trimColor,
              background: `linear-gradient(90deg, transparent, ${architecture.trimColor}33, transparent)`,
            }}
          />
          <div
            className="absolute inset-y-0 right-[calc(50%-305px)] w-[18px] border-x opacity-65"
            style={{
              borderColor: architecture.trimColor,
              background: `linear-gradient(90deg, transparent, ${architecture.trimColor}33, transparent)`,
            }}
          />
        </div>

        {/* Left & Right Flickering Brass Carriage Lanterns */}
        {[-255, 255].map((offsetX, idx) => (
          <div
            key={idx}
            className="absolute top-[210px] flex flex-col items-center"
            style={{
              transform: `translate3d(${offsetX}px, 0px, 28px)`,
            }}
          >
            {/* Warm Volumetric Lantern Halo */}
            <div
              className="w-40 h-40 rounded-full -mb-24 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 224, 138, 0.85) 0%, rgba(235, 148, 52, 0.35) 50%, transparent 72%)",
              }}
            />
            {/* Brass Lantern Finals & Bevelled Glass */}
            <div className="w-4 h-2.5 rounded-t-full bg-[#D8AE68] border border-[#FFF2C6]/60" />
            <div
              className="w-8 h-12 rounded-t-lg rounded-b-md border-2 flex items-center justify-center relative overflow-hidden"
              style={{
                borderColor: architecture.trimColor,
                background:
                  "radial-gradient(circle at 50% 55%, #FFFDF0 0%, #FFE08A 48%, #D97E24 90%)",
                boxShadow: "0 0 32px 8px rgba(255, 214, 115, 0.75)",
              }}
            >
              <div className="w-2 h-4 rounded-full bg-white blur-[1px]" />
            </div>
            <div className="w-5 h-3 rounded-b-full bg-[#3A2818] border-t border-[#D8AE68]" />
          </div>
        ))}

        {/* ===================================================================
            2. DEEP INTERIOR READING PARLOR VISIBLE BEHIND THE DOORS
           =================================================================== */}
        <div
          className="relative w-[388px] h-[640px] rounded-t-[194px] overflow-hidden border-4 flex flex-col justify-between"
          style={{
            borderColor: architecture.trimColor,
            background:
              "radial-gradient(circle at 50% 42%, #FFF7DC 0%, #F7C96E 28%, #9E4B16 66%, #261108 100%)",
            boxShadow: isThrownOpen
              ? "0 0 140px 45px rgba(255, 216, 125, 0.9), inset 0 0 80px rgba(35, 14, 4, 0.75)"
              : "inset 0 0 60px rgba(0, 0, 0, 0.85)",
          }}
        >
          {/* Interior Library Bookshelves in Depth */}
          <div
            className="absolute inset-0 flex flex-col justify-center items-center px-8 pt-24 pb-16 transition-transform duration-700"
            style={{
              transform: isThrownOpen ? "scale(1.04)" : "scale(0.92)",
              background:
                "linear-gradient(180deg, rgba(22, 14, 12, 0.78) 0%, rgba(36, 20, 14, 0.62) 45%, rgba(18, 11, 10, 0.88) 100%)",
            }}
          >
            {/* Background Floor-to-Ceiling Bookshelf Silhouettes */}
            <div
              className="absolute inset-x-6 top-28 bottom-20 opacity-30 pointer-events-none"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(180deg, transparent 0px, transparent 42px, #D8AE68 42px, #D8AE68 45px),
                  repeating-linear-gradient(90deg, rgba(255,220,150,0.18) 0px, rgba(255,220,150,0.18) 12px, rgba(0,0,0,0.5) 12px, rgba(0,0,0,0.5) 16px)
                `,
              }}
            />

            {/* Warm Chandelier / Banker's Lamp Halo inside room */}
            <div
              className="w-64 h-64 rounded-full blur-2xl opacity-80 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 236, 175, 0.9) 0%, rgba(226, 145, 55, 0.35) 55%, transparent 75%)",
              }}
            />

            {/* Preview of the Book Pedestal Waiting Inside */}
            <div className="relative z-10 flex flex-col items-center text-center -mt-44">
              {cover.coverUrl ? (
                <div
                  className="w-28 h-42 rounded shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 overflow-hidden mb-4"
                  style={{ borderColor: architecture.trimColor }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover.coverUrl}
                    alt=""
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-28 h-40 rounded shadow-2xl border-2 flex items-center justify-center p-3 mb-4"
                  style={{
                    borderColor: architecture.trimColor,
                    backgroundColor: architecture.primaryColor,
                  }}
                >
                  <span
                    className="font-serif text-xs font-semibold"
                    style={{ color: architecture.accentColor }}
                  >
                    {book.title}
                  </span>
                </div>
              )}

              <p
                className="font-serif text-lg font-semibold tracking-wide px-4 line-clamp-1"
                style={{ color: "#FFF6E0" }}
              >
                {book.title}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#F3D393]/85 mt-0.5">
                {book.author || "Catalogue Review Edition"}
              </p>
            </div>
          </div>

          {/* Volumetric Golden Light Rays Spilling Through the Opening Doors */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              isThrownOpen ? "opacity-95" : isUnlatched ? "opacity-45" : "opacity-0"
            }`}
            style={{
              background:
                "conic-gradient(from 165deg at 50% 45%, transparent 0deg, rgba(255, 240, 185, 0.55) 20deg, rgba(255, 215, 120, 0.25) 35deg, transparent 55deg)",
              mixBlendMode: "screen",
            }}
          />

          {/* =================================================================
              3. ARCHED LEADED-GLASS FANLIGHT TRANSOM (TOP OF DOORWAY)
             ================================================================= */}
          <div
            className="relative z-20 w-full h-[182px] rounded-t-[190px] border-b-[6px] flex flex-col items-center justify-end pb-4 overflow-hidden shrink-0"
            style={{
              borderColor: architecture.trimColor,
              background:
                "radial-gradient(circle at 50% 100%, rgba(255, 244, 204, 0.92) 0%, rgba(238, 174, 82, 0.78) 58%, rgba(68, 32, 12, 0.92) 100%)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.7), inset 0 0 28px rgba(0,0,0,0.65)",
            }}
          >
            {/* Radial Wrought-Iron Fanlight Glazing Bars */}
            <svg
              viewBox="0 0 388 182"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <path
                d="M194 182 L194 6 M194 182 L65 55 M194 182 L323 55 M194 182 L22 125 M194 182 L366 125"
                stroke="#23140B"
                strokeWidth="3.5"
                opacity="0.82"
              />
              <path
                d="M84 182 A110 110 0 0 1 304 182"
                fill="none"
                stroke="#23140B"
                strokeWidth="3.5"
                opacity="0.82"
              />
              <path
                d="M134 182 A60 60 0 0 1 254 182"
                fill="none"
                stroke="#D8AE68"
                strokeWidth="2"
                opacity="0.85"
              />
            </svg>

            {/* Etched Gold-Leaf House Number & Title Plaque in Fanlight */}
            <div className="relative z-10 px-5 py-1.5 rounded-full bg-[#1C1009]/85 border border-[#F3D393]/80 shadow-lg text-center">
              <span className="block text-[10px] font-mono uppercase tracking-[0.28em] text-[#F3D393]">
                NO. {houseNumber} • LITERARY HOUSE
              </span>
            </div>
          </div>

          {/* =================================================================
              4. TWIN 3D HEAVY PANELLED TIMBER DOORS (THROW OPEN IN 3D)
             ================================================================= */}
          <div
            className="relative z-30 w-full flex-1 flex"
            style={{
              perspective: "1100px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Center Crack of Golden Light When Unlatching */}
            <div
              className={`pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
                isThrownOpen
                  ? "w-24 opacity-0"
                  : isUnlatched
                  ? "w-3 opacity-100"
                  : "w-0.5 opacity-0"
              }`}
              style={{
                background:
                  "linear-gradient(180deg, #FFFDF2, #FFE082, #FFFDF2)",
                boxShadow: "0 0 32px 10px rgba(255, 224, 130, 0.95)",
              }}
            />

            {/* ---------------- LEFT DOOR LEAF ---------------- */}
            <div
              className="relative w-1/2 h-full"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: `rotateY(${leftDoorAngle}deg)`,
                transition: isThrownOpen
                  ? "transform 740ms cubic-bezier(0.16, 1, 0.3, 1)"
                  : "transform 240ms ease-out",
              }}
            >
              {/* Front Exterior Face of Left Door */}
              <div
                className="absolute inset-0 border-y-2 border-l-2 border-r flex flex-col justify-between p-4"
                style={{
                  backgroundColor: architecture.doorWoodColor,
                  backgroundImage: `
                    linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(255,255,255,0.06) 14%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.5) 100%),
                    repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 2px, transparent 2px, transparent 7px)
                  `,
                  borderColor: `${architecture.trimColor}AA`,
                  boxShadow:
                    "inset 0 0 24px rgba(0,0,0,0.85), 10px 0 30px rgba(0,0,0,0.75)",
                }}
              >
                {/* 3 Brass Barrel Hinges on Left Stile */}
                {[52, 210, 368].map((topPx) => (
                  <div
                    key={topPx}
                    className="absolute left-0 w-2.5 h-8 rounded-r-sm border-y border-r"
                    style={{
                      top: `${topPx}px`,
                      backgroundColor: architecture.trimColor,
                      borderColor: "#FFF2C6",
                    }}
                  />
                ))}

                {/* Upper Bevelled Glass & Timber Panel */}
                <div
                  className="w-full h-[185px] rounded-[4px] p-2.5 border-2 relative overflow-hidden"
                  style={{
                    borderColor: `${architecture.trimColor}99`,
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(255,255,255,0.05) 100%)",
                    boxShadow:
                      "inset 2px 2px 6px rgba(0,0,0,0.85), inset -1px -1px 4px rgba(255,225,160,0.2)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-[2px] border relative overflow-hidden flex items-center justify-center"
                    style={{
                      borderColor: `${architecture.trimColor}88`,
                      background:
                        "radial-gradient(circle at 60% 45%, rgba(255, 232, 168, 0.52) 0%, rgba(188, 98, 28, 0.34) 65%, rgba(24, 14, 10, 0.85) 100%)",
                    }}
                  >
                    {/* Ornate wrought-iron grille inside door glass */}
                    <div
                      className="w-10 h-10 rotate-45 border-2"
                      style={{ borderColor: architecture.trimColor }}
                    />
                  </div>
                </div>

                {/* Middle Lock Rail with Brass Ring Knocker & Lever Handle on Right Edge */}
                <div className="relative w-full h-[54px] flex items-center justify-between px-2">
                  {/* Raised Decorative Timber Medallion */}
                  <div
                    className="w-16 h-8 rounded border mx-auto flex items-center justify-center"
                    style={{
                      borderColor: `${architecture.trimColor}66`,
                      backgroundColor: "rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: architecture.trimColor }}
                    />
                  </div>

                  {/* Aged Brass Escutcheon Plate & Turning Handle on Right Stile */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div
                      className="w-4 h-14 rounded-full border flex flex-col items-center justify-between py-2 shadow-md"
                      style={{
                        background:
                          "linear-gradient(180deg, #FFF0BE 0%, #D8AE68 50%, #8C6226 100%)",
                        borderColor: "#FFF6D6",
                      }}
                    >
                      {/* Brass Lever Handle */}
                      <div
                        className="w-8 h-2.5 rounded-full origin-right -ml-5 shadow-lg transition-transform duration-200"
                        style={{
                          background:
                            "linear-gradient(90deg, #FFF5D6, #D8AE68)",
                          transform: `rotateZ(${-handleTurnDeg}deg)`,
                        }}
                      />
                      {/* Keyhole */}
                      <div className="w-1.5 h-3 rounded-full bg-[#1A1008]" />
                    </div>
                  </div>
                </div>

                {/* Lower Heavy Raised Coffer Panel */}
                <div
                  className="w-full h-[155px] rounded-[4px] p-3 border-2"
                  style={{
                    borderColor: `${architecture.trimColor}88`,
                    backgroundColor: "rgba(0,0,0,0.32)",
                    boxShadow:
                      "inset 3px 3px 8px rgba(0,0,0,0.9), inset -2px -2px 5px rgba(255,220,150,0.18)",
                  }}
                >
                  <div
                    className="w-full h-full border rounded-[2px]"
                    style={{
                      borderColor: `${architecture.trimColor}55`,
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.45))",
                    }}
                  />
                </div>
              </div>

              {/* 3D Solid Timber Thickness Edge Slab of Left Door (Visible as it swings open!) */}
              <div
                className="absolute top-0 right-0 h-full w-[26px] border-y border-r flex flex-col items-center justify-center"
                style={{
                  transformOrigin: "right center",
                  transform: "rotateY(90deg)",
                  backgroundColor: architecture.secondaryColor,
                  borderColor: architecture.trimColor,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.8)",
                }}
              >
                {/* Brass Mortise Lock Faceplate & Bolt on the Door Edge */}
                <div
                  className="w-3 h-20 rounded-sm border flex flex-col items-center justify-around py-2"
                  style={{
                    backgroundColor: architecture.trimColor,
                    borderColor: "#FFF2C6",
                  }}
                >
                  <div className="w-1.5 h-3 bg-[#2B1B0E] rounded-xs" />
                  <div className="w-1.5 h-4 bg-[#2B1B0E] rounded-xs" />
                </div>
              </div>
            </div>

            {/* ---------------- RIGHT DOOR LEAF ---------------- */}
            <div
              className="relative w-1/2 h-full"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "right center",
                transform: `rotateY(${rightDoorAngle}deg)`,
                transition: isThrownOpen
                  ? "transform 740ms cubic-bezier(0.16, 1, 0.3, 1)"
                  : "transform 240ms ease-out",
              }}
            >
              {/* Front Exterior Face of Right Door */}
              <div
                className="absolute inset-0 border-y-2 border-r-2 border-l flex flex-col justify-between p-4"
                style={{
                  backgroundColor: architecture.doorWoodColor,
                  backgroundImage: `
                    linear-gradient(270deg, rgba(0,0,0,0.55) 0%, rgba(255,255,255,0.06) 14%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.5) 100%),
                    repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 2px, transparent 2px, transparent 7px)
                  `,
                  borderColor: `${architecture.trimColor}AA`,
                  boxShadow:
                    "inset 0 0 24px rgba(0,0,0,0.85), -10px 0 30px rgba(0,0,0,0.75)",
                }}
              >
                {/* 3 Brass Barrel Hinges on Right Stile */}
                {[52, 210, 368].map((topPx) => (
                  <div
                    key={topPx}
                    className="absolute right-0 w-2.5 h-8 rounded-l-sm border-y border-l"
                    style={{
                      top: `${topPx}px`,
                      backgroundColor: architecture.trimColor,
                      borderColor: "#FFF2C6",
                    }}
                  />
                ))}

                {/* Upper Bevelled Glass & Timber Panel */}
                <div
                  className="w-full h-[185px] rounded-[4px] p-2.5 border-2 relative overflow-hidden"
                  style={{
                    borderColor: `${architecture.trimColor}99`,
                    background:
                      "linear-gradient(225deg, rgba(0,0,0,0.65) 0%, rgba(255,255,255,0.05) 100%)",
                    boxShadow:
                      "inset 2px 2px 6px rgba(0,0,0,0.85), inset -1px -1px 4px rgba(255,225,160,0.2)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-[2px] border relative overflow-hidden flex items-center justify-center"
                    style={{
                      borderColor: `${architecture.trimColor}88`,
                      background:
                        "radial-gradient(circle at 40% 45%, rgba(255, 232, 168, 0.52) 0%, rgba(188, 98, 28, 0.34) 65%, rgba(24, 14, 10, 0.85) 100%)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rotate-45 border-2"
                      style={{ borderColor: architecture.trimColor }}
                    />
                  </div>
                </div>

                {/* Middle Lock Rail with Turning Brass Handle on Left Edge */}
                <div className="relative w-full h-[54px] flex items-center justify-between px-2">
                  {/* Aged Brass Escutcheon Plate & Turning Handle on Left Stile */}
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div
                      className="w-4 h-14 rounded-full border flex flex-col items-center justify-between py-2 shadow-md"
                      style={{
                        background:
                          "linear-gradient(180deg, #FFF0BE 0%, #D8AE68 50%, #8C6226 100%)",
                        borderColor: "#FFF6D6",
                      }}
                    >
                      <div
                        className="w-8 h-2.5 rounded-full origin-left -mr-5 shadow-lg transition-transform duration-200"
                        style={{
                          background:
                            "linear-gradient(270deg, #FFF5D6, #D8AE68)",
                          transform: `rotateZ(${handleTurnDeg}deg)`,
                        }}
                      />
                      <div className="w-1.5 h-3 rounded-full bg-[#1A1008]" />
                    </div>
                  </div>

                  <div
                    className="w-16 h-8 rounded border mx-auto flex items-center justify-center"
                    style={{
                      borderColor: `${architecture.trimColor}66`,
                      backgroundColor: "rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: architecture.trimColor }}
                    />
                  </div>
                </div>

                {/* Lower Heavy Raised Coffer Panel */}
                <div
                  className="w-full h-[155px] rounded-[4px] p-3 border-2"
                  style={{
                    borderColor: `${architecture.trimColor}88`,
                    backgroundColor: "rgba(0,0,0,0.32)",
                    boxShadow:
                      "inset 3px 3px 8px rgba(0,0,0,0.9), inset -2px -2px 5px rgba(255,220,150,0.18)",
                  }}
                >
                  <div
                    className="w-full h-full border rounded-[2px]"
                    style={{
                      borderColor: `${architecture.trimColor}55`,
                      background:
                        "linear-gradient(215deg, rgba(255,255,255,0.05), rgba(0,0,0,0.45))",
                    }}
                  />
                </div>
              </div>

              {/* 3D Solid Timber Thickness Edge Slab of Right Door */}
              <div
                className="absolute top-0 left-0 h-full w-[26px] border-y border-l flex flex-col items-center justify-center"
                style={{
                  transformOrigin: "left center",
                  transform: "rotateY(-90deg)",
                  backgroundColor: architecture.secondaryColor,
                  borderColor: architecture.trimColor,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.8)",
                }}
              >
                <div
                  className="w-3 h-20 rounded-sm border"
                  style={{
                    backgroundColor: architecture.trimColor,
                    borderColor: "#FFF2C6",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stone Threshold & Warm Floor Spill Reflection */}
          <div
            className="relative z-20 w-full h-[22px] border-t-2"
            style={{
              borderColor: architecture.trimColor,
              background:
                "linear-gradient(180deg, #473E4F 0%, #241F2C 100%)",
              boxShadow: isThrownOpen
                ? "0 -12px 40px rgba(255, 220, 130, 0.85)"
                : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}

