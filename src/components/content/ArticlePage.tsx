import { ArticleLayout } from "./ArticleLayout";
import { fetchPoll } from "@/lib/api/polls";
import { ArticleBody } from "@/components/content/ArticleBody";
import {
  PollDownloads,
  PollSupportingContent,
} from "@/components/content/PollDetails";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchMemo, fetchMemos, getSiteConfig } from "@/lib/api";
import { extractHeadings } from "@/lib/extract-headings";
import { TwitterEmbed, MemoSubscribe, RelatedMemos } from "@/app/memos/[slug]/MemoClientParts";
import { MemoEngagement } from "@/app/memos/[slug]/MemoEngagement";
import { ShareSection } from "@/components/share";
import { MemoHero } from "@/app/memos/[slug]/MemoHero";
import { MemoPrintHeader } from "@/app/memos/[slug]/MemoPrintHeader";
import { Signpost } from "@/components/custom/signpost";
import { buildGraph } from "@/lib/schemas/graph";
import { generateArticleSchema } from "@/lib/schemas/generators/article";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { DraftPreviewBanner } from "@/components/auth/DraftPreviewBanner";
import { primeAdminPreviewToken } from "@/lib/preview";
import { getCurrentUser } from "@/lib/auth";

export async function articleMetadata(slug: string, kind: "memos" | "polls"): Promise<Metadata> {
  // Prime the request-scoped token so draft metadata resolves for admins.
  await primeAdminPreviewToken();
  let article;
  try {
    article = await (kind === "polls" ? fetchPoll(slug) : fetchMemo(slug));
  } catch {
    return { title: `${kind === "polls" ? "Poll" : "Memo"} Not Found | Build Canada` };
  }

  const title = `${article.title} | Build Canada`;
  const description = article.keyMessage1;
  const image = article.seoImage || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/${kind}/${article.slug}`,
      types: { "text/markdown": `/${kind}/${article.slug}.md` },
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt ?? article.createdAt,
      authors: [article.author.name],
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

export async function ArticlePage({ slug, kind }: { slug: string; kind: "memos" | "polls" }) {

  const accessToken = await primeAdminPreviewToken();
  // Cached per-request alongside primeAdminPreviewToken's call — drives the
  // engagement UI's signed-in / postal-code-ready states.
  const viewer = kind === "memos" ? await getCurrentUser() : null;

  // The article and the list backing "related memos" don't depend on each other,
  // so they go out together rather than one after the other. Both must start
  // after primeAdminPreviewToken, which seeds the token apiFetch reads.
  // Related memos are decorative — if that list fails the article still renders.
  const [article, allMemos] = await Promise.all([
    (kind === "polls" ? fetchPoll(slug) : fetchMemo(slug)).catch(() => null),
    kind === "memos" ? fetchMemos().catch(() => []) : Promise.resolve([]),
  ]);

  if (!article) {
    notFound();
  }

  if (article.slug !== slug) {
    permanentRedirect(`/${kind}/${article.slug}`);
  }

  const authorImage =
    article.author.name === "Build Canada"
      ? "/assets/logos/buildcanada-logo-square.svg"
      : article.author.photo;

  const keyMessages = article.keyMessages;

  // A article is a draft when it has no publish date, or one scheduled in the
  // future. The preview banner is for genuine drafts only — not every article an
  // admin happens to be viewing.
  const isDraft = !article.publishedAt || new Date(article.publishedAt) > new Date();

  const date = new Date(article.publishedAt || article.createdAt).toLocaleDateString(
    "en-CA",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const configData = getSiteConfig();

  const fullUrl = `${configData.siteUrl}/${kind}/${article.slug}`;

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateArticleSchema(
      {
        title: article.title,
        slug: article.slug,
        path: `/${kind}/${article.slug}`,
        keyMessage1: article.keyMessage1,
        seoImage: article.seoImage,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt),
      },
      {
        name: article.author.name,
        title: article.author.title,
        photo: authorImage,
        bio: article.author.bio,
        websiteUrl: article.author.websiteUrl,
        xUrl: article.author.xUrl,
        linkedinUrl: article.author.linkedinUrl,
      },
      configData,
    ),
    generateBreadcrumbSchema(
      `/${kind}/${article.slug}`,
      article.title,
      configData.siteUrl,
    ),
  );

  const sameCategory = allMemos.filter(
    (m) =>
      m.slug !== article.slug && article.category && m.category === article.category,
  );
  const hasSameCategory = sameCategory.length > 0;
  const relatedMemos = hasSameCategory
    ? sameCategory.slice(0, 2)
    : allMemos.filter((m) => m.slug !== article.slug).slice(0, 2);
  const relatedCategory = hasSameCategory ? article.category : null;

  const sidebar = (
    <div className="space-y-5">
      <div className="space-y-3">
        <ShareSection title={article.title} url={fullUrl} />
        {article.poll && <PollDownloads poll={article.poll} />}
      </div>
      <MemoSubscribe />
    </div>
  );

  const { headings, html: bodyHtml } = extractHeadings(article.body);
  if (article.poll?.methodology)
    headings.push({ id: "poll-methodology", text: "Methodology", level: 2 });
  if (article.poll?.news_release)
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
        brand={kind === "polls" ? "polling" : "canada"}
        title={article.title}
        authorName={article.author.name}
        authorTitle={article.author.title}
        authorImage={authorImage}
        date={date}
        url={fullUrl}
      />

      {/* Hidden in print — the print-only header above already carries the
          title, author, and date. */}
      <div className="print-hide">
        <MemoHero
          backHref={kind === "polls" ? "/polls" : undefined}
          backLabel={kind === "polls" ? "All polls" : undefined}
          title={article.title}
          authorName={article.author.name}
          authorImage={authorImage}
          date={date}
          supporters={article.supporters}
        />
      </div>

      <ArticleLayout>
        <Signpost
          headings={headings}
          shareTitle={article.title}
          shareUrl={fullUrl}
          afterShare={article.poll ? <PollDownloads poll={article.poll} /> : undefined}
        />

        <article className="w-full min-w-0 max-w-[720px]" data-memo-content>
          {keyMessages.length > 0 && (
            <div className="mb-8 p-6 border-[3px] border-double border-border-light bg-[#f0e5dc] space-y-4">
              <span className="type-label block mb-3">{kind === "polls" ? "Key Takeaways" : "Key Messages"}</span>
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

          <ArticleBody html={bodyHtml} />
          {article.poll && <PollSupportingContent poll={article.poll} />}

          {kind === "memos" && (
            <MemoEngagement
              memoSlug={article.slug}
              endorsementsCount={article.endorsementsCount}
              critiquesCount={article.critiquesCount}
              recentEndorsers={article.recentEndorsers}
              critiques={article.critiques}
              signedIn={!!viewer}
              engagementReady={viewer?.engagementReady ?? false}
            />
          )}

          <div className="print-hide 2xl-memo:hidden mt-10 pt-8 border-t border-border-light">
            {sidebar}
          </div>

          {(article.twitterEmbed || relatedMemos.length > 0) && (
            <div className="print-hide hidden md:block 2xl-memo:hidden mt-10 pt-8 border-t border-border-light space-y-5">
              {article.twitterEmbed && <TwitterEmbed html={article.twitterEmbed} />}
              <RelatedMemos related={relatedMemos} category={relatedCategory} />
            </div>
          )}
        </article>
      </ArticleLayout>
    </div>
  );
}
