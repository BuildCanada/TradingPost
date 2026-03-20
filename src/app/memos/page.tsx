import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionLabel from "@/components/SectionLabel";
import MemosListClient from "./MemosListClient";

export const metadata: Metadata = {
  title: "Memos | Build Canada",
  description:
    "Bold thinking from Canada's builders, reformers, and leaders. Read policy memos and ideas worth building on.",
  openGraph: {
    title: "Memos | Build Canada",
    description:
      "Bold thinking from Canada's builders, reformers, and leaders.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Memos | Build Canada",
    description:
      "Bold thinking from Canada's builders, reformers, and leaders.",
  },
};

export default async function MemosPage() {
  const memos = await prisma.memo.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      author: true,
      authorImage: true,
      keyMessage1: true,
      keyMessage2: true,
      keyMessage3: true,
      splashImage: true,
      seoImage: true,
      category: true,
      featured: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  // Serialize dates for the client component
  const serialized = memos.map((m) => ({
    ...m,
    authorImage:
      m.author === "Build Canada"
        ? "/assets/logos/Logocircle.png"
        : m.authorImage,
    publishedAt: m.publishedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
      {/* Statement — server-rendered for SEO */}
      <div className="animate-fade-in" style={{ animationDelay: "0s" }}>
        <section className="relative px-5 border-b border-[var(--color-border-light)] overflow-hidden">
          <Image
            src="/assets/images/harley.png"
            alt=""
            fill
            className="object-cover brightness-[0.35]"
            priority
          />
          <div className="relative max-w-[900px] mx-auto py-[60px] md:pt-[140px] md:pb-[80px] lg:pt-[180px]">
            <SectionLabel className="text-white/60">Memos</SectionLabel>
            <h1 className="type-title mb-1 text-white">Ideas Worth Building On</h1>
            <p className="type-body text-white/70">
              Bold thinking from Canada&apos;s builders, reformers, and leaders.
            </p>
          </div>
        </section>
      </div>

      <MemosListClient memos={serialized} />
    </div>
  );
}
