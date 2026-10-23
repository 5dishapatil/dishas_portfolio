"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NEXUS // Indian Financial Markets & Wealth Principles
 * A completely self-contained single-file React component with:
 * - Real-time BSE/NSE market data integration with auto-refresh & live sync
 * - Foreground cinematic video background with scroll-linked fade into pitch-black reading mode
 * - Framer Motion scroll-triggered staggered fade-in & slide-up reveal animations
 * - Interactive SIP compounding engine, IPO lottery probability simulator, and Inflation/Real Return calculator
 * - Fundamental valuation ratios (P/E, ROE, ROCE, Debt/Equity) and Indian tax shield (LTCG, STCG, 80C ELSS)
 * - Self-assessment knowledge check quiz with instant feedback
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  BarChart3,
  PieChart,
  Coins,
  ArrowUpRight,
  Play,
  Pause,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Landmark,
  Scale,
  Compass,
  ChevronDown,
  RotateCcw,
  RefreshCw,
  Lock,
} from "lucide-react";

/* =========================================================================
   1. SELF-CONTAINED FINANCIAL CALCULATION UTILITIES & TYPES
   ========================================================================= */

export interface SIPResult {
  totalInvested: number;
  futureValue: number;
  wealthGained: number;
  multiplier: number;
}

export interface IPOMetrics {
  lotCost: number;
  expectedListingPrice: number;
  estimatedListingGainPerLot: number;
  listingGainPercentage: number;
  allotmentProbabilityPct: number;
}

export interface RealReturnResult {
  postTaxNominal: number;
  realReturn: number;
  netPurchasingPowerChange: "positive" | "negative";
}

export interface LiveMarketTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated: string;
}

/**
 * Standard Annuity SIP Compounding Formula:
 * FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 */
export function calculateSIP(
  monthlyInvestment: number,
  annualRatePct: number,
  years: number
): SIPResult {
  if (monthlyInvestment <= 0 || years <= 0) {
    return { totalInvested: 0, futureValue: 0, wealthGained: 0, multiplier: 1 };
  }
  const months = Math.round(years * 12);
  const totalInvested = monthlyInvestment * months;

  if (annualRatePct <= 0) {
    return {
      totalInvested,
      futureValue: totalInvested,
      wealthGained: 0,
      multiplier: 1,
    };
  }

  const i = annualRatePct / 100 / 12;
  const futureValue =
    monthlyInvestment * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  const roundedFV = Math.round(futureValue);
  const wealthGained = Math.max(0, roundedFV - totalInvested);
  const multiplier = Number((roundedFV / totalInvested).toFixed(2));

  return { totalInvested, futureValue: roundedFV, wealthGained, multiplier };
}

/**
 * Rule of 72 for estimating investment doubling period in years
 */
export function ruleOf72(annualRatePct: number): number {
  if (annualRatePct <= 0) return Infinity;
  return Number((72 / annualRatePct).toFixed(1));
}

/**
 * IPO Metrics: Lot cost, listing gain via Grey Market Premium (GMP),
 * and retail lottery allotment chance under SEBI oversubscription rules.
 */
export function calculateIPOAllotmentMetrics(
  lotSize: number,
  issuePrice: number,
  gmp: number,
  oversubscriptionTimes: number
): IPOMetrics {
  const safeLotSize = Math.max(1, lotSize);
  const safeIssuePrice = Math.max(1, issuePrice);
  const safeGMP = Math.max(0, gmp);
  const safeOversub = Math.max(1, oversubscriptionTimes);

  const lotCost = safeLotSize * safeIssuePrice;
  const expectedListingPrice = safeIssuePrice + safeGMP;
  const estimatedListingGainPerLot = safeLotSize * safeGMP;
  const listingGainPercentage = Number(
    ((safeGMP / safeIssuePrice) * 100).toFixed(1)
  );
  const allotmentProbabilityPct = Number(
    Math.min(100, (1 / safeOversub) * 100).toFixed(1)
  );

  return {
    lotCost,
    expectedListingPrice,
    estimatedListingGainPerLot,
    listingGainPercentage,
    allotmentProbabilityPct,
  };
}

/**
 * Real Rate of Return (Fisher Equation):
 * (1 + Nominal) = (1 + Real) * (1 + Inflation)
 */
export function calculateRealReturn(
  nominalReturnPct: number,
  inflationPct: number,
  taxBracketPct: number = 0
): RealReturnResult {
  const postTaxNominal = nominalReturnPct * (1 - taxBracketPct / 100);
  const nominalDecimal = postTaxNominal / 100;
  const inflationDecimal = inflationPct / 100;

  const realDecimal = (1 + nominalDecimal) / (1 + inflationDecimal) - 1;
  const realReturn = Number((realDecimal * 100).toFixed(2));

  return {
    postTaxNominal: Number(postTaxNominal.toFixed(2)),
    realReturn,
    netPurchasingPowerChange: realReturn >= 0 ? "positive" : "negative",
  };
}

/**
 * Formats a currency amount into the Indian denomination system (Crores, Lakhs, Thousands, or Rupees).
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return "₹0";
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = "";
  if (absAmount >= 10000000) {
    const cr = absAmount / 10000000;
    formatted = `₹${cr.toFixed(cr >= 10 ? 1 : 2)} Cr`;
  } else if (absAmount >= 100000) {
    const lakh = absAmount / 100000;
    formatted = `₹${lakh.toFixed(lakh >= 10 ? 1 : 2)} L`;
  } else if (absAmount >= 1000) {
    formatted = `₹${absAmount.toLocaleString("en-IN")}`;
  } else {
    formatted = `₹${Math.round(absAmount)}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/* =========================================================================
   2. FRAMER MOTION STAGGERED REVEAL ANIMATION VARIANTS
   ========================================================================= */

const headingRevealVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const staggerGridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cardSlideUpVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/* =========================================================================
   3. MAIN APPLICATION COMPONENT
   ========================================================================= */

export default function FinanceViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parallax & Scroll-based dynamic video fading
  const { scrollY, scrollYProgress } = useScroll();
  // Hero: opacity 0 (video is in the forefront in full glory).
  // As user scrolls past the hero (60px to 420px), fade smoothly to 0.96 pitch black for reading mode
  const darkFadeOpacity = useTransform(scrollY, [60, 420], [0, 0.96]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // Video Background controls
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [userDimOverride, setUserDimOverride] = useState<"auto" | "clear" | "deep">("auto");

  // Real-time market tickers state
  const [tickers, setTickers] = useState<LiveMarketTicker[]>([
    { symbol: "NIFTY_50", name: "NIFTY 50", price: 22600.0, change: -87.65, changePercent: -0.39, currency: "INR", lastUpdated: "LIVE" },
    { symbol: "SENSEX", name: "SENSEX 30", price: 73123.85, change: -125.55, changePercent: -0.17, currency: "INR", lastUpdated: "LIVE" },
    { symbol: "BANK_NIFTY", name: "BANK NIFTY", price: 54287.35, change: -638.35, changePercent: -1.16, currency: "INR", lastUpdated: "LIVE" },
    { symbol: "NIFTY_IT", name: "NIFTY IT", price: 34820.5, change: 180.2, changePercent: 0.52, currency: "INR", lastUpdated: "LIVE" },
    { symbol: "USD_INR", name: "USD / INR", price: 94.93, change: 0.12, changePercent: 0.13, currency: "INR", lastUpdated: "LIVE" },
  ]);
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);
  const [lastMarketSync, setLastMarketSync] = useState<string>("Live Feed");

  // Fetch real-time market data from backend proxy or fallback
  const loadMarketData = async () => {
    setIsFetchingMarket(true);
    try {
      const res = await fetch("/api/market-data");
      if (res.ok) {
        const json = await res.json();
        if (json.tickers && json.tickers.length > 0) {
          setTickers(json.tickers);
          const date = new Date(json.timestamp || Date.now());
          setLastMarketSync(date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }
      }
    } catch {
      // Retain graceful fallback state
    } finally {
      setIsFetchingMarket(false);
    }
  };

  useEffect(() => {
    loadMarketData();
    // Poll real-time quotes every 45 seconds
    const interval = setInterval(loadMarketData, 45000);
    return () => clearInterval(interval);
  }, []);

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState<number>(10000);
  const [sipRate, setSipRate] = useState<number>(13.5);
  const [sipYears, setSipYears] = useState<number>(15);

  // IPO Calculator State
  const [ipoLotSize, setIpoLotSize] = useState<number>(30);
  const [ipoPrice, setIpoPrice] = useState<number>(550);
  const [ipoGmp, setIpoGmp] = useState<number>(220);
  const [ipoOversub, setIpoOversub] = useState<number>(35);

  // Real Return / Inflation Calculator State
  const [nominalAssetReturn, setNominalAssetReturn] = useState<number>(13.5);
  const [inflationRate, setInflationRate] = useState<number>(5.5);
  const [taxBracketRate, setTaxBracketRate] = useState<number>(12.5);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  // Toggle video playback
  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  // Computations
  const sipMetrics = calculateSIP(sipMonthly, sipRate, sipYears);
  const doublingYears = ruleOf72(sipRate);
  const ipoMetrics = calculateIPOAllotmentMetrics(ipoLotSize, ipoPrice, ipoGmp, ipoOversub);
  const realReturnMetrics = calculateRealReturn(nominalAssetReturn, inflationRate, taxBracketRate);

  const QUIZ_QUESTIONS = [
    {
      q: "Which investment vehicle provides Section 80C tax deduction with the shortest lock-in period of 3 years in India?",
      options: ["Public Provident Fund (PPF)", "ELSS (Equity Linked Savings Scheme)", "National Pension System (NPS)", "5-Year Bank FD"],
      correct: 1,
      explanation: "ELSS mutual funds have the shortest lock-in of only 3 years compared to 5 years for tax-saving FDs and 15 years for PPF.",
    },
    {
      q: "If a retail IPO category is oversubscribed 40 times, how is allotment decided for individual retail applicants in India?",
      options: [
        "Pro-rata proportionate allocation of shares",
        "Computerized lottery mechanism among valid applicants",
        "First-come, first-served basis based on UPI mandate time",
        "Bidders with the highest bid amount get priority",
      ],
      correct: 1,
      explanation: "Under SEBI regulations, retail oversubscription is resolved strictly through a computerized lottery to allocate minimum lots equally without bias.",
    },
    {
      q: "What is the primary advantage of Rupee Cost Averaging in Mutual Fund SIPs during a market correction?",
      options: [
        "It eliminates market risk permanently",
        "It automatically purchases more mutual fund units at lower NAVs",
        "It converts equity holdings into fixed deposits",
        "It guarantees 20% annual returns",
      ],
      correct: 1,
      explanation: "With a fixed monthly SIP amount, when markets drop and NAV decreases, you buy more units. When markets rebound, those extra units accelerate compounding.",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen text-slate-100 bg-[#030303] selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden font-sans"
    >
      {/* Top Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 origin-left z-50 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ================= BACKGROUND VIDEO & DYNAMIC SCROLL FADE ================= */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <motion.div
          style={{ y: videoY }}
          className="w-full h-full relative"
        >
          <video
            ref={videoRef}
            src="/assets/money.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter contrast-[1.05] brightness-[0.98]"
          >
            <source src="/assets/money.mp4" type="video/mp4" />
            <source src="/assets/aistudio/money_64f71987.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Dynamic Scroll-Activated Fade to Pitch Black for Reading Sections */}
        {userDimOverride === "auto" ? (
          <motion.div
            style={{ opacity: darkFadeOpacity }}
            className="absolute inset-0 bg-[#030303] transition-opacity pointer-events-none"
          />
        ) : (
          <div
            className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${
              userDimOverride === "clear" ? "bg-black/10" : "bg-[#030303]/95"
            }`}
          />
        )}
      </div>

      {/* ================= FLOATING HUD CONTROLS ================= */}
      <aside aria-label="Controls" className="fixed bottom-6 right-6 z-40 flex items-center gap-2 p-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 shadow-2xl">
        <button
          onClick={toggleVideo}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono-num font-medium text-slate-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          title={isVideoPlaying ? "Pause video motion" : "Resume video motion"}
          aria-label={isVideoPlaying ? "Pause video" : "Play video"}
        >
          {isVideoPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden sm:inline">{isVideoPlaying ? "PAUSE BG" : "PLAY BG"}</span>
        </button>

        <div className="h-4 w-[1px] bg-white/20" />

        <button
          onClick={() => {
            const next = userDimOverride === "auto" ? "clear" : userDimOverride === "clear" ? "deep" : "auto";
            setUserDimOverride(next);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-num text-slate-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          title="Toggle scroll-fade vs manual video visibility"
          aria-label="Toggle dim level"
        >
          {userDimOverride === "clear" ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-cyan-400" />}
          <span className="hidden sm:inline">VIEW: {userDimOverride.toUpperCase()}</span>
        </button>
      </aside>

      {/* ================= REAL-TIME MARKET TICKER BAR & HEADER ================= */}
      <header className="relative z-30 border-b border-white/10 bg-black/50 backdrop-blur-md">
        {/* Real-time Ticker Bar with live sync indicator */}
        <div className="overflow-hidden py-2 border-b border-white/10 bg-black/75 text-[11px] font-mono-num">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE BSE / NSE FEED
              </span>
              <span>Updated: {lastMarketSync}</span>
            </div>

            <button
              onClick={loadMarketData}
              disabled={isFetchingMarket}
              className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors text-slate-400 cursor-pointer"
              title="Refresh live market quotes"
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingMarket ? "animate-spin text-emerald-400" : ""}`} />
              <span>SYNC LIVE QUOTES</span>
            </button>
          </div>

          <div className="flex w-max animate-marquee space-x-8 px-4 pt-1">
            {[...tickers, ...tickers].map((ticker, index) => {
              const isPositive = ticker.change >= 0;
              return (
                <div key={index} className="inline-flex items-center space-x-2">
                  <span className="text-slate-300 tracking-wider font-semibold">{ticker.name}</span>
                  <span className="text-white font-bold">{ticker.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isPositive
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-rose-400 bg-rose-500/10"
                    }`}
                  >
                    {isPositive ? "+" : ""}{ticker.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-neutral-700">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Bar with GO TO MY MIND button */}
        <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* GO TO MY MIND Button */}
            <Link
              href="/mind"
              className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-mono-num uppercase tracking-[0.16em] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 hover:border-emerald-400 text-emerald-300 hover:text-white transition-all duration-300 shadow-xl hover:scale-105"
              title="Go to My Mind"
            >
              <span className="text-base transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              <span>GO TO MY MIND</span>
            </Link>

            <div className="hidden sm:flex items-center space-x-2.5 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-lg bg-black/60 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Landmark className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-display font-bold tracking-tight text-white text-base">
                  NEXUS<span className="text-emerald-400">.</span>IN
                </span>
                <p className="text-[9px] font-mono-num text-slate-400 tracking-wider uppercase">
                  Indian Capital Markets
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-5 text-xs lg:text-sm font-medium text-slate-200">
            <a href="#mutual-funds" className="hover:text-emerald-400 transition-colors">Mutual Funds</a>
            <a href="#sip-calculator" className="hover:text-emerald-400 transition-colors">SIP Engine</a>
            <a href="#ipo-markets" className="hover:text-cyan-400 transition-colors">IPO Anatomy</a>
            <a href="#fundamentals" className="hover:text-amber-300 transition-colors">Valuation</a>
            <a href="#inflation" className="hover:text-rose-400 transition-colors">Inflation &amp; Tax</a>
            <a href="#quiz" className="hover:text-emerald-400 transition-colors">Knowledge Check</a>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="#sip-calculator"
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono-num font-semibold text-emerald-300 bg-black/60 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <Coins className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CALCULATE</span> SIP
            </a>
          </div>
        </nav>
      </header>

      {/* ================= HERO SECTION (FOREFRONT VIDEO - NO GRIDS OR DARK TINTS) ================= */}
      <section className="relative z-10 min-h-[85vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12 pb-20">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-emerald-500/40 backdrop-blur-md mb-6 text-xs font-mono-num text-emerald-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>INDIAN CAPITAL MARKETS // CURRICULUM &amp; DYNAMICS</span>
        </motion.div>

        {/* Hero Title directly over Forefront Video */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white max-w-5xl leading-[1.1] mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
        >
          The Architecture of Wealth in <span className="text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]">Dalal Street</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-100 max-w-3xl leading-relaxed mb-10 font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        >
          Master the core tenets of India’s booming capital ecosystem. From the exponential power of
          <strong className="text-emerald-300 font-bold"> Mutual Fund SIPs</strong> and the mechanics of
          <strong className="text-cyan-300 font-bold"> Primary Market IPOs</strong> to index dynamics, SEBI guardrails,
          and valuation fundamentals.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          <a
            href="#mutual-funds"
            className="px-6 py-3.5 rounded-xl font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_30px_rgba(52,211,153,0.5)] flex items-center gap-2 group cursor-pointer"
          >
            <span>Explore Mutual Funds &amp; SIP</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href="#ipo-markets"
            className="px-6 py-3.5 rounded-xl font-medium text-white bg-black/60 hover:bg-black/80 border border-white/20 transition-all backdrop-blur-md flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.7)] cursor-pointer"
          >
            <span>Deconstruct IPOs</span>
            <ChevronDown className="w-4 h-4 text-cyan-400" />
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/15 text-[11px] font-mono-num text-slate-300 backdrop-blur-sm"
        >
          <ChevronDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>Scroll down to fade video into pitch-black reading mode</span>
        </motion.div>
      </section>

      {/* ================= DISCLAIMER BANNER (PURELY EDUCATIONAL / NO FINANCIAL ADVICE) ================= */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={headingRevealVariants}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      >
        <div className="p-4 rounded-2xl bg-black/80 border border-amber-500/30 backdrop-blur-xl flex items-center justify-between gap-4 text-xs font-mono-num text-amber-200/90 shadow-xl">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>EDUCATIONAL CURRICULUM NOTICE:</strong> This application strictly provides academic financial principles and mathematical models. It does not provide financial advice, stock recommendations, or trading tips.
            </span>
          </div>
          <span className="hidden md:inline px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold shrink-0">
            SEBI Compliant Study
          </span>
        </div>
      </motion.div>

      {/* ================= SECTION 1: MUTUAL FUNDS & SIP ================= */}
      <section id="mutual-funds" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {/* Section Heading with Framer Motion reveal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingRevealVariants}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-num text-emerald-400 mb-2 uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5" />
              <span>Chapter 01 // Collective Wealth Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              The Mutual Fund Architecture
            </h2>
          </div>
          <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
            Mutual funds aggregate retail and institutional capital to invest in a diversified portfolio
            managed by SEBI-registered Asset Management Companies (AMCs).
          </p>
        </motion.div>

        {/* 4 Core Fund Categories with Staggered Fade-in & Slide-Up Reveal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerGridContainerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <motion.div variants={cardSlideUpVariants} className="p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              Equity Funds
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Invested predominantly in listed company shares for long-term capital appreciation.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-white/5 pt-4 font-mono-num">
              <li className="flex items-center justify-between">
                <span>Large Cap (Top 100)</span>
                <span className="text-emerald-400">Low/Moderate Volatility</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Mid Cap (101-250)</span>
                <span className="text-cyan-400">High Growth</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Small Cap (251+)</span>
                <span className="text-amber-400">High Risk &amp; Alpha</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Flexi Cap</span>
                <span className="text-slate-400">Unconstrained Mandate</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              Debt &amp; Liquid Funds
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Invests in fixed-income instruments like Government Securities (G-Secs), Treasury Bills, and Corporate Bonds.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-white/5 pt-4 font-mono-num">
              <li className="flex items-center justify-between">
                <span>Overnight / Liquid</span>
                <span className="text-emerald-400">1 to 91 Days Maturity</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Corporate Bond</span>
                <span className="text-cyan-400">&gt;80% AAA Rated Paper</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Banking &amp; PSU</span>
                <span className="text-slate-300">High Credit Safety</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Gilt Funds</span>
                <span className="text-amber-400">Pure Sovereign Risk</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
              Hybrid &amp; Dynamic
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Strategically combines equity and debt to balance risk, volatility, and downside protection.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-white/5 pt-4 font-mono-num">
              <li className="flex items-center justify-between">
                <span>Balanced Advantage (BAF)</span>
                <span className="text-emerald-400">Dynamic P/E Multiples</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Aggressive Hybrid</span>
                <span className="text-cyan-400">65-80% Equity Allocation</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Arbitrage Funds</span>
                <span className="text-amber-300">Equity Tax, Debt Risk</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Multi-Asset Allocator</span>
                <span className="text-purple-400">Gold + Silver + Equity</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-purple-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Passive Index &amp; ETFs
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Rules-based investing mirroring benchmark indices like Nifty 50 or Sensex with ultra-low expense ratios.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-white/5 pt-4 font-mono-num">
              <li className="flex items-center justify-between">
                <span>Expense Ratio</span>
                <span className="text-emerald-400">0.05% - 0.20% TER</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tracking Error</span>
                <span className="text-slate-300">Target &lt; 0.15%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Nifty Next 50</span>
                <span className="text-cyan-400">Emerging Bluechips</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Factor / Smart Beta</span>
                <span className="text-amber-400">Momentum / Alpha / Low Vol</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Rupee Cost Averaging Visual Concept */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingRevealVariants}
          className="p-8 rounded-3xl bg-black/80 border border-emerald-500/30 backdrop-blur-xl mb-16"
        >
          <div className="max-w-3xl">
            <span className="text-xs font-mono-num text-emerald-400 uppercase tracking-widest">
              The 8th Wonder of the World
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1 mb-4">
              Rupee Cost Averaging &amp; The Disciplined SIP
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              When Indian markets experience periodic corrections (e.g. 2008 Lehman, 2020 COVID dip, geopolitical pullbacks),
              a regular Systematic Investment Plan (SIP) automatically buys <strong className="text-emerald-400">more mutual fund units at lower NAV</strong>.
              When markets resume their upward trajectory driven by GDP growth, those cheaper units generate an explosive compounding multiplier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono-num text-xs">
            <div className="p-4 rounded-xl bg-black/60 border border-white/5">
              <div className="text-emerald-400 font-semibold mb-1">Bullish Market (High NAV)</div>
              <p className="text-slate-400">Fixed ₹10k allocation purchases fewer units at peak valuations.</p>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border border-white/5">
              <div className="text-cyan-400 font-semibold mb-1">Correction / Bear Dip (Low NAV)</div>
              <p className="text-slate-400">Same ₹10k automatically scoops up significantly higher quantity of units.</p>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border border-white/5">
              <div className="text-amber-300 font-semibold mb-1">Recovery &amp; All-Time Highs</div>
              <p className="text-slate-400">Blended acquisition cost drops, maximizing long-term wealth acceleration.</p>
            </div>
          </div>
        </motion.div>

        {/* ================= INTERACTIVE SIP COMPOUNDING ENGINE ================= */}
        <motion.div
          id="sip-calculator"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={headingRevealVariants}
          className="p-8 rounded-3xl bg-black/85 border border-white/15 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono-num text-emerald-400 uppercase tracking-widest">
                <Coins className="w-3.5 h-3.5" />
                <span>Simulator</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white">
                Interactive SIP Wealth Compounding Engine
              </h3>
            </div>
            <div className="mt-2 md:mt-0 text-xs font-mono-num text-slate-400">
              Rule of 72 Doubling Time: <span className="text-emerald-400 font-bold">{doublingYears} Years</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-6 space-y-6">
              {/* Monthly Amount */}
              <div>
                <div className="flex justify-between text-sm mb-2 font-mono-num">
                  <label htmlFor="sip-monthly-input" className="text-slate-300">Monthly SIP Amount</label>
                  <span className="text-emerald-400 font-bold text-base">{formatINR(sipMonthly)}</span>
                </div>
                <input
                  id="sip-monthly-input"
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[11px] font-mono-num text-slate-500 mt-1">
                  <span>₹1,000/mo</span>
                  <span>₹50,000/mo</span>
                  <span>₹1,00,000/mo</span>
                </div>
              </div>

              {/* Expected CAGR */}
              <div>
                <div className="flex justify-between text-sm mb-2 font-mono-num">
                  <label htmlFor="sip-rate-input" className="text-slate-300">Expected Annual CAGR (%)</label>
                  <span className="text-cyan-400 font-bold text-base">{sipRate.toFixed(1)}%</span>
                </div>
                <input
                  id="sip-rate-input"
                  type="range"
                  min="6"
                  max="20"
                  step="0.5"
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[11px] font-mono-num text-slate-500 mt-1">
                  <span>6% (Debt/FD)</span>
                  <span>12% (Nifty 50)</span>
                  <span>15% (Flexi/Mid)</span>
                  <span>20% (Aggressive)</span>
                </div>
              </div>

              {/* Investment Horizon */}
              <div>
                <div className="flex justify-between text-sm mb-2 font-mono-num">
                  <label htmlFor="sip-years-input" className="text-slate-300">Investment Horizon</label>
                  <span className="text-amber-300 font-bold text-base">{sipYears} Years</span>
                </div>
                <input
                  id="sip-years-input"
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-300"
                />
                <div className="flex justify-between text-[11px] font-mono-num text-slate-500 mt-1">
                  <span>1 Year</span>
                  <span>15 Years</span>
                  <span>35 Years (Retirement)</span>
                </div>
              </div>
            </div>

            {/* Live Visualizer Output Card */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-black/80 border border-emerald-500/30 flex flex-col justify-between neon-glow-emerald">
              <div>
                <span className="text-xs font-mono-num text-slate-400 uppercase tracking-widest">
                  Estimated Corpus at Year {sipYears}
                </span>
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-1 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                  {formatINR(sipMetrics.futureValue)}
                </div>

                {/* Progress bar split */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4">
                  <div
                    style={{
                      width: `${Math.max(
                        5,
                        Math.min(
                          95,
                          (sipMetrics.totalInvested / sipMetrics.futureValue) * 100
                        )
                      )}%`,
                    }}
                    className="bg-slate-500 h-full transition-all duration-300"
                    title="Amount Invested"
                  />
                  <div
                    style={{
                      width: `${Math.max(
                        5,
                        Math.min(
                          95,
                          (sipMetrics.wealthGained / sipMetrics.futureValue) * 100
                        )
                      )}%`,
                    }}
                    className="bg-emerald-400 h-full transition-all duration-300 shadow-[0_0_10px_#34d399]"
                    title="Wealth Gained (Compounding)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono-num text-xs mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-slate-400 mb-0.5">Total Invested</div>
                    <div className="text-slate-200 font-bold text-sm">
                      {formatINR(sipMetrics.totalInvested)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-emerald-400 mb-0.5">Wealth Gain (Profit)</div>
                    <div className="text-emerald-300 font-bold text-sm">
                      +{formatINR(sipMetrics.wealthGained)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono-num text-slate-400">
                <span>Wealth Multiplier:</span>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {sipMetrics.multiplier}x of invested capital
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= SECTION 2: THE ANATOMY OF INDIAN IPOS ================= */}
      <section id="ipo-markets" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {/* Section Heading with Framer Motion reveal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingRevealVariants}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-num text-cyan-400 mb-2 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chapter 02 // Primary Capital Markets</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              The Indian IPO Anatomy &amp; Listing Dynamics
            </h2>
          </div>
          <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
            An Initial Public Offering (IPO) is an unlisted private company’s debut on the BSE &amp; NSE
            to raise fresh equity capital or facilitate exits for early promoters and venture capital.
          </p>
        </motion.div>

        {/* IPO Lifecycle Stepper with Staggered Slide-Up */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerGridContainerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16"
        >
          <motion.div variants={cardSlideUpVariants} className="p-5 rounded-2xl bg-black/80 border border-white/10 hover:border-cyan-500/40 transition-all">
            <div className="text-xs font-mono-num text-cyan-400 mb-2 font-bold">STAGE 01</div>
            <h4 className="text-base font-bold text-white mb-2">DRHP Filing with SEBI</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The company files the Draft Red Herring Prospectus detailing financial audits, promoter risks, legal liabilities, and objectives of the issue.
            </p>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-5 rounded-2xl bg-black/80 border border-white/10 hover:border-cyan-500/40 transition-all">
            <div className="text-xs font-mono-num text-cyan-400 mb-2 font-bold">STAGE 02</div>
            <h4 className="text-base font-bold text-white mb-2">Price Band &amp; ASBA Bidding</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Issue opens for 3 business days. Retail investors apply using UPI ASBA—funds remain safely blocked in bank accounts until allotment day.
            </p>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-5 rounded-2xl bg-black/80 border border-white/10 hover:border-cyan-500/40 transition-all">
            <div className="text-xs font-mono-num text-cyan-400 mb-2 font-bold">STAGE 03</div>
            <h4 className="text-base font-bold text-white mb-2">Basis of Allotment Lottery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When retail is oversubscribed, SEBI mandates a computer-generated randomized lottery so all valid retail applications have an equal probability.
            </p>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-5 rounded-2xl bg-black/80 border border-white/10 hover:border-cyan-500/40 transition-all">
            <div className="text-xs font-mono-num text-cyan-400 mb-2 font-bold">STAGE 04</div>
            <h4 className="text-base font-bold text-white mb-2">Listing Day Bell Ceremony</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shares hit the secondary market (BSE/NSE) at 10:00 AM IST after pre-market price discovery (9:00 - 9:45 AM).
            </p>
          </motion.div>
        </motion.div>

        {/* 3 Investor Categories Table with Reveal Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingRevealVariants}
          className="p-8 rounded-3xl bg-black/80 border border-white/10 backdrop-blur-xl mb-16 overflow-x-auto"
        >
          <h3 className="text-xl font-display font-bold text-white mb-4">
            SEBI IPO Quota Distribution Breakdown
          </h3>
          <table className="w-full text-left text-xs font-mono-num min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 px-4">Investor Category</th>
                <th className="py-3 px-4">Mandatory Quota</th>
                <th className="py-3 px-4">Max Bid Amount</th>
                <th className="py-3 px-4">Allotment Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  RII (Retail Individual Investors)
                </td>
                <td className="py-3.5 px-4 text-emerald-400">Min 35% of Issue</td>
                <td className="py-3.5 px-4">Up to ₹2,00,000</td>
                <td className="py-3.5 px-4">Lottery system when oversubscribed (1 lot per winner)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  sHNI / bHNI (Non-Institutional / NII)
                </td>
                <td className="py-3.5 px-4 text-cyan-400">15% of Issue</td>
                <td className="py-3.5 px-4">Above ₹2,00,000 (No upper limit)</td>
                <td className="py-3.5 px-4">Draw of lots for sHNI (₹2L-₹10L) &amp; bHNI (&gt;₹10L)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  QIB (Qualified Institutional Buyers)
                </td>
                <td className="py-3.5 px-4 text-purple-400">Up to 50% of Issue</td>
                <td className="py-3.5 px-4">No limit (Mutual Funds, FPIs, Banks)</td>
                <td className="py-3.5 px-4">Proportionate allotment; includes Anchor Investor book</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* ================= INTERACTIVE IPO ESTIMATOR ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={headingRevealVariants}
          className="p-8 rounded-3xl bg-black/85 border border-cyan-500/20 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono-num text-cyan-400 uppercase tracking-widest">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>IPO Calculator</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white">
                GMP &amp; Retail Allotment Probability Estimator
              </h3>
            </div>
            <p className="text-xs font-mono-num text-slate-400 mt-2 md:mt-0">
              *Grey Market Premium (GMP) is an unofficial sentiment indicator.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Form Inputs */}
            <div className="lg:col-span-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ipo-issue-price" className="block text-xs font-mono-num text-slate-300 mb-1.5">Issue Cutoff Price (₹)</label>
                  <input
                    id="ipo-issue-price"
                    type="number"
                    value={ipoPrice}
                    onChange={(e) => setIpoPrice(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono-num text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="ipo-lot-size" className="block text-xs font-mono-num text-slate-300 mb-1.5">Lot Size (Shares)</label>
                  <input
                    id="ipo-lot-size"
                    type="number"
                    value={ipoLotSize}
                    onChange={(e) => setIpoLotSize(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono-num text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-num mb-1.5">
                  <label htmlFor="ipo-gmp-input" className="text-slate-300">Expected Grey Market Premium (GMP)</label>
                  <span className="text-cyan-400 font-bold">₹{ipoGmp} ({ipoMetrics.listingGainPercentage}%)</span>
                </div>
                <input
                  id="ipo-gmp-input"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={ipoGmp}
                  onChange={(e) => setIpoGmp(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-num mb-1.5">
                  <label htmlFor="ipo-oversub-input" className="text-slate-300">Retail Category Oversubscription (Times)</label>
                  <span className="text-amber-400 font-bold">{ipoOversub}x</span>
                </div>
                <input
                  id="ipo-oversub-input"
                  type="range"
                  min="1"
                  max="150"
                  step="1"
                  value={ipoOversub}
                  onChange={(e) => setIpoOversub(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-300"
                />
              </div>
            </div>

            {/* Calculations Output */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-black/80 border border-cyan-500/30 neon-glow-cyan space-y-4">
              <div className="grid grid-cols-2 gap-4 font-mono-num text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-slate-400 mb-1">1 Retail Lot Cost</div>
                  <div className="text-white text-lg font-bold">{formatINR(ipoMetrics.lotCost)}</div>
                  <div className="text-[10px] text-slate-500">{ipoLotSize} shares @ ₹{ipoPrice}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-slate-400 mb-1">Expected Listing Price</div>
                  <div className="text-cyan-300 text-lg font-bold">₹{ipoMetrics.expectedListingPrice}</div>
                  <div className="text-[10px] text-emerald-400">+{ipoMetrics.listingGainPercentage}% Listing Pop</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono-num">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                  <span>Estimated Listing Gain Per Lot:</span>
                  <span className="text-emerald-400 font-bold text-base">
                    +{formatINR(ipoMetrics.estimatedListingGainPerLot)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Potential profit if sold on listing day opening print.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 font-mono-num">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                  <span>Lottery Allotment Probability:</span>
                  <span className="text-cyan-300 font-bold text-base">
                    {ipoMetrics.allotmentProbabilityPct}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    style={{ width: `${ipoMetrics.allotmentProbabilityPct}%` }}
                    className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Approx 1 in {ipoOversub} retail applicants will be allotted 1 lot.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= SECTION 3: FUNDAMENTAL VALUATION & METRICS ================= */}
      <section id="fundamentals" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {/* Section Heading with Framer Motion reveal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingRevealVariants}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-300 mb-2 uppercase tracking-widest">
              <Scale className="w-3.5 h-3.5" />
              <span>Chapter 03 // Valuation Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Fundamental Analysis &amp; Core Financial Ratios
            </h2>
          </div>
          <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
            Fundamental analysis assesses a company’s financial health, management capability,
            cash flow generation, and fair economic valuation before allocating capital.
          </p>
        </motion.div>

        {/* 3 Valuation Cards with Staggered Fade-in & Slide-Up */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerGridContainerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <motion.div variants={cardSlideUpVariants} className="p-6 rounded-2xl bg-black/80 border border-white/10 hover:border-amber-400/40 transition-all">
            <div className="text-xs font-mono-num text-amber-400 font-bold mb-2">RATIO 01</div>
            <h3 className="text-lg font-bold text-white mb-2">P/E Ratio (Price to Earnings)</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Measures how much the market is willing to pay per rupee of current profit.
              A P/E of 25 means paying ₹25 for ₹1 of annual earnings.
            </p>
            <div className="p-3 rounded-xl bg-white/5 font-mono-num text-xs space-y-1">
              <div className="text-slate-400">Formula: Market Price / EPS</div>
              <div className="text-amber-300">Context: Compare against historical 5-yr median &amp; industry peers.</div>
            </div>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-6 rounded-2xl bg-black/80 border border-white/10 hover:border-emerald-400/40 transition-all">
            <div className="text-xs font-mono-num text-emerald-400 font-bold mb-2">RATIO 02</div>
            <h3 className="text-lg font-bold text-white mb-2">ROE &amp; ROCE (Capital Efficiency)</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Return on Equity (ROE) measures how productively management deploys shareholder funds.
              ROCE assesses returns across all capital employed (debt + equity).
            </p>
            <div className="p-3 rounded-xl bg-white/5 font-mono-num text-xs space-y-1">
              <div className="text-slate-400">Benchmark: Consistently &gt; 15%</div>
              <div className="text-emerald-300">Sign of strong economic moat &amp; pricing power.</div>
            </div>
          </motion.div>

          <motion.div variants={cardSlideUpVariants} className="p-6 rounded-2xl bg-black/80 border border-white/10 hover:border-cyan-400/40 transition-all">
            <div className="text-xs font-mono-num text-cyan-400 font-bold mb-2">RATIO 03</div>
            <h3 className="text-lg font-bold text-white mb-2">Debt-to-Equity &amp; Free Cash Flow</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Evaluates financial solvency. High debt companies face severe distress when interest rates rise or revenues contract during downcycles.
            </p>
            <div className="p-3 rounded-xl bg-white/5 font-mono-num text-xs space-y-1">
              <div className="text-slate-400">Safety Threshold: D/E &lt; 0.5 (excluding banks)</div>
              <div className="text-cyan-300">Free Cash Flow (FCF) = Operating Cash - Capital Capex.</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Fundamental Trilemma Visual Banner with Reveal Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingRevealVariants}
          className="p-8 rounded-3xl bg-black/80 border border-white/10 backdrop-blur-xl"
        >
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-mono-num text-amber-300 uppercase tracking-widest">Theoretical Axiom</span>
            <h3 className="text-2xl font-display font-bold text-white mt-1">The Fundamental Trilemma of Investing</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              In finance, an investment can never simultaneously maximize all three: <strong>High Return</strong>, <strong>Low Risk</strong>, and <strong>High Liquidity</strong>.
              Any scheme promising guaranteed high returns with zero risk is mathematically unsustainable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-num text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-emerald-400 font-bold mb-1">Equities (Shares / MF)</div>
              <p className="text-slate-400">High Return Potential + High Liquidity, but Volatile Short-term Risk.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-cyan-400 font-bold mb-1">Debt / Fixed Deposits</div>
              <p className="text-slate-400">Low Risk + High Liquidity, but Sub-inflation or Moderate Returns.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-amber-300 font-bold mb-1">Physical Real Estate</div>
              <p className="text-slate-400">Moderate/High Return + Tangible, but Low Liquidity and High Ticket Size.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= SECTION 4: INFLATION & REAL RATE OF RETURN ================= */}
      <section id="inflation" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {/* Section Heading with Framer Motion reveal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingRevealVariants}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-num text-rose-400 mb-2 uppercase tracking-widest">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Chapter 04 // The Hidden Tax</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Inflation &amp; The Fisher Real Return Equation
            </h2>
          </div>
          <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
            Inflation silently erodes purchasing power. True wealth creation only occurs when your post-tax return exceeds consumer price inflation.
          </p>
        </motion.div>

        {/* Interactive Real Return Engine with Reveal Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={headingRevealVariants}
          className="p-8 rounded-3xl bg-black/85 border border-rose-500/20 backdrop-blur-2xl shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2 font-mono-num">
                  <label htmlFor="nominal-return-input" className="text-slate-300">Nominal Annual Asset Return (%)</label>
                  <span className="text-emerald-400 font-bold">{nominalAssetReturn.toFixed(1)}%</span>
                </div>
                <input
                  id="nominal-return-input"
                  type="range"
                  min="4"
                  max="20"
                  step="0.5"
                  value={nominalAssetReturn}
                  onChange={(e) => setNominalAssetReturn(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] font-mono-num text-slate-500 mt-1">
                  <span>6.5% (Savings / FD)</span>
                  <span>13.5% (Equity MF)</span>
                  <span>18% (Midcap / Smallcap)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-mono-num">
                  <label htmlFor="inflation-rate-input" className="text-slate-300">Estimated Retail Inflation Rate (%)</label>
                  <span className="text-rose-400 font-bold">{inflationRate.toFixed(1)}%</span>
                </div>
                <input
                  id="inflation-rate-input"
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
                <div className="flex justify-between text-[10px] font-mono-num text-slate-500 mt-1">
                  <span>4.0% (RBI Target)</span>
                  <span>5.5% (Average Historical)</span>
                  <span>8.0% (Elevated Food/Fuel)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 font-mono-num">
                  <label htmlFor="tax-bracket-input" className="text-slate-300">Applicable Tax Rate (%)</label>
                  <span className="text-cyan-400 font-bold">{taxBracketRate}%</span>
                </div>
                <input
                  id="tax-bracket-input"
                  type="range"
                  min="0"
                  max="30"
                  step="2.5"
                  value={taxBracketRate}
                  onChange={(e) => setTaxBracketRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono-num text-slate-500 mt-1">
                  <span>0% (Tax-Free Exemption)</span>
                  <span>12.5% (Equity LTCG)</span>
                  <span>30% (High Income Bracket)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-black/80 border border-white/10 space-y-4 font-mono-num">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-widest">
                  Net Real Purchasing Power Growth (Annualized)
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-display font-extrabold mt-1 mb-2 ${
                    realReturnMetrics.realReturn >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {realReturnMetrics.realReturn >= 0 ? "+" : ""}{realReturnMetrics.realReturn}% / year
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {realReturnMetrics.realReturn >= 0
                    ? "Your capital outpaces inflation. Your real wealth and buying capacity expand over time."
                    : "Warning: Your post-tax returns fall below inflation. Your purchasing power is mathematically decaying."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-slate-400 mb-0.5">Post-Tax Nominal Return</div>
                  <div className="text-white font-bold text-sm">{realReturnMetrics.postTaxNominal}%</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-slate-400 mb-0.5">Purchasing Power Status</div>
                  <div
                    className={`font-bold text-sm ${
                      realReturnMetrics.realReturn >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {realReturnMetrics.netPurchasingPowerChange.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 text-[11px] text-slate-400 leading-normal">
                <strong>Fisher Equation:</strong> (1 + Nominal) = (1 + Real) × (1 + Inflation).
                Notice why a 7% bank deposit taxed at 30% nets only 4.9%, resulting in negative real returns under 5.5% inflation.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= SECTION 5: KNOWLEDGE CHECK QUIZ ================= */}
      <section id="quiz" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={headingRevealVariants}
          className="p-8 sm:p-10 rounded-3xl bg-black/85 border border-white/15 backdrop-blur-2xl shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono-num text-emerald-400 mb-2 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assessment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
              Indian Finance Knowledge Check
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Test your understanding of mutual funds, IPO allotment, and compounding.
            </p>
          </div>

          <div className="space-y-8">
            {QUIZ_QUESTIONS.map((item, qIndex) => {
              const selected = selectedAnswers[qIndex];
              const isSubmitted = submittedQuiz;
              const isCorrect = selected === item.correct;

              return (
                <div key={qIndex} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-num text-xs font-bold">
                      Q{qIndex + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      {item.q}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                    {item.options.map((opt, optIndex) => {
                      const isOptionSelected = selected === optIndex;
                      let btnStyle = "bg-black/60 border-white/10 text-slate-300 hover:border-white/30";

                      if (isOptionSelected && !isSubmitted) {
                        btnStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-200";
                      } else if (isSubmitted) {
                        if (optIndex === item.correct) {
                          btnStyle = "bg-emerald-500/30 border-emerald-400 text-emerald-200 font-semibold";
                        } else if (isOptionSelected && !isCorrect) {
                          btnStyle = "bg-rose-500/20 border-rose-400 text-rose-200";
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => {
                            if (!isSubmitted) {
                              setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                            }
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2 cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-mono-num text-slate-500 mt-0.5">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div
                      className={`p-3 rounded-xl text-xs font-mono-num leading-relaxed mt-3 border ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="text-xs font-mono-num text-slate-400">
              {submittedQuiz ? (
                <span>
                  Score:{" "}
                  <strong className="text-emerald-400">
                    {
                      Object.entries(selectedAnswers).filter(
                        ([qIdx, ansIdx]) => QUIZ_QUESTIONS[Number(qIdx)].correct === ansIdx
                      ).length
                    }
                    {" / "}
                    {QUIZ_QUESTIONS.length}
                  </strong>{" "}
                  correct
                </span>
              ) : (
                <span>Select an answer for each question to see verified explanations.</span>
              )}
            </div>

            <div className="flex gap-3">
              {submittedQuiz ? (
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setSubmittedQuiz(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono-num font-semibold text-slate-300 bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET QUIZ</span>
                </button>
              ) : (
                <button
                  onClick={() => setSubmittedQuiz(true)}
                  disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
                  className={`px-6 py-2.5 rounded-xl text-xs font-mono-num font-bold transition-all ${
                    Object.keys(selectedAnswers).length === QUIZ_QUESTIONS.length
                      ? "bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)] cursor-pointer"
                      : "bg-white/10 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  CHECK ANSWERS
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= CLASSY FOOTER ================= */}
      <footer className="relative z-10 border-t border-white/10 bg-black/95 py-12 px-4 sm:px-6 lg:px-8 text-xs font-mono-num text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-bold font-display text-sm">
                NEXUS // DALAL STREET ARCHITECTURE
              </p>
              <p className="text-[11px] text-slate-400">
                Created for finance students and investors navigating Indian Capital Markets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-[11px]">
            <span>SEBI Academic Framework</span>
            <span>AMFI Guidelines</span>
            <span>Real-Time Market APIs</span>
            <a href="#" className="text-emerald-400 hover:underline flex items-center gap-1">
              <span>Top of page</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-[10px] text-slate-500">
          Disclaimer: This educational interactive portal is for academic and informational purposes only and strictly does not constitute financial, investment, or trading advice. Mutual fund investments and equity securities are subject to market risks; read all scheme-related documents carefully.
        </div>
      </footer>
    </div>
  );
}
