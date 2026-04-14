"use client";

import { useState, useEffect } from "react";
import type { Heading } from "./config";

export function useScrollSpy(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    let ticking = false;

    const update = () => {
      const threshold = window.innerHeight * 0.35;
      let lastId: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) lastId = h.id;
      }
      setActiveId(lastId ?? headings[0]?.id ?? null);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return activeId;
}

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const content = document.querySelector("[data-memo-content]");
      if (!content) {
        ticking = false;
        return;
      }
      const rect = content.getBoundingClientRect();
      const total = content.scrollHeight;
      const visible = window.innerHeight;
      const scrolled = -rect.top;
      const pct = Math.min(
        100,
        Math.max(0, (scrolled / (total - visible)) * 100),
      );
      setProgress(Math.round(pct));
      ticking = false;
    };

    const onEvent = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onEvent, { passive: true });
    window.addEventListener("resize", onEvent, { passive: true });
    return () => {
      window.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
    };
  }, []);

  return progress;
}
