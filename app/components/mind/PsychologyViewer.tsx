"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "motion/react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronDown,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Compass,
  Layers,
  Activity,
  ArrowUp,
  Brain,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// SELF-CONTAINED COGNITIVE SCIENCE UTILITIES & ALGORITHMS
// ─────────────────────────────────────────────────────────────
export interface CRTResult {
  score: number;
  total: number;
  percentile: number;
  profile:
    | "Intuitive (System 1 Dominant)"
    | "Dual-Process Balanced"
    | "Analytical (System 2 Dominant)";
  feedback: string;
}

export const CRT_SOLUTIONS: Record<number, number> = {
  1: 0.05,
  2: 5,
  3: 47,
};

export function evaluateCognitiveReflection(
  answers: Record<number, number>
): CRTResult {
  let score = 0;
  const total = Object.keys(CRT_SOLUTIONS).length;

  for (const [id, correctValue] of Object.entries(CRT_SOLUTIONS)) {
    const qId = Number(id);
    const userVal = answers[qId];
    if (userVal !== undefined && Math.abs(userVal - correctValue) < 0.001) {
      score += 1;
    }
  }

  let profile: CRTResult["profile"] = "Intuitive (System 1 Dominant)";
  let feedback =
    "You rely swiftly on heuristic gut impressions. System 1 provides immediate, effortless answers that often feel intuitively correct without scrutiny.";

  if (score === 3) {
    profile = "Analytical (System 2 Dominant)";
    feedback =
      "Exceptional metacognitive restraint. You consistently suppress automatic intuitive heuristics to allow deliberate algorithmic computation to verify reality.";
  } else if (score >= 1) {
    profile = "Dual-Process Balanced";
    feedback =
      "A hybrid cognitive rhythm. In some domains you permit fast heuristic inference, while in others you deploy reflective skepticism.";
  }

  const percentile = Math.round((score / total) * 100);

  return {
    score,
    total,
    percentile,
    profile,
    feedback,
  };
}

export function calculateReadingStats(
  wordCount: number,
  currentProgress: number
): {
  totalMinutes: number;
  remainingMinutes: number;
} {
  const WORDS_PER_MINUTE = 200;
  const totalMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  const remaining = Math.max(
    0,
    Math.ceil(totalMinutes * (1 - currentProgress))
  );
  return {
    totalMinutes,
    remainingMinutes: remaining,
  };
}

// ─────────────────────────────────────────────────────────────
// COMPREHENSIVE PSYCHOLOGY & COGNITIVE SCIENCE DOSSIER
// ─────────────────────────────────────────────────────────────
interface Chapter {
  id: string;
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  quote: { text: string; author: string; role: string };
  keyConcept: string;
  bodyParagraphs: string[];
  principles: { title: string; desc: string; formula?: string }[];
  takeaway: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: "predictive-mind",
    number: "01",
    tag: "NEURAL PREDICTION & PERCEPTION",
    title: "The Hallucinated Reality",
    subtitle: "Karl Friston’s Free Energy Principle & Unconscious Inference",
    quote: {
      text: "We do not see the world as it is. We see the world as our statistical models expect it to be, corrected only by the residue of error.",
      author: "Karl Friston",
      role: "Theoretical Neurobiologist, Wellcome Centre for Human Neuroimaging",
    },
    keyConcept:
      "Perception is not an incoming transmission of light and sound; it is a top-down generative projection. The brain is locked inside the dark, silent skull, generating an internal simulation of reality.",
    bodyParagraphs: [
      "For over a century, classical psychology treated the senses like recording cameras: sensory organs passively capture photons and soundwaves, relaying them upward to be processed into thoughts. Cognitive neuroscience has radically upended this paradigm through Predictive Processing and Helmholtz’s concept of Unconscious Inference.",
      "The brain is an anticipatory engine. At every tier of the visual hierarchy—from the fusiform face area to the lateral geniculate nucleus—the brain generates downward predictions about what it expects to encounter. The sensory organs merely send upward \"prediction error\" signals: the discrepancy between what was anticipated and what arrived.",
      "This explains pareidolia and facial fixation. Because ancestral survival hinged on instantaneously distinguishing human faces, predators, and emotional expressions in dim twilight, our perceptual priors for faces are heavily weighted. When looking at grain, random static, or ambiguous shadows, the predictive cortex aggressively forces facial geometry onto chaos.",
    ],
    principles: [
      {
        title: "Top-Down Prediction",
        desc: "Prior expectations actively shape raw sensory data before it reaches conscious awareness.",
        formula: "Percept = Bayesian Prior × Sensory Likelihood",
      },
      {
        title: "Pareidolia & Fusiform Specialization",
        desc: "The Fusiform Face Area (FFA) prioritizes facial topology even in visual noise and static.",
      },
      {
        title: "Free Energy Minimization",
        desc: "The nervous system continuously adjusts internal states to minimize surprise and entropy.",
      },
    ],
    takeaway:
      "Reality as you experience it is a controlled hallucination, perpetually calibrated by the whisper of error signals.",
  },
  {
    id: "dual-process",
    number: "02",
    tag: "COGNITIVE ARCHITECTURE",
    title: "Dual-Process Cognition",
    subtitle: "The Tension Between Instinctive Heuristics and Deliberate Logic",
    quote: {
      text: "A reliable way to make people believe in falsehoods is frequent repetition, because familiarity is not easily distinguished from truth.",
      author: "Daniel Kahneman",
      role: "Nobel Laureate & Author of Thinking, Fast and Slow",
    },
    keyConcept:
      "Human judgment is governed by two radically divergent computational engines operating in parallel: the ancient heuristic reflex and the modern algorithmic supervisor.",
    bodyParagraphs: [
      "In the framework popularized by Daniel Kahneman and Amos Tversky, human consciousness operates via two complementary modalities: System 1 (Fast, Automatic, Subconscious, and Effortless) and System 2 (Slow, Analytical, Deliberate, and Computationally Expensive).",
      "System 1 processes an estimated 11 million bits of sensory information per second, deploying associative shortcuts evolved over millions of years of Pleistocene survival. It excels at recognizing facial emotion, ducking a flying object, and reading a billboard effortlessly. However, it is biologically allergic to ambiguity and defaults to narrative coherence over statistical truth.",
      "System 2, housed primarily in the prefrontal cortex, possesses the rare capacity to compute abstract mathematics, compare alternative strategies, and question instinct. Yet it is severely bandwidth-constrained—capable of handling merely 40 to 50 bits per second—and metabolically exhausting. Thus, System 2 routinely ratifies System 1’s intuitive impulses without verification.",
    ],
    principles: [
      {
        title: "System 1 (Heuristic Engine)",
        desc: "Parallel, sub-symbolic, unconscious, instantaneous; governed by associative coherence.",
        formula: "Speed: ~11,000,000 bps",
      },
      {
        title: "System 2 (Algorithmic Supervisor)",
        desc: "Serial, symbolic, conscious, deliberate; governed by logical verification and effort.",
        formula: "Speed: ~40–50 bps",
      },
      {
        title: "Cognitive Miser Principle",
        desc: "The brain conserves glucose by defaulting to intuitive heuristic short-circuits whenever possible.",
      },
    ],
    takeaway:
      "Most decisions are not rational conclusions; they are emotional impulses rationalized retroactively by an overworked prefrontal cortex.",
  },
  {
    id: "memory-neuroplasticity",
    number: "03",
    tag: "MEMORY & NEUROPLASTICITY",
    title: "The Palimpsest of Memory",
    subtitle: "Constructive Recall and the Malleability of Neural Engrams",
    quote: {
      text: "Memory is not a video recording waiting in an archive; it is a story rewritten from fragments every single time the lights turn on.",
      author: "Elizabeth F. Loftus",
      role: "Cognitive Psychologist & Pioneer in Eyewitness Testimony",
    },
    keyConcept:
      "Remembering is not retrieval; it is reconstruction. Every act of recall dissolves the chemical engram, rendering it fragile and susceptible to rewriting before reconsolidation.",
    bodyParagraphs: [
      "In folk psychology, memory is conceptualized like digital storage: a factual file written down in the hippocampus and retrieved pristinely decades later. Neurobiology paints a far more dramatic and unsettling picture.",
      "When an experience is formed, it distributes across thousands of cortical synapses via Long-Term Potentiation (LTP). However, when you recall that event today, the neural trace enters a transient, biochemically labile state through a process known as Reconsolidation.",
      "In this fragile window, new emotions, contemporary suggestions, and current social contexts bleed directly into the core engram. When the brain re-stores the memory, it stores the memory of the last recall, not the original event. Over a lifetime, our most cherished historical truths gradually morph into high-resolution fictions.",
    ],
    principles: [
      {
        title: "Synaptic Reconsolidation",
        desc: "Recalling a memory renders the physical protein trace malleable and vulnerable to modification.",
      },
      {
        title: "Misinformation & Source Amnesia",
        desc: "The brain readily retains narrative facts while losing the contextual origin of how it learned them.",
      },
      {
        title: "Hebbian Plasticity",
        desc: "Neurons that fire together wire together, continuously restructuring cortical density across the lifespan.",
      },
    ],
    takeaway:
      "You are not the keeper of an immutable archive. You are the continuous author of a living mythology.",
  },
  {
    id: "biases-heuristics",
    number: "04",
    tag: "HEURISTIC DISTORTIONS",
    title: "The Architecture of Bias",
    subtitle: "Evolutionary Shortcuts That Warp Modern Epistemology",
    quote: {
      text: "The easiest person to fool is yourself, because you desperately want to believe your intuition was right all along.",
      author: "Richard Feynman",
      role: "Theoretical Physicist",
    },
    keyConcept:
      "Cognitive biases are not arbitrary flaws or mental illnesses. They are evolutionary adaptations that sacrificed fidelity for speed in high-stakes ancestral environments.",
    bodyParagraphs: [
      "In evolutionary history, a hominid who mistook the rustle of dry savannah grass for a leopard survived; one who waited for 95% statistical confidence was eaten. Evolution selected aggressively for type-I errors (false positives) over type-II errors (false negatives).",
      "Today, placed within digital information cascades, global capital markets, and abstract institutional dilemmas, these ancient heuristic shortcuts misfire catastrophically. Confirmation bias turns curiosity into tribal dogmatism; anchoring bias locks financial evaluation onto arbitrary initial numbers.",
      "Recognizing these systematic blind spots is the beginning of metacognition: the deliberate ability to watch your own cognitive machinery operate and catch it in the act of distortion.",
    ],
    principles: [
      {
        title: "Anchoring Bias",
        desc: "Disproportionate reliance on the first piece of information encountered, even if explicitly random.",
      },
      {
        title: "Confirmation Bias & Myside Bias",
        desc: "The immediate subconscious dismissal of contradictory data coupled with active hunting for validating signals.",
      },
      {
        title: "The Availability Cascade",
        desc: "Judging the frequency or danger of an event by the emotional vividness with which examples spring to mind.",
      },
      {
        title: "Dunning-Kruger Calibration",
        desc: "The metacognitive inability of novice cognition to gauge its own incompetence.",
      },
    ],
    takeaway:
      "Wisdom is not accumulating more knowledge; it is calibrating the humility of your own cognitive instruments.",
  },
  {
    id: "flow-consciousness",
    number: "05",
    tag: "CONSCIOUSNESS & FLOW",
    title: "The Dissolution of the Ego",
    subtitle: "Transient Hypofrontality, Attention, and Peak Experience",
    quote: {
      text: "The best moments in our lives are not the passive, receptive, relaxing times… The best moments usually occur if a person’s body or mind is stretched to its limits in a voluntary effort to accomplish something difficult.",
      author: "Mihaly Csikszentmihalyi",
      role: "Psychologist & Architect of Flow Theory",
    },
    keyConcept:
      "When attention aligns flawlessly with high-stakes challenge and immediate sensory feedback, the Default Mode Network quiets down, dissolving the boundary between the observer and the task.",
    bodyParagraphs: [
      "Consciousness spends much of its waking hours trapped in the Default Mode Network (DMN)—a constellation of midline cortical regions responsible for self-rumination, regret, social anxiety, and time-traveling thoughts of past and future.",
      "During states of Flow, neurobiology observes Transient Hypofrontality: a temporary downregulation of the dorsolateral prefrontal cortex. The inner critic goes silent. Self-consciousness vanishes. Time dilates, feeling simultaneously compressed and expansive.",
      "A cascade of five potent neurochemicals floods the synaptic cleft simultaneously: dopamine, norepinephrine, endorphins, anandamide, and serotonin. In this state of neural hyper-synchrony, pattern recognition skyrockets, cognitive friction dissolves, and the illusion of a separated self melts into pure execution.",
    ],
    principles: [
      {
        title: "Transient Hypofrontality",
        desc: "Temporary dampening of the prefrontal inner monologue, unleashing peak computational fluidity.",
      },
      {
        title: "Challenge-Skill Equilibrium",
        desc: "Flow occurs specifically where task demands sit precisely 4% beyond existing skill ceilings.",
      },
      {
        title: "DMN Downregulation",
        desc: "Silencing the rumination loop that fuels subjective suffering and existential anxiety.",
      },
    ],
    takeaway:
      "The highest state of human consciousness is not the amplification of the ego, but its sublime, temporary extinction.",
  },
];

// Interactive Bias Catalog
interface BiasDetail {
  id: string;
  name: string;
  latin: string;
  summary: string;
  manifestation: string;
  antidote: string;
}

const BIAS_CATALOG: BiasDetail[] = [
  {
    id: "anchoring",
    name: "Anchoring & Adjustment",
    latin: "Fixatio Primaria",
    summary:
      "The tendency to give disproportionate psychological weight to the first number or premise introduced in a discussion.",
    manifestation:
      "In negotiations or criminal sentencing, an initial arbitrary figure influences the final settlement by up to 40%, even when subjects are informed the number was chosen randomly.",
    antidote:
      "Actively generate counter-anchors from independent baseline metrics before entering deliberation.",
  },
  {
    id: "confirmation",
    name: "Confirmation Polarization",
    latin: "Veritas Concors",
    summary:
      "Searching for, interpreting, and recalling information in a manner that validates preexisting hypotheses.",
    manifestation:
      "When presented with identical statistical studies on capital punishment, both proponents and opponents emerge more polarized, selectively praising compatible methodology.",
    antidote:
      "Engage in \"Red Teaming\" and ask: \"What evidence would definitively force me to renounce this conviction?\"",
  },
  {
    id: "availability",
    name: "Availability Heuristic",
    latin: "Memoria Prompta",
    summary:
      "Estimating the probability of an outcome based on how easily vivid instances can be retrieved from memory.",
    manifestation:
      "People dramatically overestimate the lethality of commercial aviation or shark attacks relative to diabetes or stroke, driven by sensationalized media coverage.",
    antidote:
      "Demand empirical base rates and actuarial tables rather than relying on emotional vividness.",
  },
  {
    id: "framing",
    name: "The Framing Effect",
    latin: "Forma Contextus",
    summary:
      "Drawing radically different conclusions from identical factual data based entirely on whether outcomes are phrased as gains or losses.",
    manifestation:
      "Patients overwhelmingly consent to surgery framed as \"90% survival rate after 5 years\" but recoil when phrased as \"10% mortality rate.\"",
    antidote:
      "Invert the semantic polarity of every critical proposition before committing resources.",
  },
  {
    id: "dunning-kruger",
    name: "Dunning-Kruger Distortion",
    latin: "Caecitas Peritiae",
    summary:
      "A cognitive blind spot wherein individuals with low competence in a domain fail to recognize their own deficit.",
    manifestation:
      "Novices in grammar, logic, or financial trading routinely rate their percentile rank in the top 20% due to lacking the very skills required to evaluate quality.",
    antidote:
      "Adopt structured peer calibration, rigorous blind testing, and cultivate intellectual humility.",
  },
];

export default function PsychologyViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parallax scroll hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Dynamic parallax transformations:
  // At scroll 0 (Hero): Video is in FOREFRONT (opacity 1.0, 0 blur, 0 scrim).
  // As user scrolls down to points: Video fades to background (opacity 0.22, dark scrim 0.88, subtle blur).
  const videoOpacityTransform = useTransform(
    scrollYProgress,
    [0, 0.08, 0.22],
    [1.0, 0.65, 0.22]
  );
  const darkScrimTransform = useTransform(
    scrollYProgress,
    [0, 0.08, 0.22],
    [0.0, 0.45, 0.88]
  );
  const videoFilterTransform = useTransform(
    scrollYProgress,
    [0, 0.1, 0.25],
    ["blur(0px) contrast(115%)", "blur(2px) contrast(120%)", "blur(6px) contrast(125%)"]
  );
  const videoScaleTransform = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1.0, 1.06]
  );

  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.18], [0, -100]);

  // Video and audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Active section tracking
  const [activeChapterId, setActiveChapterId] = useState<string>("predictive-mind");
  const [selectedBiasId, setSelectedBiasId] = useState<string>("anchoring");

  // Interactive Cognitive Reflection Test (CRT) state
  const [crtAnswers, setCrtAnswers] = useState<Record<number, string>>({
    1: "",
    2: "",
    3: "",
  });
  const [crtResult, setCrtResult] = useState<CRTResult | null>(null);
  const [showCrtAnalysis, setShowCrtAnalysis] = useState<boolean>(false);

  // Ambient sound synthesizer: generates a gentle, resonant 432Hz sine focus tone with binaural modulation
  const toggleAmbientAudio = () => {
    if (!audioActive) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 3);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Carrier frequency (432Hz deep meditative drone)
        const oscLeft = ctx.createOscillator();
        oscLeft.type = "sine";
        oscLeft.frequency.setValueAtTime(108, ctx.currentTime); // Deep sub octave

        const oscRight = ctx.createOscillator();
        oscRight.type = "sine";
        oscRight.frequency.setValueAtTime(114, ctx.currentTime); // 6Hz Theta binaural beat

        const subOsc = ctx.createOscillator();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(54, ctx.currentTime); // Deep grounding floor

        // Gentle lowpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        oscLeft.connect(filter);
        oscRight.connect(filter);
        subOsc.connect(filter);
        filter.connect(masterGain);

        oscLeft.start();
        oscRight.start();
        subOsc.start();

        setAudioActive(true);
      } catch (err) {
        console.error("Audio context error:", err);
      }
    } else {
      if (audioCtxRef.current && gainNodeRef.current) {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
          0.0001,
          audioCtxRef.current.currentTime + 1.2
        );
        setTimeout(() => {
          audioCtxRef.current?.close();
          audioCtxRef.current = null;
          setAudioActive(false);
        }, 1300);
      } else {
        setAudioActive(false);
      }
    }
  };

  // Video play/pause toggle
  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // CRT scoring handler
  const handleScoreCRT = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed: Record<number, number> = {};
    if (crtAnswers[1] !== "") parsed[1] = parseFloat(crtAnswers[1]);
    if (crtAnswers[2] !== "") parsed[2] = parseFloat(crtAnswers[2]);
    if (crtAnswers[3] !== "") parsed[3] = parseFloat(crtAnswers[3]);

    const result = evaluateCognitiveReflection(parsed);
    setCrtResult(result);
    setShowCrtAnalysis(true);
  };

  const handleResetCRT = () => {
    setCrtAnswers({ 1: "", 2: "", 3: "" });
    setCrtResult(null);
    setShowCrtAnalysis(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveChapterId(id);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const totalWords = 2800;
  const [currentProgressVal, setCurrentProgressVal] = useState<number>(0);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (latest) => {
      setCurrentProgressVal(latest);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const readingStats = calculateReadingStats(totalWords, currentProgressVal);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-neutral-100 selection:bg-neutral-200 selection:text-black font-sans overflow-x-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. BACKGROUND CINEMATIC VIDEO & DYNAMIC FADE ARCHITECTURE
          - At scroll = 0: Video is in FOREFRONT (100% visible, no dark scrim).
          - On scroll down: Scrim fades in to pitch black, video fades to background.
          ───────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
        {/* Forefront Video Layer */}
        <motion.div
          style={{
            opacity: videoOpacityTransform,
            scale: videoScaleTransform,
            filter: videoFilterTransform,
          }}
          className="w-full h-full will-change-transform will-change-opacity"
        >
          <video
            ref={videoRef}
            src="/assets/psychology.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center filter grayscale"
          >
            <source src="/assets/psychology.mp4" type="video/mp4" />
            <source src="/assets/aistudio/psychology_e67186a4.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Dynamic Pitch-Black Scrim that fades in as user scrolls down */}
        <motion.div
          style={{ opacity: darkScrimTransform }}
          className="absolute inset-0 bg-black pointer-events-none"
        />

        {/* Edge feathering to guarantee pitch black blending with lower pages */}
        <motion.div
          style={{
            opacity: darkScrimTransform,
            background:
              "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 60%, #000000 95%)",
          }}
          className="absolute inset-0 pointer-events-none"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SLEEK TOP PROGRESS & MINIMAL HUD
          ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
        {/* Hairline Scroll Progress Bar */}
        <div className="w-full h-[2px] bg-neutral-900/60">
          <motion.div
            className="h-full bg-gradient-to-r from-neutral-500 via-neutral-100 to-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
          />
        </div>

        {/* Minimal Floating Navigation Bar */}
        <div className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-white/[0.06] pointer-events-auto">
          {/* Brand & Monograph Metadata */}
          <div className="flex items-center space-x-3">
            <Link
              href="/mind"
              className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code uppercase bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white transition-all shadow-sm"
              title="Return to Mind & More"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              <span>Mind</span>
            </Link>

            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <a
              href="#hero"
              className="font-serif-title tracking-[0.25em] text-sm md:text-base font-semibold text-neutral-100 hover:text-white transition-colors"
            >
              COGNITION
            </a>
            <span className="hidden sm:inline text-xs font-mono-code text-neutral-400 border-l border-neutral-800 pl-3">
              ARCHIVE // PSYCHE.01
            </span>
          </div>

          {/* Quick Chapter Selector */}
          <nav
            aria-label="Chapter Navigation"
            className="hidden md:flex items-center space-x-1 text-xs font-mono-code text-neutral-400"
          >
            {CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => scrollToSection(ch.id)}
                className={`px-3 py-1.5 rounded transition-all duration-300 ${
                  activeChapterId === ch.id
                    ? "text-white bg-white/10 font-medium"
                    : "hover:text-neutral-200 hover:bg-white/5"
                }`}
              >
                {ch.number}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("interactive-crt")}
              className="px-3 py-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              EXPERIMENT
            </button>
          </nav>

          {/* Controls: Ambient Sound & Video Controls */}
          <div className="flex items-center space-x-2">
            {/* Ambient Sound Generator Button */}
            <button
              onClick={toggleAmbientAudio}
              aria-label={
                audioActive
                  ? "Mute 432Hz ambient focus tone"
                  : "Enable 432Hz ambient focus tone"
              }
              className={`p-2 rounded-full border transition-all flex items-center space-x-1.5 text-xs ${
                audioActive
                  ? "border-white/40 bg-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                  : "border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-white/20"
              }`}
              title={
                audioActive
                  ? "Mute 432Hz neural tone"
                  : "Activate 432Hz neural focus tone"
              }
            >
              {audioActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden lg:inline text-[11px] font-mono-code">
                {audioActive ? "432Hz ON" : "SOUND"}
              </span>
            </button>

            {/* Video Play/Pause */}
            <button
              onClick={toggleVideoPlayback}
              aria-label={
                isPlaying ? "Pause background video" : "Resume background video"
              }
              className="p-2 rounded-full border border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-white/20 transition-all"
              title={isPlaying ? "Pause video loop" : "Play video loop"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION (VIDEO ON FOREFRONT — MATCHES USER REFERENCE)
          - Video is vivid and completely in the forefront.
          - Solid white highlight text blocks for 100% readability.
          ───────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center z-10"
      >
        <motion.div
          style={{ opacity: heroContentOpacity, y: heroContentY }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Metadata pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/70 backdrop-blur-md mb-8 shadow-xl">
            <Sparkles size={13} className="text-neutral-300" />
            <span className="text-xs font-mono-code tracking-[0.2em] text-neutral-200 uppercase">
              COGNITIVE SCIENCE & PHILOSOPHY OF MIND
            </span>
          </div>

          {/* Majestic Headline with Crisp White Highlight Blocks (Matching User Reference) */}
          <div className="flex flex-col items-center space-y-1.5 select-none">
            {/* Box 1: THE */}
            <div className="bg-white text-black px-8 sm:px-12 py-1.5 sm:py-2.5 shadow-2xl">
              <span className="font-serif-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.12em] font-medium leading-none block">
                THE
              </span>
            </div>

            {/* Box 2: ARCHITECTURE */}
            <div className="bg-white text-black px-6 sm:px-10 py-1.5 sm:py-3 shadow-2xl">
              <span className="font-serif-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] font-medium leading-none block">
                ARCHITECTURE
              </span>
            </div>

            {/* Box 3: OF THE PSYCHE */}
            <div className="bg-white text-black px-6 sm:px-10 py-1.5 sm:py-3 shadow-2xl">
              <span className="font-serif-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] italic font-light leading-none block">
                OF THE PSYCHE
              </span>
            </div>
          </div>

          {/* White Ribbon Subtitle Matching User Reference */}
          <div className="mt-8 flex flex-col items-center space-y-1 text-center max-w-2xl mx-auto select-none">
            <span className="bg-white text-black px-2.5 py-1 text-xs sm:text-sm md:text-base font-normal tracking-wide shadow-md">
              The human brain does not passively mirror reality. It is an active, predictive
            </span>
            <span className="bg-white text-black px-2.5 py-1 text-xs sm:text-sm md:text-base font-normal tracking-wide shadow-md">
              hallucination machine—casting hypotheses across darkness, pruning
            </span>
            <span className="bg-white text-black px-2.5 py-1 text-xs sm:text-sm md:text-base font-normal tracking-wide shadow-md">
              sensory noise, and projecting coherence onto chaos.
            </span>
          </div>

          {/* Enter / Scroll Prompt */}
          <div className="mt-12 flex flex-col items-center">
            <button
              onClick={() => scrollToSection("dossier-metrics")}
              className="group flex flex-col items-center space-y-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="bg-black/80 text-white border border-white/20 px-4 py-1 rounded-full text-[11px] font-mono-code tracking-[0.25em] uppercase shadow-lg group-hover:border-white/50 transition-all">
                Scroll to Explore
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="p-1.5 rounded-full border border-white/30 bg-black/60 backdrop-blur-md group-hover:border-white/60 transition-colors shadow-lg"
              >
                <ChevronDown size={15} />
              </motion.div>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. TRANSITION BRIDGE & METRICS
          - This is where the video gracefully recedes into the background
          - Pitch black surfaces take over for high-contrast reading
          ───────────────────────────────────────────────────────────── */}
      <section
        id="dossier-metrics"
        className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-24 scroll-mt-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left"
        >
          <div className="p-5 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-widest block">
              Reading Time
            </span>
            <span className="text-lg font-serif-title text-neutral-100 font-medium mt-1 block">
              ~{readingStats.totalMinutes} Minutes
            </span>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-widest block">
              Principles
            </span>
            <span className="text-lg font-serif-title text-neutral-100 font-medium mt-1 block">
              5 Core Pillars
            </span>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-widest block">
              Laboratory
            </span>
            <span className="text-lg font-serif-title text-neutral-100 font-medium mt-1 block">
              CRT Reflection
            </span>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-widest block">
              Environment
            </span>
            <span className="text-lg font-serif-title text-neutral-100 font-medium mt-1 block">
              Pitch Black Space
            </span>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CHAPTERS WITH PARALLAX SCROLLING & MOTION GRAPHICS
          ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 space-y-36 pb-36">
        {CHAPTERS.map((chapter) => (
          <section
            key={chapter.id}
            id={chapter.id}
            className="relative scroll-mt-28"
          >
            {/* Parallax Background Chapter Watermark Number */}
            <div className="absolute -top-12 -left-6 sm:-left-16 pointer-events-none select-none text-7xl sm:text-9xl font-serif-title font-black text-white/[0.03] tracking-tighter">
              {chapter.number}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {/* Header Metadata */}
              <div className="flex items-center space-x-3 text-xs font-mono-code text-neutral-400">
                <span className="text-neutral-500">§ {chapter.number}</span>
                <span className="w-4 h-[1px] bg-neutral-800" />
                <span className="tracking-[0.2em] uppercase text-neutral-300">
                  {chapter.tag}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-title font-normal tracking-wide text-white leading-tight">
                  {chapter.title}
                </h2>
                <p className="mt-2 text-sm sm:text-base font-mono-code text-neutral-400">
                  {chapter.subtitle}
                </p>
              </div>

              {/* Editorial Pull Quote Card */}
              <blockquote className="p-6 sm:p-8 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/60 to-transparent" />
                <p className="text-base sm:text-lg md:text-xl font-serif-title italic text-neutral-200 leading-relaxed">
                  &ldquo;{chapter.quote.text}&rdquo;
                </p>
                <footer className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div>
                    <cite className="not-italic text-sm font-medium text-white block">
                      {chapter.quote.author}
                    </cite>
                    <span className="text-xs font-mono-code text-neutral-400">
                      {chapter.quote.role}
                    </span>
                  </div>
                  <Compass size={18} className="text-neutral-500 opacity-60" />
                </footer>
              </blockquote>

              {/* Key Concept Banner */}
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-white/[0.08] flex items-start space-x-3">
                <Brain className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-300 leading-relaxed">
                  <strong className="text-white font-medium">Core Axiom: </strong>
                  {chapter.keyConcept}
                </p>
              </div>

              {/* Body Prose */}
              <div className="space-y-5 text-base sm:text-lg text-neutral-300/90 font-light leading-relaxed">
                {chapter.bodyParagraphs.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Principles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {chapter.principles.map((principle, prIdx) => (
                  <div
                    key={prIdx}
                    className="p-5 rounded-lg border border-white/[0.07] bg-black/50 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
                  >
                    <span className="text-[10px] font-mono-code text-neutral-500 uppercase tracking-widest block mb-2">
                      Principle 0{prIdx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white mb-1.5">
                      {principle.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {principle.desc}
                    </p>
                    {principle.formula && (
                      <div className="mt-3 pt-2 border-t border-white/[0.06] text-[11px] font-mono-code text-neutral-300">
                        {principle.formula}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Takeaway Epigram */}
              <div className="p-4 rounded border-l-2 border-white/80 bg-white/[0.01] text-sm text-neutral-300 font-mono-code">
                <span className="text-neutral-400 uppercase tracking-wider block text-[10px] mb-1">
                  Synthesized Conclusion
                </span>
                {chapter.takeaway}
              </div>
            </motion.div>
          </section>
        ))}

        {/* ─────────────────────────────────────────────────────────────
            6. INTERACTIVE COGNITIVE BIAS OBSERVATORY
            ───────────────────────────────────────────────────────────── */}
        <section
          id="bias-observatory"
          className="relative scroll-mt-28 p-8 sm:p-10 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl"
        >
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-2 text-xs font-mono-code text-neutral-400">
              <Layers size={14} className="text-neutral-300" />
              <span className="tracking-[0.2em] uppercase">Interactive Taxonomy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-title text-white">
              The Cognitive Bias Observatory
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
              Inspect how evolutionary shortcuts consistently deceive judgment in contemporary environments. Select a bias below to inspect its mechanism and behavioral countermeasure.
            </p>
          </div>

          {/* Bias Tabs */}
          <div className="flex flex-wrap gap-2 pb-6 border-b border-white/[0.08]">
            {BIAS_CATALOG.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBiasId(b.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                  selectedBiasId === b.id
                    ? "bg-white text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                    : "border border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* Active Bias Card */}
          {(() => {
            const currentBias =
              BIAS_CATALOG.find((b) => b.id === selectedBiasId) || BIAS_CATALOG[0];
            return (
              <motion.div
                key={currentBias.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h3 className="text-xl font-serif-title text-white">
                    {currentBias.name}
                  </h3>
                  <span className="text-xs font-mono-code text-neutral-500 italic">
                    {currentBias.latin}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
                  {currentBias.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-widest block mb-2">
                      Experimental Manifestation
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      {currentBias.manifestation}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-widest block mb-2">
                      Cognitive Antidote
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-mono-code">
                      {currentBias.antidote}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. COGNITIVE REFLECTION TEST (INTERACTIVE EXPERIMENT)
            ───────────────────────────────────────────────────────────── */}
        <section
          id="interactive-crt"
          className="relative scroll-mt-28 p-8 sm:p-10 rounded-2xl border border-white/10 bg-neutral-950/80 backdrop-blur-xl"
        >
          <div className="space-y-3 mb-8">
            <div className="flex items-center space-x-2 text-xs font-mono-code text-neutral-400">
              <Activity size={14} className="text-neutral-300" />
              <span className="tracking-[0.2em] uppercase">
                Metacognitive Laboratory
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-title text-white">
              The Cognitive Reflection Experiment
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
              Devised by Shane Frederick (2005), this test assesses your ability to suppress an immediate, intuitively seductive &ldquo;gut&rdquo; response in favor of deliberate calculation.
            </p>
          </div>

          <form onSubmit={handleScoreCRT} className="space-y-6">
            {/* Question 1 */}
            <div className="p-5 rounded-xl border border-white/[0.08] bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-neutral-400">
                  Experiment 01 // The Bat & The Ball
                </span>
                <HelpCircle size={14} className="text-neutral-600" />
              </div>
              <p className="text-sm sm:text-base text-neutral-200">
                A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost in dollars?
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <span className="text-xs font-mono-code text-neutral-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 0.05"
                  value={crtAnswers[1]}
                  onChange={(e) =>
                    setCrtAnswers({ ...crtAnswers, 1: e.target.value })
                  }
                  className="bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 w-36 font-mono-code"
                />
                <span className="text-xs text-neutral-500 font-mono-code">
                  (Enter decimal, e.g. 0.05)
                </span>
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-5 rounded-xl border border-white/[0.08] bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-neutral-400">
                  Experiment 02 // The Manufacturing Rate
                </span>
                <HelpCircle size={14} className="text-neutral-600" />
              </div>
              <p className="text-sm sm:text-base text-neutral-200">
                If 5 machines take 5 minutes to make 5 widgets, how many minutes would it take 100 machines to make 100 widgets?
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 5"
                  value={crtAnswers[2]}
                  onChange={(e) =>
                    setCrtAnswers({ ...crtAnswers, 2: e.target.value })
                  }
                  className="bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 w-36 font-mono-code"
                />
                <span className="text-xs text-neutral-400 font-mono-code">
                  Minutes
                </span>
              </div>
            </div>

            {/* Question 3 */}
            <div className="p-5 rounded-xl border border-white/[0.08] bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-neutral-400">
                  Experiment 03 // The Exponential Lily Pads
                </span>
                <HelpCircle size={14} className="text-neutral-600" />
              </div>
              <p className="text-sm sm:text-base text-neutral-200">
                In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how many days would it take to cover half of the lake?
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. 47"
                  value={crtAnswers[3]}
                  onChange={(e) =>
                    setCrtAnswers({ ...crtAnswers, 3: e.target.value })
                  }
                  className="bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 w-36 font-mono-code"
                />
                <span className="text-xs text-neutral-400 font-mono-code">
                  Days
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
              >
                Analyze Cognitive Architecture
              </button>
              {showCrtAnalysis && (
                <button
                  type="button"
                  onClick={handleResetCRT}
                  className="px-4 py-2.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white text-xs font-mono-code flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>

          {/* CRT Results Disclosure */}
          <AnimatePresence>
            {showCrtAnalysis && crtResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 pt-8 border-t border-white/10 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-white/15 bg-white/[0.03]">
                  <div>
                    <span className="text-[10px] font-mono-code text-neutral-400 uppercase tracking-widest block">
                      Diagnostic Profile
                    </span>
                    <span className="text-xl font-serif-title text-white font-medium">
                      {crtResult.profile}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-serif-title text-white">
                      {crtResult.score} / {crtResult.total}
                    </span>
                    <span className="text-xs font-mono-code text-neutral-400 block">
                      Accuracy Score
                    </span>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed font-light">
                  {crtResult.feedback}
                </p>

                {/* Explanation of Intuitive Traps */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono-code text-neutral-400 uppercase tracking-wider block">
                    Dissection of the Heuristic Traps:
                  </span>
                  <div className="text-xs font-mono-code text-neutral-300 space-y-2">
                    <p className="p-3 rounded bg-black/40 border border-white/[0.06]">
                      • <strong>Question 1:</strong> Intuition shouts $0.10. But if the ball is $0.10 and the bat is $1.00 more ($1.10), the total would be $1.20. The actual algebraic solution is: Ball = ($1.10 - $1.00) / 2 = <strong>$0.05</strong>.
                    </p>
                    <p className="p-3 rounded bg-black/40 border border-white/[0.06]">
                      • <strong>Question 2:</strong> Intuition defaults to the symmetrical pattern (100 machines = 100 minutes). But 1 machine produces 1 widget in 5 minutes. 100 machines acting simultaneously still take exactly <strong>5 minutes</strong>.
                    </p>
                    <p className="p-3 rounded bg-black/40 border border-white/[0.06]">
                      • <strong>Question 3:</strong> Intuition halves 48 days to 24 days. But because the patch doubles daily, stepping backward one single day (Day <strong>47</strong>) halves the patch from whole to half.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            8. SYNTHESIS & METAPHYSICAL EPILOGUE
            ───────────────────────────────────────────────────────────── */}
        <section className="text-center py-12 space-y-6">
          <div className="w-12 h-[1px] bg-white/20 mx-auto" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-title font-light tracking-wide text-neutral-200 max-w-xl mx-auto leading-relaxed">
            &ldquo;The brain is a map that has mistaken itself for the territory.&rdquo;
          </h2>
          <p className="text-sm font-mono-code text-neutral-500 max-w-md mx-auto">
            To grasp cognition is to recognize that the observer, the lens, and the observed universe arise from the identical tapestry of neural calculation.
          </p>
          <div className="pt-6">
            <button
              onClick={() => scrollToSection("hero")}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 text-xs font-mono-code text-neutral-300 hover:text-white transition-all bg-black/40 backdrop-blur cursor-pointer"
            >
              <ArrowUp size={14} />
              <span>RETURN TO APEX</span>
            </button>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          9. REFINED EDITORIAL FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-black/90 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 gap-6 font-mono-code">
          <div>
            <span className="font-serif-title text-neutral-200 text-sm tracking-widest uppercase block mb-1">
              Cognition Monograph
            </span>
            <span>A study in neural inference, heuristics & conscious synthesis.</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="hover:text-neutral-200 transition-colors">
              PITCH BLACK CINEMA // 2026
            </span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400">
              {Math.round(currentProgressVal * 100)}% READ
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

