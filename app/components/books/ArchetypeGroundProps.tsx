import React from "react";
import type { HouseArchetypeId } from "./archetypeStyles";

interface GroundPropProps {
  archetypeId: HouseArchetypeId;
  trimColor: string;
  accentColor: string;
}

export default function ArchetypeGroundProps({
  archetypeId,
  trimColor,
  accentColor,
}: GroundPropProps) {
  switch (archetypeId) {
    case "romance":
      // Bistro table & two cafe chairs with rose vase
      return (
        <div className="absolute -bottom-1 -left-4 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 76 56" className="w-[76px] h-[56px] overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            {/* Left Chair */}
            <path d="M12 52V36M12 36C12 28 20 22 20 22V52" stroke="#2D121B" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 36H22" stroke={trimColor} strokeWidth="1.6" />
            <path d="M14 26C14 26 18 24 20 26" stroke={trimColor} strokeWidth="1.2" />
            {/* Bistro Table */}
            <ellipse cx="38" cy="30" rx="16" ry="4" fill="#3D1824" stroke={trimColor} strokeWidth="1.2" />
            <path d="M38 34V54M28 54L38 52L48 54" stroke="#2D121B" strokeWidth="1.8" strokeLinecap="round" />
            {/* Lace Tablecloth draping */}
            <path d="M26 31C28 35 34 36 38 34C42 36 48 35 50 31" fill="#FDF2F4" opacity="0.85" />
            {/* Glass Vase & Rose Blossom */}
            <rect x="36" y="24" width="4" height="7" rx="1" fill="#FFF4D4" fillOpacity="0.7" stroke={trimColor} strokeWidth="0.8" />
            <circle cx="38" cy="22" r="3.5" fill="#E86C8D" />
            <circle cx="37" cy="21" r="1.5" fill="#FFAEC3" />
            {/* Right Chair */}
            <path d="M64 52V36M64 36C64 28 56 22 56 22V52" stroke="#2D121B" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M54 36H66" stroke={trimColor} strokeWidth="1.6" />
          </svg>
        </div>
      );

    case "fantasy":
      // Gothic carved stone urn with golden roses & ivy
      return (
        <div className="absolute -bottom-1 -left-3 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 54 62" className="w-[54px] h-[62px] overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)]">
            {/* Stone Pedestal */}
            <rect x="14" y="38" width="26" height="22" rx="1" fill="#0F241F" stroke={trimColor} strokeWidth="1.2" />
            <line x1="10" y1="60" x2="44" y2="60" stroke={trimColor} strokeWidth="2.5" />
            <line x1="12" y1="38" x2="42" y2="38" stroke={trimColor} strokeWidth="2" />
            {/* Gothic Fluted Urn Cup */}
            <path d="M16 38C16 26 22 18 27 18C32 18 38 26 38 38Z" fill="#14362E" stroke={trimColor} strokeWidth="1.4" />
            <path d="M10 24C6 24 6 32 16 32M44 24C48 24 48 32 38 32" fill="none" stroke={trimColor} strokeWidth="1.3" />
            {/* Cascading Golden Foliage */}
            <path d="M20 20Q14 26 12 36M34 20Q40 26 42 36M27 16V10" stroke={accentColor} strokeWidth="1.2" fill="none" />
            <circle cx="12" cy="36" r="2" fill={accentColor} />
            <circle cx="42" cy="36" r="2" fill={accentColor} />
            <circle cx="27" cy="10" r="3" fill="#FFE294" />
          </svg>
        </div>
      );

    case "mystery":
      // Autumn bench with fallen amber maple leaves
      return (
        <div className="absolute -bottom-1 -left-4 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 74 54" className="w-[74px] h-[54px] overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
            {/* Iron Park Bench Frame */}
            <path d="M12 48V30C12 22 18 16 24 16H60" fill="none" stroke="#16171E" strokeWidth="2" />
            <path d="M10 48L18 34M66 48L58 34" stroke="#16171E" strokeWidth="2" />
            <line x1="12" y1="34" x2="66" y2="34" stroke={trimColor} strokeWidth="3" />
            <line x1="16" y1="26" x2="64" y2="26" stroke={trimColor} strokeWidth="2" strokeOpacity="0.8" />
            <line x1="18" y1="20" x2="62" y2="20" stroke={trimColor} strokeWidth="2" strokeOpacity="0.8" />
            {/* Fallen Autumn Leaves on Bench & Ground */}
            <path d="M28 32L32 30L34 33Z" fill="#E26D38" />
            <path d="M42 31L46 32L44 34Z" fill="#D99026" />
            <path d="M54 48L58 46L56 50Z" fill="#C44E28" />
            <path d="M6 50L10 49L8 52Z" fill="#E88C30" />
          </svg>
        </div>
      );

    case "peaceful-reads":
      // Weathered cedar garden bench with sleeping cat
      return (
        <div className="absolute -bottom-1 -left-4 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 76 54" className="w-[76px] h-[54px] overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            {/* Rustic Timber Bench */}
            <rect x="12" y="30" width="56" height="5" rx="1" fill="#4A3423" stroke={trimColor} strokeWidth="1" />
            <rect x="14" y="16" width="52" height="4" rx="1" fill="#4A3423" stroke={trimColor} strokeWidth="0.8" />
            <rect x="14" y="22" width="52" height="4" rx="1" fill="#4A3423" stroke={trimColor} strokeWidth="0.8" />
            <path d="M16 52V35M64 52V35" stroke="#322215" strokeWidth="2.5" />
            {/* Sleeping curled cream cat */}
            <ellipse cx="44" cy="28" rx="7" ry="4" fill="#FCEFD7" />
            <circle cx="48" cy="27" r="3" fill="#FCEFD7" />
            <path d="M48 24L50 22L51 25" fill="#E08B48" />
            <path d="M51 29Q54 31 50 33" stroke="#FCEFD7" strokeWidth="1.2" fill="none" />
            {/* Basket with wildflowers */}
            <path d="M22 52L20 42H30L28 52Z" fill="#755234" stroke={trimColor} strokeWidth="0.8" />
            <circle cx="23" cy="40" r="2.5" fill="#FFF8DE" />
            <circle cx="27" cy="39" r="2.5" fill="#A4D4A0" />
          </svg>
        </div>
      );

    case "self-help":
      // Classical ivory urn on marble plinth with glowing lilies
      return (
        <div className="absolute -bottom-1 -left-3 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 54 64" className="w-[54px] h-[64px] overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)]">
            {/* Marble Base */}
            <rect x="12" y="40" width="30" height="22" rx="1" fill="#423425" stroke={trimColor} strokeWidth="1.4" />
            <line x1="8" y1="62" x2="46" y2="62" stroke={trimColor} strokeWidth="2.5" />
            <line x1="10" y1="40" x2="44" y2="40" stroke={trimColor} strokeWidth="2" />
            {/* Classical Scrolled Urn */}
            <path d="M16 40C16 28 22 20 27 20C32 20 38 28 38 40Z" fill="#C2AB8A" stroke={trimColor} strokeWidth="1.4" />
            <path d="M12 28C8 28 8 36 18 36M42 28C46 28 46 36 36 36" fill="none" stroke={trimColor} strokeWidth="1.3" />
            {/* Radiant White Lilies */}
            <circle cx="27" cy="14" r="4" fill="#FFFBF0" stroke={accentColor} strokeWidth="1" />
            <path d="M27 20V14" stroke="#87B07B" strokeWidth="1.5" />
            <circle cx="22" cy="17" r="3" fill="#FFF4D0" />
            <circle cx="32" cy="17" r="3" fill="#FFF4D0" />
          </svg>
        </div>
      );

    case "finance-business":
      // Sculpted marble lion statue on Roman pedestal
      return (
        <div className="absolute -bottom-1 -left-3 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 66 68" className="w-[66px] h-[68px] overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
            {/* Pedestal */}
            <rect x="12" y="44" width="42" height="22" rx="1" fill="#3B3227" stroke={trimColor} strokeWidth="1.5" />
            <line x1="8" y1="66" x2="58" y2="66" stroke={trimColor} strokeWidth="2.5" />
            {/* Roman Lion Silhouette */}
            <path
              d="M18 44 C18 36 22 30 26 26 C28 22 30 18 34 16 C38 14 44 14 48 18 C52 22 50 28 48 32 C46 36 46 40 48 44 Z"
              fill="#D4C4AE"
              stroke={trimColor}
              strokeWidth="1.2"
            />
            {/* Lion Mane & Paw Detail */}
            <circle cx="38" cy="18" r="5" fill="#BF9B30" fillOpacity="0.4" />
            <rect x="18" y="40" width="8" height="4" rx="2" fill="#E6D7C3" />
            <rect x="42" y="40" width="8" height="4" rx="2" fill="#E6D7C3" />
          </svg>
        </div>
      );

    case "sci-fi":
      // Steampunk celestial armillary sphere on brass tripod
      return (
        <div className="absolute -bottom-1 -left-3 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 62 70" className="w-[62px] h-[70px] overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.75)]">
            {/* Brass Tripod Stand */}
            <path d="M31 44L14 68M31 44L48 68M31 44V68" stroke="#0E1C33" strokeWidth="2" strokeLinecap="round" />
            <path d="M31 44L14 68M31 44L48 68" stroke={trimColor} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="31" cy="44" r="3" fill={accentColor} />
            {/* Concentric Armillary Rings */}
            <circle cx="31" cy="24" r="16" fill="none" stroke={trimColor} strokeWidth="1.6" />
            <ellipse cx="31" cy="24" rx="16" ry="6" fill="none" stroke={trimColor} strokeWidth="1.2" transform="rotate(30 31 24)" />
            <ellipse cx="31" cy="24" rx="16" ry="6" fill="none" stroke={accentColor} strokeWidth="1.2" transform="rotate(-30 31 24)" />
            {/* Central Glowing Celestial Orb */}
            <circle cx="31" cy="24" r="5" fill="#FFEAA8" />
            <circle cx="31" cy="24" r="7" fill="#5EE5E2" fillOpacity="0.35" />
          </svg>
        </div>
      );

    case "dark-academia":
      // Gothic fluted stone pedestal with leather folios & candelabra
      return (
        <div className="absolute -bottom-1 -left-3 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 58 68" className="w-[58px] h-[68px] overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]">
            {/* Fluted Stone Pedestal */}
            <rect x="14" y="44" width="30" height="22" rx="1" fill="#241D1A" stroke={trimColor} strokeWidth="1.3" />
            <line x1="10" y1="66" x2="48" y2="66" stroke={trimColor} strokeWidth="2.5" />
            {/* Stacked Leather-bound Tomes */}
            <rect x="16" y="38" width="26" height="6" rx="1" fill="#692518" stroke={trimColor} strokeWidth="0.9" />
            <rect x="18" y="32" width="22" height="6" rx="1" fill="#1C382A" stroke={trimColor} strokeWidth="0.9" />
            {/* Brass 3-Candle Candelabra */}
            <path d="M29 32V20M23 24H35M23 24V18M35 24V18" stroke={trimColor} strokeWidth="1.4" />
            {/* Candle Flames */}
            <circle cx="23" cy="16" r="1.8" fill="#FFD57E" />
            <circle cx="29" cy="14" r="2.2" fill="#FFEAA8" />
            <circle cx="35" cy="16" r="1.8" fill="#FFD57E" />
          </svg>
        </div>
      );

    case "adventure-exploration":
      // Stack of weathered sea trunks & rolled chart
      return (
        <div className="absolute -bottom-1 -left-4 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 72 60" className="w-[72px] h-[60px] overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]">
            {/* Bottom Sea Trunk */}
            <rect x="10" y="34" width="52" height="22" rx="2" fill="#1B3B47" stroke={trimColor} strokeWidth="1.4" />
            <line x1="10" y1="44" x2="62" y2="44" stroke={trimColor} strokeWidth="1.2" />
            {/* Brass Corner Protectors & Straps */}
            <rect x="12" y="34" width="4" height="22" fill="#D4A35B" />
            <rect x="56" y="34" width="4" height="22" fill="#D4A35B" />
            <circle cx="36" cy="44" r="2" fill={accentColor} />
            {/* Top Steamer Trunk */}
            <rect x="18" y="20" width="36" height="15" rx="2" fill="#452F1C" stroke={trimColor} strokeWidth="1.2" />
            <line x1="18" y1="27" x2="54" y2="27" stroke={trimColor} strokeWidth="1" />
            {/* Rolled Nautical Chart */}
            <rect x="42" y="16" width="22" height="5" rx="2.5" fill="#F4E9D0" stroke="#9C7942" strokeWidth="0.8" transform="rotate(-15 42 16)" />
          </svg>
        </div>
      );

    case "fairytale-whimsical":
      // Whimsical two-wheeled flower cart with wisteria & lanterns
      return (
        <div className="absolute -bottom-1 -left-4 z-20 pointer-events-none select-none">
          <svg viewBox="0 0 76 60" className="w-[76px] h-[60px] overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)]">
            {/* Wooden Cart Box */}
            <polygon points="12,24 64,24 58,42 18,42" fill="#4B2754" stroke={trimColor} strokeWidth="1.3" />
            {/* Spoked Wooden Wheel */}
            <circle cx="38" cy="46" r="11" fill="none" stroke={trimColor} strokeWidth="1.8" />
            <circle cx="38" cy="46" r="2.5" fill={accentColor} />
            <line x1="38" y1="35" x2="38" y2="57" stroke={trimColor} strokeWidth="1" />
            <line x1="27" y1="46" x2="49" y2="46" stroke={trimColor} strokeWidth="1" />
            {/* Cart Handles / Legs */}
            <line x1="14" y1="30" x2="4" y2="24" stroke="#33183B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="56" y1="42" x2="62" y2="54" stroke="#33183B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cascading Violet Blossoms */}
            <circle cx="22" cy="20" r="4" fill="#D9A6DB" />
            <circle cx="30" cy="18" r="5" fill="#E8BDEF" />
            <circle cx="40" cy="19" r="4.5" fill="#C98BCB" />
            <circle cx="50" cy="21" r="5" fill="#E8BDEF" />
            <circle cx="58" cy="23" r="3.5" fill="#D9A6DB" />
            {/* Fairy Light Glow */}
            <circle cx="34" cy="22" r="2" fill="#FFF2BD" />
            <circle cx="46" cy="24" r="2" fill="#FFF2BD" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}

