import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPosts, getSiteConfig } from "@/lib/api";
import MemosListClient from "@/app/memos/MemosListClient";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";

export const metadata: Metadata = {
  title: "Posts",
  description:
    "Statements, updates, and announcements from Build Canada.",
  openGraph: {
    title: "Posts",
    description:
      "Statements, updates, and announcements from Build Canada.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Posts",
    description:
      "Statements, updates, and announcements from Build Canada.",
  },
};

export default async function PostsPage() {
  const posts = await fetchPosts();
  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema("/posts", "Posts", configData.siteUrl)
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title={<>Posts &mdash; Updates from Build Canada</>}
        description="Statements, announcements, and reactions to the news of the day."
      />

      <Suspense>
        <MemosListClient
          memos={posts}
          basePath="/posts"
          showCategoryFilter={false}
          resultsLabel="Posts"
        />
      </Suspense>
    </div>
  );
}
