import { fetchMemo } from "@/lib/api/memos";
import { fetchPost } from "@/lib/api/posts";
import { fetchBuilder } from "@/lib/api/builders";
import { getSiteConfig } from "@/lib/api/config";
import { buildGraph } from "@/lib/schemas/graph";
import { generateArticleSchema } from "@/lib/schemas/generators/article";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { htmlToMarkdown } from "./html-to-markdown";
import { buildMarkdownDocument, type MarkdownDocument } from "./document";

export type MarkdownContentResult =
  | { kind: "document"; doc: MarkdownDocument; canonicalUrl: string }
  | { kind: "redirect"; location: string };

export type MarkdownContentBuilder = (slug: string) => Promise<MarkdownContentResult>;

export async function memoMarkdown(slug: string): Promise<MarkdownContentResult> {
  const memo = await fetchMemo(slug);
  if (memo.slug !== slug) {
    return { kind: "redirect", location: `/memos/${memo.slug}.md` };
  }

  const config = getSiteConfig();
  const canonicalUrl = `${config.siteUrl}/memos/${memo.slug}`;
  const convert = (html: string | null | undefined) =>
    html ? htmlToMarkdown(html, { baseUrl: config.siteUrl }) : Promise.resolve("");

  const [body, appendix, supporters] = await Promise.all([
    convert(memo.body),
    convert(memo.appendix),
    convert(memo.supporters),
  ]);

  const keyMessages = memo.keyMessages.length
    ? "## Key Messages\n\n" + memo.keyMessages.map((m, i) => `${i + 1}. ${m}`).join("\n")
    : null;

  const authorImage =
    memo.author.name === "Build Canada"
      ? "/assets/logos/buildcanada-logo-square.svg"
      : memo.author.photo;

  const jsonLd = buildGraph(
    generateOrganizationSchema(config),
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
      config,
    ),
    generateBreadcrumbSchema(`/memos/${memo.slug}`, memo.title, config.siteUrl),
  );

  const doc = buildMarkdownDocument({
    frontmatter: {
      title: memo.title,
      description: memo.keyMessage1,
      image: memo.seoImage,
      author: memo.author.title ? `${memo.author.name}, ${memo.author.title}` : memo.author.name,
      published: memo.publishedAt,
      canonical: canonicalUrl,
    },
    sections: [
      `# ${memo.title}`,
      keyMessages,
      body,
      appendix ? `## Appendix\n\n${appendix}` : null,
      supporters ? `## Supporters\n\n${supporters}` : null,
    ],
    jsonLd,
  });

  return { kind: "document", doc, canonicalUrl };
}

export async function postMarkdown(slug: string): Promise<MarkdownContentResult> {
  const post = await fetchPost(slug);
  if (post.slug !== slug) {
    return { kind: "redirect", location: `/posts/${post.slug}.md` };
  }

  const config = getSiteConfig();
  const canonicalUrl = `${config.siteUrl}/posts/${post.slug}`;
  const body = post.body ? await htmlToMarkdown(post.body, { baseUrl: config.siteUrl }) : "";

  const jsonLd = buildGraph(
    generateOrganizationSchema(config),
    generateBreadcrumbSchema(`/posts/${post.slug}`, post.title, config.siteUrl),
  );

  const doc = buildMarkdownDocument({
    frontmatter: {
      title: post.title,
      description: post.summary,
      image: post.seoImage,
      published: post.publishedAt,
      canonical: canonicalUrl,
    },
    sections: [
      `# ${post.title}`,
      post.summary ? `> ${post.summary.replace(/\n/g, "\n> ")}` : null,
      body,
    ],
    jsonLd,
  });

  return { kind: "document", doc, canonicalUrl };
}

export async function builderMarkdown(slug: string): Promise<MarkdownContentResult> {
  const builder = await fetchBuilder(slug);
  if (builder.slug !== slug) {
    return { kind: "redirect", location: `/builders/${builder.slug}.md` };
  }

  const config = getSiteConfig();
  const canonicalUrl = `${config.siteUrl}/builders/${builder.slug}`;
  const body = builder.body ? await htmlToMarkdown(builder.body, { baseUrl: config.siteUrl }) : "";

  const title = builder.tagline ? `${builder.name}: ${builder.tagline}` : builder.name;

  const doc = buildMarkdownDocument({
    frontmatter: {
      title,
      description: builder.quote,
      image: builder.imageUrl,
      canonical: canonicalUrl,
    },
    sections: [
      `# ${title}`,
      builder.quote ? `> "${builder.quote}"` : null,
      body,
      builder.author ? `_Written by ${builder.author}_` : null,
    ],
  });

  return { kind: "document", doc, canonicalUrl };
}

export const markdownBuilders: Record<string, MarkdownContentBuilder> = {
  memos: memoMarkdown,
  posts: postMarkdown,
  builders: builderMarkdown,
};
