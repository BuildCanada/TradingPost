"use client";

import { useEffect, useRef, useState } from "react";

// Tracks the chart container's rendered width and derives clamped Grapher
// bounds from it. Shared by the single-indicator and combined section charts
// (which take the ~2:1 defaults) and the State of the Nation cards, whose
// full-width headline chart passes a panoramic override.
export type ChartSizeOptions = {
  // Upper bound on plot width. Defaults to 1040 — comfortable for a chart
  // sitting in a text column, too narrow for a chart spanning the page.
  maxWidth?: number;
  // Plot height as a fraction of width, above the phone breakpoint.
  aspectRatio?: number;
  maxHeight?: number;
};

export function useChartSize({
  maxWidth = 1040,
  aspectRatio = 0.5,
  maxHeight = 460,
}: ChartSizeOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 480 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      // Never exceed the container: a floor above the phone-width inner size
      // (~264px on a 320px screen) would overflow and clip the right edge.
      const w = Math.min(maxWidth, Math.max(240, el.clientWidth - 16));
      // Portrait-ish on phones — Grapher's line legend eats up to a third of
      // the width there, so extra height keeps the plot area readable. The
      // caller's aspect ratio applies on larger screens.
      const h =
        w < 480
          ? Math.max(320, Math.min(400, Math.round(w * 1.05)))
          : Math.max(320, Math.min(maxHeight, Math.round(w * aspectRatio)));
      setSize({ width: w, height: h });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxWidth, aspectRatio, maxHeight]);

  return { containerRef, size };
}
