import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchMemos, getSiteConfig } from "@/lib/api";
import SectionLabel from "@/components/SectionLabel";
import MemosListClient from "./MemosListClient";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";

export const metadata: Metadata = {
  title: "Memos",
  description:
    "Bold thinking from Canada's builders, reformers, and leaders. Read policy memos and ideas worth building on.",
  openGraph: {
    title: "Memos",
    description:
      "Bold thinking from Canada's builders, reformers, and leaders.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memos",
    description:
      "Bold thinking from Canada's builders, reformers, and leaders.",
  },
};

export default async function MemosPage() {
  const serialized = await fetchMemos();
  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema("/memos", "Memos", configData.siteUrl)
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="px-5 pt-[120px] pb-[100px] md:pt-[140px] md:pb-[120px] border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">Memos</SectionLabel>
          <h1 className="type-display mt-4 mb-6 text-dark">
            Ideas for a Better Canada
          </h1>
          <p className="type-body max-w-[600px] text-dark/70">
            Bold thinking from Canada&apos;s leading builders and doers.
          </p>
        </div>
      </section>

      <Suspense>
        <MemosListClient memos={serialized} />
      </Suspense>
    </div>
  );
}
