"use client";

import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type ForestControls = {
  magic: () => void;
  reset: () => void;
  press: (key: string, down: boolean) => void;
};

type Firefly = {
  group: THREE.Group;
  home: THREE.Vector3;
  phase: number;
  material: THREE.MeshStandardMaterial;
  halo: THREE.MeshBasicMaterial;
};

type CanopyInstance = {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  color: string;
  rotation: number;
};

type ForestObjects = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  dragon: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  tail: THREE.Group;
  eyeLids: THREE.Mesh[];
  pupils: THREE.Mesh[];
  fireflies: Firefly[];
  flowers: THREE.Group[];
  ripples: THREE.Mesh[];
  water: THREE.Mesh;
  waterTexture: THREE.Texture | null;
  waterBaseY: Float32Array;
  mushrooms: THREE.Group[];
  obstacles: [number, number, number][];
  hitTargets: THREE.Object3D[];
  held: Set<string>;
  magic: () => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function groundHeight(x: number, z: number) {
  return (
    Math.sin(x * 0.22 + z * 0.09) * 0.12 +
    Math.cos(z * 0.2 - x * 0.12) * 0.1 +
    Math.sin((x + z) * 0.11) * 0.08
  );
}

function makeMaterial(
  color: THREE.ColorRepresentation,
  roughness = 0.88,
  options: Partial<THREE.MeshStandardMaterialParameters> = {},
) {
  return new THREE.MeshStandardMaterial({ color, roughness, ...options });
}

function addSphere(
  parent: THREE.Object3D,
  name: string,
  position: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  material: THREE.Material,
  segments = 24,
) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, segments, Math.max(12, Math.floor(segments * 0.75))),
    material,
  );
  mesh.name = name;
  mesh.position.copy(
    position instanceof THREE.Vector3
      ? position
      : new THREE.Vector3(position[0], position[1], position[2]),
  );
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addBeam(
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) {
  const axis = end.clone().sub(start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.72, radius, axis.length(), 9),
    material,
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize());
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function createRibbon(points: THREE.Vector3[], width: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const samples = curve.getPoints(128);
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < samples.length; i += 1) {
    const before = samples[Math.max(0, i - 1)];
    const after = samples[Math.min(samples.length - 1, i + 1)];
    const tangent = after.clone().sub(before).setY(0).normalize();
    const progress = i / (samples.length - 1);
    const widthVariation = 1 + Math.sin(progress * Math.PI * 8) * 0.055 + Math.sin(progress * Math.PI * 19) * 0.025;
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x).multiplyScalar((width * widthVariation) / 2);
    const center = samples[i].clone();
    center.y = groundHeight(center.x, center.z) + 0.025;
    const left = center.clone().add(side);
    const right = center.clone().sub(side);
    vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
    uvs.push(progress, 0, progress, 1);
  }

  for (let i = 0; i < samples.length - 1; i += 1) {
    const k = i * 2;
    indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#5d694a";
  context.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 29;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const patches = ["#899064", "#40583d", "#83714d", "#334836", "#63724d"];
  for (let i = 0; i < 1150; i += 1) {
    context.globalAlpha = 0.08 + random() * 0.2;
    context.fillStyle = patches[Math.floor(random() * patches.length)];
    context.beginPath();
    context.ellipse(
      random() * 512,
      random() * 512,
      2 + random() * 18,
      1 + random() * 11,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  for (let i = 0; i < 4200; i += 1) {
    const shade = random() > 0.58 ? "#a49a70" : "#283d2c";
    context.globalAlpha = 0.16 + random() * 0.25;
    context.fillStyle = shade;
    context.beginPath();
    context.ellipse(
      random() * 512,
      random() * 512,
      0.5 + random() * 2.2,
      0.35 + random() * 1.3,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeBarkTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const base = context.createLinearGradient(0, 0, 256, 0);
  base.addColorStop(0, "#49372c");
  base.addColorStop(0.23, "#72543c");
  base.addColorStop(0.5, "#594333");
  base.addColorStop(0.77, "#806044");
  base.addColorStop(1, "#49372c");
  context.fillStyle = base;
  context.fillRect(0, 0, 256, 512);

  let seed = 831;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 86; i += 1) {
    const x = random() * 256;
    const drift = (random() - 0.5) * 34;
    context.beginPath();
    context.moveTo(x, 0);
    context.bezierCurveTo(x + drift, 160, x - drift * 0.7, 350, x + drift * 0.35, 512);
    context.strokeStyle = i % 3 === 0 ? "rgba(28,19,14,0.48)" : "rgba(190,151,106,0.22)";
    context.lineWidth = 0.6 + random() * 2.6;
    context.stroke();
  }
  for (let i = 0; i < 10; i += 1) {
    const x = random() * 256;
    const y = random() * 512;
    context.beginPath();
    context.ellipse(x, y, 3 + random() * 5, 7 + random() * 13, random() * 0.2, 0, Math.PI * 2);
    context.strokeStyle = "rgba(32,22,15,0.28)";
    context.lineWidth = 1.5;
    context.stroke();
    context.beginPath();
    context.ellipse(x + 1, y, 1 + random() * 2, 4 + random() * 7, 0, 0, Math.PI * 2);
    context.strokeStyle = "rgba(190,151,106,0.18)";
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeTrailTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#67543c";
  context.fillRect(0, 0, 512, 512);
  let seed = 173;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 3200; i += 1) {
    const isStone = random() > 0.84;
    context.globalAlpha = isStone ? 0.42 : 0.2;
    context.fillStyle = isStone
      ? (random() > 0.5 ? "#a09275" : "#342f27")
      : (random() > 0.55 ? "#816a4e" : "#4d483a");
    context.beginPath();
    context.ellipse(
      random() * 512,
      random() * 512,
      isStone ? 1 + random() * 4 : 0.6 + random() * 2.1,
      isStone ? 1 + random() * 2.8 : 0.5 + random() * 1.7,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSunPatchTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const glow = context.createRadialGradient(128, 128, 6, 128, 128, 124);
  glow.addColorStop(0, "rgba(255,230,177,0.26)");
  glow.addColorStop(0.32, "rgba(255,225,164,0.16)");
  glow.addColorStop(0.68, "rgba(250,221,163,0.045)");
  glow.addColorStop(1, "rgba(250,221,163,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeWaterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const base = context.createLinearGradient(0, 0, 512, 0);
  base.addColorStop(0, "#6a948b");
  base.addColorStop(0.5, "#91b1a2");
  base.addColorStop(1, "#6a948b");
  context.fillStyle = base;
  context.fillRect(0, 0, 512, 512);
  let seed = 611;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 155; i += 1) {
    const x = random() * 512;
    const y = random() * 512;
    const length = 12 + random() * 68;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(
      x + length * 0.28,
      y - 5 + random() * 10,
      x + length * 0.66,
      y - 5 + random() * 10,
      x + length,
      y - 2 + random() * 4,
    );
    context.strokeStyle = i % 4 === 0 ? "rgba(234,244,220,0.32)" : "rgba(222,239,218,0.13)";
    context.lineWidth = 0.7 + random() * 2.4;
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 9);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeTaperedTube(points: THREE.Vector3[], baseRadius: number, tipRadius: number, sides = 10) {
  const curve = new THREE.CatmullRomCurve3(points);
  const samples = curve.getPoints(18);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const ring = sides + 1;
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / (samples.length - 1);
    const tangent = curve.getTangent(t).normalize();
    let axisA = new THREE.Vector3().crossVectors(tangent, up).normalize();
    if (axisA.lengthSq() < 0.01) axisA.set(1, 0, 0);
    const axisB = new THREE.Vector3().crossVectors(tangent, axisA).normalize();
    const radius = THREE.MathUtils.lerp(baseRadius, tipRadius, t) * (1 + Math.sin(t * 28) * 0.035);
    for (let j = 0; j <= sides; j += 1) {
      const angle = (j / sides) * Math.PI * 2;
      const point = samples[i]
        .clone()
        .addScaledVector(axisA, Math.cos(angle) * radius)
        .addScaledVector(axisB, Math.sin(angle) * radius);
      positions.push(point.x, point.y, point.z);
      uvs.push(j / sides, t * 2.4);
      if (i < samples.length - 1 && j < sides) {
        const a = i * ring + j;
        const b = a + 1;
        const c = a + ring;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeCanopyGeometry(seed: number) {
  const geometry = new THREE.SphereGeometry(1, 24, 18);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const colors: number[] = [];
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const ripple =
      Math.sin((x + seed) * 9.1) * Math.sin((y - seed * 0.7) * 7.8) *
      Math.cos((z + seed * 0.4) * 8.6);
    const radius = 1 + ripple * 0.055 + Math.sin((x + z) * 15 + seed) * 0.018;
    positions.setXYZ(i, x * radius, y * radius, z * radius);
    const light = 0.82 + Math.max(0, y) * 0.2 + ripple * 0.12;
    colors.push(light, light * (0.99 + Math.sin(seed + i) * 0.025), light * (0.94 + Math.cos(i * 0.7) * 0.035));
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createFern(
  scene: THREE.Scene,
  x: number,
  z: number,
  scale: number,
  seed: number,
  leafletGeometry: THREE.BufferGeometry,
  leafletMaterial: THREE.MeshStandardMaterial,
  stemMaterial: THREE.MeshStandardMaterial,
) {
  const fern = new THREE.Group();
  fern.name = "Woodland Fern";
  fern.position.set(x, groundHeight(x, z), z);
  const frondCount = 5 + (seed % 3);
  const leafletsPerFrond = 14;
  const stemGeometries: THREE.BufferGeometry[] = [];
  const leaves = new THREE.InstancedMesh(leafletGeometry, leafletMaterial, frondCount * leafletsPerFrond);
  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  let instance = 0;

  for (let frond = 0; frond < frondCount; frond += 1) {
    const angle = (Math.PI * 2 * frond) / frondCount + seed * 0.73;
    const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const side = new THREE.Vector3(-direction.z, 0, direction.x);
    const length = scale * (0.76 + ((seed + frond) % 4) * 0.085);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.06 * scale, 0),
      direction.clone().multiplyScalar(length * 0.38).add(new THREE.Vector3(0, length * 0.48, 0)),
      direction.clone().multiplyScalar(length).add(new THREE.Vector3(0, length * 0.76, 0)),
    ]);
    stemGeometries.push(new THREE.TubeGeometry(curve, 14, 0.012 * scale, 5, false));

    for (let leaflet = 0; leaflet < 7; leaflet += 1) {
      const t = 0.2 + leaflet * 0.105;
      const center = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      for (const sign of [-1, 1]) {
        const leafDirection = side.clone().multiplyScalar(sign * 0.78).addScaledVector(tangent, 0.34).normalize();
        const width = length * (0.17 - t * 0.07);
        dummy.position.copy(center).addScaledVector(side, sign * width * 0.42);
        dummy.quaternion.setFromUnitVectors(up, leafDirection);
        dummy.scale.set(0.047 * scale, width * 0.86, 0.026 * scale);
        dummy.updateMatrix();
        leaves.setMatrixAt(instance, dummy.matrix);
        const tint = new THREE.Color().setHSL(0.25 + ((seed + leaflet) % 5) * 0.008, 0.32, 0.32 + ((seed + frond) % 4) * 0.025);
        leaves.setColorAt(instance, tint);
        instance += 1;
      }
    }
  }
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  leaves.castShadow = false;
  leaves.receiveShadow = true;
  fern.add(leaves);
  const mergedStems = BufferGeometryUtils.mergeGeometries(stemGeometries, false);
  stemGeometries.forEach((geometry) => geometry.dispose());
  if (mergedStems) {
    const stemMesh = new THREE.Mesh(mergedStems, stemMaterial);
    stemMesh.castShadow = false;
    fern.add(stemMesh);
  }
  scene.add(fern);
  return fern;
}

function createGrassLayer(
  scene: THREE.Scene,
  trailPoints: THREE.Vector3[],
  count: number,
) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([
    -0.075, 0, 0, 0.075, 0, 0,
    -0.048, 0.23, 0.018, 0.048, 0.23, 0.018,
    0, 0.52, 0.065,
  ], 3));
  geometry.setIndex([0, 2, 1, 1, 2, 3, 2, 4, 3]);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const grass = new THREE.InstancedMesh(geometry, material, count);
  grass.name = "Forest Floor Grass";
  grass.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  grass.castShadow = false;
  grass.receiveShadow = true;

  let seed = 919;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const trailXAt = (z: number) => {
    for (let i = 0; i < trailPoints.length - 1; i += 1) {
      const a = trailPoints[i];
      const b = trailPoints[i + 1];
      if (z <= a.z && z >= b.z) {
        const t = (z - a.z) / (b.z - a.z);
        return THREE.MathUtils.lerp(a.x, b.x, t);
      }
    }
    return z > trailPoints[0].z ? trailPoints[0].x : trailPoints[trailPoints.length - 1].x;
  };
  const dummy = new THREE.Object3D();
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 8) {
    attempts += 1;
    const x = -37 + random() * 74;
    const z = -41 + random() * 77;
    const riverX = 13 + Math.sin((z + 4) * 0.17) * 1.1;
    if (Math.abs(x - trailXAt(z)) < 2.1) continue;
    if (Math.abs(x - riverX) < 1.9) continue;
    if (Math.abs(x) < 3.2 && z > -7 && z < 1.5) continue;
    const height = 0.72 + random() * 0.85;
    dummy.position.set(x, groundHeight(x, z), z);
    dummy.rotation.set((random() - 0.5) * 0.16, random() * Math.PI * 2, (random() - 0.5) * 0.12);
    dummy.scale.set(0.7 + random() * 0.8, height, 0.7 + random() * 0.8);
    dummy.updateMatrix();
    grass.setMatrixAt(placed, dummy.matrix);
    const tint = new THREE.Color().setHSL(0.23 + random() * 0.07, 0.28 + random() * 0.2, 0.2 + random() * 0.18);
    grass.setColorAt(placed, tint);
    placed += 1;
  }
  grass.count = placed;
  grass.instanceMatrix.needsUpdate = true;
  if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
  scene.add(grass);
  return grass;
}

function createTree(
  scene: THREE.Scene,
  x: number,
  z: number,
  height: number,
  seed: number,
  leafColor: string,
  barkTexture: THREE.Texture | null,
  canopyInstances: CanopyInstance[],
  trunkRadius = 0.82,
) {
  const tree = new THREE.Group();
  tree.name = "Ancient Tree " + seed;
  tree.position.set(x, groundHeight(x, z), z);

  const bark = makeMaterial(
    seed % 3 === 0 ? "#c2a17d" : "#ad8c6a",
    0.96,
    barkTexture ? { map: barkTexture, bumpMap: barkTexture, bumpScale: 0.11 } : {},
  );
  const moss = makeMaterial("#586c43", 0.98);
  const woodGeometries: THREE.BufferGeometry[] = [];
  const mossGeometries: THREE.BufferGeometry[] = [];
  const trunkHeight = height * 0.74;
  const leanX = Math.sin(seed * 2.17) * 0.32;
  const leanZ = Math.cos(seed * 1.61) * 0.26;
  woodGeometries.push(
    makeTaperedTube([
      new THREE.Vector3(0, 0.03, 0),
      new THREE.Vector3(leanX * 0.18, trunkHeight * 0.26, leanZ * 0.14),
      new THREE.Vector3(leanX * 0.48, trunkHeight * 0.57, leanZ * 0.4),
      new THREE.Vector3(leanX, trunkHeight, leanZ),
    ], trunkRadius * 1.15, trunkRadius * 0.16, 13),
  );

  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5 + seed * 0.37;
    const reach = trunkRadius * (1.55 + (i % 3) * 0.28);
    woodGeometries.push(
      makeTaperedTube([
        new THREE.Vector3(0, 0.52, 0),
        new THREE.Vector3(Math.cos(angle) * reach * 0.48, 0.23, Math.sin(angle) * reach * 0.48),
        new THREE.Vector3(Math.cos(angle) * reach, 0.035, Math.sin(angle) * reach),
      ], trunkRadius * 0.3, 0.045, 8),
    );
  }

  const branchCount = 4 + (seed % 3);
  for (let i = 0; i < branchCount; i += 1) {
    const angle = (Math.PI * 2 * i) / branchCount + seed * 0.61;
    const startY = trunkHeight * (0.5 + (i % 3) * 0.075);
    const reach = 1.55 + (seed % 4) * 0.25 + (i % 2) * 0.45;
    const start = new THREE.Vector3(leanX * (startY / trunkHeight), startY, leanZ * (startY / trunkHeight));
    const middle = new THREE.Vector3(
      start.x + Math.cos(angle) * reach * 0.52,
      startY + 0.48,
      start.z + Math.sin(angle) * reach * 0.52,
    );
    const end = new THREE.Vector3(
      start.x + Math.cos(angle) * reach,
      startY + 1.35 + (i % 2) * 0.45,
      start.z + Math.sin(angle) * reach,
    );
    woodGeometries.push(
      makeTaperedTube([start, middle, end], trunkRadius * 0.22, 0.045, 8),
    );
  }

  const crownY = height * (0.73 + (seed % 3) * 0.025);
  const clusterCount = 7 + (seed % 3);
  for (let i = 0; i < clusterCount; i += 1) {
    const angle = (Math.PI * 2 * i) / clusterCount + seed * 0.43;
    const ring = i === 0 ? 0 : 1.35 + (i % 3) * 0.3;
    const radius = 1.75 + ((seed + i * 3) % 4) * 0.25 + trunkRadius * 0.14;
    canopyInstances.push({
      position: new THREE.Vector3(
        x + leanX + Math.cos(angle) * ring,
        groundHeight(x, z) + crownY + (i === 0 ? 0.72 : (i % 3) * 0.48 - 0.15),
        z + leanZ + Math.sin(angle) * ring,
      ),
      scale: new THREE.Vector3(
        radius * (1.05 + (i % 2) * 0.14),
        radius * 0.72,
        radius * (0.92 + (i % 3) * 0.07),
      ),
      color: leafColor,
      rotation: angle + i * 0.31,
    });
  }

  for (let i = 0; i < 3; i += 1) {
    const angle = (Math.PI * 2 * i) / 3 + seed * 0.29;
    const patchGeometry = new THREE.SphereGeometry(trunkRadius * (0.72 + i * 0.11), 16, 9);
    patchGeometry.scale(1.3, 0.12, 0.82);
    patchGeometry.translate(Math.cos(angle) * 0.45, 0.1, Math.sin(angle) * 0.45);
    mossGeometries.push(patchGeometry);
  }

  const mergedWood = BufferGeometryUtils.mergeGeometries(woodGeometries, false);
  woodGeometries.forEach((geometry) => geometry.dispose());
  if (mergedWood) {
    const woodMesh = new THREE.Mesh(mergedWood, bark);
    woodMesh.name = "Textured Trunk and Branches";
    woodMesh.castShadow = true;
    woodMesh.receiveShadow = true;
    tree.add(woodMesh);
  }
  const mergedMoss = BufferGeometryUtils.mergeGeometries(mossGeometries, false);
  mossGeometries.forEach((geometry) => geometry.dispose());
  if (mergedMoss) {
    const mossMesh = new THREE.Mesh(mergedMoss, moss);
    mossMesh.name = "Root Moss";
    mossMesh.receiveShadow = true;
    tree.add(mossMesh);
  }

  scene.add(tree);
}

function createMushroom(
  scene: THREE.Scene,
  x: number,
  z: number,
  scale: number,
  capColor: string,
  number: number,
) {
  const root = new THREE.Group();
  root.name = `Interactive Mushroom ${number}`;
  root.position.set(x, groundHeight(x, z), z);
  root.userData.interaction = "mushroom";

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.25 * scale, 0.72 * scale, 14),
    makeMaterial("#ded2b4", 0.95),
  );
  stem.position.y = 0.34 * scale;
  stem.castShadow = true;
  root.add(stem);

  const capMaterial = makeMaterial(capColor, 0.56);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.72 * scale, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.58),
    capMaterial,
  );
  cap.name = `Mushroom Cap ${number}`;
  cap.position.y = 0.71 * scale;
  cap.scale.y = 0.62;
  cap.castShadow = true;
  cap.userData.interaction = "mushroom";
  root.add(cap);

  const spotMaterial = makeMaterial("#f3e5c5", 0.72);
  const spots = [
    [-0.32, 0.25, 0.36],
    [0.05, 0.39, 0.55],
    [0.37, 0.24, 0.35],
    [-0.02, 0.16, -0.5],
  ];
  spots.forEach(([sx, sy, sz], i) => {
    const spot = new THREE.Mesh(
      new THREE.SphereGeometry(0.085 * scale, 12, 10),
      spotMaterial,
    );
    spot.position.set(sx * scale, cap.position.y + sy * scale, sz * scale);
    spot.scale.z = 0.46;
    spot.name = `Mushroom Spot ${number}-${i}`;
    root.add(spot);
  });

  scene.add(root);
  return root;
}

function createFlower(scene: THREE.Scene, x: number, z: number, color: string, number: number) {
  const flower = new THREE.Group();
  flower.name = `Forest Flower ${number}`;
  flower.position.set(x, groundHeight(x, z), z);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.055, 0.65, 8),
    makeMaterial("#5d7649", 1),
  );
  stem.position.y = 0.32;
  flower.add(stem);

  const petals = makeMaterial(color, 0.7);
  for (let i = 0; i < 5; i += 1) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), petals);
    const angle = (Math.PI * 2 * i) / 5;
    petal.position.set(Math.cos(angle) * 0.17, 0.68, Math.sin(angle) * 0.17);
    petal.scale.set(0.82, 0.58, 0.82);
    flower.add(petal);
  }
  const heart = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 14, 10),
    makeMaterial("#e7c875", 0.62),
  );
  heart.position.y = 0.69;
  flower.add(heart);
  scene.add(flower);
  return flower;
}

function makeDragon() {
  const mint = makeMaterial("#88b77c", 0.62);
  const lightMint = makeMaterial("#9dca8f", 0.58);
  const darkMint = makeMaterial("#698e62", 0.72);
  const belly = makeMaterial("#ebd6b8", 0.9);
  const bellySeam = makeMaterial("#cbb597", 0.96);
  const claw = makeMaterial("#e5d8ba", 0.7);
  const horn = makeMaterial("#8a956a", 0.72);
  const eyeRim = makeMaterial("#49322d", 0.4);
  const eye = makeMaterial("#170f12", 0.11, { metalness: 0.04 });
  const iris = makeMaterial("#553429", 0.3);
  const pupil = makeMaterial("#08090b", 0.08);
  const shine = new THREE.MeshBasicMaterial({ color: "#fff9e9" });

  const dragon = new THREE.Group();
  dragon.name = "Dragon Root";
  dragon.userData.interaction = "dragon";

  const torsoGroup = new THREE.Group();
  torsoGroup.name = "Dragon Torso";
  const torso = addSphere(torsoGroup, "Dragon Body", [0, 1.3, 0], [0.84, 0.99, 0.7], mint, 36);
  addSphere(torsoGroup, "Dragon Belly", [0, 1.34, 0.57], [0.67, 0.8, 0.16], belly, 32);
  for (let i = 0; i < 4; i += 1) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.94 - i * 0.035, 0.024, 0.025), bellySeam);
    line.position.set(0, 1.0 + i * 0.23, 0.72 - Math.abs(i - 1.5) * 0.018);
    torsoGroup.add(line);
  }
  dragon.add(torsoGroup);

  const head = new THREE.Group();
  head.name = "Dragon Head";
  head.position.set(0, 2.18, 0.02);
  addSphere(head, "Dragon Head Form", [0, 0.55, 0], [1.12, 0.98, 0.84], lightMint, 40);
  addSphere(head, "Dragon Muzzle", [0, 0.03, 0.77], [0.62, 0.37, 0.4], lightMint, 32);
  addSphere(head, "Dragon Cheek Left", [-0.79, 0.1, 0.59], [0.25, 0.19, 0.2], mint, 24);
  addSphere(head, "Dragon Cheek Right", [0.79, 0.1, 0.59], [0.25, 0.19, 0.2], mint, 24);

  const eyeLids: THREE.Mesh[] = [];
  const pupils: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    addSphere(head, `Dragon Eye Socket ${side}`, [side * 0.55, 0.61, 0.67], [0.31, 0.39, 0.17], eyeRim, 30);
    addSphere(head, `Dragon Eye ${side}`, [side * 0.55, 0.61, 0.79], [0.245, 0.33, 0.12], eye, 30);
    addSphere(head, `Dragon Iris ${side}`, [side * 0.55, 0.6, 0.887], [0.17, 0.24, 0.06], iris, 24);
    const pupilMesh = addSphere(head, `Dragon Pupil ${side}`, [side * 0.55, 0.61, 0.935], [0.095, 0.16, 0.045], pupil, 24);
    pupils.push(pupilMesh);
    addSphere(head, `Dragon Eye Shine ${side}`, [side * 0.55 - 0.055, 0.72, 0.978], [0.052, 0.07, 0.035], shine, 16);
    addSphere(head, `Dragon Eye Glint ${side}`, [side * 0.55 + 0.055, 0.54, 0.975], [0.025, 0.034, 0.022], shine, 12);
    const lid = addSphere(head, `Dragon Blink Lid ${side}`, [side * 0.55, 0.61, 0.96], [0.252, 0.345, 0.025], lightMint, 24);
    lid.scale.y = 0.025;
    eyeLids.push(lid);
    addSphere(head, `Dragon Nostril ${side}`, [side * 0.18, 0.15, 1.105], [0.055, 0.045, 0.034], darkMint, 12);
  }

  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.18, -0.15, 1.105),
    new THREE.Vector3(0, -0.2, 1.15),
    new THREE.Vector3(0.18, -0.15, 1.105),
  ]);
  const smile = new THREE.Mesh(
    new THREE.TubeGeometry(smileCurve, 14, 0.018, 8, false),
    makeMaterial("#536748", 0.7),
  );
  head.add(smile);

  for (const side of [-1, 1]) {
    const hornMesh = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.43, 14), horn);
    hornMesh.position.set(side * 0.54, 1.42, -0.03);
    hornMesh.rotation.z = -side * 0.22;
    hornMesh.castShadow = true;
    head.add(hornMesh);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.3, 12), darkMint);
    ear.position.set(side * 1.03, 0.57, -0.05);
    ear.rotation.z = -side * (Math.PI / 2 - 0.18);
    head.add(ear);
  }
  const crownHorn = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.32, 12), horn);
  crownHorn.position.set(0, 1.4, 0.04);
  crownHorn.castShadow = true;
  head.add(crownHorn);
  dragon.add(head);

  function makeWing(side: -1 | 1) {
    const wing = new THREE.Group();
    wing.name = side < 0 ? "Dragon Wing Left" : "Dragon Wing Right";
    wing.position.set(side * 0.64, 1.88, -0.42);
    const outline = new THREE.Shape();
    outline.moveTo(0, 0);
    outline.quadraticCurveTo(side * 0.16, 0.5, side * 0.48, 1.06);
    outline.quadraticCurveTo(side * 1.02, 1.12, side * 1.18, 0.8);
    outline.quadraticCurveTo(side * 0.88, 0.61, side * 0.98, 0.18);
    outline.quadraticCurveTo(side * 0.58, 0.38, side * 0.52, -0.16);
    outline.quadraticCurveTo(side * 0.23, 0.18, 0, 0);
    const membrane = new THREE.Mesh(
      new THREE.ShapeGeometry(outline, 8),
      makeMaterial("#789c70", 0.75, { side: THREE.DoubleSide }),
    );
    membrane.position.z = -0.04;
    wing.add(membrane);
    const boneMaterial = makeMaterial("#a1bd84", 0.68);
    addBeam(wing, new THREE.Vector3(0, 0, 0.02), new THREE.Vector3(side * 0.42, 0.86, 0.02), 0.055, boneMaterial);
    addBeam(wing, new THREE.Vector3(side * 0.15, 0.15, 0.03), new THREE.Vector3(side * 0.93, 0.76, 0.03), 0.035, boneMaterial);
    addBeam(wing, new THREE.Vector3(side * 0.13, 0.1, 0.03), new THREE.Vector3(side * 0.77, 0.1, 0.03), 0.035, boneMaterial);
    dragon.add(wing);
    return wing;
  }

  const leftWing = makeWing(-1);
  const rightWing = makeWing(1);

  function makeArm(side: -1 | 1) {
    const arm = new THREE.Group();
    arm.name = side < 0 ? "Dragon Arm Left" : "Dragon Arm Right";
    arm.position.set(side * 0.67, 1.69, 0.43);
    addSphere(arm, "Dragon Arm", [side * 0.04, -0.1, 0.04], [0.27, 0.48, 0.27], mint, 24);
    addSphere(arm, "Dragon Hand", [side * 0.05, -0.45, 0.15], [0.31, 0.24, 0.29], lightMint, 22);
    for (let i = 0; i < 3; i += 1) {
      const nail = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 9), claw);
      nail.position.set(side * 0.05 + (i - 1) * 0.13, -0.56, 0.34);
      nail.rotation.x = Math.PI / 2;
      arm.add(nail);
    }
    dragon.add(arm);
    return arm;
  }

  function makeLeg(side: -1 | 1) {
    const leg = new THREE.Group();
    leg.name = side < 0 ? "Dragon Leg Left" : "Dragon Leg Right";
    leg.position.set(side * 0.43, 0.37, 0.07);
    addSphere(leg, "Dragon Leg", [0, 0.02, 0], [0.4, 0.39, 0.39], darkMint, 24);
    addSphere(leg, "Dragon Foot", [0, -0.17, 0.34], [0.36, 0.19, 0.42], mint, 24);
    for (let i = 0; i < 3; i += 1) {
      const toe = addSphere(leg, "Dragon Toe", [(i - 1) * 0.17, -0.2, 0.62], [0.095, 0.09, 0.12], lightMint, 14);
      const nail = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.12, 8), claw);
      nail.position.set(toe.position.x, -0.22, 0.72);
      nail.rotation.x = Math.PI / 2;
      leg.add(nail);
    }
    dragon.add(leg);
    return leg;
  }

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  const tail = new THREE.Group();
  tail.name = "Dragon Tail";
  tail.position.set(0, 0.9, -0.48);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(0.48, -0.08, -0.55),
    new THREE.Vector3(1.18, -0.02, -0.9),
    new THREE.Vector3(1.75, 0.26, -0.86),
  ]);
  const tailPoints = tailCurve.getPoints(22);
  const tailVertices: number[] = [];
  const tailIndices: number[] = [];
  for (let i = 0; i < tailPoints.length; i += 1) {
    const tangent = tailCurve.getTangent(i / (tailPoints.length - 1)).normalize();
    const axisA = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    if (axisA.lengthSq() < 0.01) axisA.set(1, 0, 0);
    const axisB = new THREE.Vector3().crossVectors(tangent, axisA).normalize();
    const radius = 0.29 * (1 - i / (tailPoints.length - 1)) + 0.035;
    for (let j = 0; j < 9; j += 1) {
      const angle = (j / 8) * Math.PI * 2;
      const point = tailPoints[i]
        .clone()
        .addScaledVector(axisA, Math.cos(angle) * radius)
        .addScaledVector(axisB, Math.sin(angle) * radius);
      tailVertices.push(point.x, point.y, point.z);
      if (i < tailPoints.length - 1 && j < 8) {
        const a = i * 9 + j;
        tailIndices.push(a, a + 9, a + 1, a + 1, a + 9, a + 10);
      }
    }
  }
  const tailGeometry = new THREE.BufferGeometry();
  tailGeometry.setAttribute("position", new THREE.Float32BufferAttribute(tailVertices, 3));
  tailGeometry.setIndex(tailIndices);
  tailGeometry.computeVertexNormals();
  const tailMesh = new THREE.Mesh(tailGeometry, mint);
  tailMesh.castShadow = true;
  tail.add(tailMesh);
  for (let i = 0; i < 4; i += 1) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11 - i * 0.012, 0.25 - i * 0.025, 10), horn);
    spike.position.set(0.24 + i * 0.34, 0.23 + i * 0.055, -0.28 - i * 0.18);
    spike.rotation.z = -0.2;
    tail.add(spike);
  }
  dragon.add(tail);

  for (let i = 0; i < 5; i += 1) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.25, 10), horn);
    spike.position.set((i - 2) * 0.16, 2.05 - Math.abs(i - 2) * 0.12, -0.48);
    dragon.add(spike);
  }

  return { dragon, head, torso, leftWing, rightWing, leftArm, rightArm, leftLeg, rightLeg, tail, eyeLids, pupils };
}

function makeFirefly(scene: THREE.Scene, x: number, y: number, z: number, phase: number): Firefly {
  const group = new THREE.Group();
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#ffdb8a",
    emissive: "#d08a2a",
    emissiveIntensity: 1.5,
    roughness: 0.35,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), coreMaterial);
  group.add(core);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: "#f9ce70",
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), haloMaterial);
  group.add(halo);
  group.position.set(x, y, z);
  scene.add(group);
  return { group, home: new THREE.Vector3(x, y, z), phase, material: coreMaterial, halo: haloMaterial };
}

function buildForest(canvas: HTMLCanvasElement): ForestObjects {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#64786a");
  scene.fog = new THREE.Fog("#64786a", 22, 78);

  const camera = new THREE.PerspectiveCamera(51, 1, 0.1, 120);
  camera.position.set(0, 2.75, 13.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.27;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const hemisphere = new THREE.HemisphereLight("#eaf0dc", "#43533c", 1.7);
  scene.add(hemisphere);
  scene.add(new THREE.AmbientLight("#dce6d4", 0.28));
  const sun = new THREE.DirectionalLight("#ffe8bb", 2.05);
  sun.position.set(-16, 27, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.left = -34;
  sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 34;
  sun.shadow.camera.bottom = -34;
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 4;
  scene.add(sun);
  const clearingLight = new THREE.PointLight("#f1d9a7", 0.62, 30, 1.8);
  clearingLight.position.set(-1, 8, -16);
  scene.add(clearingLight);
  const distantFill = new THREE.PointLight("#c8d9c3", 0.34, 34, 1.7);
  distantFill.position.set(5, 10, -30);
  scene.add(distantFill);

  const groundTexture = makeGroundTexture();
  const barkTexture = makeBarkTexture();
  const trailTexture = makeTrailTexture();
  const groundMaterial = makeMaterial(
    "#b1b497",
    1,
    groundTexture ? { map: groundTexture, bumpMap: groundTexture, bumpScale: 0.055 } : {},
  );
  const groundGeometry = new THREE.PlaneGeometry(84, 92, 72, 80);
  groundGeometry.rotateX(-Math.PI / 2);
  const groundPositions = groundGeometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < groundPositions.count; i += 1) {
    const x = groundPositions.getX(i);
    const z = groundPositions.getZ(i);
    groundPositions.setY(i, groundHeight(x, z));
  }
  groundGeometry.computeVertexNormals();
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.name = "Forest Ground";
  ground.receiveShadow = true;
  scene.add(ground);

  const sunlightTexture = makeSunPatchTexture();
  if (sunlightTexture) {
    const lightPatchMaterial = new THREE.MeshBasicMaterial({
      map: sunlightTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      toneMapped: false,
    });
    const sunlightPatches: [number, number, number, number][] = [
      [-1.4, 8.5, 4.2, 2.4],
      [1.7, -10.4, 3.6, 2.3],
      [-1.2, -24.4, 4.4, 2.8],
    ];
    sunlightPatches.forEach(([x, z, width, depth]) => {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), lightPatchMaterial);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(x, groundHeight(x, z) + 0.045, z);
      patch.renderOrder = 2;
      scene.add(patch);
    });
  }

  const trailPoints = [
    new THREE.Vector3(-1, 0.05, 31),
    new THREE.Vector3(0.4, 0.05, 19),
    new THREE.Vector3(-0.3, 0.05, 7),
    new THREE.Vector3(1.2, 0.05, -4),
    new THREE.Vector3(0.6, 0.05, -16),
    new THREE.Vector3(-2.8, 0.05, -27),
    new THREE.Vector3(-3.2, 0.05, -39),
  ];
  const trailMaterial = makeMaterial(
    "#d0b996",
    0.98,
    trailTexture ? { map: trailTexture, bumpMap: trailTexture, bumpScale: 0.035 } : {},
  );
  const trail = new THREE.Mesh(createRibbon(trailPoints, 2.9), trailMaterial);
  trail.name = "Forest Trail";
  trail.receiveShadow = true;
  scene.add(trail);
  createGrassLayer(scene, trailPoints, 760);

  const streamPoints = [
    new THREE.Vector3(13.5, 0.02, 34),
    new THREE.Vector3(14.7, 0.02, 24),
    new THREE.Vector3(12.2, 0.02, 14),
    new THREE.Vector3(13.3, 0.02, 4),
    new THREE.Vector3(11.7, 0.02, -8),
    new THREE.Vector3(13.8, 0.02, -19),
    new THREE.Vector3(16.2, 0.02, -30),
    new THREE.Vector3(15.5, 0.02, -39),
  ];
  const streambed = new THREE.Mesh(
    createRibbon(streamPoints, 3.55),
    makeMaterial("#42584a", 0.98),
  );
  streambed.name = "Shallow Streambed";
  streambed.receiveShadow = true;
  scene.add(streambed);
  const waterGeometry = createRibbon(streamPoints, 2.1);
  const waterPositions = waterGeometry.attributes.position as THREE.BufferAttribute;
  const waterBaseY = new Float32Array(waterPositions.count);
  for (let i = 0; i < waterPositions.count; i += 1) waterBaseY[i] = waterPositions.getY(i);
  const waterTexture = makeWaterTexture();
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: "#b7d4c3",
    map: waterTexture,
    roughness: 0.22,
    metalness: 0.035,
    transparent: true,
    opacity: 0.82,
    clearcoat: 0.7,
    clearcoatRoughness: 0.24,
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.name = "Stream";
  water.receiveShadow = true;
  scene.add(water);

  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.48, 4.5, 24, 2),
    makeMaterial(
      "#a98965",
      0.96,
      barkTexture ? { map: barkTexture, bumpMap: barkTexture, bumpScale: 0.09 } : {},
    ),
  );
  log.name = "Mossy Log";
  log.rotation.z = Math.PI / 2;
  log.position.set(0, 0.38, -2.9);
  log.castShadow = true;
  log.receiveShadow = true;
  scene.add(log);
  const logMossMaterial = makeMaterial("#526b43", 0.98);
  for (let i = 0; i < 6; i += 1) {
    const mossPatch = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), logMossMaterial);
    mossPatch.position.set(-1.55 + i * 0.62, 0.76 + (i % 2) * 0.025, -2.9 + Math.sin(i * 1.3) * 0.16);
    mossPatch.scale.set(0.42 + (i % 3) * 0.08, 0.07, 0.22);
    mossPatch.castShadow = true;
    scene.add(mossPatch);
  }

  const treePositions: [number, number, number, number][] = [
    [-9, 9, 18, 1.75], [9.5, 10, 19, 1.9], [-15, 15, 15, 1.25], [16, 17, 17, 1.3],
    [-14, 2, 16, 1.15], [15, -2, 18, 1.25], [-12, -14, 17, 1.35], [14, -16, 16, 1.2],
    [-21, -10, 15, 1.25], [22, -9, 16, 1.25], [-19, -25, 17, 1.2], [20, -25, 17, 1.25],
    [-9, -31, 18, 0.92], [8, -34, 19, 0.95], [-28, 3, 16, 1.55], [29, 5, 15, 1.4],
    [-31, -19, 16, 1.4], [31, -18, 17, 1.5], [-9, -36, 20, 0.9], [5, -38, 19, 0.9],
    [-25, 27, 14, 1.25], [25, 28, 15, 1.3], [-36, 14, 15, 1.2], [36, 15, 16, 1.25],
  ];
  const leafPalette = ["#4d6842", "#5c7446", "#6c7c4e", "#3f5d3f", "#70804f"];
  const canopyInstances: CanopyInstance[] = [];
  const walkObstacles: [number, number, number][] = [];
  treePositions.forEach(([x, z, height, trunkRadius], i) => {
    walkObstacles.push([x, z, trunkRadius * 1.55]);
    createTree(scene, x, z, height, i + 3, leafPalette[i % leafPalette.length], barkTexture, canopyInstances, trunkRadius);
  });
  const canopyMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.92,
    vertexColors: true,
  });
  const canopyMesh = new THREE.InstancedMesh(
    makeCanopyGeometry(17),
    canopyMaterial,
    canopyInstances.length,
  );
  canopyMesh.name = "Layered Forest Canopy";
  const canopyTransform = new THREE.Object3D();
  canopyInstances.forEach((instance, i) => {
    canopyTransform.position.copy(instance.position);
    canopyTransform.rotation.y = instance.rotation;
    canopyTransform.scale.copy(instance.scale);
    canopyTransform.updateMatrix();
    canopyMesh.setMatrixAt(i, canopyTransform.matrix);
    canopyMesh.setColorAt(i, new THREE.Color(instance.color));
  });
  canopyMesh.instanceMatrix.needsUpdate = true;
  if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
  canopyMesh.castShadow = true;
  canopyMesh.receiveShadow = true;
  canopyMesh.computeBoundingSphere();
  scene.add(canopyMesh);

  const shrubs = [
    [-15, 13, 1.4], [-10, 8, 1.1], [8, 10, 1.3], [17, 6, 1.25],
    [-12, -11, 1.2], [7, -20, 1.4], [19, -25, 1.3], [-18, -28, 1.35],
  ];
  shrubs.forEach(([x, z, scale], i) => {
    const shrub = new THREE.Group();
    shrub.position.set(x, groundHeight(x, z), z);
    for (let puff = 0; puff < 4; puff += 1) {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.68 * scale, 20, 14),
        makeMaterial(i % 2 ? "#61794a" : "#4d6943", 0.98),
      );
      bush.position.set((puff - 1.5) * 0.48 * scale, 0.6 * scale + (puff % 2) * 0.16, (puff % 2) * 0.32);
      bush.scale.y = 0.82;
      bush.castShadow = true;
      shrub.add(bush);
    }
    scene.add(shrub);
  });

  const rockMaterial = makeMaterial("#777866", 0.94);
  const rockPositions: [number, number, number][] = [
    [-12, 10, 0.6], [-9, 9, 0.4], [9, 7, 0.55], [17, -2, 0.7],
    [10, -17, 0.6], [18, -27, 0.8], [-17, -19, 0.5], [-7, -31, 0.55],
    [5, 22, 0.55], [-19, -4, 0.7],
    [10.5, 14, 0.64], [16.2, 8, 0.82], [10.4, -7, 0.55],
    [16.7, -18, 0.72], [13.8, -28, 0.58], [18.2, -31, 0.68],
  ];
  rockPositions.forEach(([x, z, size], i) => {
    walkObstacles.push([x, z, size * 0.9]);
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 2), rockMaterial);
    rock.position.set(x, groundHeight(x, z) + size * 0.48, z);
    rock.rotation.set(i * 0.23, i * 0.64, i * 0.16);
    rock.scale.set(1.25, 0.78 + (i % 3) * 0.12, 0.96);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  });

  const mushrooms = [
    createMushroom(scene, -8.4, 6.5, 1.0, "#a64d4b", 0),
    createMushroom(scene, -10.1, 5.8, 0.68, "#c08b4e", 1),
    createMushroom(scene, 5.4, 8.8, 0.78, "#527f8a", 2),
    createMushroom(scene, -6.5, -15.4, 0.88, "#ad5357", 3),
    createMushroom(scene, 5.1, -24.2, 0.78, "#b79a59", 4),
    createMushroom(scene, 17.2, 14.2, 0.72, "#c08d53", 5),
    createMushroom(scene, -18.2, 14.5, 0.84, "#a95252", 6),
    createMushroom(scene, -13.1, 9.4, 0.42, "#b27a50", 7),
    createMushroom(scene, -12.2, 8.7, 0.3, "#a95650", 8),
    createMushroom(scene, 11.9, 12.1, 0.36, "#bc9b5c", 9),
    createMushroom(scene, 12.6, 11.4, 0.29, "#557d82", 10),
    createMushroom(scene, -15.8, -17.4, 0.4, "#a95555", 11),
    createMushroom(scene, 18.8, -22.1, 0.42, "#b47a53", 12),
    createMushroom(scene, -21.3, 16.8, 0.4, "#527b83", 13),
    createMushroom(scene, 5.9, -30.2, 0.34, "#c49b58", 14),
  ];

  const flowers: THREE.Group[] = [];
  const flowerLocations: [number, number, string][] = [
    [-10, 11, "#d28b95"], [-11, 10, "#cfb46e"], [8, 11, "#a596c1"],
    [9.5, 8, "#d98b8e"], [-15, -3, "#d4b570"], [-8, -23, "#aa9ac5"],
    [4.5, -31, "#d28b95"], [20, -14, "#d4b570"], [-19, -25, "#cf8994"],
    [2, 18, "#a69ac0"],
  ];
  flowerLocations.forEach(([x, z, color], i) => flowers.push(createFlower(scene, x, z, color, i)));

  const waterfall = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.9, 1, 8),
    new THREE.MeshPhysicalMaterial({
      color: "#92bcb0",
      roughness: 0.22,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
    }),
  );
  waterfall.name = "Waterfall";
  waterfall.position.set(13.1, 1.15, -19.2);
  waterfall.rotation.y = -0.2;
  scene.add(waterfall);
  const basin = new THREE.Mesh(new THREE.CircleGeometry(1.65, 40), makeMaterial("#3d7978", 0.24, { transparent: true, opacity: 0.8 }));
  basin.rotation.x = -Math.PI / 2;
  basin.position.set(13.1, 0.13, -20.2);
  scene.add(basin);

  const ripples: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i += 1) {
    const rippleMaterial = new THREE.MeshBasicMaterial({
      color: "#d2e5d0",
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.33, 32), rippleMaterial);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(12.9 + (i - 1) * 0.35, 0.16, -4 - i * 9);
    ripple.userData.phase = i * 2.3;
    scene.add(ripple);
    ripples.push(ripple);
  }

  const logByStream = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 3.0, 20), makeMaterial("#574333", 1));
  logByStream.rotation.z = Math.PI / 2;
  logByStream.position.set(19.1, 0.28, -11.5);
  logByStream.castShadow = true;
  scene.add(logByStream);

  const fernLeafGeometry = new THREE.SphereGeometry(1, 8, 6);
  const fernLeafMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.92, side: THREE.DoubleSide });
  const fernStemMaterial = makeMaterial("#64794b", 0.95);
  const fernLocations: [number, number, number][] = [
    [-6.8, 8.2, 1.15], [-12.2, 11.8, 1.25], [7.7, 10.7, 1.0], [16.7, 8.8, 1.35],
    [-17.4, 4.2, 1.5], [18.8, -4.5, 1.35], [-7.4, -12.8, 1.2], [7.7, -18.2, 1.25],
    [18.7, -20.1, 1.45], [-19.4, -23.1, 1.3], [2.2, -29.7, 1.1], [-3.8, 18.5, 1.0],
  ];
  fernLocations.forEach(([x, z, scale], i) => {
    createFern(scene, x, z, scale, i + 7, fernLeafGeometry, fernLeafMaterial, fernStemMaterial);
  });

  const fireflies = [
    [-9, 2.8, 9], [-5, 4.0, 4], [5.5, 3.4, 3], [11, 3.1, 6],
    [-11, 3.2, -6], [8, 4.2, -10], [-4, 4.8, -16], [15, 3.7, -21],
    [-15, 2.9, -23], [3, 3.4, -29],
  ].map(([x, y, z], i) => makeFirefly(scene, x, y, z, i * 0.91));

  const dragonParts = makeDragon();
  dragonParts.dragon.position.set(0, 0.68, -2.9);
  scene.add(dragonParts.dragon);

  const hitTargets: THREE.Object3D[] = [dragonParts.dragon, ...mushrooms];
  const held = new Set<string>();
  const magic = () => {
    const event = new CustomEvent("forest-magic");
    window.dispatchEvent(event);
  };

  return {
    scene,
    camera,
    renderer,
    dragon: dragonParts.dragon,
    head: dragonParts.head,
    torso: dragonParts.torso,
    leftWing: dragonParts.leftWing,
    rightWing: dragonParts.rightWing,
    leftArm: dragonParts.leftArm,
    rightArm: dragonParts.rightArm,
    leftLeg: dragonParts.leftLeg,
    rightLeg: dragonParts.rightLeg,
    tail: dragonParts.tail,
    eyeLids: dragonParts.eyeLids,
    pupils: dragonParts.pupils,
    fireflies,
    flowers,
    ripples,
    water,
    waterTexture,
    waterBaseY,
    mushrooms,
    obstacles: walkObstacles,
    hitTargets,
    held,
    magic,
  };
}

export default function EnchantedForestPlayground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<ForestControls | null>(null);
  const [status, setStatus] = useState("A quiet clearing, and a curious little friend.");
  const [isRoaming, setIsRoaming] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let forest: ForestObjects;
    try {
      forest = buildForest(canvas);
    } catch {
      setStatus("This device could not start the 3D forest.");
      return;
    }

    let frame = 0;
    let previous = performance.now();
    let elapsed = 0;
    let yaw = 0;
    let pitch = -0.055;
    let dragging = false;
    let movedPointer = false;
    let lastPointer = { x: 0, y: 0 };
    let downAt = { x: 0, y: 0 };
    let blinkStart = -1;
    let nextBlink = 3.2 + Math.random() * 3.2;
    let magicStart = -1;
    let magicOrigin: THREE.Vector3 | null = null;
    let lastNear = false;
    let nextWander = 15;
    let destinationIndex = 0;
    let sparkleGroup: THREE.Group | null = null;
    let sparkleMaterials: THREE.MeshBasicMaterial[] = [];
    let sparkleVelocities: THREE.Vector3[] = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const velocity = new THREE.Vector3();
    const movement = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const destinations = [
      new THREE.Vector3(-6.4, 0.12, 6.5),
      new THREE.Vector3(8.3, 0.12, -8.5),
      new THREE.Vector3(2.4, 0.12, -25.2),
      new THREE.Vector3(0, 0.68, -2.9),
    ];
    const makeSparkles = () => {
      if (sparkleGroup) return;
      sparkleGroup = new THREE.Group();
      sparkleGroup.name = "Dragon Golden Sparkles";
      for (let i = 0; i < 14; i += 1) {
        const material = new THREE.MeshBasicMaterial({ color: i % 3 ? "#f4cf73" : "#fff0b3", transparent: true, opacity: 0, depthWrite: false });
        const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.075 + (i % 3) * 0.018, 0), material);
        sparkleMaterials.push(material);
        sparkleVelocities.push(new THREE.Vector3((Math.random() - 0.5) * 1.35, 1.1 + Math.random() * 1.4, 0.8 + Math.random() * 1.2));
        sparkleGroup.add(sparkle);
      }
      forest.scene.add(sparkleGroup);
    };
    makeSparkles();

    const triggerMagic = (origin?: THREE.Vector3) => {
      magicStart = elapsed;
      magicOrigin = origin?.clone() ?? null;
      forest.leftWing.rotation.z = 0;
      setStatus("A tiny breath of golden magic!");
    };
    const resetView = () => {
      forest.camera.position.set(0, 2.75, 13.5);
      yaw = 0;
      pitch = -0.055;
      velocity.set(0, 0, 0);
      forest.camera.lookAt(0, 2.1, -2.8);
    };
    const press = (key: string, down: boolean) => {
      const normalized = key.toLowerCase();
      if (down) forest.held.add(normalized);
      else forest.held.delete(normalized);
    };
    controlsRef.current = { magic: triggerMagic, reset: resetView, press };

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const findInteraction = (object: THREE.Object3D | null) => {
      let current = object;
      while (current && !current.userData.interaction) current = current.parent;
      return current?.userData.interaction as string | undefined;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      movedPointer = false;
      lastPointer = { x: event.clientX, y: event.clientY };
      downAt = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.focus();
    };
    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event);
      if (dragging) {
        const dx = event.clientX - lastPointer.x;
        const dy = event.clientY - lastPointer.y;
        if (Math.abs(event.clientX - downAt.x) + Math.abs(event.clientY - downAt.y) > 4) movedPointer = true;
        yaw += dx * 0.0024;
        pitch = clamp(pitch - dy * 0.0018, -0.42, 0.28);
        lastPointer = { x: event.clientX, y: event.clientY };
      }
      raycaster.setFromCamera(pointer, forest.camera);
      const hit = raycaster.intersectObjects(forest.hitTargets, true)[0];
      canvas.style.cursor = hit && findInteraction(hit.object) ? "pointer" : dragging ? "grabbing" : "grab";
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      const distance = Math.abs(event.clientX - downAt.x) + Math.abs(event.clientY - downAt.y);
      if (distance > 8 || movedPointer) return;
      updatePointer(event);
      raycaster.setFromCamera(pointer, forest.camera);
      const hit = raycaster.intersectObjects(forest.hitTargets, true)[0];
      const interaction = hit ? findInteraction(hit.object) : undefined;
      if (interaction === "dragon") triggerMagic();
      if (interaction === "mushroom") {
        triggerMagic(hit?.point);
        setStatus("The mushrooms scatter a few little lights.");
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        event.preventDefault();
        press(key, true);
        setIsRoaming(true);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => press(event.key, false);
    const onBlur = () => forest.held.clear();
    const onMagicEvent = () => triggerMagic();

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("forest-magic", onMagicEvent);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      forest.camera.aspect = width / height;
      forest.camera.updateProjectionMatrix();
      forest.renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const clockForward = new THREE.Vector3();
    const cameraTarget = new THREE.Vector3();
    const cameraDesired = new THREE.Vector3();
    const wanderTarget = new THREE.Vector3();
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.045);
      previous = now;
      elapsed += dt;

      const isMoving = forest.held.size > 0;
      const acceleration = isMoving ? 8.5 : 5.8;
      const damping = Math.exp(-acceleration * dt);
      movement.set(0, 0, 0);
      forward.set(Math.sin(yaw), 0, -Math.cos(yaw));
      right.set(Math.cos(yaw), 0, Math.sin(yaw));
      if (forest.held.has("w") || forest.held.has("arrowup")) movement.add(forward);
      if (forest.held.has("s") || forest.held.has("arrowdown")) movement.sub(forward);
      if (forest.held.has("d") || forest.held.has("arrowright")) movement.add(right);
      if (forest.held.has("a") || forest.held.has("arrowleft")) movement.sub(right);
      if (movement.lengthSq() > 0) movement.normalize().multiplyScalar(5.5);
      velocity.lerp(movement, 1 - damping);

      cameraDesired.copy(forest.camera.position).addScaledVector(velocity, dt);
      cameraDesired.x = clamp(cameraDesired.x, -34, 34);
      cameraDesired.z = clamp(cameraDesired.z, -34, 30);
      for (const [ox, oz, radius] of forest.obstacles) {
        const dx = cameraDesired.x - ox;
        const dz = cameraDesired.z - oz;
        const distance = Math.hypot(dx, dz);
        if (distance < radius + 0.62) {
          const safeDistance = radius + 0.62;
          const angle = distance > 0.0001 ? Math.atan2(dz, dx) : 0;
          cameraDesired.x = ox + Math.cos(angle) * safeDistance;
          cameraDesired.z = oz + Math.sin(angle) * safeDistance;
        }
      }
      const riverX = 13 + Math.sin((cameraDesired.z + 4) * 0.17) * 1.1;
      if (cameraDesired.z > -34 && cameraDesired.z < 31 && Math.abs(cameraDesired.x - riverX) < 1.55) {
        cameraDesired.x = riverX + (cameraDesired.x < riverX ? -1.58 : 1.58);
      }
      forest.camera.position.x = cameraDesired.x;
      forest.camera.position.z = cameraDesired.z;
      const eyeHeight = 2.05 + groundHeight(forest.camera.position.x, forest.camera.position.z);
      forest.camera.position.y += (eyeHeight - forest.camera.position.y) * (1 - Math.exp(-5 * dt));
      clockForward.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
      cameraTarget.copy(forest.camera.position).add(clockForward);
      forest.camera.lookAt(cameraTarget);

      if (elapsed > nextWander && magicStart < 0) {
        destinationIndex = (destinationIndex + 1) % destinations.length;
        nextWander = elapsed + 13 + Math.random() * 8;
      }
      wanderTarget.copy(destinations[destinationIndex]);
      const toDestination = new THREE.Vector3(wanderTarget.x - forest.dragon.position.x, 0, wanderTarget.z - forest.dragon.position.z);
      const distanceToDestination = toDestination.length();
      const walking = distanceToDestination > 0.28 && elapsed > 9 && magicStart < 0;
      if (walking) {
        toDestination.normalize();
        forest.dragon.position.addScaledVector(toDestination, Math.min(dt * 0.85, distanceToDestination));
        forest.dragon.rotation.y += (Math.atan2(toDestination.x, toDestination.z) - forest.dragon.rotation.y) * (1 - Math.exp(-2.4 * dt));
      }
      const restY = destinationIndex === 3 && distanceToDestination < 0.5 ? 0.68 : 0.12;
      forest.dragon.position.y += (restY - forest.dragon.position.y) * (1 - Math.exp(-3.6 * dt));
      const curiousDistance = forest.dragon.position.distanceTo(forest.camera.position);
      const curious = clamp(1 - (curiousDistance - 3.8) / 8, 0, 1);
      forest.head.rotation.y = Math.sin(elapsed * 0.43) * 0.09 + curious * Math.atan2(
        forest.camera.position.x - forest.dragon.position.x,
        forest.camera.position.z - forest.dragon.position.z,
      ) * 0.22;
      forest.head.rotation.z = Math.sin(elapsed * 0.72) * 0.035 + curious * Math.sin(elapsed * 0.8) * 0.055;
      forest.torso.scale.y = 1 + Math.sin(elapsed * 1.7) * 0.018;
      const reaction = magicStart >= 0 ? Math.max(0, 1 - (elapsed - magicStart) / 1.8) : 0;
      const flap = Math.sin(elapsed * (walking ? 7.5 : 2.2)) * (walking ? 0.23 : 0.065);
      forest.leftWing.rotation.z = 0.05 + flap + reaction * 0.32;
      forest.rightWing.rotation.z = -0.05 - flap - reaction * 0.32;
      forest.leftArm.rotation.x = Math.sin(elapsed * 6) * (walking ? 0.16 : 0.025) + reaction * 0.14;
      forest.rightArm.rotation.x = -Math.sin(elapsed * 6) * (walking ? 0.16 : 0.025) + reaction * 0.14;
      forest.leftLeg.rotation.x = Math.sin(elapsed * 6 + Math.PI) * (walking ? 0.2 : 0.012);
      forest.rightLeg.rotation.x = Math.sin(elapsed * 6) * (walking ? 0.2 : 0.012);
      forest.tail.rotation.y = Math.sin(elapsed * 1.4) * (0.12 + curious * 0.1 + reaction * 0.18);
      forest.tail.rotation.z = Math.sin(elapsed * 1.1 + 1.2) * 0.07;
      const gaze = Math.sin(elapsed * 0.38) * 0.11 + curious * Math.sin(elapsed * 0.7) * 0.08;
      forest.pupils.forEach((pupil, i) => {
        const side = i === 0 ? -1 : 1;
        pupil.position.x = side * 0.55 + gaze;
      });

      if (elapsed > nextBlink && blinkStart < 0) {
        blinkStart = elapsed;
        nextBlink = elapsed + 3.2 + Math.random() * 4.5;
      }
      const blinkProgress = blinkStart < 0 ? 0 : elapsed - blinkStart;
      const blink = blinkProgress < 0.16 ? Math.sin((blinkProgress / 0.16) * Math.PI) : 0;
      if (blinkProgress > 0.19) blinkStart = -1;
      forest.eyeLids.forEach((lid) => {
        lid.scale.y = 0.025 + blink * 0.97;
      });

      if (sparkleGroup && magicStart >= 0) {
        const age = elapsed - magicStart;
        const origin = magicOrigin ?? forest.dragon.localToWorld(new THREE.Vector3(0, 2.45, 1.08));
        sparkleGroup.children.forEach((child, i) => {
          const velocityForSparkle = sparkleVelocities[i];
          const spread = (i - 6.5) * 0.08;
          child.position.set(
            origin.x + spread + velocityForSparkle.x * age,
            origin.y + velocityForSparkle.y * age - 0.5 * age * age,
            origin.z + velocityForSparkle.z * age,
          );
          child.rotation.set(age * (2 + i), age * (1.4 + i * 0.1), age * 2.2);
          child.scale.setScalar(Math.max(0.001, (1 - age / 1.4) * (0.55 + (i % 3) * 0.18)));
          sparkleMaterials[i].opacity = clamp(1 - age / 1.4, 0, 1);
        });
        if (age > 1.5) {
          magicStart = -1;
          magicOrigin = null;
          setStatus("The forest settles back into its quiet rhythm.");
          nextWander = elapsed + 7;
        }
      }

      const near = curiousDistance < 7.5;
      if (near !== lastNear) {
        setStatus(near ? "The little dragon noticed you." : "A quiet forest, with a little life in the distance.");
        lastNear = near;
      }
      forest.fireflies.forEach((firefly) => {
        const proximity = clamp(1 - firefly.group.position.distanceTo(forest.camera.position) / 9, 0, 1);
        const pulse = 0.5 + Math.sin(elapsed * 2.1 + firefly.phase) * 0.18;
        firefly.group.position.set(
          firefly.home.x + Math.sin(elapsed * 0.34 + firefly.phase) * 0.52,
          firefly.home.y + Math.sin(elapsed * 0.8 + firefly.phase) * 0.34,
          firefly.home.z + Math.cos(elapsed * 0.3 + firefly.phase) * 0.4,
        );
        firefly.material.emissiveIntensity = 0.8 + pulse + proximity * 1.1;
        firefly.halo.opacity = 0.08 + proximity * 0.16 + pulse * 0.08;
        firefly.group.scale.setScalar(0.9 + proximity * 0.25);
      });
      forest.flowers.forEach((flower, i) => {
        const distance = flower.position.distanceTo(forest.camera.position);
        const close = clamp(1 - distance / 7, 0, 1);
        flower.rotation.z = Math.sin(elapsed * 1.4 + i) * (0.035 + close * 0.18);
      });
      forest.ripples.forEach((ripple, i) => {
        const pulse = (elapsed * 0.32 + i * 0.31) % 1;
        ripple.scale.setScalar(0.72 + pulse * 1.3);
        (ripple.material as THREE.MeshBasicMaterial).opacity = 0.36 * (1 - pulse);
      });
      const waterPositions = forest.water.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < waterPositions.count; i += 1) {
        const x = waterPositions.getX(i);
        const z = waterPositions.getZ(i);
        waterPositions.setY(i, forest.waterBaseY[i] + Math.sin(elapsed * 1.7 + z * 1.3 + x * 0.55) * 0.035);
      }
      waterPositions.needsUpdate = true;
      if (forest.waterTexture) forest.waterTexture.offset.y = (elapsed * 0.035) % 1;

      forest.renderer.render(forest.scene, forest.camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      controlsRef.current = null;
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("forest-magic", onMagicEvent);
      forest.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      forest.renderer.dispose();
    };
  }, []);

  const holdKey = (key: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    controlsRef.current?.press(key, true);
    setIsRoaming(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const releaseKey = (key: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    controlsRef.current?.press(key, false);
  };

  return (
    <section className="relative overflow-hidden rounded-[8px] border border-[#D8B77E]/35 bg-[#10140f] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
      <div className="relative min-h-[520px] aspect-[1.45/1] w-full overflow-hidden sm:aspect-[1.68/1] sm:min-h-[600px]">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Explore a three-dimensional enchanted forest with a baby dragon"
          className="absolute inset-0 h-full w-full touch-none outline-none"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-6">
          <div className="rounded-full border border-white/15 bg-[#10170f]/55 px-3.5 py-2 backdrop-blur-md sm:px-4">
            <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#e7d5ad] sm:text-[10px]">A small world to wander</p>
          </div>
          <div className="rounded-full border border-[#e0c895]/30 bg-[#10170f]/55 px-3.5 py-2 font-sans text-[9px] uppercase tracking-[0.18em] text-[#f1e8d6]/80 backdrop-blur-md sm:px-4 sm:text-[10px]">
            Playground · 06
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[min(70%,420px)] rounded-[5px] border border-white/10 bg-[#10170f]/55 px-3.5 py-2.5 backdrop-blur-md sm:bottom-6 sm:left-6 sm:px-4">
          <p aria-live="polite" className="font-sans text-[9px] uppercase tracking-[0.12em] text-[#e8d9bd]/80 sm:text-[10px]">
            {status}
          </p>
          <p className="mt-1 font-sans text-[8px] tracking-[0.04em] text-[#e8d9bd]/55 sm:text-[9px]">
            Drag to look · WASD or arrows to walk · click the dragon
          </p>
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex items-end gap-2 sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={() => controlsRef.current?.reset()}
            className="rounded-full border border-white/20 bg-[#10170f]/65 px-3 py-2 font-sans text-[9px] uppercase tracking-[0.12em] text-[#f4ead7]/85 backdrop-blur-md transition hover:border-[#e5c992]/70 hover:text-white sm:px-4 sm:text-[10px]"
          >
            Reset view
          </button>
          <button
            type="button"
            onClick={() => controlsRef.current?.magic()}
            className="rounded-full border border-[#e0c48d]/55 bg-[#453e25]/75 px-3.5 py-2 font-sans text-[9px] uppercase tracking-[0.12em] text-[#fff2d5] shadow-[0_0_28px_rgba(224,196,141,0.12)] backdrop-blur-md transition hover:border-[#f2d99f] hover:bg-[#5a4c2d]/90 sm:px-4 sm:text-[10px]"
          >
            ✧ Tiny magic
          </button>
        </div>

        <div className="absolute right-4 top-1/2 z-20 grid -translate-y-1/2 grid-cols-3 gap-1.5 opacity-80 sm:hidden">
          <span />
          <button aria-label="Walk forward" onPointerDown={holdKey("w")} onPointerUp={releaseKey("w")} onPointerLeave={releaseKey("w")} className="forest-pad">↑</button>
          <span />
          <button aria-label="Walk left" onPointerDown={holdKey("a")} onPointerUp={releaseKey("a")} onPointerLeave={releaseKey("a")} className="forest-pad">←</button>
          <button aria-label="Walk backward" onPointerDown={holdKey("s")} onPointerUp={releaseKey("s")} onPointerLeave={releaseKey("s")} className="forest-pad">↓</button>
          <button aria-label="Walk right" onPointerDown={holdKey("d")} onPointerUp={releaseKey("d")} onPointerLeave={releaseKey("d")} className="forest-pad">→</button>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-[#D8B77E]/20 bg-[#100d09] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
        <div>
          <p className="font-sans text-[9px] uppercase tracking-[0.27em] text-[#c4a66f]">A living woodland</p>
          <h3 className="mt-1 font-display text-[30px] font-normal leading-none text-[#f8f1e5] sm:text-[38px]">The Enchanted Forest</h3>
          <p className="mt-2 max-w-xl font-serif text-[16px] leading-relaxed text-[#d4c7b1]/75 sm:text-[18px]">
            Follow the mossy trail, listen to the stream, and meet the little dragon who calls this clearing home.
          </p>
        </div>
        <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#d9c8a6]/45 sm:pb-1">
          {isRoaming ? "Free roam is ready" : "Take your time · the forest is yours"}
        </p>
      </div>

      <style jsx>{`
        .forest-pad {
          display: flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(235, 218, 182, 0.36);
          border-radius: 9999px;
          background: rgba(17, 22, 15, 0.76);
          color: rgba(255, 247, 229, 0.92);
          font: 14px/1 system-ui, sans-serif;
          touch-action: none;
          backdrop-filter: blur(10px);
        }
        .forest-pad:active {
          background: rgba(89, 77, 46, 0.9);
        }
      `}</style>
    </section>
  );
}
