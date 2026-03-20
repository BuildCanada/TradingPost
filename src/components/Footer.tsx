"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

const socials = [
  {
    icon: "/assets/icons/platform-x-twitter.svg",
    href: "https://x.com/build_canada",
    label: "X",
  },
  {
    icon: "/assets/icons/platform-linkedin.svg",
    href: "https://www.linkedin.com/company/buildcanada",
    label: "LinkedIn",
  },
  {
    icon: "/assets/icons/platform-instagram.svg",
    href: "https://www.instagram.com/build_canada/",
    label: "Instagram",
  },
  {
    icon: "/assets/icons/substack-icon.svg",
    href: "https://buildcanada.substack.com/",
    label: "Substack",
  },
  {
    icon: "/assets/icons/platform-youtube.svg",
    href: "https://www.youtube.com/@BuildCanada",
    label: "YouTube",
  },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [leafVisible, setLeafVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLeafVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-[var(--color-dark)] px-5 py-16 md:py-24 lg:pb-10 flex flex-col items-center text-center relative overflow-hidden lg:min-h-[600px]"
    >
      {/* Maple leaf background decoration */}
      <svg
        className="absolute pointer-events-none"
        style={{
          bottom: "-15%",
          right: "-8%",
          width: "500px",
          height: "500px",
          transform: "rotate(-25deg)",
          opacity: 0.2,
        }}
        viewBox="0 0 1200 1200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m1063.1 460.22-131.06 1.7812h0.046875c-5.6719 0.1875-10.688-3.6562-12-9.1406l-20.062-80.859-139.92 97.922c-3.8438 2.6719-8.8594 2.9062-12.891 0.5625-4.0781-2.3438-6.375-6.8438-5.9531-11.484l22.547-255-75.234 29.531c-5.25 2.0625-11.25 0.23438-14.391-4.4531l-74.156-109.08-74.156 109.22c-3.1406 4.6875-9.1406 6.5156-14.391 4.4062l-75.234-29.625 22.547 254.86c0.42188 4.6875-1.875 9.1406-5.9531 11.484-4.0312 2.3438-9.0469 2.1562-12.891-0.5625l-139.92-97.781-20.156 80.625c-1.3594 5.4844-6.375 9.2812-12 9.1406l-131.06-1.7812 62.766 130.78c2.3906 4.875 1.2188 10.688-2.8594 14.297l-57.375 50.766 269.9 126.56c5.1094 2.3906 7.8281 8.0625 6.5625 13.547l-25.781 116.06 160.92-49.219h5.2969c0.60938-0.09375 1.2656-0.09375 1.9219 0 0.70312 0.09375 1.3594 0.28125 2.0156 0.60938l2.0625 1.3125 1.6875 1.3125 1.3125 1.9219 1.0781 2.0625c0.046875 0.79688 0.046875 1.5938 0 2.3906 0.046875 0.5625 0.046875 1.125 0 1.6875l-17.906 205.92h103.22l-19.078-204.94c-0.046875-0.51562-0.046875-0.98438 0-1.4531 0.046875-0.98438 0.28125-1.9688 0.60938-2.9062 0.1875-0.46875 0.42188-0.98438 0.70312-1.4062 0.42188-0.89062 1.0312-1.6875 1.6875-2.4375 0.375-0.42188 0.79688-0.75 1.3125-1.0781 0.65625-0.60938 1.4531-1.125 2.2969-1.5469 0.5625-0.28125 1.2188-0.51562 1.9219-0.60938 0.65625-0.09375 1.3594-0.09375 2.0156 0h5.9062l161.16 48.375-25.922-116.3c-1.2656-5.4844 1.4531-11.156 6.5625-13.547l269.76-126.1-57.328-50.766c-4.0781-3.5625-5.25-9.4219-2.9062-14.297z"
          stroke="var(--color-bg)"
          strokeWidth="1"
          fill="none"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={leafVisible ? undefined : "1"}
          style={leafVisible ? { animation: "drawLeaf 3s ease-out forwards" } : { strokeDashoffset: 1 }}
        />
      </svg>

      {/* Left vertical line — sticks to 1080px content edge */}
      <div
        className="absolute top-0 bottom-0 left-5 lg:left-[calc(50%-540px)] w-px pointer-events-none"
        style={{ backgroundColor: "var(--color-bg)", opacity: 0.2 }}
      />

      {/* Logo with decorative lines */}
      <div className="w-full max-w-[1080px] mx-auto relative mb-16 md:mb-20 lg:mb-10">
        {/* Right vertical line — sticks to 1080px content edge, top of footer to bottom of logo */}
        <div
          className="absolute bottom-0 right-0 w-px pointer-events-none top-[-4rem] md:top-[-6rem]"
          style={{ backgroundColor: "var(--color-bg)", opacity: 0.2 }}
        />
        {/* Inline wrapper to measure text width */}
        <div className="flex justify-center">
          <div className="relative inline-block">
            <h2
              className="text-[var(--color-bg)] text-[clamp(36px,10vw,120px)]"
              style={{
                fontFamily: '"Test Soehne Fett", "Test Soehne", sans-serif',
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Build Canada
            </h2>

            {/* Top horizontal line — flush with top of text, full viewport width */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[200vw] h-px pointer-events-none"
              style={{ backgroundColor: "var(--color-bg)", opacity: 0.2 }}
            />

            {/* Bottom horizontal line — flush with bottom of text, full viewport width */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] h-px pointer-events-none"
              style={{ backgroundColor: "var(--color-bg)", opacity: 0.2 }}
            />

          </div>
        </div>
      </div>

      {/* Bottom content — stacked on mobile, side-by-side on lg */}
      <div className="w-full max-w-[1080px] mx-auto flex flex-col lg:flex-row lg:gap-12 lg:flex-1 lg:items-end">
        {/* CTA buttons + quote cluster — first on mobile, right-aligned on lg */}
        <div className="max-w-[600px] text-center lg:text-left mb-16 lg:mb-0 mx-auto lg:mx-0 lg:order-2 lg:ml-auto">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-5">
            <Link
              href="#subscribe"
              className="type-label px-6 py-3.5 bg-[var(--color-bg)] text-[var(--color-dark)] hover:bg-white transition-colors"
            >
              Subscribe
            </Link>
            <Link
              href="https://buy.stripe.com/3cI5kCdi8a2K2xY2bgdZ600"
              className="type-label px-6 py-3.5 text-[var(--color-bg)] hover:text-white transition-colors"
            >
              Donate
            </Link>
          </div>

          <p
            className="text-[var(--color-text-muted)] mb-3"
            style={{
              fontFamily: '"Test Financier Text", serif',
              fontSize: "14px",
              lineHeight: 1.45,
            }}
          >
            Whatever our errors are otherwise, we shall not err for want of
            boldness... Canada shall be the star towards which all men who love
            progress and freedom shall come.
          </p>
          <span className="type-label text-[var(--color-text-muted)] font-bold">
            — Laurier
          </span>
        </div>

        {/* Social icons + copyright cluster — second on mobile, left on lg */}
        <div className="flex flex-col items-center lg:items-start gap-2 lg:order-1 lg:pl-[5px]">
          <div className="flex items-center gap-1.5">
            {socials.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-7 h-7 flex items-center justify-center hover:opacity-100 transition-opacity"
              >
                <Image
                  src={icon}
                  alt={label}
                  width={18}
                  height={18}
                  className="opacity-50 hover:opacity-90 transition-opacity brightness-0 invert"
                  unoptimized
                />
              </a>
            ))}
          </div>
          <p className="type-label text-[var(--color-text-muted)]">
            🏗️🇨🇦 Copyright Build Canada 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
