"use client";

import React, { useEffect, useState } from "react";
import type { BookCatalogItem, BookSynopsisInfo } from "./types";
import {
  ARCHETYPES,
  ArchetypeBadgeIcon,
  HouseArchetypeId,
} from "./archetypeStyles";

interface BookInteriorModalProps {
  book: BookCatalogItem;
  totalHouses: number;
  onClose: () => void;
  onNavigateHouse: (direction: "prev" | "next") => void;
}

export default function BookInteriorModal({
  book,
  totalHouses,
  onClose,
  onNavigateHouse,
}: BookInteriorModalProps) {
  const [imgError, setImgError] = useState(false);
  const [liveSynopsis, setLiveSynopsis] = useState<BookSynopsisInfo>(
    book.synopsis
  );
  const [showProvenance, setShowProvenance] = useState(
    book.recordStatus === "needs-review"
  );

  // If synopsis is pending or could be enriched by Open Library Work API, query our on-demand endpoint
  useEffect(() => {
    let cancelled = false;
    if (
      book.cover.openLibraryWorkKey &&
      book.synopsis.text.includes("awaiting confirmation")
    ) {
      fetch(`/api/books/${encodeURIComponent(book.id)}/synopsis`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data && data.synopsis) {
            setLiveSynopsis(data.synopsis);
          }
        })
        .catch(() => {
          // Keep pre-resolved synopsis
        });
    }
    return () => {
      cancelled = true;
    };
  }, [book]);

  // Keyboard support: Escape returns to the street; Left/Right arrows step to adjacent houses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigateHouse("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigateHouse("next");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigateHouse]);

  const { architecture, cover } = book;
  const houseNumber = String(book.streetOrder).padStart(2, "0");
  const hasVerifiedCover = Boolean(cover.coverUrl && !imgError);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-interior-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto animate-[fadeIn_380ms_ease-out]"
    >
      {/* Warm Parlor Backdrop with Blue-Hour Window Vignette */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#070811]/85 backdrop-blur-xl transition-opacity"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 35%, ${architecture.primaryColor}66 0%, rgba(9, 11, 22, 0.94) 70%)`,
        }}
      />

      {/* Interior Reading Room Frame */}
      <div
        className="relative z-10 w-full max-w-5xl rounded-2xl border overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] my-auto"
        style={{
          borderColor: `${architecture.trimColor}88`,
          background: `linear-gradient(155deg, #151421 0%, ${architecture.secondaryColor}E6 48%, #0E0F1A 100%)`,
          boxShadow: `0 25px 85px rgba(0,0,0,0.9), 0 0 60px ${architecture.windowGlowColor}22, inset 0 0 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Top Gilt Molding Cornice Bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${architecture.secondaryColor}, ${architecture.trimColor}, ${architecture.accentColor}, ${architecture.trimColor}, ${architecture.secondaryColor})`,
          }}
        />

        {/* Interior Header Bar: Street Address, Status Badges & Return to Street Control */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-b bg-black/25"
          style={{ borderColor: `${architecture.trimColor}33` }}
        >
          <div className="flex items-center gap-3">
            {book.archetypeId && ARCHETYPES[book.archetypeId as HouseArchetypeId] && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-[0.16em] uppercase border shadow-sm"
                style={{
                  background:
                    ARCHETYPES[book.archetypeId as HouseArchetypeId].badgeBg,
                  borderColor:
                    ARCHETYPES[book.archetypeId as HouseArchetypeId].badgeBorder,
                  color:
                    ARCHETYPES[book.archetypeId as HouseArchetypeId].badgeText,
                }}
              >
                <ArchetypeBadgeIcon
                  archetypeId={book.archetypeId as HouseArchetypeId}
                  className="w-3.5 h-3.5"
                />
                <span>
                  {ARCHETYPES[book.archetypeId as HouseArchetypeId].number}{" "}
                  {ARCHETYPES[book.archetypeId as HouseArchetypeId].name}
                </span>
              </span>
            )}

            <span
              className="px-3 py-1 rounded-full text-xs font-serif tracking-[0.18em] uppercase border"
              style={{
                borderColor: `${architecture.trimColor}AA`,
                backgroundColor: `${architecture.primaryColor}AA`,
                color: architecture.accentColor,
              }}
            >
              House No. {houseNumber} of {totalHouses}
            </span>

            {book.recordStatus === "needs-review" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 border border-amber-400/50 text-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Needs Catalogue Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 border border-emerald-400/40 text-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Verified Edition
              </span>
            )}

            {book.duplicateOf && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/20 border border-purple-400/40 text-purple-200">
                Duplicate of {book.duplicateOf}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateHouse("prev")}
              disabled={book.streetOrder <= 1}
              className="px-2.5 py-1.5 rounded-lg text-xs tracking-wider uppercase border border-white/15 text-white/75 hover:text-white hover:border-[#D8AE68]/70 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Previous House (Left Arrow)"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => onNavigateHouse("next")}
              disabled={book.streetOrder >= totalHouses}
              className="px-2.5 py-1.5 rounded-lg text-xs tracking-wider uppercase border border-white/15 text-white/75 hover:text-white hover:border-[#D8AE68]/70 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Next House (Right Arrow)"
            >
              Next →
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ml-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-[0.14em] uppercase transition-all border shadow-md hover:scale-[1.02]"
              style={{
                backgroundColor: architecture.trimColor,
                borderColor: architecture.accentColor,
                color: "#16100B",
              }}
            >
              <span>Step Back Onto Street</span>
              <span className="text-[10px] opacity-75">(Esc)</span>
            </button>
          </div>
        </div>

        {/* Main Parlor Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-5 sm:p-8 md:p-10 items-start">
          {/* Left Column (4 cols): Verified Book Cover or Honest Architectural Spine Fallback */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div
              className="relative w-[210px] sm:w-[235px] aspect-[2/3] rounded-lg p-2.5 border shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              style={{
                borderColor: `${architecture.trimColor}99`,
                background: `linear-gradient(145deg, ${architecture.primaryColor}, ${architecture.secondaryColor})`,
              }}
            >
              {hasVerifiedCover ? (
                <div className="relative w-full h-full rounded overflow-hidden bg-[#0E0F19]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover.coverUrl!}
                    alt={`Front cover of ${book.title}${
                      book.author ? ` by ${book.author}` : ""
                    }`}
                    decoding="async"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle book-spine hinge crease on left edge */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/55 via-white/15 to-transparent" />
                </div>
              ) : (
                /* Honest Architectural Edition Card (Never pretends to be a publisher's cover) */
                <div
                  className="relative w-full h-full rounded border flex flex-col justify-between p-4 text-center overflow-hidden"
                  style={{
                    borderColor: `${architecture.trimColor}88`,
                    background: `radial-gradient(circle at 50% 30%, ${architecture.primaryColor} 0%, ${architecture.secondaryColor} 100%)`,
                  }}
                >
                  <div className="text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded border self-center"
                    style={{
                      borderColor: `${architecture.trimColor}77`,
                      color: architecture.trimColor,
                    }}
                  >
                    Architectural Spine Edition
                  </div>

                  <div className="my-auto space-y-2 px-1">
                    {book.series && (
                      <p
                        className="text-[10px] uppercase tracking-[0.16em]"
                        style={{ color: architecture.trimColor }}
                      >
                        {book.series}
                      </p>
                    )}
                    <h4
                      className="font-serif text-lg font-semibold leading-snug"
                      style={{ color: architecture.accentColor }}
                    >
                      {book.title}
                    </h4>
                    <div
                      className="w-10 h-[1px] mx-auto"
                      style={{ backgroundColor: architecture.trimColor }}
                    />
                    <p className="text-xs uppercase tracking-widest text-white/80">
                      {book.author || "Author Unlisted in Export"}
                    </p>
                  </div>

                  <div className="text-[10px] text-amber-200/85 bg-black/35 rounded p-2 border border-amber-400/30 leading-relaxed">
                    {cover.matchStatus === "missing-author"
                      ? "No cover queried: author is missing from the raw wishlist export."
                      : cover.matchStatus === "ambiguous-author"
                      ? "Held for review: listed author differs from primary Open Library edition."
                      : "No verified cover image indexed on Open Library yet."}
                  </div>
                </div>
              )}
            </div>

            {/* Cover Source & Open Library Attribution */}
            <div className="mt-3 text-center space-y-1 max-w-[240px]">
              {hasVerifiedCover && cover.attribution && (
                <p className="text-[11px] text-white/60 leading-snug">
                  {cover.attribution}
                </p>
              )}
              {cover.openLibraryWorkKey && (
                <a
                  href={`https://openlibrary.org${cover.openLibraryWorkKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium underline underline-offset-4 hover:opacity-90"
                  style={{ color: architecture.accentColor }}
                >
                  <span>View Work on Open Library</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column (8 cols): Title, Author, Verified Synopsis, Sources & Provenance */}
          <div className="md:col-span-8 flex flex-col space-y-5">
            {/* Series & Genre Eyebrow */}
            <div className="flex flex-wrap items-center gap-2">
              {book.series && (
                <span
                  className="px-2.5 py-0.5 rounded text-[11px] uppercase tracking-[0.15em] font-medium border"
                  style={{
                    borderColor: `${architecture.trimColor}77`,
                    color: architecture.accentColor,
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  {book.series}
                </span>
              )}
              {liveSynopsis.genre && (
                <span className="px-2.5 py-0.5 rounded text-[11px] uppercase tracking-[0.14em] text-white/75 bg-white/5 border border-white/10">
                  {liveSynopsis.genre}
                </span>
              )}
              {cover.firstPublishYear && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-white/65 bg-white/5 border border-white/10">
                  First Published {cover.firstPublishYear}
                </span>
              )}
              {book.format && (
                <span className="px-2.5 py-0.5 rounded text-[11px] text-white/60 bg-white/5 border border-white/10">
                  {book.format}
                </span>
              )}
            </div>

            {/* Book Title & Subtitle */}
            <div>
              <h2
                id="book-interior-title"
                className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide leading-tight"
                style={{ color: "#FFF8EB" }}
              >
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="mt-1 font-serif italic text-base sm:text-lg text-white/75">
                  {book.subtitle}
                </p>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-white/60 uppercase tracking-widest text-xs">
                  By
                </span>
                {book.author ? (
                  <span
                    className="font-medium text-base tracking-wide"
                    style={{ color: architecture.accentColor }}
                  >
                    {book.author}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-medium">
                    Author Missing in Wishlist Export (Not Guessed)
                  </span>
                )}

                {book.addedDate && (
                  <span className="text-xs text-white/45">
                    • Added to wishlist {book.addedDate}
                  </span>
                )}
              </div>
            </div>

            {/* Theme Pills */}
            {liveSynopsis.themes && liveSynopsis.themes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {liveSynopsis.themes.map((theme) => (
                  <span
                    key={theme}
                    className="px-2.5 py-1 rounded-full text-xs border bg-black/25 text-white/85"
                    style={{ borderColor: `${architecture.trimColor}55` }}
                  >
                    ✦ {theme}
                  </span>
                ))}
              </div>
            )}

            {/* Spoiler-Free Synopsis Reading Card */}
            <div
              className="rounded-xl p-5 sm:p-6 border relative"
              style={{
                borderColor: `${architecture.trimColor}55`,
                background:
                  "linear-gradient(180deg, rgba(12, 13, 24, 0.72) 0%, rgba(8, 9, 18, 0.88) 100%)",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h3
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: architecture.trimColor }}
                >
                  {liveSynopsis.status === "verified"
                    ? "Verified Spoiler-Free Synopsis"
                    : "Catalogue Verification Note"}
                </h3>
                <span className="text-[11px] text-white/50">
                  Paraphrased • No Plot Spoilers
                </span>
              </div>

              <p className="text-sm sm:text-[15.5px] leading-[1.78] text-[#EFE8DC] font-normal">
                {liveSynopsis.text}
              </p>

              {/* Verified Bibliographic Source Links */}
              {liveSynopsis.sources && liveSynopsis.sources.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span className="text-white/50 uppercase tracking-wider text-[10.5px]">
                    Sources:
                  </span>
                  {liveSynopsis.sources.map((src) => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#F3D393] hover:underline"
                    >
                      <span>{src.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Catalogue Provenance & Raw Wishlist Audit Drawer */}
            <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowProvenance((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] text-white/75 hover:text-white transition"
              >
                <span>
                  Catalogue Provenance & Raw Wishlist Record (
                  {book.recordStatus === "needs-review"
                    ? "Needs Review"
                    : "Normalized Clean"}
                  )
                </span>
                <span>{showProvenance ? "−" : "+"}</span>
              </button>

              {showProvenance && (
                <div className="px-4 pb-4 pt-1 border-t border-white/10 text-xs text-white/75 space-y-2 font-mono">
                  <div>
                    <span className="text-white/45">Record ID: </span>
                    <span className="text-[#F3D393]">{book.id}</span> (Street
                    Order #{book.streetOrder}, Source: {book.sourceFile})
                  </div>
                  <div>
                    <span className="text-white/45">
                      Original Listing Title:{" "}
                    </span>
                    <span className="text-white/90">
                      {book.originalListingTitle}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/45">
                      Original Listing Author:{" "}
                    </span>
                    <span className="text-white/90">
                      {book.originalListingAuthor || "(none in raw listing)"}
                    </span>
                  </div>
                  {book.promotionalTextRemoved && (
                    <div>
                      <span className="text-white/45">
                        Promotional Text Stripped:{" "}
                      </span>
                      <span className="text-emerald-300">
                        {book.promotionalTextRemoved}
                      </span>
                    </div>
                  )}
                  {book.correctionNote && (
                    <div>
                      <span className="text-white/45">
                        Normalization Rule ({book.correctionBasis}):{" "}
                      </span>
                      <span className="text-sky-300">{book.correctionNote}</span>
                    </div>
                  )}
                  {book.reviewReasons.length > 0 && (
                    <div className="pt-1">
                      <span className="text-amber-300 block mb-1">
                        Review Notes:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-amber-200/90">
                        {book.reviewReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
