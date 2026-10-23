import React from "react";

interface BookStreetEnvironmentProps {
  worldX: number;
  totalStreetWidth: number;
}

/**
 * Cinematic Twilight Literary Boulevard Environment
 * Recreates the atmosphere from the reference images:
 * - Twilight indigo to dusk-rose sky
 * - Crescent moon and twinkling stars
 * - Dramatic mountain cliffs, fairy-tale castle with glowing spire windows & distant waterfalls
 * - Distant silhouetted collegiate spires and rooftops
 * - Stone canal balustrade and cobblestone promenade with warm golden reflections
 */
export default function BookStreetEnvironment({
  worldX,
  totalStreetWidth,
}: BookStreetEnvironmentProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {/* ===================================================================
          LAYER 1: TWILIGHT SKY & LUMINOUS CRESCENT MOON
         =================================================================== */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #060814 0%, #0E132B 24%, #1A1F45 48%, #3A2548 70%, #683E58 86%, #211626 100%)",
        }}
      >
        {/* Rose-Gold Twilight Horizon Glow */}
        <div
          className="absolute inset-x-0 bottom-[20%] h-[34%] opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 50% 90%, rgba(245, 175, 138, 0.42) 0%, rgba(178, 102, 138, 0.22) 50%, transparent 80%)",
          }}
        />

        {/* Luminous Crescent Moon (Very slow parallax) */}
        <div
          className="absolute top-[8%] right-[14%] transition-transform duration-300"
          style={{
            transform: `translate3d(${-worldX * 0.015}px, 0, 0)`,
          }}
        >
          <div
            className="w-40 h-40 rounded-full blur-2xl opacity-60 -m-10"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 238, 190, 0.85) 0%, rgba(255, 215, 130, 0.3) 50%, transparent 75%)",
            }}
          />
          <svg viewBox="0 0 64 64" className="w-16 h-16 drop-shadow-[0_0_20px_rgba(255,236,180,0.85)]">
            <path
              d="M44 12A22 22 0 1 0 44 52A17 17 0 1 1 44 12Z"
              fill="#FFF6D8"
            />
          </svg>
        </div>

        {/* Twinkling Constellations & Evening Clouds */}
        <svg
          viewBox="0 0 1600 400"
          className="w-full h-[52%] opacity-80"
          preserveAspectRatio="xMidYMid slice"
          style={{
            transform: `translate3d(${-(worldX * 0.03) % 400}px, 0, 0)`,
          }}
        >
          {[
            [100, 50, 1.6],
            [240, 100, 1.2],
            [390, 42, 2.0],
            [540, 88, 1.4],
            [710, 48, 1.8],
            [880, 78, 1.3],
            [1060, 38, 2.1],
            [1220, 95, 1.5],
            [1400, 58, 1.7],
            [170, 165, 1.1],
            [620, 145, 1.4],
            [990, 138, 1.3],
            [1340, 150, 1.2],
          ].map(([cx, cy, r], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="#FFF6DE"
              opacity={0.6 + (i % 3) * 0.15}
            />
          ))}
          {/* Drifting Rose Clouds */}
          <path
            d="M60 260 Q160 230 280 255 T520 250 T760 265 H60 Z"
            fill="#B87391"
            fillOpacity="0.18"
          />
          <path
            d="M780 245 Q920 215 1070 240 T1380 235 T1580 255 H780 Z"
            fill="#D48E9E"
            fillOpacity="0.16"
          />
        </svg>
      </div>

      {/* ===================================================================
          LAYER 2: DRAMATIC CLIFF CASTLE & DISTANT WATERFALL (Parallax 0.06x)
         =================================================================== */}
      <div
        className="absolute bottom-[130px] left-0 h-[380px] flex items-end opacity-75"
        style={{
          width: `${totalStreetWidth * 0.2 + 2400}px`,
          transform: `translate3d(${-worldX * 0.06}px, 0, 0)`,
        }}
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <svg
            key={idx}
            viewBox="0 0 600 360"
            className="w-[600px] h-[360px] shrink-0"
            preserveAspectRatio="none"
          >
            {/* Mountain Ridge & Jagged Cliff */}
            <path
              d="M0 360 L80 180 L180 240 L260 110 L340 190 L440 80 L520 170 L600 360 Z"
              fill="#0F1328"
            />
            {/* Distant Spire Castle on Cliff #2 */}
            <path
              d="M240 110 V60 L248 30 L256 60 V110 H240 Z"
              fill="#0A0E1F"
            />
            <path
              d="M256 110 V50 L264 20 L272 50 V110 H256 Z"
              fill="#080C1A"
            />
            {/* Castle Spire Golden Windows */}
            <circle cx="248" cy="70" r="2.5" fill="#FFDA88" fillOpacity="0.75" />
            <circle cx="264" cy="60" r="2.5" fill="#FFDA88" fillOpacity="0.85" />
            {/* Cascading Mountain Waterfall */}
            <path
              d="M440 80 Q436 140 438 210 Q436 280 439 360"
              stroke="#A4D8E6"
              strokeWidth="2.5"
              strokeOpacity="0.45"
              fill="none"
            />
            <path
              d="M442 110 Q440 170 441 240"
              stroke="#FFF8DC"
              strokeWidth="1.2"
              strokeOpacity="0.6"
              fill="none"
            />
          </svg>
        ))}
      </div>

      {/* ===================================================================
          LAYER 3: DISTANT SILHOUETTED ROOFTOPS & SPIRES (Parallax 0.16x)
         =================================================================== */}
      <div
        className="absolute bottom-[114px] left-0 h-[310px] flex items-end opacity-60"
        style={{
          width: `${totalStreetWidth * 0.35 + 2400}px`,
          transform: `translate3d(${-worldX * 0.16}px, 0, 0)`,
        }}
      >
        {Array.from({ length: 16 }).map((_, idx) => (
          <svg
            key={idx}
            viewBox="0 0 320 260"
            className="w-[320px] h-[260px] shrink-0"
            preserveAspectRatio="none"
          >
            <path
              d="M0 260 V120 L40 75 L80 120 V95 L130 45 L175 95 V130 L215 80 L255 130 V60 L285 20 L315 60 V260 Z"
              fill="#13162C"
            />
            {/* Distant amber attic dormers */}
            <rect x="36" y="135" width="7" height="10" rx="1" fill="#FFD98E" fillOpacity="0.5" />
            <rect x="124" y="110" width="8" height="11" rx="1" fill="#FFD98E" fillOpacity="0.6" />
            <rect x="138" y="110" width="8" height="11" rx="1" fill="#FFD98E" fillOpacity="0.45" />
            <rect x="278" y="90" width="7" height="12" rx="1" fill="#FFD98E" fillOpacity="0.55" />
          </svg>
        ))}
      </div>

      {/* ===================================================================
          LAYER 4: STONE CANAL BALUSTRADE RUNNING PARALLEL (Parallax 0.45x)
         =================================================================== */}
      <div
        className="absolute bottom-[98px] left-0 h-[48px] flex items-end opacity-40 z-0"
        style={{
          width: `${totalStreetWidth * 0.6 + 2000}px`,
          transform: `translate3d(${-worldX * 0.45}px, 0, 0)`,
        }}
      >
        <div
          className="w-full h-[44px] border-t border-b flex"
          style={{
            borderColor: "rgba(216, 174, 104, 0.35)",
            background:
              "linear-gradient(180deg, #1C1E32 0%, #121322 100%)",
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(216, 174, 104, 0.15) 18px, rgba(216, 174, 104, 0.15) 24px)",
          }}
        />
      </div>

      {/* ===================================================================
          LAYER 5: COBBLESTONE PROMENADE & WATER REFLECTIONS
         =================================================================== */}
      <div className="absolute inset-x-0 bottom-0 h-[106px] z-0 overflow-hidden">
        {/* Sidewalk Curbstone with bevel and golden highlight */}
        <div
          className="w-full h-[14px] border-t border-b"
          style={{
            background:
              "linear-gradient(180deg, #3A364E 0%, #262436 60%, #171624 100%)",
            borderColor: "rgba(216, 174, 104, 0.45)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.65)",
          }}
        />

        {/* Main Roadway with Golden Reflections & Wet Sheen */}
        <div
          className="relative w-full h-[92px]"
          style={{
            background:
              "linear-gradient(180deg, #181726 0%, #11111E 45%, #0A0A13 100%)",
          }}
        >
          {/* Warm Window & Lantern Reflections moving with street scroll */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0px, rgba(255, 218, 138, 0.16) 110px, transparent 220px, rgba(240, 160, 85, 0.12) 340px, transparent 440px)",
              backgroundPosition: `${-worldX}px 0px`,
            }}
          />

          {/* Cobblestone Stone Pavers */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(180deg, rgba(255,255,255,0.08) 1px, transparent 1px),
                repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 38px, rgba(0,0,0,0.4) 38px, rgba(0,0,0,0.4) 40px)
              `,
              backgroundSize: "80px 18px",
              backgroundPosition: `${-worldX}px 0px`,
            }}
          />

          {/* Soft Bottom Vignette */}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>
    </div>
  );
}
