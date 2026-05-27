import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchMemos, getSiteConfig } from "@/lib/api";
import MemosListClient from "./MemosListClient";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";

export const metadata: Metadata = {
  title: "Memos",
  description:
    "Bold thinking from Canada's builders, reformers, and leaders. Read policy memos and ideas worth building on.",
  alternates: { canonical: "/memos" },
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
      <PageHeader
        title={<>Memos &mdash; Ideas for a Better Canada</>}
        description="Bold thinking from Canada's leading builders and doers."
      />

      <Suspense>
        <MemosListClient memos={serialized} />
      </Suspense>
    </div>
  );
}
