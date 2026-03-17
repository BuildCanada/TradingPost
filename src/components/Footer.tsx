"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

const socials = [
  {
    icon: "/assets/icons/Platform=X (Twitter), Color=Negative.svg",
    href: "https://x.com/build_canada",
    label: "X",
  },
  {
    icon: "/assets/icons/Platform=LinkedIn, Color=Negative.svg",
    href: "https://www.linkedin.com/company/build-canada",
    label: "LinkedIn",
  },
  {
    icon: "/assets/icons/Platform=Instagram, Color=Negative.svg",
    href: "https://www.instagram.com/build_canada/",
    label: "Instagram",
  },
  {
    icon: "/assets/icons/substack-icon (1).svg",
    href: "https://buildcanada.substack.com/",
    label: "Substack",
  },
  {
    icon: "/assets/icons/Platform=YouTube, Color=Negative.svg",
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
          d="m1036.8 408.71c-52.781 24.844-112.78 50.297-166.4 54.609l-13.312-60.844c-1.3594-5.3906-5.625-9.5156-11.062-10.688-5.3906-1.0781-10.969 1.2188-14.062 5.7656-36 52.688-75.609 104.16-120 132.94l75.609-213.94c1.7812-5.0625 0.46875-10.688-3.375-14.438-3.7969-3.75-9.4688-5.0156-14.484-3.1875l-62.766 22.688 7.3125-102.23c0.46875-5.3438-2.25-10.5-6.9375-13.078-4.7344-2.625-10.453-2.3438-14.906 0.70312l-42.938 29.859-36-108v-0.70312c-0.375-0.89062-0.84375-1.7344-1.4531-2.5312-0.42188-0.70312-0.9375-1.3594-1.5469-1.9219-0.5625-0.65625-1.2656-1.2188-2.0625-1.6406l-2.3906-1.4531h-0.84375c-0.60938-0.14062-1.2188-0.14062-1.7812 0l-3.375-0.60938h-2.7656c-0.5625-0.09375-1.125-0.09375-1.6875 0h-0.84375l-2.5312 1.4531h0.046875c-0.70312 0.42188-1.3594 0.89062-1.9219 1.4062l-1.5469 2.1562-0.046875 0.046875c-0.5625 0.75-1.0781 1.5938-1.4062 2.4844v0.70312l-36 108-43.688-29.25c-4.4531-3.0469-10.172-3.3281-14.906-0.70312-4.6875 2.5781-7.4062 7.7344-6.9375 13.078l7.3125 102.23-62.766-22.688c-5.0625-2.0156-10.828-0.75-14.625 3.1406-3.7969 3.7969-5.1094 9.4219-3.375 14.484l75.609 213.94c-44.297-28.781-84-80.297-120-132.94-3.0469-4.5938-8.625-6.8906-14.062-5.7656-5.3906 1.1719-9.7031 5.2969-11.016 10.688l-13.312 60.844c-53.531-4.3125-113.53-29.766-166.31-54.609-5.3906-2.5312-11.812-1.4062-15.984 2.9062-4.125 4.3125-5.1094 10.688-2.5312 16.078l77.531 153.1-60 40.781v0.046876c-3.9375 2.6719-6.1875 7.2188-6 12 0.1875 5.1094 3.1875 9.75 7.8281 12l171.14 82.219c-26.859 28.547-68.625 44.156-132.84 50.156l-0.046875-0.046876c-6.3281-0.046874-11.906 4.2188-13.547 10.359-1.6406 6.1406 1.0781 12.562 6.6094 15.703 63 43.219 139.55 84 233.29 64.547l-1.0781 31.078h-0.046874c-0.23438 3.8906 1.2188 7.7344 3.9844 10.453 2.625 2.625 6.2344 4.125 9.9375 4.0781h0.60938c47.297-2.5312 94.547-25.922 144-71.062v222.98c0 7.6875 6.2344 13.922 13.922 13.922s13.922-6.2344 13.922-13.922v-223.55c49.453 45.141 96.703 68.531 144 71.062h0.60937v-0.046874c3.7031 0.046874 7.3125-1.4062 9.9375-4.0781 2.7656-2.7188 4.2188-6.5625 3.9844-10.406l-1.0781-31.078c93.703 19.219 170.29-21.375 233.29-64.547l-0.046875-0.046874c4.8281-3.2812 7.0781-9.2344 5.625-14.906-1.4531-5.6719-6.2812-9.7969-12.094-10.406-64.078-6-105.94-21.609-132.94-50.156l171.24-82.219c4.5938-2.25 7.5938-6.8438 7.7812-12 0.23437-4.7812-2.1094-9.3281-6.0938-12l-60-40.781 77.625-153.14c2.5781-5.3438 1.5938-11.766-2.5312-16.078-4.2188-4.5469-10.875-5.7656-16.453-3z"
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
