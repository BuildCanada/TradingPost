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
    <div className="h-full flex">
      {/* Left: title + quote + author */}
      <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
        {/* Top: title + description */}
        <div>
          <span className="type-label font-bold text-[10px] text-[var(--color-text-secondary)]">
            {project.title}
          </span>
          {project.description && (
            <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">
              {project.description}
            </p>
          )}
        </div>
        {/* Middle: quote — flex-1 to fill space evenly between title and author */}
        <div className="relative flex-1 flex items-center py-3">
          {builders.map((b, i) => (
            <div
              key={b.name}
              className={`${i === index ? "relative" : "absolute inset-0 pointer-events-none"} flex items-center`}
              style={{ visibility: i === index ? "visible" : "hidden" }}
              aria-hidden={i !== index}
            >
              <p
                className="text-[12px] leading-snug text-[var(--color-dark)] line-clamp-4"
                style={{ fontFamily: '"Test Financier Text", serif', fontStyle: "italic" }}
              >
                &ldquo;{b.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
        {/* Bottom: author */}
        <div>
          <p className="type-heading text-[13px] text-[var(--color-dark)] leading-tight">
            {builder.name}
          </p>
          <p className="text-[10px] font-mono text-[var(--color-text-secondary)] truncate">
            {builder.tagline}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-[var(--color-border-light)] shrink-0" />

      {/* Right: gif fills the space, with dot indicators overlaid */}
      <div className="w-[45%] shrink-0 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={builder.gif}
          alt={`${builder.name} — ${builder.tagline}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dot indicators */}
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
