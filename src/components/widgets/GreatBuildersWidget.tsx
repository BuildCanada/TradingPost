"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { builders } from "@/lib/builders";
import { WidgetProps } from "./types";

export default function GreatBuildersWidget({ project }: WidgetProps) {
  const [index, setIndex] = useState(0);
  const builder = builders[index];

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % builders.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full h-[200px] md:hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={builder.gif}
          alt={`${builder.name} — ${builder.tagline}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          {builders.map((_, i) => (
            <span
              key={i}
              className={`block transition-all ${
                i === index
                  ? "w-[10px] h-[5px] bg-white"
                  : "w-[5px] h-[5px] bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-8 lg:p-10 min-w-0">
        {project.description && (
          <p className="type-body-sm text-text-secondary">
            {project.description}
          </p>
        )}

        <div className="relative flex-1 flex items-center py-4">
          {builders.map((b, i) => (
            <div
              key={b.name}
              className={`${i === index ? "relative" : "absolute inset-0 pointer-events-none"} flex items-center`}
              style={{ visibility: i === index ? "visible" : "hidden" }}
              aria-hidden={i !== index}
            >
              <p className="type-body-sm font-sans font-medium text-dark line-clamp-3">
                &ldquo;{b.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <Link href={`/builders/${builder.slug}`} className="group block">
          <p className="font-display text-[1.25rem] lg:text-[1.5rem] font-normal leading-[1.2] text-dark mb-1 group-hover:underline">
            {builder.name}
          </p>
          <p className="type-label-sm text-text-secondary uppercase truncate">
            {builder.tagline}
          </p>
        </Link>
      </div>

      <div className="hidden md:block w-px bg-border-light shrink-0" />

      <div className="hidden md:block w-[45%] shrink-0 relative min-h-[180px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={builder.gif}
          alt={`${builder.name} — ${builder.tagline}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          {builders.map((_, i) => (
            <span
              key={i}
              className={`block transition-all ${
                i === index
                  ? "w-[10px] h-[5px] bg-white"
                  : "w-[5px] h-[5px] bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
