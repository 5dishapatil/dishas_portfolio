"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";

/**
 * DnaHelixViewer — 3D Real-time DNA Double Helix Simulation & Slide Sequencing
 * Features:
 * - Procedural dual-helix DNA backbone with Catmull-Rom curves & TubeGeometry
 * - Rungs, glowing joint rings, nucleotide strips, and amber macro gap sprite
 * - 3-stage camera choreography (Hero, Close-up, Macro)
 * - Mouse & touch parallax tracking with ambient floating dust
 * - Interactive slide choreography with typography line reveals
 * - Keyboard (arrow keys, space), mouse wheel, and touch navigation
 */

export default function DnaHelixViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Transition controller ref
  const goRef = useRef<(dir: number) => void>(() => {});

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    // 1. Renderer Setup
    const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.2;

    const S = new THREE.Scene();
    S.fog = new THREE.FogExp2(0x03112a, 0.05);

    const C = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 120);

    // 2. Lights
    S.add(new THREE.AmbientLight(0x2a3f7a, 1));
    const key = new THREE.DirectionalLight(0x7fb2ff, 1.7);
    key.position.set(-6, 8, 6);
    S.add(key);

    const rim = new THREE.DirectionalLight(0xff8a2b, 1.2);
    rim.position.set(6, -4, -4);
    S.add(rim);

    const camL = new THREE.PointLight(0x2aa8ff, 2.2, 18);
    S.add(camL);

    const warm = new THREE.PointLight(0xffa030, 2.4, 5);

    // 3. Materials & Geometry helpers
    const M = {
      body: new THREE.MeshStandardMaterial({ color: 0x1e2d4c, metalness: 0.85, roughness: 0.32 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x0d1524, metalness: 0.9, roughness: 0.38 }),
      or: new THREE.MeshBasicMaterial({ color: 0xffb020 }),
      cy: new THREE.MeshBasicMaterial({ color: 0x35b6ff }),
    };

    const cylZ = (r: number, l: number, off?: boolean) => {
      const geom = new THREE.CylinderGeometry(r, r, l, 12);
      geom.rotateX(Math.PI / 2);
      if (off) geom.translate(0, 0, l / 2);
      return geom;
    };

    const N = 54;
    const DY = 0.62;
    const RAD = 1.7;
    const DA = 0.52;
    const L = RAD * 0.86;

    const G = {
      sleeve: cylZ(0.235, 0.5),
      ringB: new THREE.TorusGeometry(0.265, 0.03, 8, 28),
      strip: new THREE.BoxGeometry(0.06, 0.05, 0.55),
      rung: cylZ(0.07, L, true),
      joint: cylZ(0.15, 0.3),
      ringR: new THREE.TorusGeometry(0.12, 0.024, 8, 22),
    };

    // 4. DNA Construction
    const D = new THREE.Group();
    const H = new THREE.Group();
    D.add(H);
    S.add(D);
    H.add(warm);

    const ang = (i: number) => (i - N / 2) * DA;
    const P = (i: number, s: number) =>
      new THREE.Vector3(
        Math.cos(ang(i) + s * Math.PI) * RAD,
        (i - N / 2) * DY,
        Math.sin(ang(i) + s * Math.PI) * RAD
      );

    const add = (
      g: THREE.BufferGeometry,
      m: THREE.Material,
      p: THREE.Vector3,
      t: THREE.Vector3
    ) => {
      const o = new THREE.Mesh(g, m);
      o.position.copy(p);
      o.lookAt(t);
      H.add(o);
      return o;
    };

    for (let s = 0; s < 2; s++) {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= N * 6; k++) pts.push(P(k / 6, s));
      const cur = new THREE.CatmullRomCurve3(pts);
      H.add(new THREE.Mesh(new THREE.TubeGeometry(cur, N * 10, 0.2, 12), M.body));

      for (let i = 1; i < N; i++) {
        const t = i / N;
        const p = cur.getPointAt(t);
        const tg = cur.getTangentAt(t);
        const q = p.clone().add(tg);

        if (i % 3 === 0) add(G.sleeve, M.dark, p, q);
        if (i % 3 === 1) add(G.ringB, M.or, p, q);

        const inw = new THREE.Vector3(-p.x, 0, -p.z).normalize();
        const cp = p.clone().addScaledVector(inw, 0.17);
        add(G.strip, M.cy, cp, cp.clone().add(tg));

        // Rung from strand towards axis
        const ax = new THREE.Vector3(0, P(i, s).y, 0);
        const pp = P(i, s);
        const dir = ax.clone().sub(pp).normalize();
        add(G.rung, M.body, pp, ax);
        add(G.joint, M.dark, pp.clone().addScaledVector(dir, 0.12), ax);
        add(G.ringR, M.or, pp.clone().addScaledVector(dir, L + 0.03), ax);
      }
    }

    // 5. Glow sprite at macro gap
    const gc = document.createElement("canvas");
    gc.width = gc.height = 128;
    const gx = gc.getContext("2d");
    if (gx) {
      const gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, "rgba(255,170,40,.9)");
      gr.addColorStop(0.35, "rgba(255,130,20,.25)");
      gr.addColorStop(1, "rgba(255,100,0,0)");
      gx.fillStyle = gr;
      gx.fillRect(0, 0, 128, 128);
    }
    const spr = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(gc),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      })
    );
    spr.scale.set(1.8, 1.8, 1);
    H.add(spr);

    // 6. Floating dust
    const dg = new THREE.BufferGeometry();
    const dp = new Float32Array(500 * 3);
    for (let i = 0; i < dp.length; i++) {
      dp[i] = (Math.random() - 0.5) * (i % 3 === 2 ? 18 : 26);
    }
    dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(
      dg,
      new THREE.PointsMaterial({
        color: 0x7fb2ff,
        size: 0.045,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    S.add(dust);

    // 7. Camera keyframes: [hero] [close-up] [macro] -> loop
    const K = [
      { p: [0, 0, 15], l: [1.6, -0.8, 0], rz: 1.05, ry: 0.45, f: 40 },
      { p: [2.4, -0.6, 5.4], l: [1.3, 0.1, 0], rz: 1.28, ry: 2.3, f: 52 },
      { p: [0.5, 0.1, 3], l: [0.9, 0, 0], rz: 1.18, ry: 0.2, f: 46 },
    ];

    const mix = (a: number, b: number, t: number) => a + (b - a) * t;
    const sm = (t: number) => t * t * (3 - 2 * t);
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;

    function pose(c: number, t: number) {
      const n = K.length;
      const k = Math.floor(c);
      const f = c - k;
      const a = K[((k % n) + n) % n];
      const b = K[(((k + 1) % n) + n) % n];
      const u = sm(f);
      const e = Math.sin(Math.PI * f);

      const v = (i: number) => mix(a.p[i], b.p[i], u);
      const w = (i: number) => mix(a.l[i], b.l[i], u);

      C.position.set(v(0) + mx * 0.5, v(1) + my * 0.35, v(2));
      C.up.set(Math.sin(e * 0.16), Math.cos(e * 0.16), 0);
      C.lookAt(w(0), w(1), w(2));
      C.fov = mix(a.f, b.f, u) + e * 14;
      C.updateProjectionMatrix();

      D.rotation.z = mix(a.rz, b.rz, u);
      D.rotation.y = mix(a.ry, b.ry, u) + e * 0.3;
      H.rotation.y = Math.sin(t * 0.3) * 0.4;
      camL.position.copy(C.position).add(new THREE.Vector3(-2, 2, 1));
      dust.rotation.y = t * 0.02;

      if (cv) {
        cv.style.filter = e > 0.04 ? `blur(${(e * 2.4).toFixed(2)}px)` : "";
      }
    }

    // 8. Navigation state
    let targetIdx = 0;
    let curProgress = 0;
    let lock = false;

    const go = (dir: number) => {
      if (lock) return;
      lock = true;
      targetIdx += dir;
      const nextSlide = ((targetIdx % 3) + 3) % 3;
      setActiveSlide(nextSlide);
      setTimeout(() => {
        lock = false;
      }, 1150);
    };

    goRef.current = go;

    // 9. Input Listeners
    let lw = 0;
    let ld = 0;
    let ty0 = 0;

    const handleWheel = (e: WheelEvent) => {
      const now = performance.now();
      const a = Math.abs(e.deltaY);
      const fresh = now - lw > 120 || a > ld * 1.6;
      lw = now;
      ld = a;
      if (a > 6 && fresh) {
        go(e.deltaY > 0 ? 1 : -1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      ty0 = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const d = ty0 - e.changedTouches[0].clientY;
      if (Math.abs(d) > 40) {
        go(d > 0 ? 1 : -1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        go(1);
      }
      if (["ArrowUp", "PageUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handlePointerMove);

    // 10. Resize
    const size = () => {
      R.setSize(window.innerWidth, window.innerHeight, false);
      C.aspect = window.innerWidth / window.innerHeight;
      C.updateProjectionMatrix();
    };
    window.addEventListener("resize", size);
    size();

    // 11. Animation Loop
    let animId: number;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      curProgress += (targetIdx - curProgress) * (1 - Math.exp(-dt * 3.6));
      mx += (tx - mx) * (1 - Math.exp(-dt * 3));
      my += (ty - my) * (1 - Math.exp(-dt * 3));

      pose(curProgress, now / 1000);
      R.render(S, C);
      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    // Fade canvas in on ready
    cv.classList.add("ready");

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", size);

      // Clean Three.js resources
      R.dispose();
      dg.dispose();
      dust.material.dispose();
      H.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="dna-root fixed inset-0 w-full h-full overflow-hidden select-none bg-[#020f24] text-white"
    >
      <style jsx global>{`
        :root {
          --teal: #46d3db;
          --ease: cubic-bezier(0.19, 1, 0.22, 1);
        }

        .dna-root {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
          font-weight: 400;
          -webkit-font-smoothing: antialiased;
          background: radial-gradient(120% 90% at 35% 0%, #0d2140 0%, #06142b 45%, #020f24 100%);
        }

        .dna-root::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: radial-gradient(ellipse at 65% 40%, transparent 35%, rgba(1, 8, 20, 0.6) 100%),
                      linear-gradient(to top, rgba(1, 8, 20, 0.45), transparent 40%);
        }

        .dna-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: 0;
          transition: opacity 2s ease;
        }

        .dna-canvas.ready {
          opacity: 1;
        }

        /* Slide typography */
        .dna-slide {
          position: fixed;
          z-index: 20;
          pointer-events: none;
          transition: opacity 0.5s ease;
        }

        .dna-slide.on {
          pointer-events: auto;
        }

        #dna-s0 {
          left: 7vw;
          bottom: 11vh;
        }

        #dna-s1 {
          left: 66.5vw;
          bottom: 11vh;
        }

        #dna-s2 {
          left: 66vw;
          top: 29vh;
        }

        .dna-title {
          font-weight: 400;
          font-size: clamp(24px, 2.45vw, 46px);
          line-height: 1.28;
          letter-spacing: -0.005em;
        }

        .dna-ln {
          display: block;
          overflow: hidden;
          padding: 0.06em 0 0.14em;
          margin-bottom: -0.14em;
          white-space: nowrap;
        }

        .dna-li {
          display: block;
          transform: translateY(115%);
          transition: transform 0.9s var(--ease) calc(var(--i) * 80ms);
        }

        .on .dna-li {
          transform: none;
        }

        .out .dna-li {
          transform: translateY(-115%);
          transition: transform 0.5s cubic-bezier(0.6, 0, 0.3, 1) calc(var(--i) * 50ms);
        }

        .dna-slide p {
          margin-top: 22px;
          max-width: 25em;
          font-size: clamp(12px, 0.98vw, 17px);
          line-height: 1.55;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.88);
        }

        .dna-fade {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.8s var(--ease) 0.35s, transform 0.9s var(--ease) 0.35s;
        }

        .on .dna-fade {
          opacity: 1;
          transform: none;
        }

        .out .dna-fade {
          opacity: 0;
          transform: translateY(-18px);
          transition: opacity 0.35s, transform 0.5s cubic-bezier(0.6, 0, 0.3, 1);
          transition-delay: 0s;
        }

        .dna-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 28px;
          font-size: clamp(12px, 0.98vw, 16px);
          color: #fff;
          cursor: pointer;
        }

        .dna-cta i {
          width: 7px;
          height: 7px;
          border-right: 1.5px solid var(--teal);
          border-bottom: 1.5px solid var(--teal);
          transform: rotate(-45deg);
          transition: transform 0.5s var(--ease);
        }

        .dna-cta:hover i {
          transform: rotate(-45deg) translate(3px, 3px);
        }

        @media (max-width: 760px) {
          #dna-s0, #dna-s1, #dna-s2 {
            left: 7vw;
            right: 7vw;
            top: auto;
            bottom: 12vh;
          }
          .dna-title {
            font-size: 26px;
          }
        }
      `}</style>

      {/* Top Navigation Bar */}
      <header className="fixed top-5 left-5 sm:top-7 sm:left-8 z-50 flex items-center gap-3">
        <Link
          href="/mind"
          aria-label="Back to Mind & More"
          className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-mono tracking-[0.2em] uppercase bg-[#0d2140]/80 hover:bg-[#122c54] border border-[#46d3db]/30 hover:border-[#46d3db]/70 text-[#c8f5f7] hover:text-white backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.03]"
        >
          <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span className="font-medium">Mind &amp; More</span>
        </Link>

        <Link
          href="/#worlds"
          aria-label="Return to Worlds"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono tracking-wider uppercase bg-black/40 hover:bg-black/70 border border-white/10 text-white/60 hover:text-white backdrop-blur-md transition-all"
        >
          <span>Worlds</span>
        </Link>
      </header>

      {/* Interactive 3D Canvas */}
      <canvas ref={canvasRef} className="dna-canvas" />

      {/* Slide 0: Hero Intro */}
      <section
        id="dna-s0"
        className={`dna-slide ${activeSlide === 0 ? "on" : "out"}`}
        aria-hidden={activeSlide !== 0}
      >
        <h1
          className="dna-title"
          aria-label="Find out what your DNA says about you and your family."
        >
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 0 } as React.CSSProperties}>
              Find out what your
            </span>
          </span>
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 1 } as React.CSSProperties}>
              DNA says about you
            </span>
          </span>
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 2 } as React.CSSProperties}>
              and your family.
            </span>
          </span>
        </h1>
        <p className="dna-fade">
          Discover your ethnicity and find new relatives with a simple DNA test.
        </p>
      </section>

      {/* Slide 1: Close-up Impact */}
      <section
        id="dna-s1"
        className={`dna-slide ${activeSlide === 1 ? "on" : "out"}`}
        aria-hidden={activeSlide !== 1}
      >
        <h2 className="dna-title" aria-label="How will DNA testing change you?">
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 0 } as React.CSSProperties}>
              How will DNA testing
            </span>
          </span>
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 1 } as React.CSSProperties}>
              change you?
            </span>
          </span>
        </h2>
        <p className="dna-fade">
          Testing your DNA offers you a powerful tool for researching what makes you unique.
        </p>
        <button
          type="button"
          onClick={() => goRef.current(1)}
          className="dna-cta dna-fade"
        >
          <i />
          <span>View success stories</span>
        </button>
      </section>

      {/* Slide 2: Ancestral Macro View */}
      <section
        id="dna-s2"
        className={`dna-slide ${activeSlide === 2 ? "on" : "out"}`}
        aria-hidden={activeSlide !== 2}
      >
        <h2
          className="dna-title"
          aria-label="What part of the world do your ancestors come from?"
        >
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 0 } as React.CSSProperties}>
              What part of the
            </span>
          </span>
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 1 } as React.CSSProperties}>
              world do your
            </span>
          </span>
          <span className="dna-ln">
            <span className="dna-li" style={{ "--i": 2 } as React.CSSProperties}>
              ancestors come from?
            </span>
          </span>
        </h2>
        <p className="dna-fade">
          Trace ancestral origins across centuries and understand migration paths encoded in your genes.
        </p>
      </section>

      {/* Interactive Bottom Control Bar */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-10 z-30 flex items-center gap-4">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => {
                const diff = i - activeSlide;
                if (diff !== 0) goRef.current(diff);
              }}
              aria-label={`Jump to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                activeSlide === i
                  ? "w-8 bg-[#46d3db] shadow-[0_0_12px_#46d3db]"
                  : "w-2 bg-white/20 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Step Arrows */}
        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={() => goRef.current(-1)}
            aria-label="Previous DNA view"
            className="w-8 h-8 rounded-full border border-white/15 bg-[#06142b]/70 hover:border-[#46d3db]/60 hover:bg-[#0d2140] text-white flex items-center justify-center text-xs backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            ←
          </button>
          <button
            onClick={() => goRef.current(1)}
            aria-label="Next DNA view"
            className="w-8 h-8 rounded-full border border-white/15 bg-[#06142b]/70 hover:border-[#46d3db]/60 hover:bg-[#0d2140] text-white flex items-center justify-center text-xs backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
