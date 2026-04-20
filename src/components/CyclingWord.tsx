"use client";

import { useEffect, useRef, useState } from "react";

const words = [
  "Better",
  "Richer",
  "Faster",
  "Stronger",
  "Bolder",
];

type Phase = "in" | "visible" | "out";

export default function CyclingWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("in");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const enterTimeout = setTimeout(() => setPhase("visible"), 50);
    return () => clearTimeout(enterTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Slide out downward
      setPhase("out");
      setTimeout(() => {
        // Move to top position instantly (no transition)
        setIndex((prev) => (prev + 1) % words.length);
        if (ref.current) {
          ref.current.style.transition = "none";
          ref.current.style.transform = "translateY(-110%)";
          ref.current.style.opacity = "0";
          // Force reflow so the browser registers the position
          ref.current.offsetHeight;
          // Re-enable transition and slide in
          ref.current.style.transition = "";
          ref.current.style.transform = "";
          ref.current.style.opacity = "";
        }
        setPhase("visible");
      }, 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const transform =
    phase === "in"
      ? "translateY(-110%)"
      : phase === "out"
        ? "translateY(110%)"
        : "translateY(0)";

  const opacity = phase === "visible" ? 1 : 0;

  return (
    <span
      className="inline-block overflow-hidden align-bottom pb-[0.1em] pr-[0.05em]"
      style={{ WebkitTextStroke: "1px white" }}
    >
      <span
        ref={ref}
        className="inline-block transition-all duration-200 ease-out"
        style={{ transform, opacity }}
      >
        {words[index]}
      </span>
    </span>
  );
}
