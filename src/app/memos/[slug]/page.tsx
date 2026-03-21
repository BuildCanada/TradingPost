import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { TwitterEmbed, MemoSubscribe, RelatedMemos } from "./MemoClientParts";

/* ─── Static Params (pre-render all memo pages) ─── */

export async function generateStaticParams() {
  const memos = await prisma.memo.findMany({ select: { slug: true } });
  return memos.map((m) => ({ slug: m.slug }));
}

/* ─── Dynamic Metadata ─── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const memo = await prisma.memo.findUnique({ where: { slug } });

  if (!memo) {
    return { title: "Memo Not Found | Build Canada" };
  }

  const title = `${memo.title} | Build Canada`;
  const description = memo.keyMessage1;
  const image = memo.seoImage || memo.splashImage || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: memo.publishedAt?.toISOString() ?? memo.createdAt.toISOString(),
      authors: [memo.author],
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

/* ─── Page ─── */

export default async function MemoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const memo = await prisma.memo.findUnique({ where: { slug } });

  if (!memo) notFound();

  const authorImage =
    memo.author === "Build Canada"
      ? "/assets/logos/Logocircle.webp"
      : memo.authorImage;

  const keyMessages = [memo.keyMessage1, memo.keyMessage2, memo.keyMessage3].filter(
    Boolean
  ) as string[];

  const date = new Date(
    memo.publishedAt || memo.createdAt
  ).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: memo.title,
    description: memo.keyMessage1,
    author: { "@type": "Person", name: memo.author },
    datePublished: (memo.publishedAt ?? memo.createdAt).toISOString(),
    dateModified: memo.updatedAt.toISOString(),
    ...(memo.seoImage || memo.splashImage
      ? { image: memo.seoImage || memo.splashImage }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Build Canada",
    },
  };

  const sidebar = (
    <div className="space-y-5">
      {memo.twitterEmbed && (
        <div>
          <span className="type-label text-[var(--color-text-secondary)] block mb-3">
            Share
          </span>
          <TwitterEmbed html={memo.twitterEmbed} />
        </div>
      )}
      <MemoSubscribe />
      <RelatedMemos category={memo.category} currentSlug={memo.slug} />
    </div>
  );

  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Splash Hero (when splash image exists) */}
      {memo.splashImage && (
        <div className="animate-fade-in relative overflow-hidden">
          <Image
            src={memo.splashImage}
            alt=""
            fill
            className="object-cover brightness-[0.3]"
            unoptimized
            priority
          />
          <div className="relative z-10 max-w-[1400px] mx-auto px-5 pt-[42px] pb-[60px]">
            <Link
              href="/memos"
              className="type-label text-white/50 hover:text-white transition-colors flex items-center gap-1.5 mb-6"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path
                  d="M12 7H3M6 3L2 7l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              All Memos
            </Link>

            {memo.category && (
              <div className="flex items-center gap-2 mb-3">
                <span className="type-label text-white/50">Category</span>
                <span className="inline-block type-label text-[var(--color-dark)] bg-white/80 rounded-full px-3 py-0.5">
                  {memo.category.replace(/-/g, " ")}
                </span>
              </div>
            )}

            <h1 className="type-title text-white mb-4 max-w-[720px]">
              {memo.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden shrink-0">
                {authorImage && (
                  <Image
                    src={authorImage}
                    alt={memo.author}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div>
                <p className="type-label font-medium text-white">{memo.author}</p>
                <p className="type-label text-white/60">{date}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in max-w-[1400px] mx-auto px-5 pt-[42px] pb-[52px] 2xl-memo:flex 2xl-memo:gap-0" style={{ animationDelay: "0.3s" }}>
        {/* Left column: main content */}
        <article className="max-w-[720px] 2xl-memo:flex-1 2xl-memo:min-w-0 2xl-memo:max-w-none 2xl-memo:pr-8">
          {/* Default header (no splash image) */}
          {!memo.splashImage && (
            <>
              <Link
                href="/memos"
                className="type-label text-[var(--color-text-muted)] hover:text-[var(--color-dark)] transition-colors flex items-center gap-1.5 mb-6"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M12 7H3M6 3L2 7l4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                All Memos
              </Link>

              {memo.category && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="type-label text-[var(--color-text-muted)]">Category</span>
                  <span className="inline-block type-label text-[var(--color-bg)] bg-[var(--color-dark)] rounded-full px-3 py-0.5">
                    {memo.category.replace(/-/g, " ")}
                  </span>
                </div>
              )}

              <h1 className="type-title mb-4">{memo.title}</h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-border-light)] overflow-hidden shrink-0">
                  {authorImage && (
                    <Image
                      src={authorImage}
                      alt={memo.author}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div>
                  <p className="type-label font-medium">{memo.author}</p>
                  <p className="type-label text-[var(--color-text-secondary)]">{date}</p>
                </div>
              </div>
            </>
          )}

          {/* Supporters */}
          {memo.supporters && (
            <div className="mb-6 pb-6 border-b border-[var(--color-border-light)]">
              <span className="type-label text-[var(--color-text-secondary)] block mb-2">
                Supporters
              </span>
              <div
                className="prose-bc [&_p]:text-[15px] [&_p]:leading-[1.5]"
                dangerouslySetInnerHTML={{ __html: memo.supporters }}
              />
            </div>
          )}

          {/* Key Messages */}
          <div className="mb-8 p-5 border-[3px] border-double border-[var(--color-border-light)] bg-[#f0e5dc] space-y-3">
            <span className="type-label-sm text-[var(--color-text-muted)] block mb-2">
              Key Messages
            </span>
            {keyMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  i === 0
                    ? "type-body"
                    : "type-body text-[var(--color-text-secondary)]"
                }`}
              >
                <span className="type-label-sm text-[var(--color-text-muted)] mt-1.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{msg}</p>
              </div>
            ))}
          </div>

          {/* Body */}
          <div
            className="prose-bc"
            dangerouslySetInnerHTML={{ __html: memo.body }}
          />

          {/* Mobile sidebar */}
          <div className="2xl-memo:hidden mt-10 pt-8 border-t border-[var(--color-border-light)]">
            {sidebar}
          </div>
        </article>

        {/* Right column: sidebar (desktop only) */}
        <aside className="hidden 2xl-memo:block w-[400px] shrink-0 px-[50px] sticky top-[70px] self-start">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
