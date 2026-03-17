"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface FeedItem {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  author: string | null;
  image: string | null;
  body: string | null;
  url: string | null;
  createdAt: string;
}

const SOCIAL_TYPES = new Set(["X", "TIKTOK", "IG", "YOUTUBE"]);
const SOCIAL_FALLBACK_IMAGE = "/assets/logos/logo-standard.svg";

function isValidImage(src: string | null): boolean {
  if (!src || src === "-") return false;
  return src.startsWith("/") || src.startsWith("http");
}

function feedImage(item: FeedItem): string | null {
  if (isValidImage(item.image)) return item.image;
  if (SOCIAL_TYPES.has(item.type)) return SOCIAL_FALLBACK_IMAGE;
  return null;
}

function itemHref(item: FeedItem): string {
  if (item.type === "BLOG") return `/feed/${item.id}`;
  return item.url || "/feed";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function isIGVideo(item: FeedItem): boolean {
  return !!(item.url && (item.url.includes("/reel/") || item.url.includes("/tv/")));
}

function IGCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/feed"}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-[#dbdbdb] bg-white flex flex-col group overflow-hidden rounded-sm"
    >
      {/* IG-style header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#efefef]">
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--color-accent)] shrink-0">
          <Image
            src="/assets/logos/sticker-build-canada-logo.png"
            alt="Build Canada"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold text-[#262626] leading-tight">@build_canada</span>
          <span className="text-[12px] text-[#8e8e8e] leading-tight">
            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        {/* IG icon */}
        <div className="ml-auto shrink-0">
          <Image
            src="/assets/icons/platform-instagram.svg"
            alt="Instagram"
            width={14}
            height={14}
            className="opacity-40"
            unoptimized
          />
        </div>
      </div>

      {/* Caption area */}
      <div className="px-3 py-3 flex flex-col gap-2 flex-1">
        {/* Photo/Video label */}
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-[#8e8e8e] font-medium">
          {isIGVideo(item) ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M8 5.14v13.72a1 1 0 001.5.86l11.24-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="#8e8e8e"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#8e8e8e" strokeWidth="2" fill="none"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#8e8e8e"/>
              <path d="M21 15l-5-5L5 21" stroke="#8e8e8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          )}
          {isIGVideo(item) ? "Video" : "Photo"}
        </span>

        {/* Caption text */}
        {item.body && (
          <p className="text-[14px] leading-[1.4] text-[#262626] line-clamp-4">
            <span className="font-semibold">@build_canada</span>{" "}
            {item.body}
          </p>
        )}
      </div>

      {/* See post CTA */}
      <div className="px-3 py-2.5 flex items-center justify-between border-t border-[#efefef]">
        <Image
          src="/assets/icons/platform-instagram.svg"
          alt="Instagram"
          width={16}
          height={16}
          className="brightness-0 opacity-30"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label rounded-full px-3 py-1 border border-[#262626] text-[#262626] bg-white group-hover:border-transparent group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-[#833AB4] group-hover:via-[#C13584] group-hover:to-[#F77737] transition-all">
          See post
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h9M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function XCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/feed"}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-[#2f3336] bg-black flex flex-col group overflow-hidden rounded-sm"
    >
      {/* X-style header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#2f3336]">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#333] shrink-0">
          <Image
            src="/assets/logos/sticker-build-canada-logo.png"
            alt="Build Canada"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold text-[#e7e9ea] leading-tight">@build_canada</span>
          <span className="text-[12px] text-[#71767b] leading-tight">
            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        {/* X icon */}
        <div className="ml-auto shrink-0">
          <Image
            src="/assets/icons/platform-x-twitter.svg"
            alt="X"
            width={14}
            height={14}
            className="opacity-50"
            unoptimized
          />
        </div>
      </div>

      {/* Caption area */}
      <div className="px-3 py-3 flex flex-col gap-2 flex-1">
        {/* Post label */}
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-[#71767b] font-medium">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16v12H5.17L4 17.17V4z" stroke="#71767b" strokeWidth="2" fill="none" strokeLinejoin="round"/>
          </svg>
          Post
        </span>

        {/* Caption text */}
        {item.body && (
          <p className="text-[14px] leading-[1.4] text-[#e7e9ea] line-clamp-4">
            {item.body}
          </p>
        )}
      </div>

      {/* See post CTA */}
      <div className="px-3 py-2.5 flex items-center justify-between border-t border-[#2f3336]">
        <Image
          src="/assets/icons/platform-x-twitter.svg"
          alt="X"
          width={16}
          height={16}
          className="opacity-20"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label rounded-full px-3 py-1 border border-[#536471] text-[#e7e9ea] group-hover:border-[#1d9bf0] group-hover:bg-[#1d9bf0] group-hover:text-white transition-all">
          See post
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h9M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function TikTokCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/feed"}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-[#2f2f2f] bg-[#121212] flex flex-col group overflow-hidden rounded-sm"
    >
      {/* TikTok-style header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#2f2f2f]">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#333] shrink-0">
          <Image
            src="/assets/logos/sticker-build-canada-logo.png"
            alt="Build Canada"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold text-[#e1e1e2] leading-tight">@build_canada</span>
          <span className="text-[12px] text-[#8a8b91] leading-tight">
            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        {/* TikTok icon */}
        <div className="ml-auto shrink-0">
          <Image
            src="/assets/icons/platform-tiktok.svg"
            alt="TikTok"
            width={14}
            height={14}
            className="opacity-50"
            unoptimized
          />
        </div>
      </div>

      {/* Caption area */}
      <div className="px-3 py-3 flex flex-col gap-2 flex-1">
        {/* Video label */}
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-[#8a8b91] font-medium">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M8 5.14v13.72a1 1 0 001.5.86l11.24-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="#8a8b91"/>
          </svg>
          Video
        </span>

        {/* Caption text */}
        {item.body && (
          <p className="text-[14px] leading-[1.4] text-[#e1e1e2] line-clamp-4">
            {item.body}
          </p>
        )}
      </div>

      {/* See post CTA */}
      <div className="px-3 py-2.5 flex items-center justify-between border-t border-[#2f2f2f]">
        <Image
          src="/assets/icons/platform-tiktok.svg"
          alt="TikTok"
          width={16}
          height={16}
          className="opacity-20"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label rounded-full px-3 py-1 border border-[#444] text-[#e1e1e2] group-hover:border-[#fe2c55] group-hover:bg-[#fe2c55] group-hover:text-white transition-all">
          See post
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h9M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function SubstackCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/feed"}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-[#e8e2d9] bg-[#fffdf7] flex flex-col group overflow-hidden rounded-sm"
    >
      {/* Banner image */}
      {isValidImage(item.image) && (
        <div className="relative h-[90px] bg-[#f7f5ef]">
          <Image
            src={item.image!}
            alt={item.title || ""}
            fill
            className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      {/* Card body */}
      <div className="px-3 py-3 flex flex-col gap-2 flex-1">
        {/* Weekly Newsletter label */}
        <div className="flex items-center gap-1.5">
          <Image
            src="/assets/icons/substack-icon.svg"
            alt="Substack"
            width={12}
            height={12}
            className="opacity-60"
            unoptimized
          />
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#857e71] font-medium">
            Weekly Newsletter
          </span>
        </div>

        {item.title && (
          <h3 className="type-heading font-serif font-semibold text-[#1a1a1a] group-hover:text-[#FF6719] transition-colors">
            {item.title}
          </h3>
        )}

        {/* Date */}
        <span className="text-[12px] text-[#857e71]">
          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* Read CTA */}
      <div className="px-3 py-2.5 flex items-center justify-between border-t border-[#e8e2d9]">
        <Image
          src="/assets/icons/substack-icon.svg"
          alt="Substack"
          width={16}
          height={16}
          className="opacity-25"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label rounded-full px-3 py-1 border border-[#1a1a1a] text-[#1a1a1a] bg-[#fffdf7] group-hover:border-[#FF6719] group-hover:bg-[#FF6719] group-hover:text-white transition-all">
          Read
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h9M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={itemHref(item)}
      target={item.type !== "BLOG" ? "_blank" : undefined}
      rel={item.type !== "BLOG" ? "noopener noreferrer" : undefined}
      className="border border-[var(--color-border-light)] flex flex-col group overflow-hidden"
    >
      {/* Banner image */}
      <div className="relative h-[100px] bg-[var(--color-dark)]">
        {feedImage(item) && (
          <Image
            src={feedImage(item)!}
            alt={item.title || ""}
            fill
            className={feedImage(item) === SOCIAL_FALLBACK_IMAGE
              ? "object-contain p-5 opacity-80 group-hover:opacity-95 transition-opacity"
              : "object-cover opacity-70 group-hover:opacity-85 transition-opacity"}
          />
        )}
        {/* Platform badge */}
        <span className="absolute top-2 left-2 bg-[var(--color-bg)]/80 px-1.5 py-0.5 flex items-center gap-1">
          {["X", "TIKTOK", "IG", "SUBSTACK", "YOUTUBE"].includes(item.type) ? (
            <Image
              src={`/assets/icons/${item.type === "X" ? "platform-x-twitter" : item.type === "TIKTOK" ? "platform-tiktok" : item.type === "IG" ? "platform-instagram" : item.type === "SUBSTACK" ? "substack-icon" : "platform-youtube"}.svg`}
              alt={item.type}
              width={10}
              height={10}
              className="brightness-0 opacity-70"
              unoptimized
            />
          ) : null}
          <span className="type-label-sm text-[var(--color-dark)]">
            {item.type === "BLOG" ? "Blog" : item.type === "SUBSTACK" ? "Substack" : item.type === "TIKTOK" ? "TikTok" : item.type === "IG" ? "IG" : item.type}
          </span>
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {item.title && (
          <h3 className="type-heading group-hover:text-[var(--color-accent)] transition-colors line-clamp-4">
            {item.title}
          </h3>
        )}

        {item.body && (
          <p className="type-body line-clamp-2">
            {stripHtml(item.body)}
          </p>
        )}
      </div>

      {/* Meta bar */}
      <div className="px-4 py-2.5 flex items-center justify-end">
        <span className="inline-flex items-center gap-2 type-label rounded-full px-3 py-1 border border-[var(--color-dark)] text-[var(--color-dark)] bg-[var(--color-bg)] group-hover:bg-[var(--color-dark)] group-hover:text-[var(--color-bg)] transition-colors">
          Read more
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h9M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function FeedPreview() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data: FeedItem[]) => {
        const picks: FeedItem[] = [];
        const types = ["X", "IG", "SUBSTACK", "BLOG"];
        for (const t of types) {
          const match = data.find((d) => d.type === t);
          if (match) picks.push(match);
        }
        setItems(picks);
      });
  }, []);

  return (
    <div className="px-5 pt-[26px] pb-0">
      <div className="max-w-[768px] mx-auto">
      <span className="type-label font-bold text-[var(--color-text-secondary)] block pb-2">
        Feed
      </span>
      <div className="grid grid-cols-2 gap-3">
        {items.length > 0
          ? items.map((item) =>
              item.type === "IG" ? (
                <IGCard key={item.id} item={item} />
              ) : item.type === "X" ? (
                <XCard key={item.id} item={item} />
              ) : item.type === "TIKTOK" ? (
                <TikTokCard key={item.id} item={item} />
              ) : item.type === "SUBSTACK" ? (
                <SubstackCard key={item.id} item={item} />
              ) : (
                <FeedCard key={item.id} item={item} />
              )
            )
          : [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[200px] border border-[var(--color-border-light)]"
              />
            ))}
      </div>
      </div>
    </div>
  );
}
