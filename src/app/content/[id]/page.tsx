import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.feedItem.findUnique({ where: { id } });

  if (!item || item.type !== "BLOG") {
    return { title: "Content | Build Canada" };
  }

  const title = `${item.title || "Post"} | Build Canada`;
  const description = item.subtitle || item.title || "A post from Build Canada";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: item.createdAt.toISOString(),
      ...(item.author && { authors: [item.author] }),
      ...(item.image && { images: [{ url: item.image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(item.image && { images: [item.image] }),
    },
  };
}

export default async function ContentItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.feedItem.findUnique({ where: { id } });

  if (!item) notFound();

  if (item.type !== "BLOG") {
    if (item.url) {
      redirect(item.url);
    }
    redirect("/content");
  }

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
    generateBreadcrumbSchema(`/content/${item.id}`, item.title || "Content", siteConfig.siteUrl)
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <article className="animate-fade-in max-w-2xl mx-auto px-5 pt-[50px] pb-[60px]">
      <Link
        href="/content"
        className="type-label text-text-muted hover:text-dark transition-colors"
      >
        &larr; Back to Content
      </Link>

      {item.image && (
        <div className="relative w-full h-[240px] md:h-[360px] mt-6 overflow-hidden bg-border-light">
          <Image
            src={item.image}
            alt={item.title || ""}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <h1 className="type-title mt-6">
        {item.title}
      </h1>

      {item.subtitle && (
        <p className="type-body text-text-secondary mt-2">{item.subtitle}</p>
      )}

      {item.author && (
        <div className="flex items-center gap-3 mt-5 pb-5 border-b border-border-light">
          {item.authorPhoto ? (
            <div
              className="w-9 h-9 overflow-hidden shrink-0"
              style={{ borderRadius: 2 }}
            >
              <Image
                src={item.authorPhoto}
                alt={item.author}
                width={36}
                height={36}
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div
              className="w-9 h-9 bg-border-light flex items-center justify-center type-label-sm text-text-secondary shrink-0"
              style={{ borderRadius: 2 }}
            >
              {item.author.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="type-label font-medium">{item.author}</p>
            <p className="type-label-sm text-text-muted">
              {new Date(item.createdAt).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {item.body && (
        <div
          className="mt-6 prose-bc"
          dangerouslySetInnerHTML={{ __html: item.body }}
        />
      )}
    </article>
    </div>
  );
}
