"use client";

import { useEffect, useRef, useState } from "react";

// Tracks the chart container's rendered width and derives clamped ~2:1
// Grapher bounds from it. Shared by the single-indicator and combined
// section charts.
export function useChartSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 480 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      // Never exceed the container: a floor above the phone-width inner size
      // (~264px on a 320px screen) would overflow and clip the right edge.
      const w = Math.min(1040, Math.max(240, el.clientWidth - 16));
      // Portrait-ish on phones — Grapher's line legend eats up to a third of
      // the width there, so extra height keeps the plot area readable. Wide
      // 2:1 on larger screens.
      const h =
        w < 480
          ? Math.max(320, Math.min(400, Math.round(w * 1.05)))
          : Math.max(320, Math.min(460, Math.round(w * 0.5)));
      setSize({ width: w, height: h });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}
