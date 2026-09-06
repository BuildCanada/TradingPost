import { ArticleBody } from "@/components/content/ArticleBody";
import {
  PollDownloads,
  PollSupportingContent,
} from "@/components/content/PollDetails";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchMemo, fetchMemos, getSiteConfig } from "@/lib/api";
import { extractHeadings } from "@/lib/extract-headings";
import { TwitterEmbed, MemoSubscribe, RelatedMemos } from "./MemoClientParts";
import { MemoEngagement } from "./MemoEngagement";
import { ShareSection } from "@/components/share";
import { MemoHero } from "./MemoHero";
import { MemoPrintHeader } from "./MemoPrintHeader";
import { Signpost } from "@/components/custom/signpost";
import { buildGraph } from "@/lib/schemas/graph";
import { generateArticleSchema } from "@/lib/schemas/generators/article";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { DraftPreviewBanner } from "@/components/auth/DraftPreviewBanner";
import { primeAdminPreviewToken } from "@/lib/preview";
import { getCurrentUser } from "@/lib/auth";

export async function generateStaticParams() {
  try {
    const memos = await fetchMemos();
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
  // Prime the request-scoped token so draft metadata resolves for admins.
  await primeAdminPreviewToken();
  let memo;
  try {
    memo = await fetchMemo(slug);
  } catch {
    return { title: "Memo Not Found | Build Canada" };
  }

  const title = `${memo.title} | Build Canada`;
  const description = memo.keyMessage1;
  const image = memo.seoImage || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/memos/${memo.slug}`,
      types: { "text/markdown": `/memos/${memo.slug}.md` },
    },
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

export default async function MemoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const accessToken = await primeAdminPreviewToken();
  // Cached per-request alongside primeAdminPreviewToken's call — drives the
  // engagement UI's signed-in / postal-code-ready states.
  const viewer = await getCurrentUser();

  // The memo and the list backing "related memos" don't depend on each other,
  // so they go out together rather than one after the other. Both must start
  // after primeAdminPreviewToken, which seeds the token apiFetch reads.
  // Related memos are decorative — if that list fails the memo still renders.
  const [memo, allMemos] = await Promise.all([
    fetchMemo(slug).catch(() => null),
    fetchMemos().catch(() => []),
  ]);

  if (!memo) {
    notFound();
  }

  if (memo.slug !== slug) {
    permanentRedirect(`/memos/${memo.slug}`);
  }

  const authorImage =
    memo.author.name === "Build Canada"
      ? "/assets/logos/buildcanada-logo-square.svg"
      : memo.author.photo;

  const keyMessages = memo.keyMessages;

  // A memo is a draft when it has no publish date, or one scheduled in the
  // future. The preview banner is for genuine drafts only — not every memo an
  // admin happens to be viewing.
  const isDraft = !memo.publishedAt || new Date(memo.publishedAt) > new Date();

  const date = new Date(memo.publishedAt || memo.createdAt).toLocaleDateString(
    "en-CA",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const configData = getSiteConfig();

  const fullUrl = `${configData.siteUrl}/memos/${memo.slug}`;

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
      configData,
    ),
    generateBreadcrumbSchema(
      `/memos/${memo.slug}`,
      memo.title,
      configData.siteUrl,
    ),
  );

  const sameCategory = allMemos.filter(
    (m) =>
      m.slug !== memo.slug && memo.category && m.category === memo.category,
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
    </div>
  );

  const { headings, html: bodyHtml } = extractHeadings(memo.body);
  if (memo.poll?.methodology)
    headings.push({ id: "poll-methodology", text: "Methodology", level: 2 });
  if (memo.poll?.news_release)
    headings.push({ id: "poll-news-release", text: "News release", level: 2 });

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      {accessToken && isDraft && (
        <DraftPreviewBanner state="viewing-draft" slug={slug} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MemoPrintHeader
        title={memo.title}
        authorName={memo.author.name}
        authorTitle={memo.author.title}
        authorImage={authorImage}
        date={date}
        url={fullUrl}
      />

      {/* Hidden in print — the print-only header above already carries the
          title, author, and date. */}
      <div className="print-hide">
        <MemoHero
          title={memo.title}
          authorName={memo.author.name}
          authorImage={authorImage}
          date={date}
          supporters={memo.supporters}
        />
      </div>

      <div
        className="animate-fade-in max-w-[1400px] mx-auto px-[5vw] md:px-[10vw] pt-4 pb-[52px] 2xl-memo:grid 2xl-memo:grid-cols-[240px_minmax(0,1fr)] 2xl-memo:gap-12"
        style={{ animationDelay: "0.3s" }}
      >
        <Signpost
          headings={headings}
          shareTitle={memo.title}
          shareUrl={fullUrl}
        />

        <article className="max-w-[720px]" data-memo-content>
          {keyMessages.length > 0 && (
            <div className="mb-8 p-6 border-[3px] border-double border-border-light bg-[#f0e5dc] space-y-4">
              <span className="type-label block mb-3">Key Messages</span>
              {keyMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-4 type-body">
                  <span className="type-label mt-2 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p>{msg}</p>
                </div>
              ))}
            </div>
          )}

          {memo.poll && <PollDownloads poll={memo.poll} />}
          <ArticleBody html={bodyHtml} />
          {memo.poll && <PollSupportingContent poll={memo.poll} />}

          {!memo.poll && (
            <MemoEngagement
              memoSlug={memo.slug}
              endorsementsCount={memo.endorsementsCount}
              critiquesCount={memo.critiquesCount}
              recentEndorsers={memo.recentEndorsers}
              critiques={memo.critiques}
              signedIn={!!viewer}
              engagementReady={viewer?.engagementReady ?? false}
            />
          )}

          <div className="print-hide 2xl-memo:hidden mt-10 pt-8 border-t border-border-light">
            {sidebar}
          </div>

          {(memo.twitterEmbed || relatedMemos.length > 0) && (
            <div className="print-hide hidden md:block 2xl-memo:hidden mt-10 pt-8 border-t border-border-light space-y-5">
              {memo.twitterEmbed && <TwitterEmbed html={memo.twitterEmbed} />}
              <RelatedMemos related={relatedMemos} category={relatedCategory} />
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
