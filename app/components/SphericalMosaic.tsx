"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  mosaicAssets,
  effectConfig,
  MosaicAssetItem,
  SphericalEffectConfig,
} from "../data/mosaicAssets";

interface CardLayoutBox {
  item: MosaicAssetItem;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 aPosition;
  attribute vec2 aUv;

  uniform vec2 uResolution;
  uniform vec2 uCursor;
  uniform vec2 uVelocity;
  uniform float uRadius;
  uniform float uStrength;

  varying vec2 vUv;
  varying vec2 vWorldPos;

  void main() {
    vUv = aUv;

    vec2 pixelPos = aPosition * uResolution;
    vec2 delta = pixelPos - uCursor;
    float dist = length(delta);
    float r = dist / max(uRadius, 1.0);

    vec2 displacedPos = pixelPos;

    if (uStrength > 0.0001 && r < 1.0) {
      float r2 = r * r;
      float t = 1.0 - r2;
      float t2 = t * t;
      float t3 = t2 * t;

      // True spherical dome cap blended with a C2-smooth quintic falloff
      // Guarantees zero circular seam or hard boundary where the sphere meets the flat plane
      float sphereCap = sqrt(max(0.0, 1.0 - 0.55 * r2));
      float profile = sphereCap * t2;

      // Gentle, wider-radius 3D convex displacement:
      // Broad, subtle spherical lens curvature without excessive bulging
      float radialPush = uStrength * 0.34 * profile;
      vec2 velocityDrag = uVelocity * (uStrength * 0.05 * t3);

      displacedPos = pixelPos + delta * radialPush + velocityDrag;
    }

    vWorldPos = displacedPos;

    // Convert pixel coordinates back to WebGL clip space [-1, 1]
    vec2 clipSpace = (displacedPos / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;

  varying vec2 vUv;
  varying vec2 vWorldPos;

  uniform sampler2D uTexture;
  uniform vec2 uCursor;
  uniform float uRadius;
  uniform float uStrength;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    if (uStrength <= 0.0001) {
      gl_FragColor = texColor;
      return;
    }

    // Per-pixel spherical dome geometry for silky, facet-free 3D shading
    vec2 delta = vWorldPos - uCursor;
    float dist = length(delta);
    float r = dist / max(uRadius, 1.0);

    if (r >= 1.0) {
      gl_FragColor = texColor;
      return;
    }

    float r2 = r * r;
    float t = 1.0 - r2;
    float t2 = t * t;

    float sphereCap = sqrt(max(0.0, 1.0 - 0.55 * r2));
    float domeHeight = uStrength * sphereCap * t2;

    // Analytical 3D surface normal across the broad, shallower convex dome
    float slopeMag = uStrength * 1.15 * r * t2;
    vec2 dir = dist > 0.001 ? (delta / dist) : vec2(0.0, 0.0);
    vec3 normal = normalize(vec3(dir * slopeMag, 1.0));

    // Studio key light positioned slightly above and in front of viewer
    vec3 lightDir = normalize(vec3(-0.2, -0.28, 0.94));
    float diff = max(dot(normal, lightDir), 0.0);

    // Soft studio specular highlight on the apex of the curved surface
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 26.0);

    // Subtle depth-based ambient shading along the receding flanks of the sphere
    float edgeShade = uStrength * (4.2 * r2 * t2);
    float centerLift = domeHeight * 0.095;
    float slopeShadow = edgeShade * 0.16;
    float directionalTint = (diff - 0.94) * 0.14 * domeHeight;

    vec3 litRgb = texColor.rgb * (1.0 + centerLift + directionalTint - slopeShadow);
    litRgb += vec3(1.0, 0.96, 0.88) * (spec * domeHeight * 0.06);

    gl_FragColor = vec4(clamp(litRgb, 0.0, 1.0), texColor.a);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

interface SphericalMosaicProps {
  /** Whether to render with a top navigation bar for the standalone `/music` route */
  showStandaloneNav?: boolean;
  /** Optional custom configuration override */
  config?: Partial<SphericalEffectConfig>;
}

export default function SphericalMosaic({
  showStandaloneNav = false,
  config,
}: SphericalMosaicProps) {
  const mergedConfig: SphericalEffectConfig = {
    ...effectConfig,
    ...config,
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const glCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeCardId, setActiveCardId] = useState<string>("card-05");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Refs for WebGL & high-frequency animation state (no React re-renders on mousemove)
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const layoutBoxesRef = useRef<CardLayoutBox[]>([]);
  const activeCardIdRef = useRef<string>("card-05");
  const isPlayingRef = useRef<boolean>(true);
  const textureDirtyRef = useRef<boolean>(true);
  const reducedMotionRef = useRef<boolean>(false);

  const pointerStateRef = useRef({
    isInside: false,
    hasEnteredOnce: false,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    vx: 0,
    vy: 0,
    targetStrength: 0,
    currentStrength: 0,
  });

  /** Compute tightly packed multi-column mosaic layout filling (width, height) */
  const computeMosaicLayout = useCallback(
    (width: number, height: number): CardLayoutBox[] => {
      const cols =
        width >= 1280 ? 7 : width >= 960 ? 6 : width >= 640 ? 4 : 3;
      const padX = width >= 768 ? 14 : 8;
      const padY = width >= 768 ? 14 : 8;
      const gap = width >= 768 ? 10 : 6;

      const totalInnerW = Math.max(100, width - padX * 2 - gap * (cols - 1));
      const colW = totalInnerW / cols;

      // Distribute mosaicAssets across columns
      const columnBuckets: { item: MosaicAssetItem; index: number }[][] =
        Array.from({ length: cols }, () => []);

      mosaicAssets.forEach((item, index) => {
        columnBuckets[index % cols].push({ item, index });
      });

      const boxes: CardLayoutBox[] = [];

      for (let c = 0; c < cols; c++) {
        const bucket = columnBuckets[c];
        if (bucket.length === 0) continue;

        const totalGapsY = gap * (bucket.length - 1);
        const availH = Math.max(120, height - padY * 2 - totalGapsY);
        const totalRatio = bucket.reduce(
          (acc, entry) => acc + entry.item.heightRatio,
          0
        );

        let curY = padY;
        const colX = padX + c * (colW + gap);

        bucket.forEach((entry, idx) => {
          const cardH =
            idx === bucket.length - 1
              ? Math.max(60, height - padY - curY)
              : Math.max(60, (entry.item.heightRatio / totalRatio) * availH);

          boxes.push({
            item: entry.item,
            index: entry.index,
            x: colX,
            y: curY,
            w: colW,
            h: cardH,
          });

          curY += cardH + gap;
        });
      }

      return boxes;
    },
    []
  );

  /** Draw the entire flat music-player mosaic onto an offscreen Retina canvas */
  const renderMosaicToSourceCanvas = useCallback(
    (
      sourceCanvas: HTMLCanvasElement,
      cssWidth: number,
      cssHeight: number,
      dpr: number
    ) => {
      const targetW = Math.max(1, Math.round(cssWidth * dpr));
      const targetH = Math.max(1, Math.round(cssHeight * dpr));

      if (sourceCanvas.width !== targetW || sourceCanvas.height !== targetH) {
        sourceCanvas.width = targetW;
        sourceCanvas.height = targetH;
      }

      const ctx = sourceCanvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep near-black / midnight background matching reference image
      ctx.fillStyle = "#07080D";
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      const boxes = computeMosaicLayout(cssWidth, cssHeight);
      layoutBoxesRef.current = boxes;

      const cornerRadius = cssWidth >= 768 ? 11 : 8;
      const artInset = cssWidth >= 768 ? 6.5 : 4.5;

      for (const box of boxes) {
        const { item, x, y, w, h } = box;
        const isCardActive =
          item.id === activeCardIdRef.current && isPlayingRef.current;

        ctx.save();

        // 1. Card rounded body with matte album-matched gradient
        drawRoundedRectPath(ctx, x, y, w, h, cornerRadius);
        const bodyGrad = ctx.createLinearGradient(x, y, x, y + h);
        bodyGrad.addColorStop(0, item.cardTint);
        bodyGrad.addColorStop(1, item.cardTintBottom);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Subtle inner rim highlight
        ctx.lineWidth = isCardActive ? 1.6 : 0.9;
        ctx.strokeStyle = isCardActive
          ? "rgba(255, 238, 195, 0.85)"
          : "rgba(255, 255, 255, 0.22)";
        ctx.stroke();

        // 2. Inset Album Artwork area (top ~66% of card)
        const artX = x + artInset;
        const artY = y + artInset;
        const artW = Math.max(16, w - artInset * 2);
        const artH = Math.max(16, h * 0.65 - artInset);
        const artRadius = Math.max(4, cornerRadius - 3);

        ctx.save();
        drawRoundedRectPath(ctx, artX, artY, artW, artH, artRadius);
        ctx.clip();

        const img = loadedImagesRef.current.get(item.src);
        if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
          // Object-fit: cover crop without stretching
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const boxRatio = artW / artH;
          let drawW = artW;
          let drawH = artH;
          let drawX = artX;
          let drawY = artY;

          if (boxRatio > imgRatio) {
            drawW = artW;
            drawH = artW / imgRatio;
            drawY = artY + (artH - drawH) * 0.5;
          } else {
            drawH = artH;
            drawW = artH * imgRatio;
            drawX = artX + (artW - drawW) * 0.5;
          }
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } else {
          // Elegant placeholder shimmer while image loads
          const fallbackGrad = ctx.createLinearGradient(
            artX,
            artY,
            artX + artW,
            artY + artH
          );
          fallbackGrad.addColorStop(0, "#1C1814");
          fallbackGrad.addColorStop(1, "#2E241B");
          ctx.fillStyle = fallbackGrad;
          ctx.fillRect(artX, artY, artW, artH);
        }

        // Subtle inner frame around album cover
        ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
        ctx.lineWidth = 1;
        ctx.strokeRect(artX, artY, artW, artH);
        ctx.restore();

        // 3. Music Player Metadata & Controls (bottom ~34% of card)
        const footerTop = artY + artH;
        const footerH = y + h - footerTop;
        const centerX = x + w * 0.5;

        ctx.fillStyle = item.inkColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Track Title
        const titleFontSize = Math.max(9, Math.min(12.5, w * 0.072));
        ctx.font = `600 ${titleFontSize.toFixed(1)}px system-ui, -apple-system, sans-serif`;
        const titleY = footerTop + footerH * 0.27;
        ctx.fillText(item.title, centerX, titleY, w - 16);

        // Artist Subtitle
        const artistFontSize = Math.max(7, Math.min(9.5, w * 0.052));
        ctx.globalAlpha = 0.72;
        ctx.font = `500 ${artistFontSize.toFixed(1)}px system-ui, -apple-system, sans-serif`;
        const artistY = footerTop + footerH * 0.49;
        ctx.fillText(item.artist, centerX, artistY, w - 16);

        // Minimalist Transport Controls: ⏮   ⏸/▶   ⏭
        ctx.globalAlpha = 0.88;
        const controlsY = footerTop + footerH * 0.77;
        const iconSize = Math.max(3.6, Math.min(5.5, w * 0.032));
        const iconSpacing = Math.max(16, Math.min(28, w * 0.16));

        // Center Pause / Play icon
        if (isCardActive) {
          // Active playing state: twin pause bars + subtle progress bar
          const barW = iconSize * 0.48;
          const barH = iconSize * 1.9;
          ctx.fillRect(
            centerX - iconSize * 0.55,
            controlsY - barH * 0.5,
            barW,
            barH
          );
          ctx.fillRect(
            centerX + iconSize * 0.15,
            controlsY - barH * 0.5,
            barW,
            barH
          );
        } else {
          // Pause bars matching reference image aesthetic
          const barW = iconSize * 0.45;
          const barH = iconSize * 1.8;
          ctx.fillRect(
            centerX - iconSize * 0.52,
            controlsY - barH * 0.5,
            barW,
            barH
          );
          ctx.fillRect(
            centerX + iconSize * 0.14,
            controlsY - barH * 0.5,
            barW,
            barH
          );
        }

        // Previous (<<) double left triangles
        const prevX = centerX - iconSpacing;
        for (let t = 0; t < 2; t++) {
          const offset = t * (iconSize * 0.95);
          ctx.beginPath();
          ctx.moveTo(prevX - offset + iconSize * 0.45, controlsY - iconSize * 0.7);
          ctx.lineTo(prevX - offset - iconSize * 0.45, controlsY);
          ctx.lineTo(prevX - offset + iconSize * 0.45, controlsY + iconSize * 0.7);
          ctx.closePath();
          ctx.fill();
        }

        // Next (>>) double right triangles
        const nextX = centerX + iconSpacing;
        for (let t = 0; t < 2; t++) {
          const offset = t * (iconSize * 0.95);
          ctx.beginPath();
          ctx.moveTo(nextX + offset - iconSize * 0.45, controlsY - iconSize * 0.7);
          ctx.lineTo(nextX + offset + iconSize * 0.45, controlsY);
          ctx.lineTo(nextX + offset - iconSize * 0.45, controlsY + iconSize * 0.7);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
    },
    [computeMosaicLayout]
  );

  useEffect(() => {
    let isCancelled = false;
    let rafId = 0;

    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    motionQuery.addEventListener("change", handleMotionChange);

    // Preload all mosaic assets from `assets/`
    mosaicAssets.forEach((asset) => {
      if (loadedImagesRef.current.has(asset.src)) return;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = asset.src;
      img.onload = () => {
        if (isCancelled) return;
        loadedImagesRef.current.set(asset.src, img);
        textureDirtyRef.current = true;
      };
      img.onerror = () => {
        // Handled gracefully by canvas fallback gradient
      };
    });

    const container = containerRef.current;
    const glCanvas = glCanvasRef.current;
    if (!container || !glCanvas) return;

    const gl = glCanvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    // Compile shaders & link program
    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }
    gl.useProgram(program);

    // Build subdivided 2D grid mesh (meshColumns x meshRows)
    const cols = mergedConfig.meshColumns;
    const rows = mergedConfig.meshRows;
    const numVertices = (cols + 1) * (rows + 1);
    const positions = new Float32Array(numVertices * 2);
    const uvs = new Float32Array(numVertices * 2);

    let vCursor = 0;
    for (let y = 0; y <= rows; y++) {
      const v = y / rows;
      for (let x = 0; x <= cols; x++) {
        const u = x / cols;
        positions[vCursor] = u;
        positions[vCursor + 1] = v;
        uvs[vCursor] = u;
        uvs[vCursor + 1] = v;
        vCursor += 2;
      }
    }

    // Use 32-bit index extension if available, otherwise split or cap grid so indices < 65535
    const uintExt = gl.getExtension("OES_element_index_uint");
    const numIndices = cols * rows * 6;
    const indices = uintExt
      ? new Uint32Array(numIndices)
      : new Uint16Array(numIndices);

    let iCursor = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const topLeft = y * (cols + 1) + x;
        const topRight = topLeft + 1;
        const bottomLeft = (y + 1) * (cols + 1) + x;
        const bottomRight = bottomLeft + 1;

        indices[iCursor++] = topLeft;
        indices[iCursor++] = bottomLeft;
        indices[iCursor++] = topRight;
        indices[iCursor++] = topRight;
        indices[iCursor++] = bottomLeft;
        indices[iCursor++] = bottomRight;
      }
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const aPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const aUvLoc = gl.getAttribLocation(program, "aUv");
    gl.enableVertexAttribArray(aUvLoc);
    gl.vertexAttribPointer(aUvLoc, 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Create high-DPI offscreen canvas texture
    const sourceCanvas = document.createElement("canvas");
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    const uCursorLoc = gl.getUniformLocation(program, "uCursor");
    const uVelocityLoc = gl.getUniformLocation(program, "uVelocity");
    const uRadiusLoc = gl.getUniformLocation(program, "uRadius");
    const uStrengthLoc = gl.getUniformLocation(program, "uStrength");

    let cachedWidth = 0;
    let cachedHeight = 0;
    let cachedDpr = Math.min(window.devicePixelRatio || 1, 2);

    const syncDimensions = () => {
      if (!container || !glCanvas) return;
      const newW = Math.max(1, container.clientWidth);
      const newH = Math.max(1, container.clientHeight);
      const newDpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        newW === cachedWidth &&
        newH === cachedHeight &&
        newDpr === cachedDpr
      ) {
        return;
      }

      cachedWidth = newW;
      cachedHeight = newH;
      cachedDpr = newDpr;

      const targetW = Math.round(cachedWidth * cachedDpr);
      const targetH = Math.round(cachedHeight * cachedDpr);
      if (glCanvas.width !== targetW || glCanvas.height !== targetH) {
        glCanvas.width = targetW;
        glCanvas.height = targetH;
      }
      gl.viewport(0, 0, targetW, targetH);
      textureDirtyRef.current = true;
    };

    syncDimensions();
    const resizeObserver = new ResizeObserver(() => {
      syncDimensions();
    });
    resizeObserver.observe(container);

    let lastTime = performance.now();

    const tick = (now: number) => {
      if (isCancelled) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const frameScale = dt * 60;

      // Upload updated mosaic texture when dirty
      if (textureDirtyRef.current) {
        renderMosaicToSourceCanvas(
          sourceCanvas,
          cachedWidth,
          cachedHeight,
          cachedDpr
        );
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sourceCanvas
        );
        textureDirtyRef.current = false;
      }

      const pState = pointerStateRef.current;

      // Smooth pointer tracking with zero micro-jitter deadband
      const followRate =
        1 - Math.pow(1 - mergedConfig.followSmoothing, frameScale);
      const dx = pState.targetX - pState.currentX;
      const dy = pState.targetY - pState.currentY;

      if (Math.hypot(dx, dy) > 0.04) {
        const prevX = pState.currentX;
        const prevY = pState.currentY;
        pState.currentX += dx * followRate;
        pState.currentY += dy * followRate;
        pState.vx = (pState.currentX - prevX) * 0.65 + pState.vx * 0.35;
        pState.vy = (pState.currentY - prevY) * 0.65 + pState.vy * 0.35;
      } else {
        pState.currentX = pState.targetX;
        pState.currentY = pState.targetY;
        pState.vx *= 0.8;
        pState.vy *= 0.8;
      }

      // Smooth emergence & relaxation of the spherical bulge
      const targetStr = reducedMotionRef.current
        ? pState.targetStrength * 0.35
        : pState.targetStrength;
      const relaxRate =
        1 - Math.pow(1 - mergedConfig.relaxationSpeed, frameScale);
      const strDiff = targetStr - pState.currentStrength;

      if (Math.abs(strDiff) > 0.0004) {
        pState.currentStrength += strDiff * relaxRate;
      } else {
        pState.currentStrength = targetStr;
      }

      // Responsive bulge radius scaled gently for smaller screens
      const responsiveRadius =
        cachedWidth < 640
          ? mergedConfig.bulgeRadius * 0.68
          : cachedWidth < 1024
          ? mergedConfig.bulgeRadius * 0.85
          : mergedConfig.bulgeRadius;

      gl.clearColor(0.027, 0.031, 0.051, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uResolutionLoc, cachedWidth, cachedHeight);
      gl.uniform2f(uCursorLoc, pState.currentX, pState.currentY);
      gl.uniform2f(uVelocityLoc, pState.vx, pState.vy);
      gl.uniform1f(uRadiusLoc, responsiveRadius);
      gl.uniform1f(uStrengthLoc, pState.currentStrength);

      gl.drawElements(
        gl.TRIANGLES,
        numIndices,
        uintExt ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
        0
      );

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      gl.deleteTexture(texture);
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(uvBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [
    mergedConfig.bulgeRadius,
    mergedConfig.followSmoothing,
    mergedConfig.meshColumns,
    mergedConfig.meshRows,
    mergedConfig.relaxationSpeed,
    renderMosaicToSourceCanvas,
  ]);

  /** Find which mosaic card is beneath the given container coordinates (x, y) */
  const findCardAtPoint = useCallback(
    (x: number, y: number): MosaicAssetItem | null => {
      const boxes = layoutBoxesRef.current;
      for (const box of boxes) {
        if (
          x >= box.x &&
          x <= box.x + box.w &&
          y >= box.y &&
          y <= box.y + box.h
        ) {
          return box.item;
        }
      }
      return null;
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      const pState = pointerStateRef.current;
      if (!pState.isInside || !pState.hasEnteredOnce) {
        // Snap center to entry position while strength is 0 so bulge rises in-place
        if (pState.currentStrength < 0.05) {
          pState.currentX = localX;
          pState.currentY = localY;
        }
        pState.isInside = true;
        pState.hasEnteredOnce = true;
      }

      pState.targetX = localX;
      pState.targetY = localY;
      pState.targetStrength = mergedConfig.bulgeStrength;
    },
    [mergedConfig.bulgeStrength]
  );

  const handlePointerLeave = useCallback(() => {
    const pState = pointerStateRef.current;
    pState.isInside = false;
    pState.targetStrength = 0;
  }, []);

  const handleMosaicClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      const clickedItem = findCardAtPoint(localX, localY);
      if (!clickedItem) return;

      if (activeCardIdRef.current === clickedItem.id) {
        isPlayingRef.current = !isPlayingRef.current;
        setIsPlaying(isPlayingRef.current);
      } else {
        activeCardIdRef.current = clickedItem.id;
        isPlayingRef.current = true;
        setActiveCardId(clickedItem.id);
        setIsPlaying(true);
      }
      textureDirtyRef.current = true;
    },
    [findCardAtPoint]
  );

  const activeAsset =
    mosaicAssets.find((a) => a.id === activeCardId) || mosaicAssets[0];

  return (
    <section
      id="music-mosaic"
      aria-label="Interactive Spherical Music Mosaic"
      className="relative flex h-screen w-full flex-col bg-[#07080D] text-[#F5EFE6] select-none overflow-hidden"
    >
      {/* Fixed Top Header Bar (Never wraps or changes height) */}
      <header className="relative z-20 flex h-[64px] w-full shrink-0 flex-nowrap items-center justify-between gap-4 border-b border-[#D8B77E]/20 bg-[#07080D] px-5 sm:px-10 overflow-hidden">
        <div className="flex items-center gap-4 shrink-0">
          {showStandaloneNav && (
            <Link
              href="/#worlds"
              className="group inline-flex items-center gap-2 rounded-full border border-[#D8B77E]/45 bg-[#140E09]/80 px-4 py-1.5 font-sans text-[11.5px] uppercase tracking-[0.18em] text-[#EAE0D0] transition-all hover:border-[#E8CFA0] hover:bg-[#22170E] whitespace-nowrap"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
                ←
              </span>
              <span>Back to Worlds</span>
            </Link>
          )}
          <div className="flex items-baseline gap-3 whitespace-nowrap">
            <span className="font-serif lining-nums text-[14px] sm:text-[16px] tracking-[0.2em] text-[#D8B77E]">
              01
            </span>
            <h1 className="font-display text-[17px] sm:text-[21px] uppercase tracking-[0.22em] text-[#FAF6F0]">
              SONIC SPHERE MOSAIC
            </h1>
          </div>
        </div>

        {/* Center Interactive Hint */}
        <p className="hidden xl:block font-sans text-[10.5px] uppercase tracking-[0.24em] text-[#CBB89D]/80 whitespace-nowrap truncate">
          MOVE THE CURSOR TO EXPERIENCE THE MAGIC :)
        </p>

        {/* Fixed-Width Now-Playing Pill (Updates only on click, never shifts layout) */}
        <div className="flex w-[240px] sm:w-[270px] shrink-0 items-center justify-center gap-2.5 rounded-full border border-[#D8B77E]/35 bg-[#120D08]/85 px-4 py-1.5 backdrop-blur-md overflow-hidden">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isPlaying ? "bg-[#E5C68E] animate-pulse" : "bg-[#D8B77E]/40"
            }`}
          />
          <span className="font-sans text-[11px] tracking-[0.06em] text-[#F5EFE6] truncate">
            {activeAsset.title}
          </span>
          <span className="text-[#D8B77E]/50 shrink-0">•</span>
          <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-[#CBB89D] truncate">
            {activeAsset.artist}
          </span>
        </div>
      </header>

      {/* =====================================================================
          INTERACTIVE FLAT -> SPHERICAL MOSAIC VIEWPORT (FILLS REMAINING HEIGHT)
         ===================================================================== */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleMosaicClick}
        className="relative flex-1 w-full cursor-grab active:cursor-grabbing overflow-hidden bg-[#07080D]"
        style={{ touchAction: "pan-y" }}
      >
        <canvas
          ref={glCanvasRef}
          className="block h-full w-full pointer-events-none"
        />

        {/* Subtle Edge Framing Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 0 0 60px rgba(4, 5, 8, 0.75)",
          }}
        />
      </div>
    </section>
  );
}
