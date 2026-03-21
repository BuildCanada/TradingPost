"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const hasScrolled = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled.current && window.scrollY > 0) {
        hasScrolled.current = true;
        setShowEmoji(true);
        setTimeout(() => {
          setShowEmoji(false);
        }, 4000);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="border-y-2 border-[var(--color-border)] flex items-stretch sticky top-[10px] z-50 bg-[var(--color-bg)]">
      {/* Logo */}
      <Link
        href="/"
        className="bg-[var(--color-accent)] flex items-center px-4 py-3 shrink-0 relative"
      >
        <Image
          src="/assets/logos/logo-standard.svg"
          alt="Build Canada"
          width={86}
          height={40}
          className="h-[36px] w-auto transition-opacity duration-500"
          style={{ opacity: showEmoji ? 0 : 1 }}
          priority
        />
        <span
          className="absolute inset-0 flex items-center justify-center text-2xl transition-opacity duration-500 pointer-events-none"
          style={{ opacity: showEmoji ? 1 : 0 }}
        >
          🏗️🇨🇦
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-stretch">
        <Link
          href="/"
          className="flex items-center px-5 border-l border-[var(--color-border)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
        >
          Home
        </Link>
        <Link
          href="/memos"
          className="flex items-center px-5 border-l border-[var(--color-border)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
        >
          Memos
        </Link>
        <Link
          href="/feed"
          className="flex items-center px-5 border-l border-[var(--color-border)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
        >
          Feed
        </Link>
        <Link
          href="/projects"
          className="flex items-center px-5 border-l border-[var(--color-border)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
        >
          Projects
        </Link>
        <Link
          href="/about"
          className="flex items-center px-5 border-l border-[var(--color-border)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
        >
          About Us
        </Link>
        <a
          href="https://shop.buildcanada.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-5 border-l border-[var(--color-border)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
        >
          Shop
        </a>
      </div>

      {/* Desktop right: social icons + subscribe */}
      <div className="hidden md:flex items-center ml-auto">
        <div className="flex items-center gap-1.5 px-4">
          {[
            { icon: "X", href: "https://x.com/build_canada", file: "platform-x-twitter" },
            { icon: "LINKEDIN", href: "https://www.linkedin.com/company/buildcanada", file: "platform-linkedin" },
            { icon: "TIKTOK", href: "https://www.tiktok.com/@build_canada", file: "platform-tiktok" },
            { icon: "IG", href: "https://www.instagram.com/build_canada/", file: "platform-instagram" },
            { icon: "SUBSTACK", href: "https://buildcanada.substack.com/", file: "substack-icon" },
            { icon: "YOUTUBE", href: "https://www.youtube.com/@BuildCanada", file: "platform-youtube" },
          ].map(({ icon, href, file }) => (
            <a
              key={icon}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/icons/${file}.svg`}
                alt={icon}
                width={14}
                height={14}
                className="brightness-0 opacity-40 group-hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
        <Link
          href="#subscribe"
          className="flex items-center self-stretch px-5 border-l border-[var(--color-border)] bg-[var(--color-dark)] type-label text-[var(--color-bg)] hover:bg-[var(--color-accent)] transition-colors"
        >
          Subscribe
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden ml-auto flex flex-col gap-1.5 justify-center px-5 border-l border-[var(--color-border)]"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className="w-5 h-[2px] bg-[var(--color-dark)] block" />
        <span className="w-5 h-[2px] bg-[var(--color-dark)] block" />
        <span className="w-5 h-[2px] bg-[var(--color-dark)] block" />
      </button>

      {/* Mobile menu */}
      <div
        className={`absolute top-full left-0 right-0 md:hidden z-50 grid transition-[grid-template-rows] duration-200 ease-out ${
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col bg-[var(--color-bg)] border-y border-[var(--color-border)]">
            <Link
              href="/"
              className="px-5 py-4 border-b border-[var(--color-border-light)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/memos"
              className="px-5 py-4 border-b border-[var(--color-border-light)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Memos
            </Link>
            <Link
              href="/feed"
              className="px-5 py-4 border-b border-[var(--color-border-light)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Feed
            </Link>
            <Link
              href="/projects"
              className="px-5 py-4 border-b border-[var(--color-border-light)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/about"
              className="px-5 py-4 border-b border-[var(--color-border-light)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              About Us
            </Link>
            <a
              href="https://shop.buildcanada.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-4 border-b border-[var(--color-border-light)] type-label text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </a>
            <Link
              href="#subscribe"
              className="px-5 py-4 bg-[var(--color-dark)] type-label text-[var(--color-bg)]"
              onClick={() => setMenuOpen(false)}
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
