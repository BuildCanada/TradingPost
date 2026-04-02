import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
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
  const memos = await prisma.memo.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { author: true },
  });

  const serialized = memos.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    author: {
      name: m.author.name,
      photo:
        m.author.name === "Build Canada"
          ? "/assets/logos/Logocircle.webp"
          : m.author.photo,
    },
    keyMessage1: m.keyMessage1,
    keyMessage2: m.keyMessage2,
    keyMessage3: m.keyMessage3,
    splashImage: m.splashImage,
    seoImage: m.seoImage,
    category: m.category,
    featured: m.featured,
    publishedAt: m.publishedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  }));

  let siteConfig = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  if (!siteConfig) {
    siteConfig = await prisma.siteConfig.create({ data: { id: "site" } });
  }
  const configData = {
    orgName: siteConfig.orgName,
    orgDescription: siteConfig.orgDescription,
    siteUrl: siteConfig.siteUrl,
    logoUrl: siteConfig.logoUrl,
    socialLinks: siteConfig.socialLinks,
  };
  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema("/memos", "Memos", siteConfig.siteUrl)
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

      <MemosListClient memos={serialized} />
    </div>
  );
}
