import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchMemos } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import MemosListClient from "@/app/memos/MemosListClient";

export const metadata: Metadata = {
  title: "Memos",
  description:
    "Bold thinking for Toronto. Read policy memos and ideas worth building on.",
  alternates: { canonical: "/toronto/memos" },
  openGraph: {
    title: "🏗️ Toronto — Memos",
    description: "Bold thinking for Toronto.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🏗️ Toronto — Memos",
    description: "Bold thinking for Toronto.",
  },
};

export default async function TorontoMemosPage() {
  const serialized = await fetchMemos({ publication: "build_toronto" });

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <section className="px-5 pt-[120px] pb-[100px] md:pt-[140px] md:pb-[120px] border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">🏗️ Toronto · Memos</SectionLabel>
          <h1 className="type-display mt-4 mb-6 text-dark">
            Ideas for a Better Toronto
          </h1>
          <p className="type-body max-w-[600px] text-dark/70">
            Bold thinking from Toronto&apos;s leading builders and doers.
          </p>
        </div>
      </section>

      <Suspense>
        <MemosListClient memos={serialized} basePath="/toronto/memos" />
      </Suspense>
    </div>
  );
}
