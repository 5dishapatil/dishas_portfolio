import React from "react";

export type HouseArchetypeId =
  | "romance"
  | "fantasy"
  | "mystery"
  | "peaceful-reads"
  | "self-help"
  | "finance-business"
  | "sci-fi"
  | "dark-academia"
  | "adventure-exploration"
  | "fairytale-whimsical";

export interface ArchetypeConfig {
  id: HouseArchetypeId;
  number: string;
  name: string;
  subGenreTitle: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  primaryColor: string;
  secondaryColor: string;
  trimColor: string;
  accentColor: string;
  roofSlateColor: string;
  doorWoodColor: string;
  windowGlowColor: string;
  groundProp: "cafe-table" | "stone-urns" | "autumn-bench" | "wooden-bench" | "marble-lions" | "astro-spheres" | "stone-pillars" | "nautical-trunks" | "flower-cart" | "none";
}

export const ARCHETYPES: Record<HouseArchetypeId, ArchetypeConfig> = {
  romance: {
    id: "romance",
    number: "01",
    name: "ROMANCE",
    subGenreTitle: "Love & Passion",
    badgeBg: "linear-gradient(180deg, #3D121F 0%, #220810 100%)",
    badgeBorder: "#E8A4B8",
    badgeText: "#FFE6EE",
    primaryColor: "#B55A75",
    secondaryColor: "#7D3349",
    trimColor: "#F5D2DC",
    accentColor: "#FFD382",
    roofSlateColor: "#612437",
    doorWoodColor: "#9C3C5A",
    windowGlowColor: "#FFE7A3",
    groundProp: "cafe-table",
  },
  fantasy: {
    id: "fantasy",
    number: "02",
    name: "FANTASY",
    subGenreTitle: "Magic & Realms",
    badgeBg: "linear-gradient(180deg, #0A2B22 0%, #041410 100%)",
    badgeBorder: "#D8AE68",
    badgeText: "#FBF3DE",
    primaryColor: "#1B4D41",
    secondaryColor: "#0D2E26",
    trimColor: "#D8AE68",
    accentColor: "#FDE39B",
    roofSlateColor: "#0A241E",
    doorWoodColor: "#123D33",
    windowGlowColor: "#FFE396",
    groundProp: "stone-urns",
  },
  mystery: {
    id: "mystery",
    number: "03",
    name: "MURDER MYSTERY",
    subGenreTitle: "Suspense & Secrets",
    badgeBg: "linear-gradient(180deg, #1C1D24 0%, #0E0F14 100%)",
    badgeBorder: "#A3866A",
    badgeText: "#EDE3D8",
    primaryColor: "#2F313D",
    secondaryColor: "#1C1D26",
    trimColor: "#C99A6B",
    accentColor: "#E5A855",
    roofSlateColor: "#181920",
    doorWoodColor: "#2A1F1B",
    windowGlowColor: "#FFD988",
    groundProp: "autumn-bench",
  },
  "peaceful-reads": {
    id: "peaceful-reads",
    number: "04",
    name: "PEACEFUL READS",
    subGenreTitle: "Solace & Thought",
    badgeBg: "linear-gradient(180deg, #243322 0%, #121C11 100%)",
    badgeBorder: "#A8BD9D",
    badgeText: "#F2F7EF",
    primaryColor: "#4E6649",
    secondaryColor: "#2D3D2A",
    trimColor: "#D1C4A5",
    accentColor: "#F5DF9E",
    roofSlateColor: "#2A3828",
    doorWoodColor: "#523B2A",
    windowGlowColor: "#FFEAA8",
    groundProp: "wooden-bench",
  },
  "self-help": {
    id: "self-help",
    number: "05",
    name: "SELF HELP",
    subGenreTitle: "Mind & Wisdom",
    badgeBg: "linear-gradient(180deg, #3A2B18 0%, #1E1508 100%)",
    badgeBorder: "#ECC369",
    badgeText: "#FFF4D4",
    primaryColor: "#E2D3BE",
    secondaryColor: "#B5A187",
    trimColor: "#E6BA55",
    accentColor: "#FFF1C4",
    roofSlateColor: "#8F7C65",
    doorWoodColor: "#9C7638",
    windowGlowColor: "#FFF0BE",
    groundProp: "stone-urns",
  },
  "finance-business": {
    id: "finance-business",
    number: "06",
    name: "FINANCE & BUSINESS",
    subGenreTitle: "Strategy & Fortune",
    badgeBg: "linear-gradient(180deg, #262016 0%, #110E08 100%)",
    badgeBorder: "#D8AE68",
    badgeText: "#FFF0CE",
    primaryColor: "#D6C7B2",
    secondaryColor: "#9E8E78",
    trimColor: "#D4AF37",
    accentColor: "#FFEAA8",
    roofSlateColor: "#5E5244",
    doorWoodColor: "#47301F",
    windowGlowColor: "#FFE7A3",
    groundProp: "marble-lions",
  },
  "sci-fi": {
    id: "sci-fi",
    number: "07",
    name: "SCIENCE FICTION",
    subGenreTitle: "Cosmos & Future",
    badgeBg: "linear-gradient(180deg, #0E1A33 0%, #060D1A 100%)",
    badgeBorder: "#4DEEEA",
    badgeText: "#E0FBFF",
    primaryColor: "#182C4E",
    secondaryColor: "#0E1C33",
    trimColor: "#5EE5E2",
    accentColor: "#FFC66E",
    roofSlateColor: "#0A1424",
    doorWoodColor: "#1E365C",
    windowGlowColor: "#FFEAAD",
    groundProp: "astro-spheres",
  },
  "dark-academia": {
    id: "dark-academia",
    number: "08",
    name: "DARK ACADEMIA",
    subGenreTitle: "Scholars & Arcana",
    badgeBg: "linear-gradient(180deg, #211B18 0%, #0D0A08 100%)",
    badgeBorder: "#C49A58",
    badgeText: "#F5ECE1",
    primaryColor: "#3D3430",
    secondaryColor: "#241D1A",
    trimColor: "#D6A85A",
    accentColor: "#FFD57E",
    roofSlateColor: "#1B1513",
    doorWoodColor: "#2B1A14",
    windowGlowColor: "#FFE49E",
    groundProp: "stone-pillars",
  },
  "adventure-exploration": {
    id: "adventure-exploration",
    number: "09",
    name: "ADVENTURE & EXPLORATION",
    subGenreTitle: "Journeys & Discovery",
    badgeBg: "linear-gradient(180deg, #132E38 0%, #08171C 100%)",
    badgeBorder: "#D4A35B",
    badgeText: "#F0FAFC",
    primaryColor: "#205463",
    secondaryColor: "#123742",
    trimColor: "#E0AA53",
    accentColor: "#FFE196",
    roofSlateColor: "#0F2830",
    doorWoodColor: "#523B2A",
    windowGlowColor: "#FFEAA8",
    groundProp: "nautical-trunks",
  },
  "fairytale-whimsical": {
    id: "fairytale-whimsical",
    number: "10",
    name: "FAIRYTALE & WHIMSICAL",
    subGenreTitle: "Wonders & Dreams",
    badgeBg: "linear-gradient(180deg, #2D1B36 0%, #15091C 100%)",
    badgeBorder: "#D9A6DB",
    badgeText: "#FDF0FE",
    primaryColor: "#7D528A",
    secondaryColor: "#53335E",
    trimColor: "#E4BCE6",
    accentColor: "#FFE899",
    roofSlateColor: "#3E2247",
    doorWoodColor: "#693F75",
    windowGlowColor: "#FFECA8",
    groundProp: "flower-cart",
  },
};

/** Renders the style's distinctive badge emblem icon */
export function ArchetypeBadgeIcon({
  archetypeId,
  className = "w-3 h-3",
}: {
  archetypeId: HouseArchetypeId;
  className?: string;
}) {
  switch (archetypeId) {
    case "romance":
      // Delicate heart emblem
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M8 14s-5.5-3.5-6.8-6.4C-0.3 4.5 1.8 1.5 5 2.2c1.4.3 2.4 1.5 3 2.3.6-.8 1.6-2 3-2.3 3.2-.7 5.3 2.3 3.8 5.4C13.5 10.5 8 14 8 14z" />
        </svg>
      );
    case "fantasy":
      // 8-pointed star / heraldic diamond
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M8 0l1.8 5.2L15 8l-5.2 2.8L8 16l-1.8-5.2L1 8l5.2-2.8z" />
        </svg>
      );
    case "mystery":
      // Magnifying glass / mystery lens
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="4.5" />
          <path d="M10 10l4.5 4.5" strokeLinecap="round" />
        </svg>
      );
    case "peaceful-reads":
      // Gentle leaf emblem
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M14 2c-6 0-11 5-11 10 2 0 5-1 7-3s4-7 4-7zM5 12c2-2 4-4 6-5" stroke="#121C11" strokeWidth="1" />
        </svg>
      );
    case "self-help":
      // Radiant lotus / sunburst
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "finance-business":
      // Embossed gold coin / currency symbol
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <text x="8" y="11" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" fontFamily="serif">$</text>
        </svg>
      );
    case "sci-fi":
      // Ringed planet / orbital sphere
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <circle cx="8" cy="8" r="4" />
          <ellipse cx="8" cy="8" rx="7.5" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.3" transform="rotate(-25 8 8)" />
        </svg>
      );
    case "dark-academia":
      // Book & quill emblem
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M2 3h5v10H2zm7 0h5v10H9z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M13 1l-6 8 1 2 2-1 6-8z" />
        </svg>
      );
    case "adventure-exploration":
      // Mariner's compass rose
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" />
        </svg>
      );
    case "fairytale-whimsical":
      // Sparkle / magic stars
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
          <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
          <circle cx="13" cy="3" r="1.2" />
          <circle cx="3" cy="12" r="1" />
        </svg>
      );
  }
}
