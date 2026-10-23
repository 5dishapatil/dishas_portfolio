import React from "react";
import SphericalMosaic from "../components/SphericalMosaic";

export const metadata = {
  title: "01 Music — Sonic Sphere Mosaic | DISHA",
  description:
    "Interactive cursor-reactive spherical music mosaic — starts flat and curves into a 3D sphere wherever your cursor travels.",
};

export default function MusicMosaicPage() {
  return (
    <main className="min-h-screen w-full bg-[#07080D] text-[#F5EFE6]">
      <SphericalMosaic showStandaloneNav />
    </main>
  );
}

