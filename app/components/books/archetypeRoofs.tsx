import React from "react";
import type { HouseArchetypeId } from "./archetypeStyles";

interface RoofCrownProps {
  archetypeId: HouseArchetypeId;
  primaryColor: string;
  secondaryColor: string;
  trimColor: string;
  accentColor: string;
  roofSlateColor: string;
  windowGlowColor: string;
}

export default function ArchetypeRoofCrown({
  archetypeId,
  primaryColor,
  secondaryColor,
  trimColor,
  accentColor,
  roofSlateColor,
  windowGlowColor,
}: RoofCrownProps) {
  switch (archetypeId) {
    case "romance":
      // Style 01: Baroque curved mansard pediment with scrolled volutes, oval attic window & rose vines
      return (
        <div className="relative w-full h-[96px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 96" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Scrolled stone chimney on right */}
            <rect x="290" y="14" width="26" height="52" fill={secondaryColor} stroke={trimColor} strokeWidth="1.2" />
            <rect x="286" y="10" width="34" height="6" rx="2" fill={trimColor} />
            {/* Curved Mansard Baroque Pediment */}
            <path
              d="M12 96 C12 65 60 22 135 14 C165 11 215 11 245 14 C320 22 368 65 368 96 Z"
              fill={roofSlateColor}
              stroke={trimColor}
              strokeWidth="2"
            />
            <path
              d="M32 96 C32 72 75 32 145 24 C170 21 210 21 235 24 C305 32 348 72 348 96 Z"
              fill={primaryColor}
              stroke={trimColor}
              strokeWidth="1"
              strokeOpacity="0.75"
            />
            {/* Scrolled Rococo volutes at edges */}
            <path
              d="M16 94 C26 78 38 68 32 54 C28 44 14 52 18 64 C20 72 34 82 30 94"
              fill="none"
              stroke={trimColor}
              strokeWidth="2"
            />
            <path
              d="M364 94 C354 78 342 68 348 54 C352 44 366 52 362 64 C360 72 346 82 350 94"
              fill="none"
              stroke={trimColor}
              strokeWidth="2"
            />
            {/* Central oval baroque attic dormer */}
            <ellipse cx="190" cy="56" rx="26" ry="32" fill={roofSlateColor} stroke={trimColor} strokeWidth="2" />
            <ellipse cx="190" cy="56" rx="20" ry="25" fill={windowGlowColor} stroke={secondaryColor} strokeWidth="1.5" />
            {/* Oval window mullions */}
            <line x1="190" y1="31" x2="190" y2="81" stroke={secondaryColor} strokeWidth="1.4" />
            <line x1="170" y1="56" x2="210" y2="56" stroke={secondaryColor} strokeWidth="1.4" />
            {/* Top Rococo crest / finial */}
            <path d="M190 6 C184 14 178 18 190 24 C202 18 196 14 190 6 Z" fill={accentColor} stroke={trimColor} strokeWidth="1.2" />
          </svg>
          {/* Cascading pink rose vine details */}
          <div className="absolute -bottom-1 left-6 flex items-center gap-1.5 opacity-90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8CA3] shadow-[0_0_8px_#FF8CA3] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#E05375] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB5C5] inline-block" />
          </div>
          <div className="absolute -bottom-1 right-8 flex items-center gap-1.5 opacity-90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB5C5] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#FF8CA3] shadow-[0_0_8px_#FF8CA3] inline-block" />
          </div>
        </div>
      );

    case "fantasy":
      // Style 02: Towering gothic emerald turrets, pointed spires, gargoyles & glowing rose window
      return (
        <div className="relative w-full h-[115px] -mt-[19px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 115" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Left Tower & Steep Spire */}
            <polygon points="12,115 12,54 36,4 60,54 60,115" fill={roofSlateColor} stroke={trimColor} strokeWidth="1.5" />
            <polygon points="20,115 20,58 36,16 52,58 52,115" fill={primaryColor} stroke={trimColor} strokeWidth="0.8" />
            <circle cx="36" cy="4" r="3" fill={accentColor} />
            <line x1="36" y1="1" x2="36" y2="9" stroke={trimColor} strokeWidth="1" />

            {/* Right Tower & Steep Spire */}
            <polygon points="320,115 320,54 344,4 368,54 368,115" fill={roofSlateColor} stroke={trimColor} strokeWidth="1.5" />
            <polygon points="328,115 328,58 344,16 360,58 360,115" fill={primaryColor} stroke={trimColor} strokeWidth="0.8" />
            <circle cx="344" cy="4" r="3" fill={accentColor} />
            <line x1="344" y1="1" x2="344" y2="9" stroke={trimColor} strokeWidth="1" />

            {/* Central High Gothic Gable */}
            <polygon points="54,115 190,14 326,115" fill={roofSlateColor} stroke={trimColor} strokeWidth="2" />
            <polygon points="76,115 190,28 304,115" fill={primaryColor} stroke={trimColor} strokeWidth="1" strokeOpacity="0.8" />

            {/* Glowing Rose Window */}
            <circle cx="190" cy="72" r="24" fill={windowGlowColor} stroke={trimColor} strokeWidth="2" />
            <circle cx="190" cy="72" r="14" fill="none" stroke={secondaryColor} strokeWidth="1.5" />
            {/* Rose window tracery */}
            <path d="M190 48 V96 M166 72 H214 M173 55 L207 89 M173 89 L207 55" stroke={secondaryColor} strokeWidth="1.2" />

            {/* Gargoyle / Dragon corner finials */}
            <path d="M60 58 C68 52 74 44 68 38 C62 38 60 48 56 52 Z" fill={accentColor} />
            <path d="M320 58 C312 52 306 44 312 38 C318 38 320 48 324 52 Z" fill={accentColor} />

            {/* High Spire Crown */}
            <polygon points="186,14 190,0 194,14" fill={accentColor} stroke={trimColor} strokeWidth="1" />
          </svg>
        </div>
      );

    case "mystery":
      // Style 03: Steep charcoal slate gables, brick chimneys, autumn red/orange maple foliage
      return (
        <div className="relative w-full h-[102px] -mt-[6px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 102" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Left tall weathered chimney stack */}
            <rect x="52" y="10" width="28" height="65" fill="#201C1B" stroke={trimColor} strokeWidth="1.2" />
            <rect x="48" y="6" width="36" height="6" rx="1" fill="#C99A6B" />
            <rect x="56" y="0" width="8" height="6" fill="#181514" />
            <rect x="68" y="0" width="8" height="6" fill="#181514" />

            {/* Right chimney stack */}
            <rect x="300" y="18" width="26" height="58" fill="#201C1B" stroke={trimColor} strokeWidth="1.2" />
            <rect x="296" y="14" width="34" height="6" rx="1" fill="#C99A6B" />
            <rect x="304" y="8" width="8" height="6" fill="#181514" />
            <rect x="316" y="8" width="8" height="6" fill="#181514" />

            {/* Steep Gothic Slate Gable */}
            <polygon points="16,102 190,12 364,102" fill={roofSlateColor} stroke={trimColor} strokeWidth="2" />
            <polygon points="36,102 190,26 344,102" fill={primaryColor} stroke={trimColor} strokeWidth="1" strokeOpacity="0.75" />

            {/* Gothic pointed attic window */}
            <path d="M172 98 V62 C172 50 190 42 190 42 C190 42 208 50 208 62 V98 Z" fill={windowGlowColor} stroke={trimColor} strokeWidth="1.6" />
            <path d="M190 44 V98 M172 74 H208 M172 86 H208" stroke="#221C1A" strokeWidth="1.2" />

            {/* Spire Weather Vane */}
            <line x1="190" y1="12" x2="190" y2="0" stroke={trimColor} strokeWidth="1.6" />
            <path d="M182 3 L190 0 L198 3" stroke={accentColor} strokeWidth="1.4" fill="none" />
          </svg>
          {/* Autumn red & burnt-orange maple foliage climbing the roof */}
          <div className="absolute top-10 left-12 flex items-center gap-1 opacity-95">
            <span className="w-3 h-3 rounded-full bg-[#C2410C] shadow-[0_0_8px_#C2410C] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#B45309] inline-block" />
          </div>
          <div className="absolute top-14 right-14 flex items-center gap-1 opacity-95">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#991B1B] inline-block" />
          </div>
        </div>
      );

    case "peaceful-reads":
      // Style 04: Rustic cottage gable, large round dormer, flowering white wisteria vines
      return (
        <div className="relative w-full h-[96px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 96" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Fieldstone chimney on left */}
            <rect x="42" y="16" width="30" height="58" fill="#52483E" stroke={trimColor} strokeWidth="1.2" />
            <rect x="38" y="12" width="38" height="6" rx="2" fill="#7D7062" />

            {/* Cedar shingle cottage gable */}
            <polygon points="12,96 190,16 368,96" fill={roofSlateColor} stroke={trimColor} strokeWidth="2.2" />
            <polygon points="34,96 190,30 346,96" fill={primaryColor} stroke={trimColor} strokeWidth="1.2" strokeOpacity="0.8" />

            {/* Overhanging timber eave bargeboards */}
            <line x1="8" y1="96" x2="190" y2="12" stroke="#423022" strokeWidth="4" />
            <line x1="372" y1="96" x2="190" y2="12" stroke="#423022" strokeWidth="4" />

            {/* Large round cottage dormer window with warm hearth glow */}
            <circle cx="190" cy="62" r="24" fill={windowGlowColor} stroke={trimColor} strokeWidth="2.2" />
            <circle cx="190" cy="62" r="19" fill="none" stroke="#423022" strokeWidth="1.5" />
            <line x1="190" y1="38" x2="190" y2="86" stroke="#423022" strokeWidth="1.5" />
            <line x1="166" y1="62" x2="214" y2="62" stroke="#423022" strokeWidth="1.5" />
          </svg>
          {/* Cascading white jasmine & wisteria flower blossoms */}
          <div className="absolute top-6 left-20 flex items-center gap-1.5 opacity-90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FAF5EE] shadow-[0_0_6px_#FAF5EE] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#E8E2D5] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] inline-block" />
          </div>
          <div className="absolute top-10 right-24 flex items-center gap-1.5 opacity-90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#E5DEC9] inline-block" />
          </div>
        </div>
      );

    case "self-help":
      // Style 05: Classical arched sunburst pediment with radiating golden sunbeams & stone urns
      return (
        <div className="relative w-full h-[98px] -mt-[2px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 98" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Corner sculpted classical urns on balustrade */}
            <path d="M26 98 V62 H46 V98 Z M36 52 C42 52 44 62 44 62 H28 C28 62 30 52 36 52 Z" fill="#D6C5AD" stroke={trimColor} strokeWidth="1" />
            <circle cx="36" cy="50" r="3" fill={accentColor} />

            <path d="M334 98 V62 H354 V98 Z M344 52 C350 52 352 62 352 62 H336 C336 62 338 52 344 52 Z" fill="#D6C5AD" stroke={trimColor} strokeWidth="1" />
            <circle cx="344" cy="50" r="3" fill={accentColor} />

            {/* Classical Dentil Cornice Bar */}
            <rect x="20" y="90" width="340" height="8" fill={primaryColor} stroke={trimColor} strokeWidth="1.4" />

            {/* Magnificent Arched Sunburst Pediment */}
            <path
              d="M50 90 C50 34 110 4 190 4 C270 4 330 34 330 90 Z"
              fill={primaryColor}
              stroke={trimColor}
              strokeWidth="2.2"
            />
            <path
              d="M68 90 C68 44 120 18 190 18 C260 18 312 44 312 90 Z"
              fill={secondaryColor}
              stroke={trimColor}
              strokeWidth="1"
              strokeOpacity="0.8"
            />

            {/* Radiating Golden Sunbeams */}
            <g stroke={accentColor} strokeWidth="2.4" strokeLinecap="round" opacity="0.95">
              <line x1="190" y1="72" x2="190" y2="28" />
              <line x1="190" y1="72" x2="152" y2="34" />
              <line x1="190" y1="72" x2="228" y2="34" />
              <line x1="190" y1="72" x2="122" y2="48" />
              <line x1="190" y1="72" x2="258" y2="48" />
              <line x1="190" y1="72" x2="102" y2="70" />
              <line x1="190" y1="72" x2="278" y2="70" />
            </g>

            {/* Radiant Glowing Sun Centerpiece */}
            <circle cx="190" cy="72" r="16" fill={windowGlowColor} stroke={trimColor} strokeWidth="2" />
            <circle cx="190" cy="72" r="8" fill={accentColor} />
          </svg>
        </div>
      );

    case "finance-business":
      // Style 06: Classical Roman/Greek temple pediment with embossed gold medallion & dentil frieze
      return (
        <div className="relative w-full h-[96px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 96" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Classical Triangular Temple Pediment */}
            <polygon points="12,96 190,16 368,96" fill={roofSlateColor} stroke={trimColor} strokeWidth="2.5" />
            <polygon points="34,96 190,30 346,96" fill={primaryColor} stroke={trimColor} strokeWidth="1.2" strokeOpacity="0.8" />

            {/* Classical Dentil molding under cornice */}
            <rect x="22" y="88" width="336" height="8" fill={secondaryColor} stroke={trimColor} strokeWidth="1.2" />
            {Array.from({ length: 24 }).map((_, i) => (
              <rect key={i} x={32 + i * 13} y="90" width="6" height="4" fill={trimColor} />
            ))}

            {/* Central Embossed Golden Coin / Currency Medallion */}
            <circle cx="190" cy="62" r="22" fill={secondaryColor} stroke={trimColor} strokeWidth="2" />
            <circle cx="190" cy="62" r="18" fill="url(#goldCoinGrad)" stroke={accentColor} strokeWidth="1.5" />
            <text x="190" y="69" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3D290F" fontFamily="serif">$</text>

            {/* Acroteria Corner & Apex Ornaments */}
            <path d="M190 16 V6 M184 10 H196" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="94" r="4" fill={accentColor} />
            <circle cx="362" cy="94" r="4" fill={accentColor} />

            <defs>
              <linearGradient id="goldCoinGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF2B8" />
                <stop offset="50%" stopColor="#E5BA55" />
                <stop offset="100%" stopColor="#9C731A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case "sci-fi":
      // Style 07: Spectacular glass astrolabe observatory dome glowing with cyan constellations & orbital rings
      return (
        <div className="relative w-full h-[106px] -mt-[10px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 106" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Outer Rotating Brass Armillary Ring */}
            <ellipse cx="190" cy="56" rx="98" ry="34" fill="none" stroke={trimColor} strokeWidth="2.2" strokeDasharray="6 3" opacity="0.85" />
            <circle cx="102" cy="64" r="5" fill="#4DEEEA" stroke={trimColor} strokeWidth="1" />
            <circle cx="278" cy="48" r="5" fill="#4DEEEA" stroke={trimColor} strokeWidth="1" />

            {/* Glowing Observatory Geodesic Glass Dome */}
            <path
              d="M100 106 C100 48 138 12 190 12 C242 12 280 48 280 106 Z"
              fill="url(#astroDomeGrad)"
              stroke={trimColor}
              strokeWidth="2.4"
            />

            {/* Glass dome geodesic struts & constellation lines */}
            <path d="M190 12 V106 M130 106 C130 65 155 35 190 35 C225 35 250 65 250 106" fill="none" stroke={trimColor} strokeWidth="1.2" opacity="0.75" />
            <line x1="110" y1="62" x2="270" y2="62" stroke={trimColor} strokeWidth="1.2" opacity="0.65" />
            <line x1="125" y1="84" x2="255" y2="84" stroke={trimColor} strokeWidth="1.2" opacity="0.65" />

            {/* Glowing Constellation Stars inside dome */}
            <circle cx="165" cy="45" r="2" fill="#E0FBFF" />
            <circle cx="215" cy="42" r="2.5" fill="#FFF2B8" />
            <circle cx="180" cy="74" r="2" fill="#E0FBFF" />
            <circle cx="220" cy="78" r="2" fill="#4DEEEA" />

            {/* Top Astrolabe Finial / Sphere */}
            <circle cx="190" cy="12" r="5" fill={accentColor} stroke={trimColor} strokeWidth="1.5" />
            <line x1="190" y1="7" x2="190" y2="0" stroke={trimColor} strokeWidth="2" />

            <defs>
              <radialGradient id="astroDomeGrad" cx="50%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#4DEEEA" stopOpacity="0.45" />
                <stop offset="55%" stopColor="#1E3860" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0B1322" stopOpacity="0.98" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      );

    case "dark-academia":
      // Style 08: Stepped Flemish collegiate gothic gables, clustered chimneys, dark ivy vines
      return (
        <div className="relative w-full h-[106px] -mt-[10px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 106" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Clustered historic masonry chimneys on left */}
            <rect x="56" y="8" width="16" height="68" fill="#1E1917" stroke={trimColor} strokeWidth="1.2" />
            <rect x="74" y="16" width="16" height="60" fill="#1E1917" stroke={trimColor} strokeWidth="1.2" />
            <rect x="52" y="4" width="42" height="6" rx="1" fill="#C49A58" />

            {/* Right chimney */}
            <rect x="290" y="12" width="22" height="64" fill="#1E1917" stroke={trimColor} strokeWidth="1.2" />
            <rect x="286" y="8" width="30" height="6" rx="1" fill="#C49A58" />

            {/* Stepped Flemish Collegiate Gothic Gable */}
            <path
              d="M24 106 V88 H56 V72 H92 V54 H134 V36 H174 V16 H206 V36 H246 V54 H288 V72 H324 V88 H356 V106 Z"
              fill={roofSlateColor}
              stroke={trimColor}
              strokeWidth="2.2"
            />
            <path
              d="M44 106 V94 H72 V78 H108 V60 H148 V42 H182 V26 H198 V42 H232 V60 H272 V78 H308 V94 H336 V106 Z"
              fill={primaryColor}
              stroke={trimColor}
              strokeWidth="1"
              strokeOpacity="0.75"
            />

            {/* Leaded collegiate gothic attic window */}
            <path d="M176 100 V64 C176 54 190 48 190 48 C190 48 204 54 204 64 V100 Z" fill={windowGlowColor} stroke={trimColor} strokeWidth="1.6" />
            <line x1="190" y1="50" x2="190" y2="100" stroke="#241D1A" strokeWidth="1.3" />
            <line x1="176" y1="74" x2="204" y2="74" stroke="#241D1A" strokeWidth="1.3" />

            {/* Stone pinnacle finial */}
            <polygon points="186,16 190,2 194,16" fill={accentColor} stroke={trimColor} strokeWidth="1.2" />
          </svg>
          {/* Dark crimson & deep green ivy creeper */}
          <div className="absolute top-12 left-24 flex items-center gap-1 opacity-90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#881337] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#14532D] inline-block" />
          </div>
          <div className="absolute top-16 right-24 flex items-center gap-1 opacity-90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#881337] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532D] inline-block" />
          </div>
        </div>
      );

    case "adventure-exploration":
      // Style 09: Nautical maritime roof with ship's lookout mast, rigging, pennant & brass compass rose
      return (
        <div className="relative w-full h-[112px] -mt-[16px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 112" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Steep shipwright-inspired timber shingle roof */}
            <polygon points="16,112 190,32 364,112" fill={roofSlateColor} stroke={trimColor} strokeWidth="2.2" />
            <polygon points="38,112 190,46 342,112" fill={primaryColor} stroke={trimColor} strokeWidth="1" strokeOpacity="0.8" />

            {/* Ship's Main Mast & Cross-Trees */}
            <rect x="187" y="0" width="6" height="50" fill="#3D291C" stroke={trimColor} strokeWidth="1" />
            <line x1="162" y1="18" x2="218" y2="18" stroke="#3D291C" strokeWidth="3" />

            {/* Maritime Rigging Lines */}
            <line x1="164" y1="18" x2="70" y2="112" stroke={trimColor} strokeWidth="1.1" strokeDasharray="3 2" opacity="0.75" />
            <line x1="216" y1="18" x2="310" y2="112" stroke={trimColor} strokeWidth="1.1" strokeDasharray="3 2" opacity="0.75" />

            {/* Canvas Pennant Flag fluttering at masthead */}
            <polygon points="193,2 225,10 193,18" fill="#E05345" stroke="#FFF" strokeWidth="0.8" />

            {/* Large Brass Navigational Compass Rose atop the gable */}
            <circle cx="190" cy="74" r="22" fill={secondaryColor} stroke={trimColor} strokeWidth="2" />
            <circle cx="190" cy="74" r="17" fill="none" stroke={accentColor} strokeWidth="1.2" />
            {/* 8-point compass star */}
            <polygon points="190,56 194,70 208,74 194,78 190,92 186,78 172,74 186,70" fill={accentColor} stroke={trimColor} strokeWidth="1" />
            <circle cx="190" cy="74" r="3.5" fill="#3D291C" />
          </svg>
        </div>
      );

    case "fairytale-whimsical":
      // Style 10: Whimsical lilac/pink fairytale turrets, spiral spires, golden crescent moon & wisteria blossoms
      return (
        <div className="relative w-full h-[115px] -mt-[19px] overflow-visible select-none pointer-events-none">
          <svg viewBox="0 0 380 115" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Left Fairytale Conical Turret with Crescent Moon */}
            <polygon points="16,115 16,60 36,6 56,60 56,115" fill={roofSlateColor} stroke={trimColor} strokeWidth="1.6" />
            <polygon points="24,115 24,64 36,18 48,64 48,115" fill={primaryColor} stroke={trimColor} strokeWidth="0.8" />
            {/* Golden Crescent Moon finial */}
            <path d="M38 1 C35 3 35 7 38 9 C33 8 32 3 38 1 Z" fill={accentColor} stroke={trimColor} strokeWidth="0.8" />

            {/* Right Fairytale Turret with Star */}
            <polygon points="324,115 324,60 344,6 364,60 364,115" fill={roofSlateColor} stroke={trimColor} strokeWidth="1.6" />
            <polygon points="332,115 332,64 344,18 356,64 356,115" fill={primaryColor} stroke={trimColor} strokeWidth="0.8" />
            {/* Star finial */}
            <polygon points="344,0 346,5 351,6 347,9 348,14 344,11 340,14 341,9 337,6 342,5" fill={accentColor} />

            {/* Central Whimsical Curving Fairytale Gable */}
            <path
              d="M52 115 C52 70 110 24 190 14 C270 24 328 70 328 115 Z"
              fill={roofSlateColor}
              stroke={trimColor}
              strokeWidth="2.2"
            />
            <path
              d="M72 115 C72 78 120 36 190 28 C260 36 308 78 308 115 Z"
              fill={primaryColor}
              stroke={trimColor}
              strokeWidth="1"
              strokeOpacity="0.8"
            />

            {/* Glowing Fairytale Rose Window */}
            <circle cx="190" cy="74" r="22" fill={windowGlowColor} stroke={trimColor} strokeWidth="2" />
            <circle cx="190" cy="74" r="14" fill="none" stroke={secondaryColor} strokeWidth="1.3" />
            <path d="M190 52 V96 M168 74 H212" stroke={secondaryColor} strokeWidth="1.3" />
            {/* Swirling fairytale spiral finial */}
            <path d="M190 14 C184 8 186 0 192 2 C196 4 194 10 190 14 Z" fill={accentColor} stroke={trimColor} strokeWidth="1" />
          </svg>
          {/* Cascading lilac and purple wisteria blossoms */}
          <div className="absolute top-8 left-16 flex items-center gap-1.5 opacity-95">
            <span className="w-3 h-3 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E879F9] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#A855F7] inline-block" />
          </div>
          <div className="absolute top-10 right-16 flex items-center gap-1.5 opacity-95">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E879F9] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC] inline-block" />
          </div>
        </div>
      );
  }
}
