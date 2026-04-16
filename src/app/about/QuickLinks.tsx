"use client";

import { useEffect, useRef, useState } from "react";

interface QuickLink {
  label: string;
  href: string;
}

export default function QuickLinks({ links }: { links: QuickLink[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const link of links) {
      const el = document.querySelector(link.href);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [links]);

  return (
    <div
      ref={ref}
      className="px-5 border-b border-border-light overflow-x-auto scrollbar-none"
    >
      <div className="max-w-[1080px] mx-auto flex gap-6">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`
              type-label whitespace-nowrap py-4 transition-colors border-b-2
              ${active === link.href
                ? "border-dark text-dark"
                : "border-transparent text-text-secondary hover:text-dark"
              }
            `}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
