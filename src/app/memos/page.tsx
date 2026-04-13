import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
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
      <div className="animate-fade-in" style={{ animationDelay: "0s" }}>
        <section className="relative px-5 h-[45svh] md:h-[65svh] flex flex-col justify-center border-b border-border-light overflow-hidden">
          <Image
            src="/assets/images/build-canada-founder-meetup-shopify.webp"
            alt="Harley Finkelstein and Lucy Hargreaves speaking at Shopify HQ on Build Canada and the future of Canada"
            fill
            className="object-cover brightness-[0.35]"
            priority
          />
          <div className="relative max-w-[1080px] mx-auto w-full">
            <SectionLabel className="text-white/70">Memos</SectionLabel>
            <h1 className="type-title mb-1 text-white">Ideas for a Better Canada</h1>
            <p className="type-body text-white/70">
              Bold thinking from Canada&apos;s leading builders and doers.
            </p>
          </div>
        </section>
      </div>

      <Suspense>
        <MemosListClient memos={serialized} />
      </Suspense>
    </div>
  );
}
