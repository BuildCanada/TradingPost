"use client";

import { useState, useEffect } from "react";
import { WidgetProps } from "./types";

const builders = [
  {
    name: "Diana Matheson",
    tagline: "Building the Future of Canadian Soccer",
    quote: "If there\u2019s something you want to do and you feel like you\u2019re the right person for the job, go do it.",
    gif: "/assets/images/diana-matheson-canadian-soccer.gif",
  },
  {
    name: "Robert Bourassa",
    tagline: "The Project of the Century",
    quote: "Never let it be said that we shall live like paupers on a land this rich.",
    gif: "/assets/images/robert-bourassa-quebec-premier.gif",
  },
  {
    name: "Mary Pickford",
    tagline: "She Invented the Movie Star",
    quote: "You may have a fresh start any moment you choose, for this thing that we call \u2018failure\u2019 is not the falling down, but the staying down.",
    gif: "/assets/images/mary-pickford-hollywood-pioneer.gif",
  },
  {
    name: "Alexander Graham Bell",
    tagline: "A Life Wired for Meaning",
    quote: "The inventor looks upon the world and is not contented with things as they are. He wants to improve whatever he sees.",
    gif: "/assets/images/alexander-graham-bell-inventor.gif",
  },
];

export default function GreatBuildersWidget({ project }: WidgetProps) {
  const [index, setIndex] = useState(0);
  const builder = builders[index];

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % builders.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row">
      {/* GIF — on top for mobile, right side for desktop */}
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
              className={`block rounded-full transition-all ${
                i === index
                  ? "w-[10px] h-[5px] bg-white"
                  : "w-[5px] h-[5px] bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
      {/* Left: description + quote + author */}
      <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
        {/* Top: description */}
        {project.description && (
          <p className="type-caption text-[var(--color-text-secondary)]">
            {project.description}
          </p>
        )}
        {/* Middle: quote */}
        <div className="relative flex-1 flex items-center py-2">
          {builders.map((b, i) => (
            <div
              key={b.name}
              className={`${i === index ? "relative" : "absolute inset-0 pointer-events-none"} flex items-center`}
              style={{ visibility: i === index ? "visible" : "hidden" }}
              aria-hidden={i !== index}
            >
              <p className="type-caption font-sans font-medium text-[var(--color-dark)] line-clamp-3">
                &ldquo;{b.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
        {/* Bottom: author */}
        <div>
          <p className="type-heading text-[13px] text-[var(--color-dark)] leading-tight mb-1">
            {builder.name}
          </p>
          <p className="type-label-sm text-[var(--color-text-secondary)] uppercase truncate">
            {builder.tagline}
          </p>
        </div>
      </div>

      {/* Divider — desktop only */}
      <div className="hidden md:block w-px bg-[var(--color-border-light)] shrink-0" />

      {/* Right: gif — desktop only */}
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
              className={`block rounded-full transition-all ${
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
