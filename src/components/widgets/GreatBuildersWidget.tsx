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

        <div>
          <p className="font-display text-[1.25rem] lg:text-[1.5rem] font-normal leading-[1.2] text-dark mb-1">
            {builder.name}
          </p>
          <p className="type-label-sm text-text-secondary uppercase truncate">
            {builder.tagline}
          </p>
        </div>
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
