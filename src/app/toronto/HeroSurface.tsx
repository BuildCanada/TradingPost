"use client";

import { useState } from "react";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { EmailCapture } from "./EmailCapture";

/* The Toronto hero: the same view, photographed in daylight and at blue hour.
   Which one you land on is decided on the server from where the sun actually
   is over the city (see @/lib/daylight), and the toggle in the corner lets a
   reader override it.

   The scrim and every type colour move with the photograph, not just the file
   — light copy over a dark wash reads as evening, dark copy over a pale wash
   reads as afternoon, and either applied to the wrong picture is illegible.

   The day scrim is the heavier of the two on purpose. Measured on the actual
   frame, the darkest pixels behind the centred type (glass towers in shadow)
   sit at 5% grey, and the veil has to lift the whole band to 152/255 before
   charcoal clears WCAG AA on the worst of them — which it now does, at
   5.2:1. The night frame needs far less, because its type band is dark
   almost everywhere already. */

export type HeroMode = "day" | "night";

const VARIANTS: Record<
  HeroMode,
  {
    src: string;
    alt: string;
    scrim: string;
    heading: string;
    accent: string;
    lead: string;
    formTone: "dark" | "light";
    /** the corner toggle: a bare icon, so it carries its own soft shadow to
     *  stay findable over the busiest part of either photograph */
    toggle: string;
    /** what the toggle switches *to* — the icon and the label describe that */
    switchLabel: string;
  }
> = {
  day: {
    src: "/assets/images/toronto/hero-day.jpg",
    alt: "The Toronto skyline under a clear blue sky, the CN Tower at its centre, seen across Lake Ontario",
    scrim: "bg-gradient-to-b from-linen-100/45 via-linen-100/70 to-linen-100/50",
    heading: "text-charcoal-1000",
    accent: "text-auburn-800",
    // Full strength, not a tint: at 90% the lead dropped to 4.4:1 against the
    // darkest part of the band, just under AA. Size carries the hierarchy.
    lead: "text-charcoal-1000",
    formTone: "light",
    toggle:
      "text-charcoal-1000/40 hover:text-charcoal-1000/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.55)]",
    switchLabel: "Switch to the night-time skyline",
  },
  night: {
    src: "/assets/images/toronto/hero-night.jpg",
    alt: "The Toronto skyline lit up at blue hour, with the CN Tower in red, seen across Lake Ontario",
    scrim: "bg-gradient-to-b from-black/25 via-black/55 to-black/40",
    heading: "text-linen-100",
    accent: "text-auburn-200",
    lead: "text-linen-100/90",
    formTone: "dark",
    toggle:
      "text-linen-100/45 hover:text-linen-100/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
    switchLabel: "Switch to the daytime skyline",
  },
};

const MODES: HeroMode[] = ["day", "night"];

export function HeroSurface({ initialMode }: { initialMode: HeroMode }) {
  const [mode, setMode] = useState<HeroMode>(initialMode);
  /* Only the photograph the reader actually landed on is in the DOM to begin
     with — the hero is the LCP element and mounting both would put a second
     full-bleed image on the critical path for a toggle most people never
     touch. The other is mounted on first use and then stays, so every
     subsequent switch cross-fades instead of re-fetching. */
  const [mounted, setMounted] = useState<HeroMode[]>([initialMode]);

  const variant = VARIANTS[mode];

  function toggle() {
    const next: HeroMode = mode === "day" ? "night" : "day";
    setMounted((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setMode(next);
  }

  return (
    <section className="relative border-b border-border-light w-full overflow-hidden">
      {MODES.filter((m) => mounted.includes(m)).map((m) => (
        <Image
          key={m}
          src={VARIANTS[m].src}
          alt={m === mode ? VARIANTS[m].alt : ""}
          aria-hidden={m !== mode}
          fill
          priority={m === initialMode}
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-500 ${
            m === mode ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Scrim: weighted to the centre, because the skyline is the busiest,
          highest-contrast band of either photograph and it falls exactly
          where the centred type sits. The sky above and water below need
          almost none of it. Both are mounted so they cross-fade with the
          image — gradient utilities can't transition into one another. */}
      {MODES.map((m) => (
        <div
          key={m}
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-500 ${
            VARIANTS[m].scrim
          } ${m === mode ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {/* Sits above the scrim but below the sticky nav's z-50, so the nav
          simply passes over it on scroll. No border, no fill, no blur — just
          the glyph, which is why it keeps a 40px transparent hit area and a
          focus ring of its own: there is no longer a box to outline. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={variant.switchLabel}
        title={variant.switchLabel}
        className={`absolute top-5 right-5 z-10 grid size-10 place-items-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${variant.toggle}`}
      >
        {/* The icon shows the mode you would move to, not the one you are in. */}
        {mode === "day" ? (
          <Moon className="size-[17px]" strokeWidth={1.5} aria-hidden />
        ) : (
          <Sun className="size-[17px]" strokeWidth={1.5} aria-hidden />
        )}
      </button>

      {/* Content sits in normal flow rather than absolutely positioned, so the
          hero grows to fit the copy instead of clipping it at a fixed aspect. */}
      <div className="relative flex min-h-[85svh] md:min-h-[860px] flex-col justify-center px-5 py-16 md:py-20">
        <div className="w-full max-w-[1080px] mx-auto text-center">
          <h1
            className={`type-display transition-colors duration-500 ${variant.heading}`}
          >
            Vote for the Toronto
            <br />
            <span className={`transition-colors duration-500 ${variant.accent}`}>
              you know is possible.
            </span>
          </h1>
          <p
            className={`type-lead max-w-[560px] mx-auto mt-6 transition-colors duration-500 ${variant.lead}`}
          >
            Coverage of the October 26 election and bold ideas for the city for the future.
          </p>
          <EmailCapture
            id="hero-email"
            source="inline"
            tone={variant.formTone}
            className="mt-8 max-w-[520px] mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
