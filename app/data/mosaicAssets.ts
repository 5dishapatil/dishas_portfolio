/**
 * Explicit Asset Manifest & Spherical Deformation Configuration
 * for the Cursor-Reactive Spherical Music Mosaic.
 *
 * HOW TO REPLACE IMAGES:
 * Place your image files inside the project's root `assets/` folder (`e:\Trial\motion_graphic_website\assets\`)
 * using the filenames `mosaic-01.jpg` through `mosaic-30.jpg` (or `.png` / `.webp`),
 * OR edit the `src` paths in `mosaicAssets` below.
 *
 * HOW TO ADD OR REMOVE IMAGES:
 * Add or remove entries in the `mosaicAssets` array below. The mosaic layout engine
 * automatically packs all entries into a dense, balanced multi-column grid.
 */

export interface SphericalEffectConfig {
  /** Radius of the cursor-driven spherical dome in CSS pixels (default: 440) */
  bulgeRadius: number;
  /** Peak 3D convex curvature and radial magnification strength, 0.0 to 1.25 (default: 0.42) */
  bulgeStrength: number;
  /** Pointer tracking interpolation factor per 60fps frame, 0.04 to 0.35 (default: 0.14) */
  followSmoothing: number;
  /** Ease-in / ease-out speed for bulge emergence and flat relaxation, 0.03 to 0.25 (default: 0.09) */
  relaxationSpeed: number;
  /** Horizontal 3D mesh subdivisions for smooth continuous card bending (default: 180) */
  meshColumns: number;
  /** Vertical 3D mesh subdivisions for smooth continuous card bending (default: 120) */
  meshRows: number;
}

export const effectConfig: SphericalEffectConfig = {
  bulgeRadius: 440,
  bulgeStrength: 0.42,
  followSmoothing: 0.14,
  relaxationSpeed: 0.09,
  meshColumns: 180,
  meshRows: 120,
};

export interface MosaicAssetItem {
  id: string;
  /** Path served from the root `assets/` folder via `app/assets/[filename]/route.ts` */
  src: string;
  alt: string;
  title: string;
  artist: string;
  /** Matte music-player card body color (inspired by reference image palette) */
  cardTint: string;
  /** Accent gradient tint for the lower player controls area */
  cardTintBottom: string;
  /** Primary text & icon color on the player card */
  inkColor: string;
  /** Relative vertical weight inside its column (1.0 = standard, 1.22 = featured tall, 0.78 = compact) */
  heightRatio: number;
}

export const mosaicAssets: MosaicAssetItem[] = [
  {
    id: "card-01",
    src: "/assets/mosaic-01.jpg",
    alt: "Snowman",
    title: "Snowman",
    artist: "Sia",
    cardTint: "#B79B84",
    cardTintBottom: "#9A7D66",
    inkColor: "#1A130E",
    heightRatio: 0.95,
  },
  {
    id: "card-02",
    src: "/assets/mosaic-02.jpg",
    alt: "Getaway Car",
    title: "Getaway Car",
    artist: "Taylor Swift",
    cardTint: "#D89A5B",
    cardTintBottom: "#B8783B",
    inkColor: "#1A1108",
    heightRatio: 1.05,
  },
  {
    id: "card-03",
    src: "/assets/mosaic-03.jpg",
    alt: "Illicit Affairs",
    title: "Illicit Affairs",
    artist: "Taylor Swift",
    cardTint: "#74787C",
    cardTintBottom: "#575B60",
    inkColor: "#F4EFEA",
    heightRatio: 1.18,
  },
  {
    id: "card-04",
    src: "/assets/mosaic-04.jpg",
    alt: "Honeybee",
    title: "Honeybee",
    artist: "Olivia Rodrigo",
    cardTint: "#D8D4CE",
    cardTintBottom: "#B8B3AC",
    inkColor: "#181614",
    heightRatio: 1.02,
  },
  {
    id: "card-05",
    src: "/assets/mosaic-05.jpg",
    alt: "Light Switch",
    title: "Light Switch",
    artist: "Charlie Puth",
    cardTint: "#E5A95C",
    cardTintBottom: "#A5C69F",
    inkColor: "#1C140A",
    heightRatio: 1.24,
  },
  {
    id: "card-06",
    src: "/assets/mosaic-06.jpg",
    alt: "Dracula",
    title: "Dracula",
    artist: "Tame Impala",
    cardTint: "#8D9296",
    cardTintBottom: "#6B7075",
    inkColor: "#141618",
    heightRatio: 1.2,
  },
  {
    id: "card-07",
    src: "/assets/mosaic-07.jpg",
    alt: "Namo Namo",
    title: "Namo Namo",
    artist: "Amit Trivedi",
    cardTint: "#C6837A",
    cardTintBottom: "#DE9C93",
    inkColor: "#1E100E",
    heightRatio: 1.15,
  },
  {
    id: "card-08",
    src: "/assets/mosaic-08.jpg",
    alt: "Run Down the City - Monica",
    title: "Run Down the City - Monica",
    artist: "Shashwat Sachdev",
    cardTint: "#6D8EC2",
    cardTintBottom: "#5472A6",
    inkColor: "#0F1724",
    heightRatio: 0.92,
  },
  {
    id: "card-09",
    src: "/assets/mosaic-09.jpg",
    alt: "Birds of a Feather",
    title: "Birds of a Feather",
    artist: "Billie Eilish",
    cardTint: "#E57A2E",
    cardTintBottom: "#C96118",
    inkColor: "#1E0E04",
    heightRatio: 1.0,
  },
  {
    id: "card-10",
    src: "/assets/mosaic-10.jpg",
    alt: "Drop Dead",
    title: "Drop Dead",
    artist: "Olivia Rodrigo",
    cardTint: "#CFCBC6",
    cardTintBottom: "#B2ADA7",
    inkColor: "#181614",
    heightRatio: 1.04,
  },
  {
    id: "card-11",
    src: "/assets/mosaic-11.jpg",
    alt: "Set Fire to the Rain",
    title: "Set Fire to the Rain",
    artist: "Adele",
    cardTint: "#9B8AA8",
    cardTintBottom: "#7E6D8C",
    inkColor: "#16111B",
    heightRatio: 0.96,
  },
  {
    id: "card-12",
    src: "/assets/mosaic-12.jpg",
    alt: "WHERE IS MY HUSBAND?",
    title: "WHERE IS MY HUSBAND?",
    artist: "RAYE",
    cardTint: "#C9AB6B",
    cardTintBottom: "#A8894A",
    inkColor: "#1B1508",
    heightRatio: 1.08,
  },
  {
    id: "card-13",
    src: "/assets/mosaic-13.jpg",
    alt: "So Easy (To Fall in Love)",
    title: "So Easy (To Fall in Love)",
    artist: "Olivia Dean",
    cardTint: "#6E8EA4",
    cardTintBottom: "#517086",
    inkColor: "#0E1820",
    heightRatio: 0.98,
  },
  {
    id: "card-14",
    src: "/assets/mosaic-14.jpg",
    alt: "Just Keep Watching",
    title: "Just Keep Watching",
    artist: "Tate McRae",
    cardTint: "#8E9E78",
    cardTintBottom: "#72825D",
    inkColor: "#141A0E",
    heightRatio: 1.06,
  },
  {
    id: "card-15",
    src: "/assets/mosaic-15.jpg",
    alt: "Rasputin",
    title: "Rasputin",
    artist: "BONEY M.",
    cardTint: "#C8BA9E",
    cardTintBottom: "#AE9E80",
    inkColor: "#1B1710",
    heightRatio: 1.0,
  },
  {
    id: "card-16",
    src: "/assets/mosaic-16.jpg",
    alt: "Man I Need",
    title: "Man I Need",
    artist: "Olivia Dean",
    cardTint: "#D4CEBE",
    cardTintBottom: "#B8B09E",
    inkColor: "#1A1814",
    heightRatio: 1.12,
  },
  {
    id: "card-17",
    src: "/assets/mosaic-17.jpg",
    alt: "back to friends",
    title: "back to friends",
    artist: "sombr",
    cardTint: "#D48FB0",
    cardTintBottom: "#B87294",
    inkColor: "#200E17",
    heightRatio: 0.94,
  },
  {
    id: "card-18",
    src: "/assets/mosaic-18.jpg",
    alt: "Let Her Go",
    title: "Let Her Go",
    artist: "Passenger",
    cardTint: "#D27E85",
    cardTintBottom: "#B56269",
    inkColor: "#1E0C0E",
    heightRatio: 1.02,
  },
  {
    id: "card-19",
    src: "/assets/mosaic-19.jpg",
    alt: "Sailor Song",
    title: "Sailor Song",
    artist: "Gigi Perez",
    cardTint: "#9084B4",
    cardTintBottom: "#736798",
    inkColor: "#141020",
    heightRatio: 0.98,
  },
  {
    id: "card-20",
    src: "/assets/mosaic-20.jpg",
    alt: "Riptide",
    title: "Riptide",
    artist: "Vance Joy",
    cardTint: "#7E94A8",
    cardTintBottom: "#61778B",
    inkColor: "#101820",
    heightRatio: 1.04,
  },
  {
    id: "card-21",
    src: "/assets/mosaic-21.jpg",
    alt: "Snow on the Beach",
    title: "Snow on the Beach",
    artist: "Taylor Swift and more LANA DEL REY",
    cardTint: "#9CB4A0",
    cardTintBottom: "#7E9882",
    inkColor: "#121B14",
    heightRatio: 0.92,
  },
  {
    id: "card-22",
    src: "/assets/mosaic-22.jpg",
    alt: "Belong Together",
    title: "Belong Together",
    artist: "Mark Ambor",
    cardTint: "#7D7A8A",
    cardTintBottom: "#605D6E",
    inkColor: "#F4EFEA",
    heightRatio: 0.96,
  },
  {
    id: "card-23",
    src: "/assets/mosaic-23.jpg",
    alt: "Ordinary",
    title: "Ordinary",
    artist: "Alex Warren",
    cardTint: "#D8D6D2",
    cardTintBottom: "#BCBAB5",
    inkColor: "#181715",
    heightRatio: 1.05,
  },
  {
    id: "card-24",
    src: "/assets/mosaic-24.jpg",
    alt: "Manchild",
    title: "Manchild",
    artist: "Sabrina Carpenter",
    cardTint: "#B29A74",
    cardTintBottom: "#947C57",
    inkColor: "#1A140B",
    heightRatio: 0.95,
  },
  {
    id: "card-25",
    src: "/assets/mosaic-25.jpg",
    alt: "Christmas Tree Farm",
    title: "Christmas Tree Farm",
    artist: "Taylor Swift",
    cardTint: "#B8B4AC",
    cardTintBottom: "#9A968E",
    inkColor: "#181715",
    heightRatio: 0.9,
  },
  {
    id: "card-26",
    src: "/assets/mosaic-26.jpg",
    alt: "Flowers",
    title: "Flowers",
    artist: "Miley Cyrus",
    cardTint: "#9E7A8F",
    cardTintBottom: "#805E72",
    inkColor: "#F5EFE8",
    heightRatio: 0.96,
  },
  {
    id: "card-27",
    src: "/assets/mosaic-27.jpg",
    alt: "No Control",
    title: "No Control",
    artist: "One Direction",
    cardTint: "#6A7888",
    cardTintBottom: "#4E5B6B",
    inkColor: "#F2EEE9",
    heightRatio: 0.92,
  },
  {
    id: "card-28",
    src: "/assets/mosaic-28.jpg",
    alt: "Attention",
    title: "Attention",
    artist: "Charlie Puth",
    cardTint: "#69879B",
    cardTintBottom: "#4D6A7E",
    inkColor: "#0F1820",
    heightRatio: 0.98,
  },
  {
    id: "card-29",
    src: "/assets/mosaic-29.jpg",
    alt: "Levitating",
    title: "Levitating",
    artist: "Dua Lipa",
    cardTint: "#C49E72",
    cardTintBottom: "#A68055",
    inkColor: "#1A130A",
    heightRatio: 0.94,
  },
  {
    id: "card-30",
    src: "/assets/mosaic-30.jpg",
    alt: "There's Nothing Holdin' Me Back",
    title: "There's Nothing Holdin' Me Back",
    artist: "Shawn Mendes",
    cardTint: "#8A7E74",
    cardTintBottom: "#6D6258",
    inkColor: "#F5EFE6",
    heightRatio: 0.96,
  },
];

