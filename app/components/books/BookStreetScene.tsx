"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import type { BookCatalogItem, BookCatalogManifest } from "./types";
import { buildShowcaseBoulevard } from "./catalogMapper";
import BookHouseFacade from "./BookHouseFacade";
import StreetTraveller from "./StreetTraveller";
import BookDoorPortal from "./BookDoorPortal";
import BookInteriorModal from "./BookInteriorModal";
import BookStreetEnvironment from "./BookStreetEnvironment";

interface BookStreetSceneProps {
  catalog: BookCatalogManifest;
}

type EntryState =
  | "idle"
  | "selecting"
  | "aligning"
  | "unlatching"
  | "opening-door"
  | "entering"
  | "interior"
  | "closing";

const STREET_LEAD_IN_PX = 320;
const STREET_TRAIL_OUT_PX = 480;

/** Vintage wrought-iron streetlamp placed every 3 houses along the boulevard */
function StreetLamp({ x, scale }: { x: number; scale: number }) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 flex flex-col items-center z-20"
      style={{
        left: `${x}px`,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "bottom center",
      }}
      aria-hidden="true"
    >
      {/* Warm Atmospheric Halo */}
      <div
        className="w-24 h-24 rounded-full -mb-14 blur-xl opacity-75"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 224, 142, 0.72) 0%, rgba(235, 152, 62, 0.25) 55%, transparent 75%)",
        }}
      />
      {/* Lantern Glass Head */}
      <div className="relative w-4 h-6 rounded-t-full border border-[#E6C387] bg-gradient-to-b from-[#FFF8DC] via-[#FFD885] to-[#D9822B] shadow-[0_0_18px_rgba(255,219,130,0.9)]" />
      {/* Crossbar */}
      <div className="w-6 h-1 bg-[#232538] border-t border-[#D8AE68]/50 rounded-full" />
      {/* Cast-iron Fluted Post */}
      <div className="w-1.5 h-[142px] bg-gradient-to-r from-[#141624] via-[#2B2F47] to-[#121320]" />
      {/* Base Pedestal */}
      <div className="w-3.5 h-4.5 rounded-t-sm bg-[#191B2C] border-t border-[#D8AE68]/40" />
    </div>
  );
}

export default function BookStreetScene({ catalog }: BookStreetSceneProps) {
  const [filterMode, setFilterMode] = useState<"all" | "clean" | "needs-review">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [viewportWidth, setViewportWidth] = useState(1280);
  const [stageHeight, setStageHeight] = useState(700);
  const [worldX, setWorldX] = useState(0);
  const [progress, setProgress] = useState(0);
  const [walkPhase, setWalkPhase] = useState(0);
  const [walkIntensity, setWalkIntensity] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [entryState, setEntryState] = useState<EntryState>("idle");

  const targetWorldXRef = useRef(0);
  const currentWorldXRef = useRef(0);
  const lastWorldXRef = useRef(0);
  const walkIntensityRef = useRef(0);
  const facingRef = useRef<1 | -1>(1);
  const savedScrollYRef = useRef(0);
  const entryTimersRef = useRef<number[]>([]);
  const activeKeysRef = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const entryStateRef = useRef<EntryState>(entryState);

  // Keep entryStateRef synchronized and clear active keys when entering a house
  useEffect(() => {
    entryStateRef.current = entryState;
    if (entryState !== "idle") {
      activeKeysRef.current.left = false;
      activeKeysRef.current.right = false;
    }
  }, [entryState]);

  // Keyboard Left / Right arrow navigation along the boulevard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if currently inside a house or typing in search/input
      if (entryStateRef.current !== "idle") return;

      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        targetTag === "input" ||
        targetTag === "textarea" ||
        targetTag === "select" ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        activeKeysRef.current.right = true;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        activeKeysRef.current.left = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        activeKeysRef.current.right = false;
      } else if (e.key === "ArrowLeft") {
        activeKeysRef.current.left = false;
      }
    };

    const handleBlur = () => {
      activeKeysRef.current.left = false;
      activeKeysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Map catalogue with the 10 reference archetype showcases in order 01 to 10,
  // followed by all remaining books mapped to their respective archetypes
  const mappedCatalogBooks = useMemo(() => {
    return buildShowcaseBoulevard(catalog.books);
  }, [catalog.books]);

  // Filter visible books (hide only if user explicitly sets "hidden": true in overrides.json)
  const visibleBooks = useMemo(() => {
    return mappedCatalogBooks.filter((b) => {
      if (b.hidden) return false;
      if (filterMode === "clean") return b.recordStatus === "clean";
      if (filterMode === "needs-review")
        return b.recordStatus === "needs-review";
      return true;
    });
  }, [mappedCatalogBooks, filterMode]);

  // Search results for quick jump dropdown
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return visibleBooks.slice(0, 12);
    return visibleBooks
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.series && b.series.toLowerCase().includes(q)) ||
          String(b.streetOrder) === q.replace(/^#/, "")
      )
      .slice(0, 15);
  }, [visibleBooks, searchQuery]);

  // Base unscaled height of house (506px) + curb (48px) + sky headroom (36px) = 590px
  const baseStreetHeight = 590;
  const streetScale = useMemo(() => {
    if (stageHeight >= baseStreetHeight) return 1;
    // Smoothly scale down for smaller screen heights, clamped between 0.55 and 1
    return Math.min(1, Math.max(0.55, stageHeight / baseStreetHeight));
  }, [stageHeight]);

  const houseWidth = Math.round(380 * streetScale);
  const houseGap = Math.round(40 * streetScale);
  const houseHeight = Math.round(506 * streetScale);

  // Compute horizontal X layout for every book-house along the street
  const houseLayout = useMemo(() => {
    let cursorX = Math.round(STREET_LEAD_IN_PX * streetScale);
    const placements: {
      book: BookCatalogItem;
      startX: number;
      centerX: number;
      endX: number;
      width: number;
    }[] = [];
    const lampPositions: number[] = [];

    visibleBooks.forEach((book, idx) => {
      const w = houseWidth;
      const startX = cursorX;
      const centerX = startX + w / 2;
      const endX = startX + w;
      placements.push({ book, startX, centerX, endX, width: w });

      if (idx % 3 === 0) {
        lampPositions.push(startX - houseGap / 2);
      }

      cursorX = endX + houseGap;
    });

    const totalStreetWidth = Math.max(
      viewportWidth + 400,
      cursorX + Math.round(STREET_TRAIL_OUT_PX * streetScale)
    );

    return { placements, lampPositions, totalStreetWidth };
  }, [visibleBooks, viewportWidth, houseWidth, houseGap, streetScale]);

  const maxWorldTravel = Math.max(
    1,
    houseLayout.totalStreetWidth - viewportWidth
  );

  // Total vertical scroll height (1px vertical scroll = ~1.15px horizontal street progression)
  const totalScrollHeightPx = useMemo(() => {
    return Math.round(maxWorldTravel * 0.92 + 1000);
  }, [maxWorldTravel]);

  // Measure viewport width and available stage height (minus header & footer)
  useEffect(() => {
    const updateSize = () => {
      setViewportWidth(window.innerWidth);
      const h = window.innerHeight - 98;
      setStageHeight(Math.max(300, h));
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Clear pending choreography timers helper
  const clearEntryTimers = useCallback(() => {
    entryTimersRef.current.forEach((id) => window.clearTimeout(id));
    entryTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearEntryTimers();
  }, [clearEntryTimers]);

  // Smooth RAF loop synchronizing scrollY -> worldX, traveller position, and walking gait
  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      const maxScrollY = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const scrollRatio = Math.min(1, Math.max(0, window.scrollY / maxScrollY));
      targetWorldXRef.current = scrollRatio * maxWorldTravel;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const tick = () => {
      // Process continuous smooth walking via ArrowRight / ArrowLeft
      if (entryStateRef.current === "idle") {
        const dir =
          (activeKeysRef.current.right ? 1 : 0) -
          (activeKeysRef.current.left ? 1 : 0);
        if (dir !== 0) {
          const speed = 16;
          const currentScrollY = window.scrollY;
          const maxScrollY = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight
          );
          const nextScrollY = Math.min(
            maxScrollY,
            Math.max(0, currentScrollY + dir * speed)
          );
          if (nextScrollY !== currentScrollY) {
            window.scrollTo({
              top: nextScrollY,
              behavior: "instant" as ScrollBehavior,
            });
            const scrollRatio = nextScrollY / maxScrollY;
            targetWorldXRef.current = scrollRatio * maxWorldTravel;
          }
        }
      }

      const target = targetWorldXRef.current;
      const current = currentWorldXRef.current;
      const next = current + (target - current) * 0.14;
      currentWorldXRef.current = next;

      const delta = next - lastWorldXRef.current;
      lastWorldXRef.current = next;

      if (Math.abs(delta) > 0.18) {
        facingRef.current = delta >= 0 ? 1 : -1;
      }

      // Compute smooth walking intensity from horizontal velocity
      const instantSpeed = Math.min(1, Math.abs(delta) / 6.5);
      walkIntensityRef.current =
        walkIntensityRef.current * 0.84 + instantSpeed * 0.16;
      if (walkIntensityRef.current < 0.01) walkIntensityRef.current = 0;

      const clampedProgress = Math.min(
        1,
        Math.max(0, next / Math.max(1, maxWorldTravel))
      );

      setWorldX(next);
      setProgress(clampedProgress);
      setWalkPhase(next * 0.062);
      setWalkIntensity(walkIntensityRef.current);
      setFacing(facingRef.current);

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, [maxWorldTravel]);

  // Traveller's screen X progresses Left -> Right (20% -> 76%) as houses move Right -> Left
  const travellerScreenXPercent = 20 + progress * 56;
  const travellerWorldX =
    worldX + (travellerScreenXPercent / 100) * viewportWidth;

  // Find the house currently nearest to the traveller
  const nearestPlacement = useMemo(() => {
    if (houseLayout.placements.length === 0) return null;
    let best = houseLayout.placements[0];
    let bestDist = Math.abs(best.centerX - travellerWorldX);
    for (const p of houseLayout.placements) {
      const d = Math.abs(p.centerX - travellerWorldX);
      if (d < bestDist) {
        best = p;
        bestDist = d;
      }
    }
    return best;
  }, [houseLayout.placements, travellerWorldX]);

  // Virtualized slice of houses visible in or near the current viewport
  const visiblePlacements = useMemo(() => {
    const buffer = 950;
    const minX = worldX - buffer;
    const maxX = worldX + viewportWidth + buffer;
    return houseLayout.placements.filter(
      (p) => p.endX >= minX && p.startX <= maxX
    );
  }, [houseLayout.placements, worldX, viewportWidth]);

  const visibleLamps = useMemo(() => {
    const buffer = 600;
    const minX = worldX - buffer;
    const maxX = worldX + viewportWidth + buffer;
    return houseLayout.lampPositions.filter((lx) => lx >= minX && lx <= maxX);
  }, [houseLayout.lampPositions, worldX, viewportWidth]);

  // Compute scrollY needed to place a given house right in front of the traveller
  const scrollToPlaceHouseAtTraveller = useCallback(
    (houseCenterX: number, smooth = true) => {
      // Solve for progress p in [0, 1]:
      // p * maxWorldTravel + (0.20 + 0.56 * p) * viewportWidth = houseCenterX
      const denom = maxWorldTravel + 0.56 * viewportWidth;
      const desiredProgress = Math.min(
        1,
        Math.max(0, (houseCenterX - 0.2 * viewportWidth) / Math.max(1, denom))
      );
      const maxScrollY = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const targetScrollY = desiredProgress * maxScrollY;
      window.scrollTo({
        top: targetScrollY,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [maxWorldTravel, viewportWidth]
  );

  // 5-Phase Hyper-Realistic Door Zoom -> Unlatch -> Throw Double Doors Open -> Step Through Sequence
  const handleSelectHouse = useCallback(
    (book: BookCatalogItem) => {
      if (entryState !== "idle" && selectedBookId === book.id) return;
      clearEntryTimers();

      savedScrollYRef.current = window.scrollY;
      setSelectedBookId(book.id);
      setEntryState("aligning");
      setSearchOpen(false);

      const placement = houseLayout.placements.find(
        (p) => p.book.id === book.id
      );
      if (placement) {
        scrollToPlaceHouseAtTraveller(placement.centerX, true);
      }

      // Push browser history state so Back button returns to the street
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("house", book.id);
        window.history.pushState({ houseId: book.id }, "", url.toString());
      }

      // Phase 2: Camera zooms into the doorway; brass handles unlatch & golden seam splits open
      const t1 = window.setTimeout(() => {
        setEntryState("unlatching");
      }, 340);

      // Phase 3: Heavy 3D double doors are thrown wide open, spilling volumetric light
      const t2 = window.setTimeout(() => {
        setEntryState("opening-door");
      }, 580);

      // Phase 4: Camera glides straight through the open double doors into the library
      const t3 = window.setTimeout(() => {
        setEntryState("entering");
      }, 1240);

      // Phase 5: Reading room synopsis & edition view settles in
      const t4 = window.setTimeout(() => {
        setEntryState("interior");
      }, 1780);

      entryTimersRef.current.push(t1, t2, t3, t4);
    },
    [
      clearEntryTimers,
      entryState,
      houseLayout.placements,
      scrollToPlaceHouseAtTraveller,
      selectedBookId,
    ]
  );

  // Return to the Street from the Interior Reading Room
  const handleCloseInterior = useCallback(() => {
    clearEntryTimers();
    setEntryState("closing");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("house")) {
        url.searchParams.delete("house");
        window.history.replaceState({}, "", url.toString());
      }
    }

    const t1 = window.setTimeout(() => {
      setEntryState("idle");
      setSelectedBookId(null);
    }, 460);

    entryTimersRef.current.push(t1);
  }, [clearEntryTimers]);

  // Listen for browser Back button (`popstate`) while inside a house
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const houseParam = params.get("house");
      if (!houseParam && entryState !== "idle") {
        clearEntryTimers();
        setEntryState("idle");
        setSelectedBookId(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [clearEntryTimers, entryState]);

  // Navigate to Previous / Next House while inside the Interior Modal
  const handleNavigateAdjacentHouse = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedBookId) return;
      const idx = houseLayout.placements.findIndex(
        (p) => p.book.id === selectedBookId
      );
      if (idx === -1) return;
      const nextIdx = direction === "prev" ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= houseLayout.placements.length) return;

      const targetPlacement = houseLayout.placements[nextIdx];
      setSelectedBookId(targetPlacement.book.id);
      scrollToPlaceHouseAtTraveller(targetPlacement.centerX, false);
    },
    [houseLayout.placements, scrollToPlaceHouseAtTraveller, selectedBookId]
  );

  const selectedPlacement = useMemo(
    () =>
      houseLayout.placements.find((p) => p.book.id === selectedBookId) || null,
    [houseLayout.placements, selectedBookId]
  );

  // Compute exact traveller screen X when aligning/entering a selected house
  const effectiveTravellerScreenXPercent = useMemo(() => {
    if (
      selectedPlacement &&
      (entryState === "aligning" ||
        entryState === "unlatching" ||
        entryState === "opening-door" ||
        entryState === "entering")
    ) {
      const screenPx = selectedPlacement.centerX - worldX + 24;
      const pct = (screenPx / Math.max(1, viewportWidth)) * 100;
      return Math.min(86, Math.max(14, pct));
    }
    return travellerScreenXPercent;
  }, [
    entryState,
    selectedPlacement,
    travellerScreenXPercent,
    viewportWidth,
    worldX,
  ]);

  // Camera dolly-zoom transform into the clicked doorway
  const cameraZoomStyle = useMemo(() => {
    if (
      (entryState === "unlatching" ||
        entryState === "opening-door" ||
        entryState === "entering" ||
        entryState === "interior") &&
      selectedPlacement
    ) {
      const doorX = selectedPlacement.centerX - worldX + 24;
      const originX = Math.min(90, Math.max(10, (doorX / viewportWidth) * 100));
      return {
        transformOrigin: `${originX}% 78%`,
        transform:
          entryState === "entering" || entryState === "interior"
            ? "scale(3.1) translateY(10%)"
            : "scale(2.25) translateY(6%)",
        filter: "brightness(1.12)",
      };
    }
    if (entryState === "aligning" && selectedPlacement) {
      const doorX = selectedPlacement.centerX - worldX + 24;
      const originX = Math.min(90, Math.max(10, (doorX / viewportWidth) * 100));
      return {
        transformOrigin: `${originX}% 78%`,
        transform: "scale(1.45) translateY(3%)",
        filter: "brightness(1.04)",
      };
    }
    return {
      transformOrigin: "50% 74%",
      transform: "scale(1) translateY(0px)",
      filter: "brightness(1)",
    };
  }, [entryState, selectedPlacement, viewportWidth, worldX]);

  return (
    <div
      className="relative w-full bg-[#090B16] text-[#F5EFE6] selection:bg-[#D8AE68]/30"
      style={{ height: `${totalScrollHeightPx}px` }}
    >
      {/* FIXED FULL-VIEWPORT BLUE-HOUR STREET STAGE */}
      <div className="fixed inset-0 overflow-hidden flex flex-col justify-between">
        {/* TOP FIXED NAVIGATION & STREET CONTROLS */}
        <header className="relative z-40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-[#070913]/95 via-[#070913]/75 to-transparent backdrop-blur-md border-b border-white/10">
          {/* Left: Back to Home + Page Title */}
          <div className="flex items-center gap-4">
            <Link
              href="/#worlds"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] bg-white/5 hover:bg-white/10 border border-[#D8AE68]/40 text-[#F3D393] transition"
            >
              <span>←</span>
              <span>Return to Worlds</span>
            </Link>

            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#D8AE68]">
                02 • Literary Boulevard
              </span>
              <h1 className="font-serif text-base sm:text-lg font-medium tracking-wide text-white">
                The Book Street
              </h1>
            </div>
          </div>

          {/* Center: Current Street Address & Filter Pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111528]/85 border border-white/10 text-xs">
              <span className="text-[#D8AE68] font-mono">
                No.{" "}
                {String(nearestPlacement?.book.streetOrder ?? 1).padStart(
                  2,
                  "0"
                )}
                /{visibleBooks.length}
              </span>
              <span className="text-white/30">|</span>
              <span className="text-white/85 truncate max-w-[200px] font-serif">
                {nearestPlacement?.book.title ?? "Strolling the Boulevard"}
              </span>
            </div>

            {/* Record Status Filter */}
            <div className="inline-flex rounded-full p-0.5 bg-[#101324]/90 border border-white/10 text-[11px]">
              {(
                [
                  { key: "all", label: `All (${catalog.total})` },
                  {
                    key: "clean",
                    label: `Verified (${
                      catalog.total - catalog.needsReview
                    })`,
                  },
                  {
                    key: "needs-review",
                    label: `Review (${catalog.needsReview})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setFilterMode(tab.key);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`px-2.5 py-1 rounded-full transition ${
                    filterMode === tab.key
                      ? "bg-[#D8AE68] text-[#14100B] font-semibold"
                      : "text-white/65 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quick Find / Jump to Any House */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-[#13172B]/90 hover:bg-[#1B203B] border border-[#D8AE68]/40 text-[#F3D393] transition"
            >
              <span>⌕</span>
              <span>Find a Book-House</span>
            </button>

            {searchOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F1222]/95 backdrop-blur-xl border border-[#D8AE68]/45 shadow-2xl p-3 z-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or house #..."
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D8AE68]"
                />
                <div className="mt-2 max-h-64 overflow-y-auto divide-y divide-white/5">
                  {searchMatches.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectHouse(b)}
                      className="w-full px-2.5 py-2 text-left hover:bg-white/10 rounded flex items-center justify-between gap-2 transition"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-serif text-white truncate">
                          {b.title}
                        </div>
                        <div className="text-[10.5px] text-white/55 truncate">
                          {b.author || "Author Unlisted (Needs Review)"}
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#D8AE68]">
                        #{String(b.streetOrder).padStart(2, "0")}
                      </span>
                    </button>
                  ))}
                  {searchMatches.length === 0 && (
                    <div className="py-4 text-center text-xs text-white/50">
                      No matching book-houses found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* CAMERA STAGE (Zooms smoothly into the open door during Phase 4) */}
        <div
          className="relative flex-1 w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={cameraZoomStyle}
        >
          {/* CINEMATIC TWILIGHT ENVIRONMENT: Sky, Moon, Stars, Mountain Castle, Waterfalls, Canal & Cobblestones */}
          <BookStreetEnvironment
            worldX={worldX}
            totalStreetWidth={houseLayout.totalStreetWidth}
          />

          {/* MAIN BOOK-HOUSE TOWNHOUSE ROW (Moves Right -> Left on Scroll) */}
          <div
            className="absolute bottom-[48px] left-0 z-10"
            style={{
              width: `${houseLayout.totalStreetWidth}px`,
              transform: `translate3d(${-worldX}px, 0, 0)`,
            }}
          >
            {/* Virtualized Book-Houses */}
            {visiblePlacements.map(({ book, startX }) => {
              const isSelected = selectedBookId === book.id;
              const isNearest = nearestPlacement?.book.id === book.id;
              const isDoorOpen =
                isSelected &&
                (entryState === "opening-door" ||
                  entryState === "entering" ||
                  entryState === "interior");
              const isEntering =
                isSelected &&
                (entryState === "entering" || entryState === "interior");

              return (
                <div
                  key={book.id}
                  className="absolute bottom-0"
                  style={{
                    left: `${startX}px`,
                    width: `${houseWidth}px`,
                    height: `${houseHeight}px`,
                  }}
                >
                  <div
                    style={{
                      width: "380px",
                      height: "506px",
                      transform: `scale(${streetScale})`,
                      transformOrigin: "bottom left",
                    }}
                  >
                    <BookHouseFacade
                      book={book}
                      isSelected={isSelected}
                      isDoorOpen={isDoorOpen}
                      isEntering={isEntering}
                      isNearestToTraveller={isNearest}
                      onSelect={handleSelectHouse}
                    />
                  </div>
                </div>
              );
            })}

            {/* Vintage Cast-Iron Streetlamps along the sidewalk */}
            {visibleLamps.map((lx) => (
              <StreetLamp key={lx} x={lx} scale={streetScale} />
            ))}
          </div>

          {/* WALKING HUMAN TRAVELLER (Progresses Left -> Right as Houses Move Right -> Left) */}
          <StreetTraveller
            screenXPercent={effectiveTravellerScreenXPercent}
            walkPhase={walkPhase}
            walkIntensity={walkIntensity}
            facing={facing}
            entryState={
              entryState === "unlatching"
                ? "opening-door"
                : entryState === "closing"
                ? "idle"
                : entryState
            }
            scale={streetScale}
          />
        </div>

        {/* HYPER-REALISTIC 3D DOUBLE-DOOR PORTAL OVERLAY (Zooms in, unlatches, throws double doors wide open, steps through) */}
        {selectedPlacement &&
          (entryState === "aligning" ||
            entryState === "unlatching" ||
            entryState === "opening-door" ||
            entryState === "entering" ||
            entryState === "closing") && (
            <BookDoorPortal
              key={`portal-${selectedPlacement.book.id}`}
              book={selectedPlacement.book}
              phase={
                entryState === "aligning"
                  ? "zooming-in"
                  : entryState === "unlatching"
                  ? "unlatching"
                  : entryState === "opening-door"
                  ? "throwing-open"
                  : entryState === "entering"
                  ? "stepping-through"
                  : "closing"
              }
            />
          )}

        {/* BOTTOM STREET PROGRESS SCRUBBER & HINT BAR */}
        <footer className="relative z-40 px-4 sm:px-8 py-2.5 bg-[#070812]/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-white/70">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D8AE68] animate-pulse" />
            <span>
              Scroll or use ← / → Arrow Keys to walk the boulevard • Click any book-house door to step inside
            </span>
          </div>

          {/* Interactive Street Progress Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-[10.5px] font-mono text-white/50">No. 01</span>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.min(
                  1,
                  Math.max(0, (e.clientX - rect.left) / rect.width)
                );
                const maxScrollY = Math.max(
                  1,
                  document.documentElement.scrollHeight - window.innerHeight
                );
                window.scrollTo({
                  top: ratio * maxScrollY,
                  behavior: "smooth",
                });
              }}
              className="relative flex-1 h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden"
              title="Click to jump along the street"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B88642] via-[#D8AE68] to-[#FFF0BE]"
                style={{ width: `${Math.max(2, progress * 100)}%` }}
              />
            </div>
            <span className="text-[10.5px] font-mono text-white/50">
              No. {String(visibleBooks.length).padStart(2, "0")}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-white/50">
            <span>Covers & Bibliographic Data via</span>
            <a
              href="https://openlibrary.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F3D393] hover:underline"
            >
              Open Library
            </a>
          </div>
        </footer>
      </div>

      {/* PHASE 5: BOOK-HOUSE INTERIOR READING ROOM MODAL */}
      {entryState === "interior" && selectedPlacement && (
        <BookInteriorModal
          key={selectedPlacement.book.id}
          book={selectedPlacement.book}
          totalHouses={visibleBooks.length}
          onClose={handleCloseInterior}
          onNavigateHouse={handleNavigateAdjacentHouse}
        />
      )}
    </div>
  );
}
