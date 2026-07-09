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
      const w = Math.min(1040, Math.max(320, el.clientWidth - 16));
      const h = Math.max(320, Math.min(460, Math.round(w * 0.5)));
      setSize({ width: w, height: h });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}
