"use client";

import React, { useEffect, useRef } from "react";

/**
 * TechStackShowcase — Interactive Cinematic Tech Stack
 * Features 29 curated technologies across 6 categories with 3D card perspective,
 * chromatic fringes, halo blurs, glass sweep transitions, and keyboard navigation.
 */

const GROUPS: [string, [string, string, string, string, string, string, number, string][]][] = [
  [
    "Languages",
    [
      ["C", "Where it all started", "#0b1f4a", "#1f6feb", "#ffffff", "#7cc4ff", 4, "C"],
      ["C++", "Speed with abstractions", "#0f172a", "#2b4acb", "#ffffff", "#6ea8ff", 3, "C++"],
      ["Java", "Write once, run anywhere", "#fff7ed", "#ffd9c2", "#1b1b2f", "#e5412d", 2, "J"],
      ["Python", "Readable and powerful", "#0a2540", "#0f4c81", "#ffffff", "#ffd43b", 1, "Py"],
      ["SQL", "Asking databases questions", "#f3f6fb", "#dbe6f6", "#0f2742", "#2563eb", 5, "Q"],
    ],
  ],
  [
    "Backend",
    [
      ["Django", "Batteries-included web framework", "#06281b", "#0c4b33", "#e8fff4", "#44b78b", 0, "dj"],
      ["Node.js", "JavaScript on the server", "#0d1b0f", "#1f4d2a", "#eaffea", "#6cc24a", 7, "N"],
      ["Express.js", "Minimal web framework", "#0c0d10", "#2a2e37", "#f5f6f8", "#b8f34a", 1, "ex"],
      ["REST APIs", "Clean endpoints for any client", "#1a0b2e", "#5b21b6", "#ffffff", "#c4b5fd", 3, "{ }"],
    ],
  ],
  [
    "Databases",
    [
      ["MySQL", "Relational database", "#eef6ff", "#cfe6ff", "#00546b", "#f29111", 2, "My"],
    ],
  ],
  [
    "AI / ML",
    [
      ["Scikit-learn", "Classic machine learning", "#fff8f0", "#ffe3c7", "#1c2b4a", "#f7931e", 7, "sk"],
      ["Pandas", "Data wrangling", "#150458", "#3b1b8f", "#ffffff", "#ffca00", 1, "pd"],
      ["NumPy", "Fast numerical computing", "#e8f4fd", "#b9defa", "#0d2c54", "#4dabcf", 0, "Np"],
      ["Machine Learning", "Models that learn from data", "#0b132b", "#1c2d5a", "#ffffff", "#5bc0be", 5, "ML"],
      ["Generative AI", "Models that create", "#1b0536", "#e0457b", "#ffffff", "#ffd6f2", 6, "AI"],
      ["RAG", "Answers grounded in your data", "#0e1116", "#1e293b", "#e5f3ff", "#38bdf8", 4, "R"],
      ["Google Gemini API", "Multimodal AI from Google", "#ffffff", "#e3e9ff", "#1a1f36", "#6d7cff", 2, "G"],
      ["Ollama", "Local LLMs on my machine", "#fafaf7", "#e6e6e6", "#111111", "#111111", 7, "O"],
    ],
  ],
  [
    "Tools & Platforms",
    [
      ["Git", "Version control", "#fff4f0", "#ffd2c4", "#2b1a16", "#f05032", 3, "git"],
      ["GitHub", "Code hosting and collaboration", "#0d1117", "#2a3038", "#f0f6fc", "#8b949e", 7, "GH"],
      ["Google Colab", "Notebooks in the cloud", "#1d1400", "#4a3200", "#ffffff", "#f9ab00", 2, "CO"],
      ["Streamlit", "Data apps in pure Python", "#ffffff", "#ffe0e0", "#262730", "#ff4b4b", 1, "St"],
      ["Google Cloud Platform", "Cloud infrastructure", "#ffffff", "#e3edff", "#202124", "#4285f4", 0, "G"],
      ["Cisco Packet Tracer", "Network simulation", "#02293b", "#049fd9", "#ffffff", "#00d2ff", 3, "CPT"],
    ],
  ],
  [
    "Core CS",
    [
      ["DSA", "Data structures and algorithms", "#fdf6e3", "#f4e2b0", "#3b2f12", "#b45309", 4, "DS"],
      ["OOP", "Object-oriented programming", "#2a0a3d", "#7c2d92", "#ffffff", "#f0abfc", 5, "OO"],
      ["DBMS", "Database management systems", "#04222a", "#0e7490", "#ffffff", "#67e8f9", 3, "DB"],
      ["Operating Systems", "Processes, memory, scheduling", "#0a0a0a", "#1f2937", "#e5e7eb", "#22c55e", 1, ">_"],
      ["Computer Networks", "How data moves", "#00162b", "#0a4a8a", "#ffffff", "#38d6ff", 2, "CN"],
    ],
  ],
];

const MODES = ["open", "R", "open", "L", "close", "R"];
const FONTS = ["Poppins", "Space Grotesk", "Outfit", "Sora", "Archivo Black", "Unbounded", "DM Serif Display", "Manrope"];
const WEIGHTS = [700, 700, 700, 700, 400, 600, 400, 800];
const HOLD = 2400;

export default function TechStackShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = rootRef.current;
    if (!app) return;

    // Clear previous children if any
    app.innerHTML = "";

    const el = (c: string) => {
      const e = document.createElement("div");
      e.className = c;
      return e;
    };

    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const lum = (h: string) => {
      const n = parseInt(h.slice(1), 16);
      const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };

    const flat: [string, string, string, string, string, string, number, string, string][] =
      GROUPS.flatMap(([cat, items]) => items.map((d) => [...d, cat] as [string, string, string, string, string, string, number, string, string]));
    const N = flat.length;
    const POS = [
      [8, 18],
      [86, 22],
      [80, 76],
      [13, 74],
      [48, 9],
    ];
    const lineSets: string[][] = [];

    const scenes = flat.map((d, i) => {
      const [name, tag, a, b, fg, acc, f, mk, cat] = d;
      let lines = [name];
      if (name.length > 13 && name.includes(" ")) {
        const mid = name.length / 2;
        const sp = [...name]
          .map((c, k) => (c === " " ? k : -1))
          .filter((k) => k >= 0);
        const k = sp.sort((x, y) => Math.abs(x - mid) - Math.abs(y - mid))[0];
        lines = [name.slice(0, k), name.slice(k + 1)];
      }
      lineSets.push(lines);

      let n = 0;
      const word = lines
        .map((l) =>
          [...l]
            .map(
              (ch) =>
                `<span class="ch" style="--i:${n++}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`
            )
            .join("")
        )
        .join("<br>");

      const p = (k: number) => POS[(i + k) % POS.length];
      const s = document.createElement("section");
      s.className = "scene";
      s.style.cssText =
        `--a:${a};--b:${b};--fg:${fg};--acc:${acc};--ff:'${FONTS[f]}',system-ui,sans-serif;--fw:${WEIGHTS[f]};` +
        `--mk:${lum(acc) > 0.45 ? "#111" : "#fff"};--veil:${lum(a) > 0.6 ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.1)"};` +
        `--ms:${mk.length === 1 ? 0.55 : mk.length === 2 ? 0.44 : 0.32}`;
      s.innerHTML = `
        <div class="bg"></div>
        <div class="chrome top">
          <span class="brand"><i></i>My tech stack</span>
          <span class="category-pill">${esc(cat)}</span>
        </div>
        <div class="card d${i % 4}">
          <div class="orb" style="--x:${(i * 37) % 45}%;--y:${(i * 23) % 40}%"></div>
          <div class="orb b" style="--x:${45 + ((i * 29) % 30)}%;--y:${35 + ((i * 17) % 35)}%"></div>
          <div class="fl ring" style="--x:${p(0)[0]}%;--y:${p(0)[1]}%"><i></i></div>
          <div class="fl plus" style="--x:${p(2)[0]}%;--y:${p(2)[1]}%"><i></i></div>
          <div class="fl dot"  style="--x:${p(4)[0]}%;--y:${p(4)[1]}%"><i></i></div>
          <div class="inner">
            <div class="mark m${i % 4}">${esc(mk)}</div>
            <div class="word" aria-label="${esc(name)}">${word}</div>
          </div>
          <div class="tag">${esc(tag)}</div>
        </div>
        <div class="chrome bot">
          <span class="tracking-widest">${String(i + 1).padStart(2, "0")} / ${N}</span>
          <span>Click or press &rarr; to advance</span>
        </div>`;
      app.appendChild(s);
      return s;
    });

    const glasses = [el("glass"), el("glass")];
    const halos = [el("halo"), el("halo")];
    const fringes = [el("fringe"), el("fringe")];
    [...halos, ...fringes, ...glasses].forEach((e) => app.appendChild(e));

    const prog = el("prog");
    prog.innerHTML = "<i></i>";
    app.appendChild(prog);
    const progBar = prog.firstChild as HTMLElement;
    progBar.style.width = 100 / N + "%";

    function fit() {
      if (!app) return;
      const rect = app.getBoundingClientRect();
      const currentWidth = rect.width || window.innerWidth;
      const currentHeight = rect.height || window.innerHeight;
      const narrow = currentWidth <= 600;
      const W = Math.min(currentWidth * 0.9, 1240);
      const H = Math.min(currentHeight * (narrow ? 0.58 : 0.66), W * (narrow ? 1.1 : 0.66));
      scenes.forEach((s, i) => {
        const L = Math.max(...lineSets[i].map((x) => x.length));
        const rows = lineSets[i].length;
        s.style.setProperty(
          "--fs",
          Math.min(W * 0.14, (W * 0.82) / (1.4 + L * 0.62), (H * 0.56) / (rows * 1.04)) + "px"
        );
      });
    }

    fit();
    window.addEventListener("resize", fit);

    // Parallax
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;
    let lastMove = -1e9;
    let animId: number;

    const handlePointerMove = (e: MouseEvent) => {
      if (!app) return;
      const rect = app.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ty = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      lastMove = performance.now();
    };

    app.addEventListener("mousemove", handlePointerMove);

    const loop = (now: number) => {
      if (!reduced && app) {
        if (now - lastMove > 2500) {
          tx = Math.sin(now / 2600) * 0.55;
          ty = Math.cos(now / 3300) * 0.35;
        }
        mx += (tx - mx) * 0.06;
        my += (ty - my) * 0.06;
        app.style.setProperty("--mx", mx.toFixed(4));
        app.style.setProperty("--my", my.toFixed(4));
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Transitions
    let cur = 0;
    let busy = false;
    let timer: NodeJS.Timeout | null = null;
    let mi = 0;

    const ease = (p: number) =>
      p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

    const setO = (s: HTMLElement, o: number, z: number) => {
      s.style.setProperty("--o", o.toFixed(1) + "px");
      s.style.setProperty("--z", z.toFixed(4));
    };

    function restart(s: HTMLElement) {
      s.classList.remove("enter");
      void s.offsetWidth;
      s.classList.add("enter");
    }

    function schedule() {
      if (timer) clearTimeout(timer);
      if (!document.hidden) {
        timer = setTimeout(() => go(1), HOLD);
      }
    }

    function go(dir: number) {
      if (busy || !app) return;
      busy = true;
      if (timer) clearTimeout(timer);

      const mode = dir < 0 ? "L" : MODES[mi++ % MODES.length];
      const old = scenes[cur];
      const ni = (cur + dir + N) % N;
      const nu = scenes[ni];

      nu.classList.add("on");
      nu.style.zIndex = "2";
      old.style.zIndex = "1";
      restart(nu);
      progBar.style.width = ((ni + 1) / N) * 100 + "%";

      const doors = mode === "open" || mode === "close";
      const sides = {
        R: ["L"],
        L: ["R"],
        open: ["R", "L"],
        close: ["L", "R"],
      }[mode] || ["L"];

      const W = app.offsetWidth || window.innerWidth;
      const c = W / 2;
      const bw = Math.max(70, Math.min(130, W * 0.09));
      const D = (90 * Math.min(W, 1100)) / 1100;
      const T = doors ? 1500 : 1300;
      const hw = halos[0].offsetWidth;
      const fw = fringes[0].offsetWidth;
      const t0 = performance.now();

      glasses.forEach((g) => (g.style.width = bw + "px"));
      sides.forEach((s, k) => {
        halos[k].classList.toggle("r", s === "R");
        fringes[k].classList.toggle("r", s === "R");
      });

      function frame(t: number) {
        const p = Math.min(1, (t - t0) / T);
        const e = ease(p);

        if (reduced) {
          nu.style.opacity = String(e);
        } else {
          let xs: number[] = [];
          let clip = "";
          let on = 0;
          let oo = 0;
          const zn = 1 + (1 - e) * (doors ? 0.12 : 0.05);
          const zo = 1 - e * (doors ? 0.06 : 0.04);

          if (mode === "R") {
            const x = -bw / 2 + (W + bw) * e;
            xs = [x];
            clip = `inset(0 ${Math.max(0, W - x)}px 0 0)`;
            on = -(1 - e) * D;
            oo = e * D * 0.5;
          } else if (mode === "L") {
            const x = W + bw / 2 - (W + bw) * e;
            xs = [x];
            clip = `inset(0 0 0 ${Math.max(0, x)}px)`;
            on = (1 - e) * D;
            oo = -e * D * 0.5;
          } else if (mode === "open") {
            const h = (c + bw / 2) * e;
            const x1 = c - h;
            const x2 = c + h;
            xs = [x1, x2];
            clip = `inset(0 ${Math.max(0, W - x2)}px 0 ${Math.max(0, x1)}px)`;
          } else {
            const h = (c + bw / 2) * (1 - e);
            const x1 = c - h;
            const x2 = c + h;
            xs = [x1, x2];
            clip = `polygon(evenodd,0 0,${W}px 0,${W}px 100%,0 100%,0 0,${x1}px 0,${x1}px 100%,${x2}px 100%,${x2}px 0,${x1}px 0)`;
          }

          nu.style.clipPath = clip;
          setO(nu, on, zn);
          setO(old, oo, zo);

          const o = p < 0.06 ? p / 0.06 : p > 0.94 ? (1 - p) / 0.06 : 1;
          xs.forEach((x, k) => {
            glasses[k].style.transform = `translateX(${x - bw / 2}px)`;
            halos[k].style.transform = `translateX(${sides[k] === "L" ? x - hw * 0.9 : x}px)`;
            fringes[k].style.transform = `translateX(${x - fw / 2 + (sides[k] === "L" ? -bw * 0.35 : bw * 0.35)}px)`;
            glasses[k].style.opacity = String(o);
            halos[k].style.opacity = String(o);
            fringes[k].style.opacity = String(o);
          });
        }

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          done();
        }
      }

      function done() {
        old.classList.remove("on", "enter");
        old.style.zIndex = "";
        setO(old, 0, 1);
        nu.style.clipPath = "";
        nu.style.opacity = "";
        nu.style.zIndex = "";
        setO(nu, 0, 1);
        [...glasses, ...halos, ...fringes].forEach((e) => (e.style.opacity = "0"));
        cur = ni;
        busy = false;
        schedule();
      }

      requestAnimationFrame(frame);
    }

    const handleClick = () => go(1);
    app.addEventListener("click", handleClick);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only react if within or viewing tech stack
      const rect = app.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const handleVisibility = () => {
      if (!busy) schedule();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    scenes[0].classList.add("on", "enter");
    schedule();

    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (app) {
        app.removeEventListener("mousemove", handlePointerMove);
        app.removeEventListener("click", handleClick);
        app.innerHTML = "";
      }
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#111]">
      <style jsx global>{`
        .tech-showcase-container {
          position: relative;
          width: 100%;
          height: 100vh;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          --mx: 0;
          --my: 0;
          overflow: hidden;
          font-family: 'Space Mono', ui-monospace, Menlo, monospace;
        }

        /* film grain over everything */
        .tech-showcase-container::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 8;
          pointer-events: none;
          opacity: 0.2;
          mix-blend-mode: soft-light;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .tech-showcase-container .scene {
          position: absolute;
          inset: 0;
          z-index: 0;
          visibility: hidden;
          color: var(--fg);
          overflow: hidden;
          --o: 0px;
          --z: 1;
        }
        .tech-showcase-container .scene.on {
          visibility: visible;
        }

        /* depth layers */
        .tech-showcase-container .bg {
          position: absolute;
          inset: -7%;
          background:
            radial-gradient(55% 70% at 12% 8%, color-mix(in srgb, var(--acc) 55%, transparent), transparent 70%),
            radial-gradient(70% 80% at 92% 100%, var(--b), transparent 75%),
            var(--a);
          filter: blur(28px) saturate(1.1);
          translate: calc(var(--o)*.3 + var(--mx)*-12px) calc(var(--my)*-9px);
          scale: calc(var(--z)*1.02);
        }
        .tech-showcase-container .bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--veil);
        }

        .tech-showcase-container .chrome {
          position: absolute;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 clamp(18px, 4vw, 42px);
          font-size: clamp(9px, 1.05vw, 12px);
          letter-spacing: 0.09em;
          text-transform: uppercase;
          opacity: 0.75;
          z-index: 3;
        }
        .tech-showcase-container .chrome.top {
          top: clamp(16px, 3.4vh, 34px);
        }
        .tech-showcase-container .chrome.bot {
          bottom: clamp(18px, 3.6vh, 36px);
        }
        .tech-showcase-container .brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tech-showcase-container .brand i {
          width: 1.5em;
          height: 1.5em;
          border-radius: 50%;
          background: var(--fg);
          display: grid;
          place-items: center;
        }
        .tech-showcase-container .brand i::after {
          content: "";
          width: 46%;
          height: 46%;
          border-radius: 50% 0 50% 50%;
          background: var(--a);
        }

        .tech-showcase-container .category-pill {
          padding: 4px 12px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          letter-spacing: 0.12em;
        }

        .tech-showcase-container .card {
          --cw: min(90vw, 1240px);
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--cw);
          height: min(66vh, calc(var(--cw)*0.66));
          transform: translate(-50%, -50%) perspective(1400px) rotateY(calc(var(--mx)*2.2deg)) rotateX(calc(var(--my)*-2.2deg));
          translate: calc(var(--o)*0.7 + var(--mx)*6px) calc(var(--my)*5px);
          border-radius: clamp(18px, 2.6vw, 34px);
          overflow: hidden;
          background: linear-gradient(135deg, var(--a), var(--b));
          box-shadow: 0 40px 90px -35px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 2px 0 rgba(255,255,255,0.28);
        }
        .tech-showcase-container .card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .tech-showcase-container .card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: linear-gradient(180deg, rgba(255,255,255,0.12), transparent 30%);
        }
        .tech-showcase-container .d0::before {
          background: linear-gradient(115deg, transparent 40%, color-mix(in srgb, var(--acc) 24%, transparent) 40%, color-mix(in srgb, var(--acc) 6%, transparent) 72%, transparent 72%);
        }
        .tech-showcase-container .d1::before {
          background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--acc) 32%, transparent) 0 3px, transparent 3px 22px);
          -webkit-mask: linear-gradient(90deg, transparent 15%, #000);
          mask: linear-gradient(90deg, transparent 15%, #000);
        }
        .tech-showcase-container .d2::before {
          background: radial-gradient(45% 60% at 82% 22%, color-mix(in srgb, var(--acc) 42%, transparent), transparent 70%), radial-gradient(40% 50% at 12% 95%, color-mix(in srgb, var(--acc) 26%, transparent), transparent 70%);
        }
        .tech-showcase-container .d3::before {
          background: radial-gradient(circle, color-mix(in srgb, var(--fg) 24%, transparent) 1.5px, transparent 2.2px) 0 0/26px 26px;
          -webkit-mask: radial-gradient(75% 90% at 50% 50%, #000, transparent);
          mask: radial-gradient(75% 90% at 50% 50%, #000, transparent);
        }

        /* drifting light orbs */
        .tech-showcase-container .orb {
          position: absolute;
          width: 44%;
          aspect-ratio: 1;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(26px);
          background: radial-gradient(circle, color-mix(in srgb, var(--acc) 55%, transparent), transparent 68%);
          left: var(--x);
          top: var(--y);
          animation: techDrift 11s ease-in-out infinite alternate;
          translate: calc(var(--o)*0.5 + var(--mx)*-18px) calc(var(--my)*-12px);
        }
        .tech-showcase-container .orb.b {
          animation-duration: 14s;
          animation-direction: alternate-reverse;
          opacity: 0.7;
        }
        @keyframes techDrift {
          from { transform: translate(-6%, 6%) scale(0.9); }
          to { transform: translate(9%, -10%) scale(1.15); }
        }

        /* floating accents */
        .tech-showcase-container .fl {
          position: absolute;
          left: var(--x);
          top: var(--y);
          color: var(--acc);
          pointer-events: none;
          opacity: 0.8;
          translate: calc(var(--o)*1.4 + var(--mx)*28px) calc(var(--my)*20px);
        }
        .tech-showcase-container .fl i {
          display: block;
          animation: techFloat 6s ease-in-out infinite alternate;
        }
        .tech-showcase-container .fl.ring i {
          width: clamp(20px, 3.2vw, 40px);
          aspect-ratio: 1;
          border: 2px solid currentColor;
          border-radius: 50%;
        }
        .tech-showcase-container .fl.dot i {
          width: clamp(8px, 1.1vw, 14px);
          aspect-ratio: 1;
          background: currentColor;
          border-radius: 50%;
          animation-duration: 4.5s;
        }
        .tech-showcase-container .fl.plus i {
          width: clamp(16px, 2.2vw, 28px);
          aspect-ratio: 1;
          animation-duration: 8s;
          background: linear-gradient(currentColor, currentColor) center/100% 2px no-repeat,
                      linear-gradient(currentColor, currentColor) center/2px 100% no-repeat;
        }
        @keyframes techFloat {
          from { transform: translateY(8px) rotate(-12deg); }
          to { transform: translateY(-16px) rotate(24deg); }
        }

        .tech-showcase-container .inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: calc(var(--fs)*0.3);
          z-index: 1;
          translate: calc(var(--o)*1.1 + var(--mx)*14px) calc(var(--my)*10px);
          scale: var(--z);
        }
        .tech-showcase-container .mark {
          flex: none;
          width: calc(var(--fs)*1.08);
          height: calc(var(--fs)*1.08);
          display: grid;
          place-items: center;
          background: var(--acc);
          color: var(--mk);
          font-family: var(--ff);
          font-weight: var(--fw);
          font-size: calc(var(--fs)*var(--ms));
          line-height: 1;
          letter-spacing: -0.04em;
          box-shadow: 0 18px 40px -14px color-mix(in srgb, var(--acc) 70%, transparent);
        }
        .tech-showcase-container .m0 { border-radius: 50%; }
        .tech-showcase-container .m1 { border-radius: 24%; }
        .tech-showcase-container .m2 { clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%); box-shadow: none; }
        .tech-showcase-container .m3 { border-radius: 6% 50% 6% 50%; }

        .tech-showcase-container .word {
          font-family: var(--ff);
          font-weight: var(--fw);
          font-size: var(--fs);
          line-height: 1.04;
          letter-spacing: -0.025em;
          white-space: nowrap;
        }
        .tech-showcase-container .ch {
          display: inline-block;
        }
        .tech-showcase-container .tag {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 7%;
          text-align: center;
          font: 500 clamp(10px, 1.35vw, 16px)/1 'Manrope', system-ui, sans-serif;
          opacity: 0.85;
          z-index: 1;
          padding: 0 12px;
          translate: calc(var(--o)*0.9 + var(--mx)*8px) 0;
        }

        /* entrance choreography */
        .tech-showcase-container .enter .card {
          animation: techPop 1.3s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        .tech-showcase-container .enter .mark {
          animation: techSpin 1.1s cubic-bezier(0.2, 0.9, 0.2, 1) 0.1s both;
        }
        .tech-showcase-container .enter .ch {
          animation: techRise 1s cubic-bezier(0.2, 0.85, 0.2, 1) both;
          animation-delay: calc(0.14s + var(--i)*42ms);
        }
        .tech-showcase-container .enter .tag {
          animation: techTagin 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.55s both;
        }
        @keyframes techPop {
          from { scale: 0.982; }
          to { scale: 1; }
        }
        @keyframes techSpin {
          from { transform: rotate(-140deg) scale(0.35); filter: blur(8px); opacity: 0; }
          to { transform: none; filter: blur(0); opacity: 1; }
        }
        @keyframes techRise {
          from { transform: translateY(58%) rotate(6deg); filter: blur(10px); opacity: 0; }
          to { transform: none; filter: blur(0); opacity: 1; }
        }
        @keyframes techTagin {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: none; opacity: 0.85; }
        }

        /* transition hardware */
        .tech-showcase-container .glass,
        .tech-showcase-container .halo,
        .tech-showcase-container .fringe {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          opacity: 0;
          will-change: transform;
        }
        .tech-showcase-container .glass {
          top: -1%;
          height: 102%;
          z-index: 6;
          --shape: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 1000' preserveAspectRatio='none'%3E%3Cpath d='M22 0H78Q80 0 80 4C80 60 56 70 56 140V860C56 930 80 940 80 996Q80 1000 78 1000H22Q20 1000 20 996C20 940 44 930 44 860V140C44 70 20 60 20 4Q20 0 22 0Z'/%3E%3C/svg%3E");
          background: linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.5));
          -webkit-backdrop-filter: blur(5px) saturate(1.7) brightness(1.12);
          backdrop-filter: blur(5px) saturate(1.7) brightness(1.12);
          -webkit-mask: var(--shape) center/100% 100% no-repeat;
          mask: var(--shape) center/100% 100% no-repeat;
        }
        .tech-showcase-container .halo {
          height: 100%;
          width: 34vw;
          z-index: 5;
          -webkit-backdrop-filter: blur(7px);
          backdrop-filter: blur(7px);
          -webkit-mask: linear-gradient(90deg, transparent, #000 88%, transparent);
          mask: linear-gradient(90deg, transparent, #000 88%, transparent);
        }
        .tech-showcase-container .halo.r {
          -webkit-mask: linear-gradient(270deg, transparent, #000 88%, transparent);
          mask: linear-gradient(270deg, transparent, #000 88%, transparent);
        }
        .tech-showcase-container .fringe {
          height: 100%;
          width: 110px;
          z-index: 5;
          mix-blend-mode: screen;
          filter: blur(10px);
          background: linear-gradient(90deg, transparent, rgba(255,140,60,0.5), rgba(190,90,255,0.45), rgba(70,150,255,0.5), transparent);
        }
        .tech-showcase-container .fringe.r {
          background: linear-gradient(270deg, transparent, rgba(255,140,60,0.5), rgba(190,90,255,0.45), rgba(70,150,255,0.5), transparent);
        }

        /* progress bar */
        .tech-showcase-container .prog {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 3px;
          z-index: 9;
          background: rgba(255, 255, 255, 0.14);
          mix-blend-mode: difference;
          pointer-events: none;
        }
        .tech-showcase-container .prog i {
          display: block;
          height: 100%;
          background: #fff;
          transition: width 1.1s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @media (max-width: 600px) {
          .tech-showcase-container .card {
            height: min(58vh, calc(var(--cw)*1.1));
          }
        }
      `}</style>

      <div ref={rootRef} className="tech-showcase-container" />
    </div>
  );
}

