import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchPost, fetchPosts, getSiteConfig } from "@/lib/api";
import { extractHeadings } from "@/lib/extract-headings";
import { ShareSection } from "@/components/share";
import { Signpost } from "@/components/custom/signpost";
import { SubscribeButton } from "@/components/ui/subscribe-button";
import { buildGraph } from "@/lib/schemas/graph";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { DraftPreviewBanner } from "@/components/auth/DraftPreviewBanner";
import { setAccessToken } from "@/lib/auth-token";
import { getCurrentUser, getAccessTokenCookie } from "@/lib/auth";

// Draft preview is gated on the signed-in user actually being an admin (live
// from /me), never on a baked cookie. When they are, we hand apiFetch the
// access token so it fetches drafts; otherwise the request store stays empty
// and only published content is returned.
async function resolveAccessToken(): Promise<string | undefined> {
  const user = await getCurrentUser();
  const token = user?.admin ? await getAccessTokenCookie() : undefined;
  setAccessToken(token);
  return token;
}

export async function generateStaticParams() {
  try {
    const posts = await fetchPosts();
    return posts.map((p) => ({ slug: p.slug }));
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
  await resolveAccessToken();
  let post;
  try {
    post = await fetchPost(slug);
  } catch {
    return { title: "Post Not Found | Build Canada" };
  }

  const title = `${post.title} | Build Canada`;
  const description = post.summary ?? undefined;
  const image = post.seoImage || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/posts/${post.slug}`,
      types: { "text/markdown": `/posts/${post.slug}.md` },
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? post.createdAt,
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

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const accessToken = await resolveAccessToken();

  let post;
  try {
    post = await fetchPost(slug);
  } catch {
    if (!accessToken) notFound();

    return (
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
        <div className="max-w-[720px] mx-auto px-[5vw] md:px-[10vw] py-24 flex flex-col items-center gap-8 text-center">
          <p className="type-label text-text-secondary">404</p>
          <h1 className="type-title">Post not found</h1>
          <p className="type-body text-text-secondary">
            This post doesn&apos;t exist or hasn&apos;t been published yet.
          </p>
          <DraftPreviewBanner state="draft-not-found" slug={slug} />
        </div>
      </div>
    );
  }

  if (post.slug !== slug) {
    permanentRedirect(`/posts/${post.slug}`);
  }

  // A post is a draft when it has no publish date, or one scheduled in the
  // future. The preview banner is for genuine drafts only — not every post an
  // admin happens to be viewing.
  const isDraft = !post.publishedAt || new Date(post.publishedAt) > new Date();

  const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString(
    "en-CA",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const configData = getSiteConfig();
  const fullUrl = `${configData.siteUrl}/posts/${post.slug}`;

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema(`/posts/${post.slug}`, post.title, configData.siteUrl),
  );

  const { headings, html: bodyHtml } = extractHeadings(post.body ?? "");

  const sidebar = (
    <div className="space-y-5">
      <ShareSection title={post.title} url={fullUrl} />
      <SubscribeButton variant="primary" source="inline" className="w-full">
        Subscribe
      </SubscribeButton>
    </div>
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      {accessToken && isDraft && (
        <DraftPreviewBanner state="viewing-draft" slug={slug} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1400px] mx-auto w-full px-[5vw] py-10 md:px-[10vw]">
        <Link
          href="/posts"
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
          All posts
        </Link>

        <h1 className="type-title mb-4 max-w-[720px]">{post.title}</h1>
        <p className="type-label text-text-secondary">{date}</p>
      </div>

      <div
        className="animate-fade-in max-w-[1400px] mx-auto px-[5vw] md:px-[10vw] pt-4 pb-[52px] 2xl-memo:grid 2xl-memo:grid-cols-[240px_minmax(0,1fr)] 2xl-memo:gap-12"
        style={{ animationDelay: "0.3s" }}
      >
        <Signpost headings={headings} shareTitle={post.title} shareUrl={fullUrl} />

        <article className="max-w-[720px]" data-memo-content>
          {post.summary && (
            <div className="mb-8 p-6 border-[3px] border-double border-border-light bg-[#f0e5dc]">
              <span className="type-label block mb-3">Summary</span>
              <p className="type-body whitespace-pre-line">{post.summary}</p>
            </div>
          )}

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
