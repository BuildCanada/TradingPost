"use client";

import { useEffect, useState } from "react";

// Must clear the sticky stack: global navbar (bottom ~70px) + this nav.
const ACTIVATION_OFFSET = 140;

type Section = { id: string; title: string };

export default function SectionNav({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      let current: string | null = null;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVATION_OFFSET) {
          current = section.id;
        }
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  return (
    <nav
      aria-label="Indicator sections"
      className="sticky top-[70px] z-40 border-b border-border-light bg-bg px-5 py-3"
    >
      <div className="max-w-[1080px] mx-auto flex flex-wrap gap-x-6 gap-y-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? "true" : undefined}
              className={
                isActive
                  ? "type-label text-accent underline underline-offset-4 whitespace-nowrap"
                  : "type-label text-dark/60 hover:text-dark underline-offset-4 hover:underline whitespace-nowrap"
              }
            >
              {section.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
