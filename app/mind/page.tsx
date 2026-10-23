"use client";

import React from "react";
import CosmicStaircaseViewer from "@/app/components/mind/CosmicStaircaseViewer";

/**
 * Mind & More Hub Page — Cosmic Staircase Webpage
 * Route: /mind
 * Displays the interactive 16:9 Cosmic Staircase with the 4 discipline cards:
 *   - Systems (/mind/systems)
 *   - Brain & Biology (/mind/brain-and-biology)
 *   - Finance (/mind/finance)
 *   - Psychology (/mind/psychology)
 */

export default function MindAndMorePage() {
  return (
    <CosmicStaircaseViewer
      videoSrc="/assets/riverflow.mp4"
      backdropImageSrc="/assets/backgroundriver.png"
    />
  );
}
