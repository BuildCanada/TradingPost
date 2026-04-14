import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { fetchMemo, fetchMemos, getSiteConfig } from "@/lib/api";
import { TwitterEmbed, MemoSubscribe, RelatedMemos } from "./MemoClientParts";
import { AuthorCard } from "./AuthorCard";
import { ShareSection } from "@/components/share";
import { buildGraph } from "@/lib/schemas/graph";
import { generateArticleSchema } from "@/lib/schemas/generators/article";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";

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
  let memo;
  try {
    memo = await fetchMemo(slug);
  } catch {
    return { title: "Memo Not Found | Build Canada" };
  }

  const title = `${memo.title} | Build Canada`;
  const description = memo.keyMessage1;
  const image = memo.seoImage || memo.splashImage || undefined;

  return {
    title,
    description,
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
  let memo;
  try {
    memo = await fetchMemo(slug);
  } catch {
    notFound();
  }

  const authorImage =
    memo.author.name === "Build Canada"
      ? "/assets/logos/Logocircle.webp"
      : memo.author.photo;

  const keyMessages = memo.keyMessages;

  const date = new Date(
    memo.publishedAt || memo.createdAt
  ).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateArticleSchema(
      {
        title: memo.title,
        slug: memo.slug,
        keyMessage1: memo.keyMessage1,
        seoImage: memo.seoImage,
        splashImage: memo.splashImage,
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
    generateBreadcrumbSchema(`/memos/${memo.slug}`, memo.title, configData.siteUrl)
  );

  const fullUrl = `${configData.siteUrl}/memos/${memo.slug}`;

  const allMemos = await fetchMemos();
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
      <RelatedMemos related={relatedMemos} category={relatedCategory} />
    </div>
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Print-only header: Build Canada branding + memo meta */}
      <div className="print-only mb-10 pb-5 border-b border-black">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logos/sticker-build-canada-logo.webp"
              alt="Build Canada"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="type-label font-semibold tracking-wider">Build Canada</span>
          </div>
          <span className="type-label break-all text-right">
            {fullUrl.replace(/^https?:\/\//, "")}
          </span>
        </div>
        <h1 className="type-title mb-4">{memo.title}</h1>
        <div className="flex items-center gap-4">
          {authorImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={authorImage}
              alt={memo.author.name}
              width={56}
              height={56}
              className="w-14 h-14 object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="type-label font-medium m-0">{memo.author.name}</p>
            {memo.author.title && (
              <p className="type-label text-text-secondary m-0 mt-0.5">
                {memo.author.title}
              </p>
            )}
            <p className="type-label text-text-secondary m-0 mt-0.5">{date}</p>
          </div>
        </div>
      </div>

      {memo.splashImage && (
        <div className="animate-fade-in relative h-[45svh] md:h-[65svh] flex items-end overflow-hidden print-hide">
          <Image
            src={memo.splashImage}
            alt=""
            fill
            className="object-cover brightness-[0.3]"
            unoptimized
            priority
          />
          <div className="relative z-10 max-w-[1400px] mx-auto w-full px-5 pb-[40px]">
             <Link
              href="/memos"
              className="type-label text-white/70 hover:text-white transition-colors flex items-center gap-1.5 mb-6 py-1"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path
                  d="M12 7H3M6 3L2 7l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              All Memos
            </Link>

            <h1 className="type-title text-white mb-6 max-w-[720px]">
              {memo.title}
            </h1>

            <AuthorCard
              name={memo.author.name}
              photo={authorImage}
              title={memo.author.title}
              date={date}
              xUrl={memo.author.xUrl}
              linkedinUrl={memo.author.linkedinUrl}
              variant="dark"
            />
          </div>
        </div>
      )}

      <div className="animate-fade-in max-w-[1400px] mx-auto px-5 pt-[42px] pb-[52px] 2xl-memo:flex 2xl-memo:gap-0" style={{ animationDelay: "0.3s" }}>
        <article className="max-w-[720px] 2xl-memo:flex-1 2xl-memo:min-w-0 2xl-memo:max-w-none 2xl-memo:pr-8">
          {!memo.splashImage && (
            <>
               <Link
                href="/memos"
                className="print-hide type-label text-text-secondary hover:text-dark transition-colors flex items-center gap-1.5 mb-6 py-1"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M12 7H3M6 3L2 7l4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                All Memos
              </Link>

              <h1 className="type-title mb-6 print-hide">{memo.title}</h1>

              <div className="mb-8 print-hide">
                <AuthorCard
                  name={memo.author.name}
                  photo={authorImage}
                  title={memo.author.title}
                  date={date}
                  xUrl={memo.author.xUrl}
                  linkedinUrl={memo.author.linkedinUrl}
                />
              </div>
            </>
          )}

          {memo.supporters && (
            <div className="mb-6 pb-6 border-b border-border-light">
              <span className="type-label text-text-secondary block mb-2">
                Supported By
              </span>
              <div
                className="memo-supporters"
                dangerouslySetInnerHTML={{ __html: memo.supporters }}
              />
            </div>
          )}

          <div className="mb-8 p-5 border-[3px] border-double border-border-light bg-[#f0e5dc] space-y-3">
            <span className="type-label-sm text-text-secondary block mb-2">
              Key Messages
            </span>
            {keyMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  i === 0
                    ? "type-body"
                    : "type-body text-text-secondary"
                }`}
              >
                <span className="type-label-sm text-text-secondary mt-1.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{msg}</p>
              </div>
            ))}
          </div>

          <div
            className="prose-bc"
            dangerouslySetInnerHTML={{ __html: memo.body }}
          />

          <div className="print-hide 2xl-memo:hidden mt-10 pt-8 border-t border-border-light">
            {sidebar}
          </div>
        </article>

        <aside className="print-hide hidden 2xl-memo:block w-[400px] shrink-0 px-[50px] sticky top-[70px] self-start max-h-[calc(100vh-90px)] overflow-y-auto">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
