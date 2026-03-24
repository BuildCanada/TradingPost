"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import TestimonialsBlock from "@/components/TestimonialsBlock";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: string;
  photo: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
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
        src="/assets/images/canadian-pacific-railway-rocky-mountains.webp"
        alt="Canadian Pacific Railway freight train running alongside the Bow River through the Rocky Mountains"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none select-none brightness-[0.35]"
      />
      <div className="relative z-10 max-w-[1080px] w-full mx-auto">
        <SectionLabel className="pb-2 !text-[var(--color-bg)] !opacity-60">Who We Are</SectionLabel>
        <h1 className="type-title mb-4 max-w-[700px] text-[var(--color-bg)]">
          Building a Better Canada.
        </h1>
        <p className="type-body max-w-[600px] text-[var(--color-bg)] opacity-70">
          Build Canada is a civic organization on a mission to make Canada the most prosperous country in the world. We publish bold policy research, build transparency tools, and bring together Canadian builders who are ready to act.
        </p>
      </div>
    </section>
  );
}

const firstMemos = [
  { title: "Canadians are Ready to Build", slug: "ready-to-build", author: "Build Canada" },
  { title: "Free Zoning to Build More Homes", slug: "housing-zoning", author: "Julie Di Lorenzo" },
  { title: "Use Industrial Policy to Claim Canada's Place in Space", slug: "claim-space", author: "Mina Mitry" },
];

const storyItems = [
  {
    key: "founding",
    title: "A Canada in Crisis",
    icon: "/assets/icons/book-list-icon.svg",
    content: (
      <div className="space-y-4">
        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Canada&apos;s productivity is slipping. GDP per Capita, Worker Productivity, Inflation, and other domestic economic measures of health across the board are declining.
        </p>

        {/* Exhibit images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/productivity-growth-by-country-oecd.webp" alt="Bar chart showing OECD productivity growth by country from 2019 to 2024, with Canada ranking near the bottom at less than 0.5 percent" className="w-full border border-[var(--color-border-light)]" />
            <p className="type-label-sm text-[var(--color-text-muted)] mt-1">Source: <a href="https://data.oecd.org/lprdty/gdp-per-hour-worked.htm" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">OECD</a></p>
          </div>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/canada-falling-standard-of-living.webp" alt="Line chart comparing Canada and U.S. real GDP per capita from 2016 to 2023, showing Canada's standard of living falling behind" className="w-full border border-[var(--color-border-light)]" />
            <p className="type-label-sm text-[var(--color-text-muted)] mt-1">Source: <a href="https://www.theglobeandmail.com/business/commentary/article-cost-of-living-crisis-data-perception/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">The Globe and Mail</a>, NBF Economics and Strategy</p>
          </div>
        </div>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Build Canada started because a group of founders looked at the data — falling productivity, declining investment, rising brain drain — and decided to stop waiting for someone else to fix it. What began as a conversation became a movement: bold policy ideas that spread across the country and sparked a national conversation about the Canada we could build.
        </p>

        {/* First 3 memos */}
        <div>
          <p className="type-label-sm text-[var(--color-text-muted)] mb-2">The First 3 Build Canada Memos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {firstMemos.map((memo) => (
              <Link
                key={memo.slug}
                href={`/memos/${memo.slug}`}
                className="border border-[var(--color-border-light)] p-3 flex flex-col gap-1.5 group hover:bg-[var(--color-border-light)]/20 transition-colors"
              >
                <h4 className="type-caption font-sans font-medium tracking-tight group-hover:text-[var(--color-accent)] transition-colors line-clamp-2" style={{ lineHeight: 1.1 }}>
                  {memo.title}
                </h4>
                <p className="type-label-sm text-[var(--color-text-secondary)]">
                  {memo.author}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "publishing",
    title: "Publishing Policy",
    icon: "/assets/icons/court-list-icon.svg",
    content: (
      <div className="space-y-4">
        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Build Canada isn&apos;t just commentary. We take pride in our carefully crafted Policy Memos published by prominent Canadian Builders at the forefront of the new economy.
        </p>

        {/* Success Story header */}
        <div className="border-t border-[var(--color-border-light)] pt-3">
          <p className="type-label text-[var(--color-accent)]">Success Story: SR&amp;ED Reforms</p>
        </div>

        {/* Shopify policy reform photo */}
        <div className="max-w-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/shopify-sred-policy-reform-article.webp" alt="Canadian Press article headline: Shopify helps feds with key piece of budget policy on SR&ED reform" className="w-full border border-[var(--color-border-light)]" />
          <p className="type-label-sm text-[var(--color-text-muted)] mt-1">Source: <a href="https://www.thecanadianpressnews.ca/national/ottawa-is-rebooting-its-relationship-with-the-tech-industry-advocates-say/article_38f627a3-3087-58a1-bb49-aeeb1993582e.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">The Canadian Press</a>, Nov 2025</p>
        </div>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Back in July of 2025, the Federal Government approached Shopify seeking their input for a series of desired SR&amp;ED reforms. Shopify President Harley Finkelstein had already published a memo on Build Canada&apos;s platform criticizing the program&apos;s complexity.
        </p>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Shopify handed back a complete SR&amp;ED redesign based on what was in Harley&apos;s Build Canada memo within 48 hours. As Prime Minister Mark Carney later <a href="https://panow.com/2025/11/22/ottawa-is-rebooting-its-relationship-with-the-tech-industry-advocates-say/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent)] transition-colors">told the Chamber of Commerce of Metropolitan Montreal</a>: &ldquo;We went to Shopify and said, &apos;Can you help us redesign this process?&apos; Somewhat embarrassingly, they came back in 48 hours and said, &apos;Do this.&apos;&rdquo;
        </p>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          The result: Budget 2025 included sweeping SR&amp;ED reforms — upfront funding approval instead of rebates, doubled annual expenditure limits to $6 million, and AI-powered audits to reduce bureaucratic burden. A $4.5 billion program that had become bogged down by consultants absorbing 25–33% of every dollar was finally getting fixed — and it started with a Build Canada memo.
        </p>

        {/* SR&ED memo link */}
        <Link
          href="/memos/fix-sred"
          className="border border-[var(--color-border-light)] p-3 flex flex-col gap-1.5 group hover:bg-[var(--color-border-light)]/20 transition-colors"
        >
          <h4 className="type-caption font-sans font-medium tracking-tight group-hover:text-[var(--color-accent)] transition-colors" style={{ lineHeight: 1.1 }}>
            Fix Canada&apos;s Primary R&amp;D Program
          </h4>
          <p className="type-label-sm text-[var(--color-text-secondary)]">
            Harley Finkelstein
          </p>
        </Link>

        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          There are many more stories like this now, and more unravelling. Together we can bring into existence the policy which makes us sovereign, prosperous, and (most importantly) fast.
        </p>
      </div>
    ),
  },
  {
    key: "culture",
    title: "Shifting Culture",
    icon: "/assets/icons/light-list-icon.svg",
    content: (
      <div className="space-y-4">
        <p className="type-body text-[var(--color-dark)] leading-relaxed">
          Policy alone won&apos;t fix Canada — culture has to shift too. We&apos;re working to rebuild a national identity rooted in ambition, competence, and urgency. That means celebrating builders, challenging complacency, and making it unacceptable to settle for mediocrity. We are a nation of Builders, after all.
        </p>

        {/* Embedded tweet */}
        <div className="max-w-[480px]">
          <blockquote className="twitter-tweet" data-theme="light">
            <p lang="en" dir="ltr">Canada is a Nation of Builders 🇨🇦🏗️ <a href="https://t.co/DCud9QpINW">pic.twitter.com/DCud9QpINW</a></p>
            &mdash; Build Canada (@build_canada) <a href="https://twitter.com/build_canada/status/1996331071885992086">December 3, 2025</a>
          </blockquote>
        </div>

        {/* Follow us on socials */}
        <div className="flex items-center gap-3 pt-1">
          <p className="type-label-sm text-[var(--color-dark)]">Follow us on socials:</p>
          <div className="flex items-center gap-1.5">
            {[
              { icon: "/assets/icons/platform-x-twitter.svg", href: "https://x.com/build_canada", label: "X" },
              { icon: "/assets/icons/platform-linkedin.svg", href: "https://www.linkedin.com/company/buildcanada", label: "LinkedIn" },
              { icon: "/assets/icons/platform-instagram.svg", href: "https://www.instagram.com/build_canada/", label: "Instagram" },
              { icon: "/assets/icons/substack-icon.svg", href: "https://buildcanada.substack.com/", label: "Substack" },
              { icon: "/assets/icons/platform-youtube.svg", href: "https://www.youtube.com/@BuildCanada", label: "YouTube" },
            ].map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt={label} width={16} height={16} className="brightness-0 opacity-50 hover:opacity-90 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

function StoryItem({
  item,
  isOpen,
  onToggle,
  isLast,
}: {
  item: (typeof storyItems)[number];
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Timeline | null>(null);
  const prevOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen === prevOpen.current) return;
    prevOpen.current = isOpen;

    const el = contentRef.current;
    if (!el) return;

    if (tweenRef.current) tweenRef.current.kill();

    if (isOpen) {
      gsap.set(el, { display: "block" });
      tweenRef.current = gsap
        .timeline()
        .fromTo(
          el,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
        );
    } else {
      tweenRef.current = gsap.timeline().to(el, {
        height: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(el, { display: "none" });
        },
      });
    }
  }, [isOpen]);

  return (
    <div className="flex gap-4">
      {/* Left column: icon bubble + vertical line */}
      <div className="flex flex-col items-center">
        <button
          onClick={onToggle}
          className={`w-[36px] h-[36px] mt-1 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
            isOpen
              ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
              : "bg-[var(--color-bg)] border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          }`}
        >
          <div
            className="w-[16px] h-[16px]"
            style={{
              backgroundColor: "currentColor",
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
        </button>
        {!isLast && (
          <div
            className="w-[2px] flex-1 rounded-full transition-colors duration-300 mt-1.5 mb-1.5"
            style={{
              backgroundColor: isOpen ? "var(--color-accent)" : "var(--color-border-light)",
            }}
          />
        )}
      </div>

      {/* Right column: title + expandable text */}
      <div className={`flex-1 ${isLast ? "" : "pb-5"}`}>
        <button
          onClick={onToggle}
          className={`flex items-center justify-between cursor-pointer group w-full text-left h-[44px] px-3 transition-colors ${
            isOpen
              ? "bg-[var(--color-accent)]"
              : "hover:bg-[var(--color-border-light)]/20"
          }`}
        >
          <h3
            className={`type-heading text-[14px] transition-colors duration-200 ${
              isOpen ? "text-white" : "text-[var(--color-dark)] group-hover:text-[var(--color-accent)]"
            }`}
          >
            {item.title}
          </h3>
          <span
            className={`text-[14px] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : "text-[var(--color-text-secondary)]"
            }`}
          >
            &#x25BE;
          </span>
        </button>
        <div
          ref={contentRef}
          className="overflow-hidden"
          style={{ display: "none", height: 0, opacity: 0 }}
        >
          <div className="mt-4">
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}

function OurStoryBlock() {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
      <div className="max-w-[1080px] mx-auto">
        <SectionLabel>Our Story</SectionLabel>
        <div className="mt-4">
          {storyItems.map((item, i) => (
            <StoryItem
              key={item.key}
              item={item}
              isOpen={openSet.has(i)}
              onToggle={() => toggle(i)}
              isLast={i === storyItems.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const platformItems = [
  {
    title: "Sovereign",
    description: "Control our supply chains, defend our borders, and depend on no one.",
    color: "#7B23CD",
    icon: "/assets/icons/newmapleleaf.svg",
    expandedHeader: "We believe in a patriotism rooted not in exclusion but in ambition — the conviction that Canada can and should be among the most prosperous, innovative, and free nations on earth.",
    expandedBullets: [
      "True sovereignty comes from the ability to build what we need ourselves — energy, technology, defence, and infrastructure",
      "Invest in domestic defence manufacturing and Arctic infrastructure",
      "Build housing, infrastructure, energy, and industry at the pace and scale the country demands",
    ],
  },
  {
    title: "Opportunistic",
    description: "Free markets, merit-based systems, and a fair starting line for every Canadian.",
    color: "#BE4A10",
    icon: "/assets/icons/increase.svg",
    expandedHeader: "Canada thrives when markets are open, competition is real, and merit is the standard. We champion the removal of genuine barriers while preserving the rewards that flow from effort and ability. The question is always the same: Can you do the work?",
    expandedBullets: [
      "Defend free markets and merit-based systems that let the best ideas and businesses win",
      "Remove regulatory barriers that prevent small businesses and startups from competing",
      "Create tax incentives that reward risk-taking, investment, and job creation",
    ],
  },
  {
    title: "Prosperous",
    description: "An economy where starting a business is simple, growing one is possible, and success is celebrated.",
    color: "#1F5F7F",
    icon: "/assets/icons/crane.svg",
    expandedHeader: "We stand for lower regulatory burden, competitive taxation, faster permitting, and a government that sees enterprise as the engine of national prosperity — not a resource to be extracted from.",
    expandedBullets: [
      "Accelerate housing construction by cutting zoning restrictions and permitting delays",
      "Modernize national infrastructure — transit, broadband, and energy grids",
      "Pursue fiscal discipline that lowers the cost of living and keeps capital in Canada",
    ],
  },
  {
    title: "Fast",
    description: "Impatient with decline. Impatient with managed expectations. Build with urgency.",
    color: "#1B7A33",
    icon: "/assets/icons/fast.svg",
    expandedHeader: "The countries that move fastest on permits, procurement, and policy will win the next decade. We must remove the obstacles — regulatory, ideological, and bureaucratic — that have turned Canada into a country where it takes years to approve what should take months.",
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

const roleGroups = [
  { key: "CORE", label: "Core Team" },
  { key: "BOARD", label: "Board" },
  { key: "ADVISOR", label: "Advisors" },
] as const;

function TeamMemberCard({ m }: { m: TeamMember }) {
  return (
    <div className="flex flex-col items-center text-center gap-0.5 border border-[var(--color-border-light)] -ml-px -mt-px p-4">
      {m.photo ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={m.photo}
          alt={m.name}
          className="w-[80px] h-[80px] object-cover border border-[var(--color-border-light)] mb-1.5"
        />
      ) : (
        <div className="w-[80px] h-[80px] bg-[var(--color-border-light)] border border-[var(--color-border-light)] mb-1.5" />
      )}
      <div>
        <p className="type-heading text-[15px] leading-tight">{m.name}</p>
        <p className="type-caption text-[var(--color-text-secondary)] mt-0.5">{m.title}</p>
      </div>
      {(m.xUrl || m.linkedinUrl) && (
        <div className="flex items-center gap-0.5">
          {m.xUrl && (
            <a
              href={m.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
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
              className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-50">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function TeamBlock({ members }: { members: TeamMember[] }) {
  if (members.length === 0) {
    return (
      <section className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px] border-b border-[var(--color-border-light)]">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel>Team</SectionLabel>
          <div className="flex flex-wrap pl-px pt-px mt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="basis-1/3 md:basis-1/6 flex-grow">
                <div className="flex flex-col items-center gap-2 border border-[var(--color-border-light)] -ml-px -mt-px p-4">
                  <div className="w-[52px] h-[52px] bg-[var(--color-border-light)] border border-[var(--color-border-light)]" />
                  <div className="h-[7px] bg-[var(--color-border-light)] rounded-sm w-[65%]" />
                  <div className="h-[6px] bg-[var(--color-border-light)] rounded-sm w-[80%]" />
                </div>
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
        <div className="mt-4 space-y-10">
          {roleGroups.map(({ key, label }) => {
            const group = members.filter((m) => (m.role || "CORE") === key);
            if (group.length === 0) return null;
            return (
              <div key={key}>
                <h3 className="type-heading text-[14px] text-[var(--color-text-secondary)] mb-4">{label}</h3>
                <div className="flex flex-wrap pl-px pt-px">
                  {group.map((m) => (
                    <div
                      key={m.id}
                      className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 flex-grow"
                    >
                      <TeamMemberCard m={m} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const qnaItems = [
  {
    question: "Is Build Canada affiliated with a political party?",
    answer:
      "No. Build Canada is non-partisan. Our work is driven by one question: how do we make Canada the most prosperous country in the world?",
  },
  {
    question: "How is Build Canada funded?",
    answer:
      "We\u2019re a federally incorporated non-profit organization funded by over 60 individual donors who believe in building a stronger country. We don\u2019t accept government grants or public funding, which keeps us independent.",
  },
  {
    question: "Is Build Canada a lobby group?",
    answer:
      "No. We produce research, build community among Canadian founders and operators, and share policy ideas in public.",
  },
  {
    question: "Do you support a specific policy platform?",
    answer:
      "We champion ideas that make Canada a better place to build and grow our economy \u2014 whether that means tax reform, talent retention, infrastructure investment, or regulatory modernization. If you want to learn more about where we stand and our latest ideas, follow along with our content \u2014 we\u2019re always publishing new ideas and perspectives from builders across the country.",
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
        <p className="type-body text-[var(--color-dark)] pt-2 leading-relaxed">
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    // Load Twitter widget script for embedded tweet
    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js";
      s.async = true;
      document.body.appendChild(s);
    }

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
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)] overflow-x-clip">
      <HeroBlock />
      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <OurStoryBlock />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <PlatformBlock />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
        <TeamBlock members={teamMembers} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.9s" }}>
        <TestimonialsBlock testimonials={testimonials} />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "1.1s" }}>
        <QnaBlock />
      </div>
    </div>
  );
}
