import type { Metadata } from "next";
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
    publishedAt: m.publishedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <>
      {/* Statement — server-rendered for SEO */}
      <div className="animate-fade-in" style={{ animationDelay: "0s" }}>
        <section className="px-5 pt-[34px] pb-[44px] border-b border-[var(--color-border)]">
          <div className="max-w-[900px] mx-auto">
            <SectionLabel>Memos</SectionLabel>
            <h1 className="type-title mt-1">Ideas Worth Building On</h1>
            <p className="type-body text-[var(--color-text-secondary)] mt-2">
              Bold thinking from Canada&apos;s builders, reformers, and leaders.
            </p>
          </div>
        </section>
      </div>

      <MemosListClient memos={serialized} />
    </>
  );
}
