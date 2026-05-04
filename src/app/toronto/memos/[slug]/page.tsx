import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchMemo, fetchMemos, getSiteConfig } from "@/lib/api";
import { extractHeadings } from "@/lib/extract-headings";
import {
  TwitterEmbed,
  MemoSubscribe,
  RelatedMemos,
} from "@/app/memos/[slug]/MemoClientParts";
import { ShareSection } from "@/components/share";
import { MemoHero } from "@/app/memos/[slug]/MemoHero";
import { Signpost } from "@/components/custom/signpost";
import { buildGraph } from "@/lib/schemas/graph";
import { generateArticleSchema } from "@/lib/schemas/generators/article";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";

const PUBLICATION = "build_toronto";
const BASE_PATH = "/toronto/memos";

export async function generateStaticParams() {
  try {
    const memos = await fetchMemos({ publication: PUBLICATION });
    return memos.map((m) => ({ slug: m.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let memo;
  try {
    memo = await fetchMemo(slug, { publication: PUBLICATION });
  } catch {
    return { title: "Memo Not Found" };
  }

  const title = memo.title;
  const description = memo.keyMessage1;
  const image = memo.seoImage || undefined;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_PATH}/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: memo.publishedAt ?? memo.createdAt,
      authors: [memo.author.name],
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function TorontoMemoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let memo;
  try {
    memo = await fetchMemo(slug, { publication: PUBLICATION });
  } catch {
    notFound();
  }

  const authorImage = memo.author.photo;

  const keyMessages = memo.keyMessages;

  const date = new Date(
    memo.publishedAt || memo.createdAt
  ).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const configData = getSiteConfig();

  const fullUrl = `${configData.siteUrl}${BASE_PATH}/${memo.slug}`;

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateArticleSchema(
      {
        title: memo.title,
        slug: memo.slug,
        keyMessage1: memo.keyMessage1,
        seoImage: memo.seoImage,
        publishedAt: memo.publishedAt ? new Date(memo.publishedAt) : null,
        createdAt: new Date(memo.createdAt),
        updatedAt: new Date(memo.updatedAt),
      },
      {
        name: memo.author.name,
        title: memo.author.title,
        photo: authorImage,
        bio: memo.author.bio,
        websiteUrl: memo.author.websiteUrl,
        xUrl: memo.author.xUrl,
        linkedinUrl: memo.author.linkedinUrl,
      },
      configData
    ),
    generateBreadcrumbSchema(
      `${BASE_PATH}/${memo.slug}`,
      memo.title,
      configData.siteUrl
    )
  );

  const allMemos = await fetchMemos({ publication: PUBLICATION });
  const sameCategory = allMemos.filter(
    (m) => m.slug !== memo.slug && memo.category && m.category === memo.category,
  );
  const hasSameCategory = sameCategory.length > 0;
  const relatedMemos = hasSameCategory
    ? sameCategory.slice(0, 2)
    : allMemos.filter((m) => m.slug !== memo.slug).slice(0, 2);
  const relatedCategory = hasSameCategory ? memo.category : null;

  const sidebar = (
    <div className="space-y-5">
      <ShareSection title={memo.title} url={fullUrl} />
      <MemoSubscribe />
      {memo.twitterEmbed && <TwitterEmbed html={memo.twitterEmbed} />}
      <RelatedMemos
        related={relatedMemos}
        category={relatedCategory}
        basePath={BASE_PATH}
      />
    </div>
  );

  const { headings, html: bodyHtml } = extractHeadings(memo.body);

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MemoHero
        category={memo.category}
        title={memo.title}
        authorName={memo.author.name}
        authorImage={authorImage}
        date={date}
        supporters={memo.supporters}
        backHref={BASE_PATH}
        backLabel="All Toronto Memos"
      />

      <div
        className="animate-fade-in max-w-[1400px] mx-auto px-[5vw] md:px-[10vw] pt-[42px] pb-[52px] 2xl-memo:grid 2xl-memo:grid-cols-[240px_minmax(0,1fr)] 2xl-memo:gap-12"
        style={{ animationDelay: "0.3s" }}
      >
        <Signpost headings={headings} />

        <article className="max-w-[720px]" data-memo-content>
          <div className="mb-8 p-6 border-[3px] border-double border-border-light bg-[#d7e4f3] space-y-4">
            <span className="type-label block mb-3">Key Messages</span>
            {keyMessages.map((msg, i) => (
              <div
                key={i}
                className="flex items-start gap-4 type-body"
              >
                <span className="type-label mt-2 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{msg}</p>
              </div>
            ))}
          </div>

          <div
            className="prose-bc"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          <div className="print-hide 2xl-memo:hidden mt-10 pt-8 border-t border-border-light">
            {sidebar}
          </div>
        </article>
      </div>
    </div>
  );
}
