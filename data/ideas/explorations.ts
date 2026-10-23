/**
 * Curated Visual Playground / Ideas Data
 * 
 * TO CHANGE IMAGES:
 * 1. Place your image files into: /public/ideas/ (e.g. /public/ideas/my-image-1.jpg)
 * 2. Set the 'image' field below to '/ideas/my-image-1.jpg' (or keep an external https:// URL).
 * 3. Update the title, subtitle, medium, and tags as desired.
 */

export interface ExplorationItem {
  id: string;
  title: string;
  subtitle: string;
  medium: string;
  image: string;
  rotation: number;
  tags: string[];
}

export const EXPLORATION_ITEMS: ExplorationItem[] = [
  {
    id: 'exp-1',
    title: 'Stock Exchange',
    subtitle: 'Building low-latency stock exchange platform that executes orders and maintains an order book.',
    medium: 'CUSTOM WEBGL FRAGMENT SHADER',
    image: '/ideas/stock exchange.jpg',
    rotation: -2,
    tags: ['WebGL', 'GLSL', 'Simulation', 'Audio-Reactive'],
  },
  {
    id: 'exp-2',
    title: 'Kinetic Serif',
    subtitle: 'Variable font collision mechanics under spring physics & fluid forces',
    medium: 'RIGID BODY TYPE DYNAMICS',
    image: '/ideas/medical records.jpg',
    rotation: 3.5,
    tags: ['Variable Fonts', 'Spring Physics', 'Fluidity'],
  },
  {
    id: 'exp-3',
    title: 'Monolith Void',
    subtitle: 'Brutalist concrete spatial study in monochromatic shadow & light',
    medium: 'BLENDER & THREE.JS INSTANCING',
    image: '/ideas/climate change.jpg',
    rotation: -1.5,
    tags: ['Architecture', 'Point Cloud', 'Three.js'],
  },
  {
    id: 'exp-4',
    title: 'Spectral Glass',
    subtitle: 'Chromatic dispersion & real-time refractive caustics',
    medium: 'MULTI-PASS RENDER BUFFER',
    image: '/ideas/accident detection.jpg',
    rotation: 2,
    tags: ['Caustics', 'Optical Physics', 'Dispersion'],
  },
  {
    id: 'exp-5',
    title: 'Neural Glyphs',
    subtitle: 'Generative asemic calligraphy written by recurrent vector agents',
    medium: 'PARAMETRIC BEZIER SPLINES',
    image: '/ideas/audiobook.jpg',
    rotation: -3,
    tags: ['Generative', 'Vector Math', 'Asemic'],
  },
  {
    id: 'exp-6',
    title: 'Aura Fields',
    subtitle: 'High-frequency noise contours with subtle iridescent wavelength shift',
    medium: 'SIMPLEX NOISE GRADIENT FIELDS',
    image: '/ideas/bus health.jpg',
    rotation: 1.5,
    tags: ['Colorimetry', 'Ambient Noise', 'Topologies'],
  },
  {
    id: 'exp-7',
    title: 'Aura Fields',
    subtitle: 'High-frequency noise contours with subtle iridescent wavelength shift',
    medium: 'SIMPLEX NOISE GRADIENT FIELDS',
    image: '/ideas/translate books.jpg',
    rotation: 1.5,
    tags: ['Colorimetry', 'Ambient Noise', 'Topologies'],
  },
  {
    id: 'exp-8',
    title: 'Aura Fields',
    subtitle: 'High-frequency noise contours with subtle iridescent wavelength shift',
    medium: 'SIMPLEX NOISE GRADIENT FIELDS',
    image: '/ideas/trading.jpg',
    rotation: 1.5,
    tags: ['Colorimetry', 'Ambient Noise', 'Topologies'],
  },
];

