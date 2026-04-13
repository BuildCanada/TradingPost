"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import SectionLabel from "@/components/SectionLabel";

interface Testimonial {
  id: string;
  name: string;
  quote: string;
  title: string | null;
  companyLogo: string | null;
  profilePhoto: string | null;
  splashPhoto: string | null;
  order: number;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const companyLogo = testimonial.companyLogo;
  return (
    <div className="w-full border border-border-light overflow-hidden bg-bg p-6 md:p-8 flex flex-col relative">
      {/* Company logo background */}
      {companyLogo && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-end"
          style={{ opacity: 0.04, transform: "rotate(-30deg) translateY(30px)", right: "-20px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={companyLogo}
            alt=""
            className="w-[180px] h-[180px] object-contain"
          />
        </div>
      )}

      {/* Quote */}
      <p className="type-body break-words relative" style={{ lineHeight: 1.2 }}>
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Attribution */}
      <div className="flex items-center gap-3 mt-5 relative">
        {testimonial.profilePhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={testimonial.profilePhoto}
            alt={testimonial.name}
            className="w-[40px] h-[40px] rounded-none object-cover"
          />
        ) : (
          <div className="w-[40px] h-[40px] rounded-none bg-border-light" />
        )}
        <div>
          <p className="type-heading text-[14px]">{testimonial.name}</p>
          <p className="text-[12px] text-auburn-800 font-mono uppercase tracking-wide mt-0.5">
            {testimonial.title || ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsBlock({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const gap = 16;

  // Measure immediately before paint so first frame is already centered
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setContainerWidth(w);
    }
  }, [testimonials.length]); // re-run when data arrives (skeleton → carousel)

  // ResizeObserver for ongoing window resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [testimonials.length]); // re-attach when carousel mounts

  const ready = containerWidth > 0;
  // Card width: 450px max, with 40px breathing room so edges don't clip
  const cardW = ready ? Math.min(380, containerWidth - 40) : 380;
  // Center current card within measured container
  const trackOffset = ready
    ? (containerWidth - cardW) / 2 - current * (cardW + gap)
    : 0;

  const goPrev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const goNext = useCallback(() => setCurrent((c) => Math.min(testimonials.length - 1, c + 1)), [testimonials.length]);

  // Touch/swipe support
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const isSwiping = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
    isSwiping.current = true;
    if (trackRef.current) trackRef.current.style.transition = "none";
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${trackOffset + touchDelta.current}px)`;
    }
  }, [trackOffset]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)";
    }
    const threshold = cardW * 0.2;
    if (touchDelta.current < -threshold) {
      goNext();
    } else if (touchDelta.current > threshold) {
      goPrev();
    }
    // Reset — React will apply the correct trackOffset on re-render
  }, [cardW, goNext, goPrev]);

  if (testimonials.length === 0) {
    return (
      <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">Voices</SectionLabel>
          <h2 className="type-h3 text-dark mt-2 mb-1">From the people building Canada.</h2>
          <div className="flex justify-center mt-2">
            <div className="border border-border-light w-[380px] max-w-[90vw]">
              <div className="p-5">
                <div className="space-y-2 mb-4">
                  <div className="h-[7px] bg-border-light rounded-sm w-[95%]" />
                  <div className="h-[7px] bg-border-light rounded-sm w-[80%]" />
                  <div className="h-[7px] bg-border-light rounded-sm w-[60%]" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[28px] h-[28px] rounded-full bg-border-light" />
                  <div>
                    <div className="h-[6px] bg-border-light rounded-sm w-[70px] mb-1.5" />
                    <div className="h-[6px] bg-border-light rounded-sm w-[50px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-border-light">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel as="h2">Voices</SectionLabel>
        <h2 className="type-h3 text-dark mt-2 mb-1">From the people building Canada.</h2>

        <div ref={containerRef} className="relative mt-4 overflow-hidden">
          <div
            ref={trackRef}
            className="flex items-start"
            style={{
              gap: `${gap}px`,
              transform: `translateX(${trackOffset}px)`,
              transition: ready ? "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {testimonials.map((t, i) => {
              const isCurrent = i === current;
              return (
                <div
                  key={t.id}
                  className="shrink-0 cursor-pointer overflow-hidden min-w-0"
                  style={{
                    width: cardW,
                    transform: isCurrent ? "scale(1)" : "scale(0.92)",
                    opacity: isCurrent ? 1 : 0.4,
                    transformOrigin: "center center",
                    transition: "transform 0.4s ease, opacity 0.4s ease",
                  }}
                  onClick={() => setCurrent(i)}
                >
                  <TestimonialCard testimonial={t} />
                </div>
              );
            })}
          </div>

          {/* Gradient overlays on edges — hidden below 710px */}
          <div
            className="absolute inset-y-0 left-0 w-[120px] pointer-events-none hidden min-[710px]:block"
            style={{
              background: "linear-gradient(to right, var(--color-bg) 0%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-y-0 right-0 w-[120px] pointer-events-none hidden min-[710px]:block"
            style={{
              background: "linear-gradient(to left, var(--color-bg) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-3">
            <button
               aria-label="Previous testimonial"
               onClick={goPrev}
               className="w-12 h-12 border border-border-light flex items-center justify-center text-[15px] text-text-secondary hover:border-dark transition-colors"
             >
               &#8249;
             </button>
             <div className="flex gap-1.5">
               {testimonials.map((_, i) => (
                 <button
                   key={i}
                   aria-label={`Go to testimonial ${i + 1}`}
                   onClick={() => setCurrent(i)}
                   className="w-12 h-12 flex items-center justify-center cursor-pointer"
                 >
                   <span
                     className={`block rounded-full transition-all ${
                       i === current
                         ? "h-[6px] w-[14px] bg-dark"
                         : "h-[6px] w-[6px] bg-border-light hover:bg-text-secondary"
                     }`}
                   />
                 </button>
               ))}
             </div>
             <button
               aria-label="Next testimonial"
               onClick={goNext}
               className="w-12 h-12 border border-border-light flex items-center justify-center text-[15px] text-text-secondary hover:border-dark transition-colors"
            >
              &#8250;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
