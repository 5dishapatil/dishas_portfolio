"use client";

import * as THREE from "three";
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
  waterBaseY: Float32Array;
  mushrooms: THREE.Group[];
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
  const samples = curve.getPoints(96);
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < samples.length; i += 1) {
    const before = samples[Math.max(0, i - 1)];
    const after = samples[Math.min(samples.length - 1, i + 1)];
    const tangent = after.clone().sub(before).setY(0).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x).multiplyScalar(width / 2);
    const center = samples[i].clone();
    center.y += groundHeight(center.x, center.z);
    const left = center.clone().add(side);
    const right = center.clone().sub(side);
    vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
  }

  for (let i = 0; i < samples.length - 1; i += 1) {
    const k = i * 2;
    indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#506344";
  context.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 29;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 1800; i += 1) {
    const shade = random() > 0.53 ? "#77815b" : "#354c38";
    context.globalAlpha = 0.12 + random() * 0.2;
    context.fillStyle = shade;
    context.beginPath();
    context.ellipse(
      random() * 256,
      random() * 256,
      0.5 + random() * 2.2,
      0.5 + random() * 1.8,
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
  texture.repeat.set(15, 15);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTree(
  scene: THREE.Scene,
  x: number,
  z: number,
  height: number,
  seed: number,
  leafColor: string,
) {
  const tree = new THREE.Group();
  tree.name = `Ancient Tree ${seed}`;
  tree.position.set(x, groundHeight(x, z), z);

  const bark = makeMaterial(seed % 3 === 0 ? "#6d5945" : "#55483a", 1);
  const moss = makeMaterial("#52664a", 1);
  const foliage = [
    makeMaterial(leafColor, 0.96),
    makeMaterial(seed % 2 ? "#496344" : "#405b40", 0.98),
    makeMaterial(seed % 3 ? "#59724b" : "#4b6543", 1),
  ];

  const trunkHeight = height * 0.62;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.56, trunkHeight, 12, 5),
    bark,
  );
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  for (let i = 0; i < 4; i += 1) {
    const angle = (Math.PI * 2 * i) / 4 + seed * 0.37;
    const heightAtBranch = trunkHeight * (0.45 + i * 0.095);
    const start = new THREE.Vector3(0, heightAtBranch, 0);
    const end = new THREE.Vector3(
      Math.cos(angle) * (1.8 + (seed % 3) * 0.2),
      heightAtBranch + 1.6,
      Math.sin(angle) * 1.8,
    );
    addBeam(tree, start, end, 0.18, bark);
  }

  const crownY = height * 0.73;
  const lobes = [
    [0, 0, 0, 2.8],
    [-1.6, -0.2, 0.2, 2.05],
    [1.65, -0.1, -0.4, 2.2],
    [0.35, 0.35, 1.45, 1.9],
    [-0.45, 0.1, -1.5, 2.05],
    [0, 2.2, 0.1, 1.8],
  ] as const;

  for (let i = 0; i < lobes.length; i += 1) {
    const [ox, oy, oz, radius] = lobes[i];
    const canopy = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius * (0.92 + ((seed + i) % 3) * 0.07), 2),
      foliage[(seed + i) % foliage.length],
    );
    canopy.position.set(ox, crownY + oy, oz);
    canopy.scale.set(1.08, 0.8 + ((seed + i) % 3) * 0.08, 0.94);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    tree.add(canopy);
  }

  for (let i = 0; i < 3; i += 1) {
    const angle = (Math.PI * 2 * i) / 3 + seed * 0.51;
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.22, 1.6, 8), moss);
    root.position.set(Math.cos(angle) * 0.58, 0.08, Math.sin(angle) * 0.58);
    root.rotation.z = Math.cos(angle) * 0.4;
    root.rotation.x = -Math.sin(angle) * 0.4;
    root.castShadow = true;
    tree.add(root);
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
  scene.background = new THREE.Color("#1b2b22");
  scene.fog = new THREE.Fog("#1b2b22", 30, 76);

  const camera = new THREE.PerspectiveCamera(51, 1, 0.1, 120);
  camera.position.set(0, 2.75, 13.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const hemisphere = new THREE.HemisphereLight("#e4edcf", "#293c31", 1.35);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight("#ffe0a4", 2.65);
  sun.position.set(-12, 22, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.left = -34;
  sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 34;
  sun.shadow.camera.bottom = -34;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const clearingLight = new THREE.PointLight("#e9c58e", 0.9, 26, 1.7);
  clearingLight.position.set(-1, 7, -14);
  scene.add(clearingLight);

  const groundTexture = makeGroundTexture();
  const groundMaterial = makeMaterial("#6c7954", 1, groundTexture ? { map: groundTexture } : {});
  const groundGeometry = new THREE.PlaneGeometry(84, 78, 72, 72);
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

  const trailPoints = [
    new THREE.Vector3(-1, 0.05, 31),
    new THREE.Vector3(0.4, 0.05, 19),
    new THREE.Vector3(-0.3, 0.05, 7),
    new THREE.Vector3(1.2, 0.05, -4),
    new THREE.Vector3(0.6, 0.05, -16),
    new THREE.Vector3(-2.8, 0.05, -27),
    new THREE.Vector3(-3.2, 0.05, -39),
  ];
  const trailMaterial = makeMaterial("#5a4b37", 0.98);
  const trail = new THREE.Mesh(createRibbon(trailPoints, 3.8), trailMaterial);
  trail.name = "Forest Trail";
  trail.receiveShadow = true;
  scene.add(trail);

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
  const waterGeometry = createRibbon(streamPoints, 2.1);
  const waterPositions = waterGeometry.attributes.position as THREE.BufferAttribute;
  const waterBaseY = new Float32Array(waterPositions.count);
  for (let i = 0; i < waterPositions.count; i += 1) waterBaseY[i] = waterPositions.getY(i);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: "#43817c",
    roughness: 0.18,
    metalness: 0.06,
    transparent: true,
    opacity: 0.9,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18,
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.name = "Stream";
  water.receiveShadow = true;
  scene.add(water);

  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.48, 4.5, 24, 2),
    makeMaterial("#5a4332", 0.96),
  );
  log.name = "Mossy Log";
  log.rotation.z = Math.PI / 2;
  log.position.set(0, 0.38, -2.9);
  log.castShadow = true;
  log.receiveShadow = true;
  scene.add(log);
  const logMoss = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.42), makeMaterial("#50684a", 1));
  logMoss.position.set(0, 0.77, -2.9);
  logMoss.rotation.z = -0.03;
  logMoss.castShadow = true;
  scene.add(logMoss);

  const treePositions: [number, number, number][] = [
    [-25, 17, 13], [-21, 5, 10], [-25, -7, 14], [-22, -20, 11], [-25, -32, 13],
    [-13, -37, 12], [-3, -41, 14], [9, -39, 11], [22, -34, 13], [25, -21, 11],
    [22, -8, 13], [25, 5, 12], [25, 18, 14], [15, 27, 11], [-16, 27, 12],
    [-34, -10, 10], [34, -13, 12], [-31, 23, 9], [33, 24, 10],
  ];
  treePositions.forEach(([x, z, height], i) => {
    createTree(scene, x, z, height, i + 3, i % 3 === 0 ? "#3e5d3e" : "#496443");
  });

  const shrubs = [
    [-15, 13, 1.4], [-10, 8, 1.1], [8, 10, 1.3], [17, 6, 1.25],
    [-12, -11, 1.2], [7, -20, 1.4], [19, -25, 1.3], [-18, -28, 1.35],
  ];
  shrubs.forEach(([x, z, scale], i) => {
    const shrub = new THREE.Group();
    shrub.position.set(x, groundHeight(x, z), z);
    for (let puff = 0; puff < 4; puff += 1) {
      const bush = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.68 * scale, 2),
        makeMaterial(i % 2 ? "#526b45" : "#415d41", 0.98),
      );
      bush.position.set((puff - 1.5) * 0.48 * scale, 0.6 * scale + (puff % 2) * 0.16, (puff % 2) * 0.32);
      bush.scale.y = 0.82;
      bush.castShadow = true;
      shrub.add(bush);
    }
    scene.add(shrub);
  });

  const rockMaterial = makeMaterial("#777866", 0.95);
  const rockPositions: [number, number, number][] = [
    [-12, 10, 0.6], [-9, 9, 0.4], [9, 7, 0.55], [17, -2, 0.7],
    [10, -17, 0.6], [18, -27, 0.8], [-17, -19, 0.5], [-7, -31, 0.55],
    [5, 22, 0.55], [-19, -4, 0.7],
  ];
  rockPositions.forEach(([x, z, size], i) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 1), rockMaterial);
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

  for (let i = 0; i < 3; i += 1) {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 1.9, 10, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: "#f5d9a4", transparent: true, opacity: 0.075, depthWrite: false, side: THREE.DoubleSide }),
    );
    shaft.position.set(-7 + i * 6, 7.4, -16 - i * 3);
    shaft.rotation.z = -0.12 + i * 0.06;
    scene.add(shaft);
  }

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
    waterBaseY,
    mushrooms,
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
    const obstacles = [
      [-25, 17, 1.55], [-21, 5, 1.25], [-25, -7, 1.6], [-22, -20, 1.4], [-25, -32, 1.55],
      [-13, -37, 1.45], [-3, -41, 1.4], [9, -39, 1.45], [22, -34, 1.55], [25, -21, 1.4],
      [22, -8, 1.5], [25, 5, 1.4], [25, 18, 1.55], [15, 27, 1.4], [-16, 27, 1.4],
      [-34, -10, 1.6], [34, -13, 1.6], [-31, 23, 1.3], [33, 24, 1.3],
      [-12, 10, 0.72], [-9, 9, 0.58], [9, 7, 0.72], [17, -2, 0.9], [10, -17, 0.72],
      [18, -27, 0.95], [-17, -19, 0.62], [-7, -31, 0.68], [5, 22, 0.72], [-19, -4, 0.88],
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
      for (const [ox, oz, radius] of obstacles) {
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
