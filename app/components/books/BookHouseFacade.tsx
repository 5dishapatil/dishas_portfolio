"use client";

import React, { useState } from "react";
import type { BookCatalogItem } from "./types";
import {
  ARCHETYPES,
  ArchetypeBadgeIcon,
  HouseArchetypeId,
} from "./archetypeStyles";
import ArchetypeRoofCrown from "./archetypeRoofs";
import ArchetypeGroundProps from "./ArchetypeGroundProps";
import { classifyBookArchetype } from "./catalogMapper";

interface BookHouseFacadeProps {
  book: BookCatalogItem;
  isSelected: boolean;
  isDoorOpen: boolean;
  isEntering: boolean;
  isNearestToTraveller: boolean;
  onSelect: (book: BookCatalogItem) => void;
}

/** Decorative architectural side window pair flanking the main book cover */
function FlankingWindows({
  archetypeId,
  trimColor,
  windowGlowColor,
  isHighlighted,
}: {
  archetypeId: HouseArchetypeId;
  trimColor: string;
  windowGlowColor: string;
  isHighlighted: boolean;
}) {
  const isGothic = archetypeId === "fantasy" || archetypeId === "mystery" || archetypeId === "dark-academia";
  const isClassical = archetypeId === "finance-business" || archetypeId === "self-help";

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Upper Window */}
      <div className="flex flex-col items-center">
        <div
          className={`w-[44px] h-[72px] ${
            isGothic ? "rounded-t-full" : isClassical ? "rounded-t-[6px]" : "rounded-t-[12px]"
          } border relative overflow-hidden transition-all duration-500`}
          style={{
            borderColor: trimColor,
            background: `radial-gradient(circle at 50% 65%, #FFF6DF 0%, ${windowGlowColor} 55%, #A85A18 100%)`,
            boxShadow: isHighlighted
              ? `0 0 18px ${windowGlowColor}BB`
              : `0 0 8px ${windowGlowColor}44`,
          }}
        >
          {/* Subtle interior book spines silhouette */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-[#21140E]/30" />
          {/* Window Mullions */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#1A100A]/85" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#1A100A]/85" />
          <div className="absolute inset-x-0 top-[26%] h-[1px] bg-[#1A100A]/70" />
        </div>
        {/* Stone Window Sill */}
        <div
          className="w-[50px] h-[5px] rounded-[1px] shadow-sm"
          style={{ backgroundColor: trimColor }}
        />
      </div>

      {/* Lower Window */}
      <div className="flex flex-col items-center">
        <div
          className="w-[44px] h-[58px] rounded-t-[4px] border relative overflow-hidden transition-all duration-500"
          style={{
            borderColor: `${trimColor}CC`,
            background: `radial-gradient(circle at 50% 60%, #FFF3D6 0%, ${windowGlowColor} 60%, #8A4612 100%)`,
            boxShadow: isHighlighted
              ? `0 0 14px ${windowGlowColor}99`
              : `0 0 6px ${windowGlowColor}33`,
          }}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#1A100A]/80" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#1A100A]/80" />
        </div>
        <div
          className="w-[50px] h-[4px] rounded-[1px]"
          style={{ backgroundColor: trimColor }}
        />
      </div>
    </div>
  );
}

export default function BookHouseFacade({
  book,
  isSelected,
  isDoorOpen,
  isEntering,
  isNearestToTraveller,
  onSelect,
}: BookHouseFacadeProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Identify archetype configuration (either from book.archetypeId or classified)
  const archetypeId = (book.archetypeId as HouseArchetypeId) || classifyBookArchetype(book);
  const config = ARCHETYPES[archetypeId] || ARCHETYPES["fantasy"];

  const { architecture, cover } = book;
  const activeCoverUrl =
    !imgFailed && (cover.coverMediumUrl || cover.coverUrl)
      ? cover.coverMediumUrl || cover.coverUrl
      : null;

  const isHighlighted = isSelected || isHovered || isNearestToTraveller;
  const houseNumber = String(book.streetOrder).padStart(2, "0");

  return (
    <div
      className="relative flex flex-col items-center select-none group shrink-0"
      style={{
        width: `${architecture.widthPx || 380}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. TOP STYLE BADGE (From Reference Image: e.g. "01 ROMANCE", "02 FANTASY", etc.) */}
      <div
        className={`mb-2 px-3 py-1 rounded-full flex items-center gap-2 border transition-all duration-300 backdrop-blur-md shadow-lg ${
          isSelected
            ? "border-[#FFE59E] scale-105 shadow-[0_0_24px_rgba(255,229,158,0.55)]"
            : isHighlighted
            ? "border-white/40 scale-102"
            : "border-white/20 opacity-90"
        }`}
        style={{
          background: config.badgeBg,
          borderColor: isSelected ? config.accentColor : config.badgeBorder,
        }}
      >
        <span
          className="w-4 h-4 flex items-center justify-center shrink-0"
          style={{ color: config.badgeBorder }}
        >
          <ArchetypeBadgeIcon archetypeId={archetypeId} className="w-3.5 h-3.5" />
        </span>
        <span
          className="text-[11px] font-serif font-bold tracking-[0.18em] uppercase"
          style={{ color: config.badgeText }}
        >
          {config.number} {config.name}
        </span>
        <span className="text-[10px] opacity-60 text-white font-mono">
          • No. {houseNumber}
        </span>
        {book.recordStatus === "needs-review" && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
            title="Flagged for catalogue review"
          />
        )}
      </div>

      {/* 2. INTERACTIVE BOOK-SPINE TOWNHOUSE BUTTON */}
      <button
        type="button"
        onClick={() => onSelect(book)}
        aria-label={`Enter House ${config.number}: ${book.title}${
          book.author ? ` by ${book.author}` : ""
        }`}
        className={`relative w-full text-left transition-transform duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3D393] ${
          isSelected ? "z-20 -translate-y-2" : "hover:-translate-y-1.5"
        }`}
        style={{
          height: `${architecture.heightPx || 580}px`,
        }}
      >
        {/* A. ARCHITECTURAL ROOF CROWN */}
        <div className="relative w-full z-10">
          <ArchetypeRoofCrown
            archetypeId={archetypeId}
            primaryColor={config.primaryColor}
            secondaryColor={config.secondaryColor}
            trimColor={config.trimColor}
            accentColor={config.accentColor}
            roofSlateColor={config.roofSlateColor}
            windowGlowColor={config.windowGlowColor}
          />
        </div>

        {/* B. MAIN UP-RIGHT FACADE BODY (380px wide) */}
        <div
          className="relative w-full flex-1 flex flex-col justify-between overflow-hidden rounded-t-[4px] border-x-2 border-t transition-all duration-500"
          style={{
            height: `${(architecture.heightPx || 580) - 96}px`,
            background: `linear-gradient(90deg, 
              ${config.secondaryColor} 0%, 
              ${config.primaryColor} 14%, 
              ${config.primaryColor} 86%, 
              ${config.secondaryColor} 100%)`,
            borderColor: isSelected
              ? config.accentColor
              : `${config.trimColor}99`,
            boxShadow: isSelected
              ? `0 0 50px ${config.windowGlowColor}55, inset 0 0 35px rgba(0,0,0,0.65)`
              : isHighlighted
              ? `0 16px 40px rgba(0,0,0,0.75), 0 0 28px ${config.windowGlowColor}33, inset 0 0 28px rgba(0,0,0,0.6)`
              : "0 12px 30px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.7)",
          }}
        >
          {/* Architectural Pilasters / Rustication Lines along left and right building margins */}
          <div
            className="pointer-events-none absolute inset-y-0 left-[14px] w-[3px] opacity-45"
            style={{
              background: `linear-gradient(180deg, ${config.trimColor}, transparent, ${config.trimColor})`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-[14px] w-[3px] opacity-45"
            style={{
              background: `linear-gradient(180deg, ${config.trimColor}, transparent, ${config.trimColor})`,
            }}
          />

          {/* Upper Cornice Belt */}
          <div
            className="w-full h-[8px] border-y shrink-0"
            style={{
              background: `linear-gradient(90deg, ${config.secondaryColor}, ${config.trimColor}88, ${config.secondaryColor})`,
              borderColor: `${config.trimColor}BB`,
              boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
            }}
          />

          {/* SECTION 1: EMBOSSED TITLE & AUTHOR CARTOUCHE PLAQUE */}
          <div className="relative px-5 pt-2 pb-1.5 z-10">
            <div
              className="relative rounded-[5px] px-3.5 py-2.5 border text-center"
              style={{
                background: `linear-gradient(180deg, ${config.secondaryColor}F0 0%, #0A0B14E6 100%)`,
                borderColor: `${config.trimColor}CC`,
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.7), 0 3px 8px rgba(0,0,0,0.45)",
              }}
            >
              {book.series && (
                <div
                  className="text-[9.5px] uppercase tracking-[0.18em] line-clamp-1 mb-0.5 font-medium"
                  style={{ color: config.trimColor }}
                >
                  {book.series}
                </div>
              )}

              <h3
                className="font-serif font-bold leading-[1.22] tracking-wide line-clamp-2 text-[14.5px] sm:text-[15.5px]"
                style={{
                  color: config.accentColor,
                  textShadow: "0 2px 5px rgba(0,0,0,0.95)",
                }}
                title={book.title}
              >
                {book.title}
              </h3>

              <div className="mt-1 flex items-center justify-center gap-2">
                <span
                  className="h-[1px] w-4 opacity-60"
                  style={{ backgroundColor: config.trimColor }}
                />
                <p
                  className="text-[11px] tracking-[0.1em] uppercase line-clamp-1 font-serif font-medium"
                  style={{
                    color: book.author ? "#F5EFE6" : "#FBBF24",
                  }}
                >
                  {book.author || "Author Unlisted"}
                </p>
                <span
                  className="h-[1px] w-4 opacity-60"
                  style={{ backgroundColor: config.trimColor }}
                />
              </div>
            </div>
          </div>

          {/* Middle Cornice Belt */}
          <div
            className="w-full h-[6px] border-y shrink-0"
            style={{
              background: `linear-gradient(90deg, ${config.secondaryColor}, ${config.trimColor}66, ${config.secondaryColor})`,
              borderColor: `${config.trimColor}99`,
            }}
          />

          {/* SECTION 2: PROMINENT 2:3 PORTRAIT BOOK COVER & FLANKING ARCHITECTURAL WINDOWS */}
          <div className="relative px-4 py-2 flex items-center justify-between gap-3 z-10">
            {/* Left Windows */}
            <FlankingWindows
              archetypeId={archetypeId}
              trimColor={config.trimColor}
              windowGlowColor={config.windowGlowColor}
              isHighlighted={isHighlighted}
            />

            {/* Central Dedicated 2:3 Portrait Book Gallery Frame (~170px × 255px) */}
            <div
              className="relative w-[172px] h-[252px] rounded-[6px] p-[5px] border shadow-2xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-102 transition-transform duration-500"
              style={{
                borderColor: config.trimColor,
                background: `linear-gradient(180deg, ${config.trimColor}55, ${config.secondaryColor})`,
                boxShadow: isHighlighted
                  ? `0 10px 28px rgba(0,0,0,0.85), 0 0 20px ${config.accentColor}44`
                  : "0 8px 22px rgba(0,0,0,0.8)",
              }}
            >
              {/* Outer Gilded Chamfer Border */}
              <div
                className="pointer-events-none absolute inset-[2px] rounded-[4px] border opacity-60"
                style={{ borderColor: config.accentColor }}
              />

              {activeCoverUrl ? (
                <div className="relative w-full h-full rounded-[3px] overflow-hidden bg-[#0D0F18] shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCoverUrl}
                    alt={`Cover artwork for ${book.title}`}
                    loading={book.streetOrder <= 8 ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover object-center filter contrast-105 saturate-105 transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle gallery lighting highlight */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(0,0,0,0.4) 100%)",
                      boxShadow: "inset 0 0 12px rgba(0,0,0,0.7)",
                    }}
                  />
                </div>
              ) : (
                /* Fallback architectural medallion if cover is missing */
                <div
                  className="w-full h-full rounded-[3px] flex flex-col items-center justify-between p-3 text-center"
                  style={{
                    background: `linear-gradient(180deg, ${config.primaryColor}, ${config.secondaryColor})`,
                  }}
                >
                  <span
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ color: config.accentColor }}
                  >
                    <ArchetypeBadgeIcon archetypeId={archetypeId} className="w-7 h-7" />
                  </span>
                  <div className="font-serif text-[13px] font-bold text-white leading-tight">
                    {book.title}
                  </div>
                  <div className="text-[10px] text-white/70 uppercase font-mono">
                    {book.author || "Folio Edition"}
                  </div>
                </div>
              )}
            </div>

            {/* Right Windows */}
            <FlankingWindows
              archetypeId={archetypeId}
              trimColor={config.trimColor}
              windowGlowColor={config.windowGlowColor}
              isHighlighted={isHighlighted}
            />
          </div>

          {/* Lower Cornice Belt */}
          <div
            className="w-full h-[6px] border-y shrink-0"
            style={{
              background: `linear-gradient(90deg, ${config.secondaryColor}, ${config.trimColor}77, ${config.secondaryColor})`,
              borderColor: `${config.trimColor}AA`,
            }}
          />

          {/* SECTION 3: GROUND FLOOR ENTRANCE, 3D DOUBLE DOORS, LANTERNS & GROUND PROPS */}
          <div className="relative px-6 pt-1 pb-0 flex items-end justify-between z-10">
            {/* Left: Archetype Ground Prop (Bistro table, Stone Urns, Lions, Astrolabe, etc.) */}
            <div className="relative w-20 h-16 flex items-end">
              <ArchetypeGroundProps
                archetypeId={archetypeId}
                trimColor={config.trimColor}
                accentColor={config.accentColor}
              />
            </div>

            {/* Center: Interactive 3D Hinged Double Doorway */}
            <div className="relative flex flex-col items-center pb-0">
              {/* Left & Right Carriage Lanterns */}
              <div
                className={`w-3 h-4 rounded-full absolute -left-4 top-7 transition-all duration-300 ${
                  isHighlighted ? "scale-110" : "opacity-85"
                }`}
                style={{
                  backgroundColor: "#FFF4CE",
                  boxShadow: isHighlighted
                    ? "0 0 18px 6px rgba(255, 226, 140, 0.9)"
                    : "0 0 10px 2px rgba(255, 218, 120, 0.5)",
                }}
              />
              <div
                className={`w-3 h-4 rounded-full absolute -right-4 top-7 transition-all duration-300 ${
                  isHighlighted ? "scale-110" : "opacity-85"
                }`}
                style={{
                  backgroundColor: "#FFF4CE",
                  boxShadow: isHighlighted
                    ? "0 0 18px 6px rgba(255, 226, 140, 0.9)"
                    : "0 0 10px 2px rgba(255, 218, 120, 0.5)",
                }}
              />

              {/* Stone & Brass Portal Surround with Fanlight */}
              <div
                className="relative w-[88px] h-[106px] rounded-t-[44px] p-[4px] pb-0 flex flex-col"
                style={{
                  background: `linear-gradient(180deg, ${config.trimColor}, ${config.secondaryColor})`,
                  boxShadow: "0 -2px 14px rgba(0,0,0,0.6)",
                }}
              >
                {/* Arched Fanlight Transom showing House Number */}
                <div
                  className="w-full h-[24px] rounded-t-[40px] border-b flex items-center justify-center relative overflow-hidden"
                  style={{
                    borderColor: config.trimColor,
                    background:
                      "radial-gradient(circle at 50% 100%, #FFF5D1 0%, #F3B95F 75%, #8C4A15 100%)",
                  }}
                >
                  <span className="text-[10px] font-serif font-bold tracking-widest text-[#231208] z-10">
                    {houseNumber}
                  </span>
                </div>

                {/* Doorway Threshold & Twin 3D Hinged Double Doors */}
                <div
                  className="relative w-full flex-1 overflow-visible flex"
                  style={{ perspective: "480px" }}
                >
                  {/* Warm Glowing Interior Library visible when doors open */}
                  <div
                    className="absolute inset-0 overflow-hidden flex flex-col justify-between p-1.5"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 45%, #FFF8DE 0%, #FFD27D 45%, #B85B14 85%, #4A1C07 100%)",
                      boxShadow: isDoorOpen
                        ? "0 0 42px 16px rgba(255, 220, 135, 0.95)"
                        : "inset 0 0 10px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="w-full h-1 bg-[#59250C]/35 rounded-full" />
                    <div className="w-4/5 h-1 bg-[#59250C]/35 rounded-full mx-auto" />
                    <div className="w-full h-1 bg-[#59250C]/35 rounded-full" />
                    <div
                      className={`transition-opacity duration-500 ${
                        isDoorOpen || isEntering ? "opacity-100" : "opacity-0"
                      } absolute inset-0 bg-gradient-to-t from-[#FFF4CC] via-[#FFE08C]/65 to-transparent`}
                    />
                  </div>

                  {/* LEFT DOOR LEAF */}
                  <div
                    className="relative w-1/2 h-full border-y border-l border-r-[0.5px] flex flex-col justify-between p-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      backgroundColor: config.doorWoodColor,
                      borderColor: `${config.trimColor}BB`,
                      transformOrigin: "left center",
                      transform: isDoorOpen
                        ? "rotateY(100deg)"
                        : isHighlighted
                        ? "rotateY(10deg)"
                        : "rotateY(0deg)",
                      boxShadow: isDoorOpen
                        ? "6px 0 18px rgba(0,0,0,0.7)"
                        : "inset 0 0 6px rgba(0,0,0,0.65)",
                    }}
                  >
                    <div
                      className="w-full h-[26px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${config.trimColor}99`,
                        background:
                          "linear-gradient(180deg, rgba(255,232,163,0.45), rgba(214,132,48,0.25))",
                      }}
                    />
                    <div className="w-full flex items-center justify-end pr-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: config.accentColor,
                          boxShadow: "0 0 4px rgba(255,215,128,0.8)",
                        }}
                      />
                    </div>
                    <div
                      className="w-full h-[24px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${config.trimColor}77`,
                        backgroundColor: "rgba(0,0,0,0.28)",
                      }}
                    />
                  </div>

                  {/* RIGHT DOOR LEAF */}
                  <div
                    className="relative w-1/2 h-full border-y border-r border-l-[0.5px] flex flex-col justify-between p-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      backgroundColor: config.doorWoodColor,
                      borderColor: `${config.trimColor}BB`,
                      transformOrigin: "right center",
                      transform: isDoorOpen
                        ? "rotateY(-100deg)"
                        : isHighlighted
                        ? "rotateY(-10deg)"
                        : "rotateY(0deg)",
                      boxShadow: isDoorOpen
                        ? "-6px 0 18px rgba(0,0,0,0.7)"
                        : "inset 0 0 6px rgba(0,0,0,0.65)",
                    }}
                  >
                    <div
                      className="w-full h-[26px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${config.trimColor}99`,
                        background:
                          "linear-gradient(180deg, rgba(255,232,163,0.45), rgba(214,132,48,0.25))",
                      }}
                    />
                    <div className="w-full flex items-center justify-start pl-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: config.accentColor,
                          boxShadow: "0 0 4px rgba(255,215,128,0.8)",
                        }}
                      />
                    </div>
                    <div
                      className="w-full h-[24px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${config.trimColor}77`,
                        backgroundColor: "rgba(0,0,0,0.28)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Stone Steps */}
              <div
                className="w-[98px] h-[5px] border-t"
                style={{
                  backgroundColor: "#2C2B38",
                  borderColor: `${config.trimColor}88`,
                }}
              />
              <div
                className="w-[108px] h-[5px] border-t"
                style={{
                  backgroundColor: "#1F1E29",
                  borderColor: `${config.trimColor}66`,
                }}
              />
            </div>

            {/* Right: Brass Edition Plaque */}
            <div className="pb-3 flex flex-col items-end">
              <div
                className="px-2 py-1 rounded-[3px] border text-[9.5px] uppercase tracking-[0.14em] font-mono shadow-md"
                style={{
                  borderColor:
                    book.recordStatus === "needs-review"
                      ? "#F59E0B"
                      : `${config.trimColor}AA`,
                  backgroundColor: "#0D0E17DD",
                  color:
                    book.recordStatus === "needs-review"
                      ? "#FCD34D"
                      : config.accentColor,
                }}
              >
                {book.recordStatus === "needs-review"
                  ? "Verify Ed."
                  : cover.firstPublishYear
                  ? `Ed. ${cover.firstPublishYear}`
                  : "Folio Ed."}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
