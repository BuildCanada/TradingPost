import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { TwitterEmbed, MemoSubscribe, RelatedMemos } from "./MemoClientParts";
import { ShareSection } from "@/components/share";
import { buildGraph } from "@/lib/schemas/graph";
import { generateArticleSchema } from "@/lib/schemas/generators/article";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";

export async function generateStaticParams() {
  const memos = await prisma.memo.findMany({ select: { slug: true } });
  return memos.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const memo = await prisma.memo.findUnique({ where: { slug }, include: { author: true } });

  if (!memo) {
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
      publishedTime: memo.publishedAt?.toISOString() ?? memo.createdAt.toISOString(),
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
  const memo = await prisma.memo.findUnique({ where: { slug }, include: { author: true } });

  if (!memo) notFound();

  const authorImage =
    memo.author.name === "Build Canada"
      ? "/assets/logos/Logocircle.webp"
      : memo.author.photo;

  const keyMessages = [memo.keyMessage1, memo.keyMessage2, memo.keyMessage3].filter(
    Boolean
  ) as string[];

  const date = new Date(
    memo.publishedAt || memo.createdAt
  ).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
    generateArticleSchema(
      {
        title: memo.title,
        slug: memo.slug,
        keyMessage1: memo.keyMessage1,
        seoImage: memo.seoImage,
        splashImage: memo.splashImage,
        publishedAt: memo.publishedAt,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
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
    generateBreadcrumbSchema(`/memos/${memo.slug}`, memo.title, siteConfig.siteUrl)
  );

  const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://buildcanada.ca"}/memos/${memo.slug}`;

  const sidebar = (
    <div className="space-y-5">
      <ShareSection
        title={memo.title}
        description={memo.keyMessage1}
        image={memo.seoImage || memo.splashImage || undefined}
        url={fullUrl}
      />
      <MemoSubscribe />
      <RelatedMemos category={memo.category} currentSlug={memo.slug} />
      {memo.twitterEmbed && (
        <div>
          <h2 className="type-label text-text-secondary block mb-3 m-0">
            Embedded Post
          </h2>
          <TwitterEmbed html={memo.twitterEmbed} />
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {memo.splashImage && (
        <div className="animate-fade-in relative overflow-hidden">
          <Image
            src={memo.splashImage}
            alt=""
            fill
            className="object-cover brightness-[0.3]"
            unoptimized
            priority
          />
          <div className="relative z-10 max-w-[1400px] mx-auto px-5 pt-[42px] pb-[60px]">
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

            {memo.category && (
              <div className="flex items-center gap-2 mb-3">
                 <span className="type-label text-white/70">Category</span>
                <span className="inline-block type-label text-dark bg-white/80 rounded-full px-3 py-0.5">
                  {memo.category.replace(/-/g, " ")}
                </span>
              </div>
            )}

            <h1 className="type-title text-white mb-4 max-w-[720px]">
              {memo.title}
            </h1>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden shrink-0">
                {authorImage && (
                  <Image
                    src={authorImage}
                    alt={memo.author.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                    priority
                  />
                )}
              </div>
              <div>
                <p className="type-label font-medium text-white">{memo.author.name}</p>
                 <p className="type-label text-white/70">{date}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in max-w-[1400px] mx-auto px-5 pt-[42px] pb-[52px] 2xl-memo:flex 2xl-memo:gap-0" style={{ animationDelay: "0.3s" }}>
        <article className="max-w-[720px] 2xl-memo:flex-1 2xl-memo:min-w-0 2xl-memo:max-w-none 2xl-memo:pr-8">
          {!memo.splashImage && (
            <>
               <Link
                href="/memos"
                className="type-label text-text-secondary hover:text-dark transition-colors flex items-center gap-1.5 mb-6 py-1"
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

              {memo.category && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="type-label text-text-muted">Category</span>
                  <span className="inline-block type-label text-bg bg-dark rounded-full px-3 py-0.5">
                    {memo.category.replace(/-/g, " ")}
                  </span>
                </div>
              )}

              <h1 className="type-title mb-4">{memo.title}</h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-border-light overflow-hidden shrink-0">
                  {authorImage && (
                    <Image
                      src={authorImage}
                      alt={memo.author.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                      priority
                    />
                  )}
                </div>
                <div>
                  <p className="type-label font-medium">{memo.author.name}</p>
                  <p className="type-label text-text-secondary">{date}</p>
                </div>
              </div>
            </>
          )}

          {memo.supporters && (
            <div className="mb-6 pb-6 border-b border-border-light">
              <span className="type-label text-text-secondary block mb-2">
                Supporters
              </span>
              <div
                className="prose-bc [&_p]:text-[15px] [&_p]:leading-[1.5]"
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

          <div className="2xl-memo:hidden mt-10 pt-8 border-t border-border-light">
            {sidebar}
          </div>
        </article>

        <aside className="hidden 2xl-memo:block w-[400px] shrink-0 px-[50px] sticky top-[70px] self-start max-h-[calc(100vh-90px)] overflow-y-auto">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
