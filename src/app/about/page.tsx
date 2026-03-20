"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import SectionLabel from "@/components/SectionLabel";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  photo: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  order: number;
}

interface Testimonial {
  id: string;
  name: string;
  quote: string;
  profilePhoto: string | null;
  splashPhoto: string | null;
  order: number;
}

function HeroBlock() {
  return (
    <section
      className="relative px-5 min-h-[280px] md:min-h-[420px] flex items-center border-b border-[var(--color-border-light)] overflow-hidden bg-[#3a3a3a]"
    >
      {/* Photo backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/images/train.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none select-none brightness-[0.35]"
      />
      <div className="relative z-10 max-w-[1080px] w-full mx-auto">
        <SectionLabel className="pb-2 !text-[var(--color-bg)] !opacity-60">Who We Are</SectionLabel>
        <h1 className="type-title mb-4 max-w-[700px] text-[var(--color-bg)]">
          Building a bolder Canada.
        </h1>
        <p className="type-body max-w-[600px] text-[var(--color-bg)] opacity-70">
          Canada must get ahead. It will require ambitious thinking, bold choices, and decisive action. Shaping this conversation properly is no small feat; and takes the qualified perspectives of thousands of Canadians. This is our method.
        </p>
      </div>
    </section>
  );
}

const platformItems = [
  {
    title: "Sovereign",
    description: "Strengthening our independence in trade, defence, and strategic decision-making.",
    color: "#7B23CD",
    icon: "/assets/icons/newmapleleaf.svg",
    expandedHeader: "A strong Canada answers to no one. True sovereignty means controlling our own supply chains, defending our own borders, and making strategic decisions without foreign dependency.",
    expandedBullets: [
      "Reduce reliance on single-nation trade relationships by diversifying export markets",
      "Invest in domestic defence manufacturing and Arctic infrastructure",
      "Secure critical supply chains for energy, food, and technology on Canadian soil",
    ],
  },
  {
    title: "Opportunistic",
    description: "Free markets and freedom to pursue opportunity — for every builder.",
    color: "#BE4A10",
    icon: "/assets/icons/increase.svg",
    expandedHeader: "Opportunity belongs to everyone willing to build. Canada thrives when markets are open, barriers are low, and every entrepreneur — regardless of background — has a fair shot at success.",
    expandedBullets: [
      "Remove regulatory barriers that prevent small businesses and startups from competing",
      "Open trade corridors that give Canadian builders direct access to global markets",
      "Create tax incentives that reward risk-taking, investment, and job creation",
    ],
  },
  {
    title: "Prosperous",
    description: "Ensuring prosperity at home through smart infrastructure, housing, and fiscal policy.",
    color: "#1F5F7F",
    icon: "/assets/icons/crane.svg",
    expandedHeader: "Prosperity starts at home. Canadians deserve affordable housing, world-class infrastructure, and a fiscal environment where hard work is rewarded — not taxed into oblivion.",
    expandedBullets: [
      "Accelerate housing construction by cutting zoning restrictions and permitting delays",
      "Modernize national infrastructure — transit, broadband, and energy grids",
      "Pursue fiscal discipline that lowers the cost of living and keeps capital in Canada",
    ],
  },
  {
    title: "Fast",
    description: "Cutting red tape and accelerating the pace of government and institutional action.",
    color: "#1B7A33",
    icon: "/assets/icons/fast.svg",
    expandedHeader: "Speed is a competitive advantage — and Canada is losing it. The countries that move fastest on permits, procurement, and policy will win the next decade. Canada must be one of them.",
    expandedBullets: [
      "Set hard deadlines on government approvals — no project should wait years for a permit",
      "Digitize and streamline procurement so public dollars move at the speed of business",
      "Empower agencies to ship reforms in months, not parliamentary cycles",
    ],
  },
];

function PlatformCard({ item, isOpen, onToggle }: { item: typeof platformItems[number]; isOpen: boolean; onToggle: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleSvgRef = useRef<SVGSVGElement>(null);
  const titleTextRef = useRef<SVGTextElement>(null);
  const expandRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween[]>([]);
  const expandTweenRef = useRef<gsap.core.Timeline | null>(null);
  const prevOpen = useRef(isOpen);

  const baseFontSize = 18;
  const expandedFontSize = Math.round(baseFontSize * 1.5);

  const killTweens = useCallback(() => {
    tweenRef.current.forEach((t) => t.kill());
    tweenRef.current = [];
  }, []);

  const animateOpen = useCallback(() => {
    killTweens();
    if (circleRef.current) {
      tweenRef.current.push(
        gsap.to(circleRef.current, {
          backgroundColor: item.color, borderColor: item.color,
          duration: 0.2, ease: "power2.out",
        })
      );
    }
    if (iconRef.current) {
      tweenRef.current.push(
        gsap.to(iconRef.current, {
          backgroundColor: "#ffffff",
          duration: 0.2, ease: "power2.out",
        })
      );
    }
    if (titleSvgRef.current) {
      tweenRef.current.push(
        gsap.to(titleSvgRef.current, {
          scaleX: 1.25, scaleY: 0.82,
          duration: 0.15, ease: "back.out(1.7)",
        })
      );
    }
    if (titleTextRef.current) {
      tweenRef.current.push(
        gsap.to(titleTextRef.current, {
          fontSize: expandedFontSize, fontWeight: 700, fill: item.color,
          duration: 0.15, ease: "back.out(1.7)",
        })
      );
    }
  }, [killTweens, expandedFontSize, item.color]);

  const animateClose = useCallback(() => {
    killTweens();
    if (circleRef.current) {
      tweenRef.current.push(
        gsap.to(circleRef.current, {
          backgroundColor: "var(--color-bg)", borderColor: "var(--color-border-light)",
          duration: 0.2, ease: "power2.out",
        })
      );
    }
    if (iconRef.current) {
      tweenRef.current.push(
        gsap.to(iconRef.current, {
          backgroundColor: item.color,
          duration: 0.2, ease: "power2.out",
        })
      );
    }
    if (titleSvgRef.current) {
      tweenRef.current.push(
        gsap.to(titleSvgRef.current, {
          scaleX: 1, scaleY: 1,
          duration: 0.2, ease: "power2.out",
        })
      );
    }
    if (titleTextRef.current) {
      tweenRef.current.push(
        gsap.to(titleTextRef.current, {
          fontSize: baseFontSize, fontWeight: 500, fill: "var(--color-dark)",
          duration: 0.2, ease: "power2.out",
        })
      );
    }
  }, [killTweens, baseFontSize, item.color]);

  // React to isOpen changes (handles both self-toggle and external close)
  useEffect(() => {
    if (isOpen === prevOpen.current) return;
    prevOpen.current = isOpen;

    if (isOpen) {
      if (cardRef.current) gsap.to(cardRef.current, { borderColor: item.color, duration: 0.2 });
      animateOpen();

      if (expandRef.current) {
        if (expandTweenRef.current) expandTweenRef.current.kill();
        const el = expandRef.current;
        const bullets = el.querySelectorAll("li");
        const header = el.querySelector(".expand-header");
        gsap.set(el, { display: "block" });
        const tl = gsap.timeline();
        tl.fromTo(el, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.25, ease: "power2.out" });
        if (header) tl.fromTo(header, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, ease: "power2.out" }, "-=0.1");
        tl.fromTo(bullets, { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "power2.out", stagger: 0.05 }, "-=0.1");
        expandTweenRef.current = tl;
      }
    } else {
      if (cardRef.current) gsap.to(cardRef.current, { borderColor: "var(--color-border-light)", duration: 0.2 });
      animateClose();

      if (expandRef.current) {
        if (expandTweenRef.current) expandTweenRef.current.kill();
        const el = expandRef.current;
        expandTweenRef.current = gsap.timeline()
          .to(el, { height: 0, opacity: 0, duration: 0.2, ease: "power2.in", onComplete: () => { gsap.set(el, { display: "none" }); } });
      }
    }
  }, [isOpen, item.color, animateOpen, animateClose]);

  const handleHoverEnter = useCallback(() => {
    animateOpen();
  }, [animateOpen]);

  const handleHoverLeave = useCallback(() => {
    if (isOpen) return;
    animateClose();
  }, [isOpen, animateClose]);

  return (
    <div
      ref={cardRef}
      className="border border-[var(--color-border-light)] flex cursor-pointer transition-colors hover:bg-[var(--color-border-light)]/20"
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      onClick={onToggle}
    >
      {/* Icon section */}
      <div
        ref={circleRef}
        className="w-[56px] shrink-0 flex items-center justify-center bg-[var(--color-bg)] border-r border-[var(--color-border-light)]"
      >
        <div
          ref={iconRef}
          className="w-[20px] h-[20px]"
          style={{
            backgroundColor: item.color,
            maskImage: `url(${item.icon})`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskImage: `url(${item.icon})`,
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
        />
      </div>
      {/* Text section */}
      <div className="min-w-0 flex-1 px-5 py-4">
        <svg
          ref={titleSvgRef}
          className="overflow-visible block"
          height={24}
          style={{ transformOrigin: "left center", willChange: "transform" }}
        >
          <text
            ref={titleTextRef}
            y="18"
            style={{
              fontFamily: '"Test Soehne", sans-serif',
              fontSize: baseFontSize,
              fontWeight: 500,
              fill: "var(--color-dark)",
            }}
          >
            {item.title}
          </text>
        </svg>
        <p className="type-caption text-[var(--color-text-secondary)] mt-1">{item.description}</p>
        <div ref={expandRef} className="overflow-hidden" style={{ display: "none", height: 0, opacity: 0 }}>
          <div className="pt-3">
            <p className="expand-header type-body text-[var(--color-dark)] mb-3 leading-relaxed">
              {item.expandedHeader}
            </p>
            <ul className="space-y-1.5">
              {item.expandedBullets.map((bullet, i) => (
                <li key={i} className="type-caption text-[var(--color-text-secondary)] flex items-start gap-2">
                  <span className="mt-[5px] w-[5px] h-[5px] rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Our Principles</SectionLabel>
        <h2 className="type-heading text-[var(--color-dark)] mt-2 mb-1">Builders believe Canada should be...</h2>
        <div className="flex flex-col gap-3 mt-3">
          {platformItems.map((item, i) => (
            <PlatformCard
              key={item.title}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamBlock({ members }: { members: TeamMember[] }) {
  if (members.length === 0) {
    return (
      <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel>Team</SectionLabel>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-[52px] h-[52px] rounded-full bg-[var(--color-border-light)] border border-[var(--color-border-light)]" />
                <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[65%]" />
                <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[80%]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Team</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8 mt-4">
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center text-center gap-2.5">
              {m.photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={m.photo}
                  alt={m.name}
                  className="w-[80px] h-[80px] rounded-full object-cover border border-[var(--color-border-light)]"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-full bg-[var(--color-border-light)] border border-[var(--color-border-light)]" />
              )}
              <div>
                <p className="type-heading text-[15px] leading-tight">{m.name}</p>
                <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">{m.title}</p>
              </div>
              {(m.xUrl || m.linkedinUrl) && (
                <div className="flex items-center gap-2">
                  {m.xUrl && (
                    <a
                      href={m.xUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/icons/platform-x-twitter.svg"
                        alt="X"
                        width={12}
                        height={12}
                        className="brightness-0 opacity-50"
                      />
                    </a>
                  )}
                  {m.linkedinUrl && (
                    <a
                      href={m.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-50">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-full border border-[var(--color-border-light)] overflow-hidden bg-[var(--color-bg)]">
      {/* Image with quote overlay */}
      <div className="relative">
        {testimonial.splashPhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={testimonial.splashPhoto}
            alt=""
            className="w-full h-[220px] md:h-[260px] object-cover brightness-[0.4]"
          />
        ) : (
          <div className="w-full h-[220px] md:h-[260px] bg-[#2a2a2a]" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          <p className="type-body text-white font-medium" style={{ lineHeight: 1.25 }}>
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </div>
      </div>

      {/* Attribution + title */}
      <div className="p-5 md:p-6 pt-4 md:pt-4">
        <div className="flex items-center gap-3">
          {testimonial.profilePhoto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={testimonial.profilePhoto}
              alt={testimonial.name}
              className="w-[32px] h-[32px] rounded-full object-cover"
            />
          ) : (
            <div className="w-[32px] h-[32px] rounded-full bg-[var(--color-border-light)]" />
          )}
          <div>
            <p className="type-heading text-[14px]">{testimonial.name}</p>
            <p className="text-[12px] text-[var(--color-accent)] font-mono uppercase tracking-wide mt-0.5">
              {testimonial.name.includes("Harley") ? "CEO of Shopify" :
               testimonial.name.includes("Jeff") || testimonial.name.includes("Adamson") ? "CEO of Neo Financial" :
               testimonial.name.includes("Helena") || testimonial.name.includes("Lee") ? "Zander's Best Friend & Fiancée" :
               "TITLE"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsBlock({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const gap = 16;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Below 535px viewport, card fills container (with 2px margin for borders); otherwise fixed 450px
  const cardW = containerWidth > 0 && containerWidth < 495 ? containerWidth - 2 : 450;
  const trackOffset = -(current * (cardW + gap));

  if (testimonials.length === 0) {
    return (
      <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel>Testimonials</SectionLabel>
          <div className="flex justify-center mt-2">
            <div className="border border-[var(--color-border-light)] w-[450px] max-w-[90vw]">
              <div className="p-5">
                <div className="space-y-2 mb-4">
                  <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[95%]" />
                  <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[80%]" />
                  <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[60%]" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[28px] h-[28px] rounded-full bg-[var(--color-border-light)]" />
                  <div>
                    <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[70px] mb-1.5" />
                    <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[50px]" />
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
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Testimonials</SectionLabel>

        <div ref={containerRef} className="relative mt-2 overflow-hidden">
          <div
            className="flex items-start"
            style={{
              gap: `${gap}px`,
              transform: `translateX(calc(50% - ${cardW / 2}px + ${trackOffset}px))`,
              transition: "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {testimonials.map((t, i) => {
              const isCurrent = i === current;
              return (
                <div
                  key={t.id}
                  className="shrink-0 cursor-pointer"
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
              onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
              className="w-[28px] h-[28px] border border-[var(--color-border-light)] flex items-center justify-center text-[15px] text-[var(--color-text-secondary)] hover:border-[var(--color-dark)] transition-colors"
            >
              &#8249;
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-[6px] rounded-full transition-all ${
                    i === current
                      ? "w-[14px] bg-[var(--color-dark)]"
                      : "w-[6px] bg-[var(--color-border-light)] hover:bg-[var(--color-text-secondary)]"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
              className="w-[28px] h-[28px] border border-[var(--color-border-light)] flex items-center justify-center text-[15px] text-[var(--color-text-secondary)] hover:border-[var(--color-dark)] transition-colors"
            >
              &#8250;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const qnaItems = [
  {
    question: "Is Build Canada affiliated with a political party?",
    answer:
      "No. Build Canada is fully nonpartisan. We don\u2019t endorse, fund, or align with any federal, provincial, or municipal political party. Our work is driven by one question: how do we make Canada more competitive?",
  },
  {
    question: "How is Build Canada funded?",
    answer:
      "We\u2019re funded by individual and corporate donations from Canadians who believe in building a stronger country. We don\u2019t accept government grants or public funding, which keeps us independent.",
  },
  {
    question: "Is Build Canada a lobby group?",
    answer:
      "No. We don\u2019t lobby government on behalf of any industry or interest group. We produce research, build community among Canadian founders and operators, and push ideas into the public conversation \u2014 but we don\u2019t work the halls of Parliament.",
  },
  {
    question: "Do you support a specific policy platform?",
    answer:
      "We\u2019re not ideological. We support policies that make Canada a better place to build \u2014 whether that means tax reform, talent retention, infrastructure investment, or regulatory modernization. If it helps Canadian builders compete globally, we\u2019re interested.",
  },
];

function QnaItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof qnaItems)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Timeline | null>(null);
  const prevOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen === prevOpen.current) return;
    prevOpen.current = isOpen;

    const el = answerRef.current;
    if (!el) return;

    if (tweenRef.current) tweenRef.current.kill();

    if (isOpen) {
      gsap.set(el, { display: "block" });
      tweenRef.current = gsap
        .timeline()
        .fromTo(
          el,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.25, ease: "power2.out" }
        );
    } else {
      tweenRef.current = gsap.timeline().to(el, {
        height: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => { gsap.set(el, { display: "none" }); },
      });
    }
  }, [isOpen]);

  return (
    <div className="py-3 border-b border-[var(--color-border-light)] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
      >
        <span className="type-heading text-[15px] text-[var(--color-dark)] group-hover:opacity-70 transition-opacity">
          {item.question}
        </span>
        <span className="w-[18px] h-[18px] border border-[var(--color-border-light)] flex items-center justify-center text-[12px] text-[var(--color-text-muted)] shrink-0 transition-colors group-hover:border-[var(--color-dark)]">
          {isOpen ? "\u2212" : "+"}
        </span>
      </button>
      <div
        ref={answerRef}
        className="overflow-hidden"
        style={{ display: "none", height: 0, opacity: 0 }}
      >
        <p className="type-body text-[var(--color-text-secondary)] pt-2 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

function QnaBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Q&amp;A</SectionLabel>
        <div className="mt-2">
          {qnaItems.map((item, i) => (
            <QnaItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTeamMembers(data); })
      .catch(() => {});
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTestimonials(data); })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
      <HeroBlock />
      <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <PlatformBlock />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <TeamBlock members={teamMembers} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <TestimonialsBlock testimonials={testimonials} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.6s" }}>
        <QnaBlock />
      </div>
    </div>
  );
}
