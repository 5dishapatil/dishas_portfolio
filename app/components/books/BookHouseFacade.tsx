"use client";

import React, { useState } from "react";
import type { BookCatalogItem } from "./types";

interface BookHouseFacadeProps {
  book: BookCatalogItem;
  isSelected: boolean;
  isDoorOpen: boolean;
  isEntering: boolean;
  isNearestToTraveller: boolean;
  onSelect: (book: BookCatalogItem) => void;
}

function OrnamentCrest({
  style,
  color,
}: {
  style: BookCatalogItem["architecture"]["ornamentStyle"];
  color: string;
}) {
  switch (style) {
    case "celestial":
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <circle cx="40" cy="40" r="32" stroke={color} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.75" />
          <circle cx="40" cy="40" r="23" stroke={color} strokeWidth="1" opacity="0.55" />
          <path
            d="M40 10L44 32L66 36L44 40L40 62L36 40L14 36L36 32L40 10Z"
            stroke={color}
            strokeWidth="1.3"
            fill={color}
            fillOpacity="0.16"
          />
          <path
            d="M52 22A14 14 0 1 0 52 58A11 11 0 1 1 52 22Z"
            fill={color}
            fillOpacity="0.28"
          />
        </svg>
      );
    case "gothic-tracery":
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <path
            d="M16 68V36C16 20 40 10 40 10C40 10 64 20 64 36V68H16Z"
            stroke={color}
            strokeWidth="1.4"
            fill={color}
            fillOpacity="0.12"
          />
          <circle cx="40" cy="34" r="12" stroke={color} strokeWidth="1.2" />
          <circle cx="40" cy="34" r="5" stroke={color} strokeWidth="1" />
          <path d="M28 68V44C28 37 40 32 40 32C40 32 52 37 52 44V68" stroke={color} strokeWidth="1.1" opacity="0.8" />
          <path d="M40 22V68" stroke={color} strokeWidth="1" opacity="0.65" />
        </svg>
      );
    case "botanical":
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <circle cx="40" cy="40" r="30" stroke={color} strokeWidth="1.2" opacity="0.7" />
          <path
            d="M40 64V18M40 28C30 24 24 30 28 38C32 42 40 38 40 38M40 36C50 32 56 38 52 46C48 50 40 46 40 46M40 22C34 15 46 15 40 22Z"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="40" cy="20" r="3.5" fill={color} fillOpacity="0.45" />
        </svg>
      );
    case "art-deco":
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <rect x="16" y="16" width="48" height="48" transform="rotate(45 40 40)" stroke={color} strokeWidth="1.2" opacity="0.75" />
          <rect x="20" y="20" width="40" height="40" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.12" />
          <path d="M40 12V68M12 40H68M24 24L56 56M56 24L24 56" stroke={color} strokeWidth="0.9" opacity="0.65" />
          <circle cx="40" cy="40" r="8" fill={color} fillOpacity="0.28" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    case "heraldic-crest":
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <path
            d="M20 16H60V40C60 54 40 66 40 66C40 66 20 54 20 40V16Z"
            stroke={color}
            strokeWidth="1.5"
            fill={color}
            fillOpacity="0.14"
          />
          <path d="M28 16L40 8L52 16" stroke={color} strokeWidth="1.3" />
          <path d="M40 16V64M20 38H60" stroke={color} strokeWidth="1" opacity="0.7" />
          <circle cx="40" cy="38" r="6" fill={color} fillOpacity="0.35" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
          <circle cx="40" cy="40" r="29" stroke={color} strokeWidth="1.3" opacity="0.8" />
          <circle cx="40" cy="40" r="22" stroke={color} strokeWidth="0.9" strokeDasharray="3 2" opacity="0.6" />
          <path d="M25 40H55M40 25V55" stroke={color} strokeWidth="1.2" />
          <circle cx="40" cy="40" r="5" fill={color} fillOpacity="0.4" />
        </svg>
      );
  }
}

function RoofCrown({
  style,
  slateColor,
  trimColor,
  primaryColor,
}: {
  style: BookCatalogItem["architecture"]["roofStyle"];
  slateColor: string;
  trimColor: string;
  primaryColor: string;
}) {
  switch (style) {
    case "gable-steep":
      return (
        <svg viewBox="0 0 240 66" className="w-full h-[58px] block overflow-visible" preserveAspectRatio="none">
          {/* Chimney */}
          <rect x="34" y="10" width="18" height="36" fill={slateColor} stroke={trimColor} strokeWidth="1" strokeOpacity="0.45" />
          <rect x="31" y="7" width="24" height="5" rx="1" fill={trimColor} fillOpacity="0.65" />
          {/* Steep Gable Pediment */}
          <polygon
            points="4,65 120,6 236,65"
            fill={slateColor}
            stroke={trimColor}
            strokeWidth="1.8"
          />
          <polygon
            points="22,65 120,16 218,65"
            fill={primaryColor}
            stroke={trimColor}
            strokeWidth="1"
            strokeOpacity="0.65"
          />
          {/* Attic roundel window */}
          <circle cx="120" cy="44" r="10" fill="#FFE39F" fillOpacity="0.85" stroke={trimColor} strokeWidth="1.5" />
          <path d="M110 44H130M120 34V54" stroke={slateColor} strokeWidth="1.2" />
          {/* Finial */}
          <path d="M120 0V8M116 4H124" stroke={trimColor} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "stepped-flemish":
      return (
        <svg viewBox="0 0 240 66" className="w-full h-[58px] block overflow-visible" preserveAspectRatio="none">
          <path
            d="M6 65V50H32V38H58V26H86V14H154V26H182V38H208V50H234V65Z"
            fill={slateColor}
            stroke={trimColor}
            strokeWidth="1.6"
          />
          <path
            d="M22 65V54H48V42H76V30H164V42H192V54H218V65Z"
            fill={primaryColor}
            stroke={trimColor}
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          {/* Arched dormer */}
          <path d="M108 58V40C108 33 132 33 132 40V58Z" fill="#FFE39F" fillOpacity="0.82" stroke={trimColor} strokeWidth="1.4" />
          <path d="M120 34V58M108 46H132" stroke={slateColor} strokeWidth="1.1" />
        </svg>
      );
    case "arched-cornice":
      return (
        <svg viewBox="0 0 240 66" className="w-full h-[58px] block overflow-visible" preserveAspectRatio="none">
          <rect x="184" y="10" width="16" height="36" fill={slateColor} stroke={trimColor} strokeWidth="1" strokeOpacity="0.5" />
          <path
            d="M4 65V38C4 38 56 8 120 8C184 8 236 38 236 38V65Z"
            fill={slateColor}
            stroke={trimColor}
            strokeWidth="1.8"
          />
          <path
            d="M18 65V44C18 44 62 18 120 18C178 18 222 44 222 44V65Z"
            fill={primaryColor}
            stroke={trimColor}
            strokeWidth="1"
            strokeOpacity="0.65"
          />
          <circle cx="120" cy="42" r="11" fill="#FFE39F" fillOpacity="0.82" stroke={trimColor} strokeWidth="1.4" />
          <path d="M109 42H131M120 31V53" stroke={slateColor} strokeWidth="1.1" />
        </svg>
      );
    case "turret-crest":
      return (
        <svg viewBox="0 0 240 66" className="w-full h-[58px] block overflow-visible" preserveAspectRatio="none">
          <polygon points="8,65 28,22 212,22 232,65" fill={slateColor} stroke={trimColor} strokeWidth="1.5" />
          <polygon points="76,65 120,4 164,65" fill={primaryColor} stroke={trimColor} strokeWidth="1.6" />
          <circle cx="120" cy="43" r="9" fill="#FFE39F" fillOpacity="0.88" stroke={trimColor} strokeWidth="1.4" />
          <path d="M120 0V6" stroke={trimColor} strokeWidth="1.8" />
        </svg>
      );
    default:
      // mansard-dormer
      return (
        <svg viewBox="0 0 240 66" className="w-full h-[58px] block overflow-visible" preserveAspectRatio="none">
          <rect x="40" y="8" width="16" height="32" fill={slateColor} stroke={trimColor} strokeWidth="1" strokeOpacity="0.45" />
          <polygon points="6,65 26,18 214,18 234,65" fill={slateColor} stroke={trimColor} strokeWidth="1.6" />
          <line x1="26" y1="24" x2="214" y2="24" stroke={trimColor} strokeWidth="1" strokeOpacity="0.6" />
          {/* Twin dormers */}
          <path d="M62 62V36L76 26L90 36V62Z" fill={primaryColor} stroke={trimColor} strokeWidth="1.2" />
          <rect x="69" y="40" width="14" height="16" fill="#FFE39F" fillOpacity="0.82" />
          <path d="M150 62V36L164 26L178 36V62Z" fill={primaryColor} stroke={trimColor} strokeWidth="1.2" />
          <rect x="157" y="40" width="14" height="16" fill="#FFE39F" fillOpacity="0.82" />
        </svg>
      );
  }
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
        width: `${architecture.widthPx}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Street Address / Status Pill on Hover or Active */}
      <div
        className={`mb-2 px-2.5 py-0.5 rounded-full text-[10px] tracking-[0.18em] uppercase font-medium transition-all duration-300 border backdrop-blur-md ${
          isSelected
            ? "bg-[#F3D393]/25 border-[#F3D393] text-[#FFF4D4] opacity-100 -translate-y-0.5 shadow-[0_0_18px_rgba(243,211,147,0.45)]"
            : isHighlighted
            ? "bg-[#121629]/85 border-[#D8AE68]/60 text-[#F3D393] opacity-100"
            : "bg-[#0D1021]/60 border-white/10 text-white/55 opacity-70"
        }`}
      >
        <span>No. {houseNumber}</span>
        {book.recordStatus === "needs-review" && (
          <span
            className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-400 align-middle"
            title="Flagged for review in catalogue report"
          />
        )}
      </div>

      {/* Interactive Book-Spine Townhouse Button */}
      <button
        type="button"
        onClick={() => onSelect(book)}
        aria-label={`Enter House No. ${houseNumber}: ${book.title}${
          book.author ? ` by ${book.author}` : " (author unlisted)"
        }`}
        className={`relative w-full text-left transition-transform duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3D393] ${
          isSelected
            ? "z-20 -translate-y-1.5"
            : "hover:-translate-y-1"
        }`}
        style={{
          height: `${architecture.heightPx}px`,
        }}
      >
        {/* 1. Architectural Roofline / Crown */}
        <div className="relative w-full z-10">
          <RoofCrown
            style={architecture.roofStyle}
            slateColor={architecture.roofSlateColor}
            trimColor={architecture.trimColor}
            primaryColor={architecture.primaryColor}
          />

          {/* Draped Silk Bookmark Ribbon hanging from upper cornice */}
          <div
            className="absolute top-[46px] right-4 w-3.5 h-12 z-20 pointer-events-none transition-transform duration-500 origin-top group-hover:rotate-3"
            style={{
              backgroundColor: architecture.ribbonColor,
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.45)",
            }}
          />
        </div>

        {/* 2. Main Upright Book-Spine Façade Body */}
        <div
          className="relative w-full flex-1 flex flex-col justify-between overflow-hidden rounded-t-[3px] border-x-2 border-t transition-shadow duration-500"
          style={{
            height: `${architecture.heightPx - 58}px`,
            background: `linear-gradient(90deg, 
              ${architecture.secondaryColor} 0%, 
              ${architecture.primaryColor} 12%, 
              ${architecture.primaryColor} 88%, 
              ${architecture.secondaryColor} 100%)`,
            borderColor: isSelected
              ? architecture.accentColor
              : `${architecture.trimColor}88`,
            boxShadow: isSelected
              ? `0 0 42px ${architecture.windowGlowColor}44, inset 0 0 28px rgba(0,0,0,0.65)`
              : isHighlighted
              ? `0 12px 32px rgba(0,0,0,0.7), 0 0 22px ${architecture.windowGlowColor}26, inset 0 0 24px rgba(0,0,0,0.65)`
              : "0 10px 26px rgba(0,0,0,0.75), inset 0 0 26px rgba(0,0,0,0.7)",
          }}
        >
          {/* Bookbinding French-joint vertical grooves on left and right spine margins */}
          <div
            className="pointer-events-none absolute inset-y-0 left-[10px] w-[2px] opacity-45"
            style={{
              background: `linear-gradient(180deg, transparent, ${architecture.trimColor}, transparent)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-[10px] w-[2px] opacity-45"
            style={{
              background: `linear-gradient(180deg, transparent, ${architecture.trimColor}, transparent)`,
            }}
          />

          {/* Subtle gold-tooled inner border frame */}
          <div
            className="pointer-events-none absolute inset-x-[15px] top-2 bottom-0 border-x border-t opacity-30"
            style={{ borderColor: architecture.trimColor }}
          />

          {/* Raised Horizontal Spine Hubs (Architectural Cornice Bands) */}
          <div
            className="w-full h-[7px] border-y shrink-0"
            style={{
              background: `linear-gradient(90deg, ${architecture.secondaryColor}, ${architecture.trimColor}66, ${architecture.secondaryColor})`,
              borderColor: `${architecture.trimColor}99`,
              boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
            }}
          />

          {/* SECTION A: Embossed Spine Title & Author Cartouche */}
          <div className="relative px-4 pt-2 pb-1.5 z-10">
            <div
              className="relative rounded-[4px] px-2.5 py-2 border text-center"
              style={{
                background: `linear-gradient(180deg, ${architecture.secondaryColor}E6 0%, #0B0B12D9 100%)`,
                borderColor: `${architecture.trimColor}AA`,
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.6)",
              }}
            >
              {book.series && (
                <div
                  className="text-[9px] uppercase tracking-[0.16em] line-clamp-1 mb-0.5 font-medium"
                  style={{ color: architecture.trimColor }}
                >
                  {book.series}
                </div>
              )}

              <h3
                className="font-serif font-semibold leading-[1.18] tracking-wide line-clamp-2 text-[13.5px] sm:text-[14px]"
                style={{
                  color: architecture.accentColor,
                  textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                }}
                title={book.title}
              >
                {book.title}
              </h3>

              <div className="mt-1 flex items-center justify-center gap-1.5">
                <span
                  className="h-[1px] w-3 opacity-50"
                  style={{ backgroundColor: architecture.trimColor }}
                />
                <p
                  className="text-[10.5px] tracking-[0.08em] uppercase line-clamp-1 font-medium"
                  style={{
                    color: book.author ? "#E8DFD1" : "#FBBF24",
                  }}
                >
                  {book.author || "Author Unlisted"}
                </p>
                <span
                  className="h-[1px] w-3 opacity-50"
                  style={{ backgroundColor: architecture.trimColor }}
                />
              </div>
            </div>
          </div>

          {/* Raised Spine Hub #2 */}
          <div
            className="w-full h-[6px] border-y shrink-0"
            style={{
              background: `linear-gradient(90deg, ${architecture.secondaryColor}, ${architecture.trimColor}55, ${architecture.secondaryColor})`,
              borderColor: `${architecture.trimColor}88`,
            }}
          />

          {/* SECTION B: Cover-Inspired Architectural Rose Medallion & Flanking Casement Windows */}
          <div className="relative px-4 py-1.5 flex items-center justify-between gap-2 z-10">
            {/* Left Arched Casement Window */}
            <div className="flex flex-col items-center">
              <div
                className="w-[32px] h-[54px] rounded-t-full border relative overflow-hidden transition-all duration-500"
                style={{
                  borderColor: architecture.trimColor,
                  background: `radial-gradient(circle at 50% 60%, ${architecture.windowGlowColor} 0%, #D9822B 72%, #5C2C0C 100%)`,
                  boxShadow: isHighlighted
                    ? `0 0 16px ${architecture.windowGlowColor}99`
                    : `0 0 8px ${architecture.windowGlowColor}44`,
                }}
              >
                {/* Window mullions */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#1E1410]/80" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#1E1410]/80" />
                <div className="absolute inset-x-0 top-[28%] h-[1px] bg-[#1E1410]/65" />
              </div>
              <div
                className="w-[38px] h-[4px] rounded-[1px]"
                style={{ backgroundColor: architecture.trimColor }}
              />
            </div>

            {/* Central Architectural Cover Medallion / Frontispiece Niche */}
            <div
              className="relative w-[84px] h-[94px] rounded-t-full rounded-b-[6px] p-[3px] border shadow-inner flex items-center justify-center overflow-hidden shrink-0"
              style={{
                borderColor: architecture.trimColor,
                background: `linear-gradient(180deg, ${architecture.trimColor}44, ${architecture.secondaryColor})`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.65)",
              }}
            >
              {activeCoverUrl ? (
                <div className="relative w-full h-full rounded-t-full rounded-b-[4px] overflow-hidden bg-[#12131F]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCoverUrl}
                    alt={`Cover artwork motif for ${book.title}`}
                    loading={book.streetOrder <= 6 ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover object-center filter contrast-105 saturate-95 transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle leaded-glass architectural overlay so cover integrates into the façade */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 45%, transparent 52%, rgba(10,10,18,0.55) 100%)",
                      boxShadow: "inset 0 0 10px rgba(0,0,0,0.7)",
                    }}
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full rounded-t-full rounded-b-[4px] flex flex-col items-center justify-center p-2"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${architecture.primaryColor}, ${architecture.secondaryColor})`,
                  }}
                >
                  <OrnamentCrest
                    style={architecture.ornamentStyle}
                    color={architecture.trimColor}
                  />
                </div>
              )}
            </div>

            {/* Right Arched Casement Window */}
            <div className="flex flex-col items-center">
              <div
                className="w-[32px] h-[54px] rounded-t-full border relative overflow-hidden transition-all duration-500"
                style={{
                  borderColor: architecture.trimColor,
                  background: `radial-gradient(circle at 50% 60%, ${architecture.windowGlowColor} 0%, #D9822B 72%, #5C2C0C 100%)`,
                  boxShadow: isHighlighted
                    ? `0 0 16px ${architecture.windowGlowColor}99`
                    : `0 0 8px ${architecture.windowGlowColor}44`,
                }}
              >
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#1E1410]/80" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#1E1410]/80" />
                <div className="absolute inset-x-0 top-[28%] h-[1px] bg-[#1E1410]/65" />
              </div>
              <div
                className="w-[38px] h-[4px] rounded-[1px]"
                style={{ backgroundColor: architecture.trimColor }}
              />
            </div>
          </div>

          {/* SECTION C: Second-Story Reading Room Windows with wrought-iron Juliette balcony */}
          <div className="relative px-5 py-1 flex items-center justify-around gap-2 z-10">
            {[0, 1, 2].map((winIdx) => (
              <div key={winIdx} className="flex flex-col items-center">
                <div
                  className="w-[40px] h-[46px] rounded-t-[6px] border relative overflow-hidden transition-all duration-500"
                  style={{
                    borderColor: `${architecture.trimColor}CC`,
                    background: `linear-gradient(180deg, #FFF0BE 0%, ${architecture.windowGlowColor} 55%, #C86D24 100%)`,
                    boxShadow: isHighlighted
                      ? `0 0 14px ${architecture.windowGlowColor}88`
                      : `0 0 6px ${architecture.windowGlowColor}33`,
                  }}
                >
                  {/* Subtle interior bookshelf / drape silhouette */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-3 opacity-35"
                    style={{ backgroundColor: architecture.secondaryColor }}
                  />
                  {/* Mullion grid */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#1C130E]/80" />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#1C130E]/80" />
                </div>
                {/* Wrought iron window box / sill */}
                <div
                  className="w-[46px] h-[5px] border-t flex items-center justify-around"
                  style={{
                    backgroundColor: architecture.secondaryColor,
                    borderColor: architecture.trimColor,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Raised Spine Hub #3 */}
          <div
            className="w-full h-[6px] border-y shrink-0"
            style={{
              background: `linear-gradient(90deg, ${architecture.secondaryColor}, ${architecture.trimColor}66, ${architecture.secondaryColor})`,
              borderColor: `${architecture.trimColor}88`,
            }}
          />

          {/* SECTION D: Ground-Floor Townhouse Entrance, Parlor Window, Lanterns & 3D Hinged Door */}
          <div className="relative px-4 pt-2 pb-0 flex items-end justify-between z-10">
            {/* Ground-floor parlor window & Review Plaque */}
            <div className="flex flex-col items-center pb-3 gap-1.5">
              <div
                className="w-[56px] h-[64px] rounded-t-[8px] border relative overflow-hidden"
                style={{
                  borderColor: architecture.trimColor,
                  background: `radial-gradient(circle at 50% 55%, #FFF2C2 0%, ${architecture.windowGlowColor} 65%, #B85D19 100%)`,
                  boxShadow: `0 0 12px ${architecture.windowGlowColor}55`,
                }}
              >
                {/* Warm table lamp silhouette inside parlor */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-4 rounded-t-full bg-[#3A1D12]/45" />
                <div className="absolute inset-y-0 left-1/3 w-[1.2px] bg-[#1C130E]/75" />
                <div className="absolute inset-y-0 left-2/3 w-[1.2px] bg-[#1C130E]/75" />
                <div className="absolute inset-x-0 top-1/2 h-[1.2px] bg-[#1C130E]/75" />
              </div>
              <div
                className="w-[62px] h-[5px] rounded-[1px]"
                style={{ backgroundColor: architecture.trimColor }}
              />

              {/* Publisher / Edition Brass Footplate */}
              <div
                className="px-1.5 py-0.5 rounded-[2px] border text-[8.5px] uppercase tracking-[0.14em] font-mono"
                style={{
                  borderColor:
                    book.recordStatus === "needs-review"
                      ? "#F59E0B"
                      : `${architecture.trimColor}88`,
                  backgroundColor: "#0D0E17CC",
                  color:
                    book.recordStatus === "needs-review"
                      ? "#FCD34D"
                      : architecture.accentColor,
                }}
              >
                {book.recordStatus === "needs-review"
                  ? "Verify Ed."
                  : cover.firstPublishYear
                  ? `Ed. ${cover.firstPublishYear}`
                  : "Folio Ed."}
              </div>
            </div>

            {/* Interactive 3D Hinged Doorway Assembly */}
            <div className="relative flex flex-col items-center">
              {/* Left & Right Carriage Lanterns */}
              <div
                className={`w-2.5 h-3.5 rounded-full absolute -left-3.5 top-8 transition-all duration-300 ${
                  isHighlighted ? "scale-110" : "opacity-85"
                }`}
                style={{
                  backgroundColor: "#FFF2C6",
                  boxShadow: isHighlighted
                    ? "0 0 16px 5px rgba(255, 224, 130, 0.85)"
                    : "0 0 8px 2px rgba(255, 214, 110, 0.45)",
                }}
              />
              <div
                className={`w-2.5 h-3.5 rounded-full absolute -right-3.5 top-8 transition-all duration-300 ${
                  isHighlighted ? "scale-110" : "opacity-85"
                }`}
                style={{
                  backgroundColor: "#FFF2C6",
                  boxShadow: isHighlighted
                    ? "0 0 16px 5px rgba(255, 224, 130, 0.85)"
                    : "0 0 8px 2px rgba(255, 214, 110, 0.45)",
                }}
              />

              {/* Stone & Brass Door Surround with Arched Fanlight */}
              <div
                className="relative w-[78px] h-[108px] rounded-t-[38px] p-[4px] pb-0 flex flex-col"
                style={{
                  background: `linear-gradient(180deg, ${architecture.trimColor}, ${architecture.secondaryColor})`,
                  boxShadow: "0 -2px 12px rgba(0,0,0,0.55)",
                }}
              >
                {/* Arched Fanlight Transom showing House Number */}
                <div
                  className="w-full h-[24px] rounded-t-[34px] border-b flex items-center justify-center relative overflow-hidden"
                  style={{
                    borderColor: architecture.trimColor,
                    background:
                      "radial-gradient(circle at 50% 100%, #FFF5D1 0%, #F3B95F 75%, #8C4A15 100%)",
                  }}
                >
                  <span className="text-[9px] font-serif font-bold tracking-widest text-[#231208] z-10">
                    {houseNumber}
                  </span>
                </div>

                {/* Doorway Threshold & Twin 3D Hinged Double Doors */}
                <div
                  className="relative w-full flex-1 overflow-visible flex"
                  style={{ perspective: "480px" }}
                >
                  {/* Warm Glowing Book-Lined Interior Vestibule visible when doors swing open */}
                  <div
                    className="absolute inset-0 overflow-hidden flex flex-col justify-between p-1.5"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 45%, #FFF8DE 0%, #FFD27D 45%, #B85B14 85%, #4A1C07 100%)",
                      boxShadow: isDoorOpen
                        ? "0 0 38px 14px rgba(255, 220, 135, 0.9)"
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

                  {/* LEFT DOUBLE-DOOR LEAF */}
                  <div
                    className="relative w-1/2 h-full border-y border-l border-r-[0.5px] flex flex-col justify-between p-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      backgroundColor: architecture.doorWoodColor,
                      borderColor: `${architecture.trimColor}AA`,
                      transformOrigin: "left center",
                      transform: isDoorOpen
                        ? "rotateY(98deg)"
                        : isHighlighted
                        ? "rotateY(8deg)"
                        : "rotateY(0deg)",
                      boxShadow: isDoorOpen
                        ? "6px 0 16px rgba(0,0,0,0.7)"
                        : "inset 0 0 6px rgba(0,0,0,0.65)",
                    }}
                  >
                    <div
                      className="w-full h-[26px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${architecture.trimColor}99`,
                        background:
                          "linear-gradient(180deg, rgba(255,232,163,0.45), rgba(214,132,48,0.25))",
                      }}
                    />
                    <div className="w-full flex items-center justify-end pr-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: architecture.accentColor,
                          boxShadow: "0 0 4px rgba(255,215,128,0.8)",
                        }}
                      />
                    </div>
                    <div
                      className="w-full h-[24px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${architecture.trimColor}77`,
                        backgroundColor: "rgba(0,0,0,0.28)",
                      }}
                    />
                  </div>

                  {/* RIGHT DOUBLE-DOOR LEAF */}
                  <div
                    className="relative w-1/2 h-full border-y border-r border-l-[0.5px] flex flex-col justify-between p-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      backgroundColor: architecture.doorWoodColor,
                      borderColor: `${architecture.trimColor}AA`,
                      transformOrigin: "right center",
                      transform: isDoorOpen
                        ? "rotateY(-98deg)"
                        : isHighlighted
                        ? "rotateY(-8deg)"
                        : "rotateY(0deg)",
                      boxShadow: isDoorOpen
                        ? "-6px 0 16px rgba(0,0,0,0.7)"
                        : "inset 0 0 6px rgba(0,0,0,0.65)",
                    }}
                  >
                    <div
                      className="w-full h-[26px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${architecture.trimColor}99`,
                        background:
                          "linear-gradient(180deg, rgba(255,232,163,0.45), rgba(214,132,48,0.25))",
                      }}
                    />
                    <div className="w-full flex items-center justify-start pl-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: architecture.accentColor,
                          boxShadow: "0 0 4px rgba(255,215,128,0.8)",
                        }}
                      />
                    </div>
                    <div
                      className="w-full h-[24px] rounded-[1.5px] border"
                      style={{
                        borderColor: `${architecture.trimColor}77`,
                        backgroundColor: "rgba(0,0,0,0.28)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Two Stone Threshold Steps */}
              <div
                className="w-[88px] h-[5px] border-t"
                style={{
                  backgroundColor: "#2C2B38",
                  borderColor: `${architecture.trimColor}77`,
                }}
              />
              <div
                className="w-[96px] h-[5px] border-t"
                style={{
                  backgroundColor: "#1F1E29",
                  borderColor: `${architecture.trimColor}55`,
                }}
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

