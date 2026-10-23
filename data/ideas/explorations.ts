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
    title: 'Orbital Flux',
    subtitle: 'Raymarched volume fluid simulation in custom GLSL shaders',
    medium: 'CUSTOM WEBGL FRAGMENT SHADER',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=900&auto=format&fit=crop',
    rotation: -2,
    tags: ['WebGL', 'GLSL', 'Simulation', 'Audio-Reactive'],
  },
  {
    id: 'exp-2',
    title: 'Kinetic Serif',
    subtitle: 'Variable font collision mechanics under spring physics & fluid forces',
    medium: 'RIGID BODY TYPE DYNAMICS',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
    rotation: 3.5,
    tags: ['Variable Fonts', 'Spring Physics', 'Fluidity'],
  },
  {
    id: 'exp-3',
    title: 'Monolith Void',
    subtitle: 'Brutalist concrete spatial study in monochromatic shadow & light',
    medium: 'BLENDER & THREE.JS INSTANCING',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop',
    rotation: -1.5,
    tags: ['Architecture', 'Point Cloud', 'Three.js'],
  },
  {
    id: 'exp-4',
    title: 'Spectral Glass',
    subtitle: 'Chromatic dispersion & real-time refractive caustics',
    medium: 'MULTI-PASS RENDER BUFFER',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=900&auto=format&fit=crop',
    rotation: 2,
    tags: ['Caustics', 'Optical Physics', 'Dispersion'],
  },
  {
    id: 'exp-5',
    title: 'Neural Glyphs',
    subtitle: 'Generative asemic calligraphy written by recurrent vector agents',
    medium: 'PARAMETRIC BEZIER SPLINES',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=900&auto=format&fit=crop',
    rotation: -3,
    tags: ['Generative', 'Vector Math', 'Asemic'],
  },
  {
    id: 'exp-6',
    title: 'Aura Fields',
    subtitle: 'High-frequency noise contours with subtle iridescent wavelength shift',
    medium: 'SIMPLEX NOISE GRADIENT FIELDS',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=900&auto=format&fit=crop',
    rotation: 1.5,
    tags: ['Colorimetry', 'Ambient Noise', 'Topologies'],
  },
];

