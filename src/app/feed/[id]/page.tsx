import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.feedItem.findUnique({ where: { id } });

  if (!item || item.type !== "BLOG") {
    return { title: "Feed | Build Canada" };
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
      card: item.image ? "summary_large_image" : "summary",
      title,
      description,
      ...(item.image && { images: [item.image] }),
    },
  };
}

export default async function FeedItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.feedItem.findUnique({ where: { id } });

  if (!item) notFound();

  // Non-blog types redirect to their external URL
  if (item.type !== "BLOG") {
    if (item.url) {
      redirect(item.url);
    }
    // No URL set — go back to feed
    redirect("/feed");
  }

  return (
    <div className="mx-[10px] my-[10px] border border-[var(--color-border-light)] bg-[var(--color-bg)]">
    <article className="max-w-2xl mx-auto px-5 pt-[50px] pb-[60px]">
      <Link
        href="/feed"
        className="type-label text-[var(--color-text-muted)] hover:text-[var(--color-dark)] transition-colors"
      >
        &larr; Back to Feed
      </Link>

      {item.image && (
        <div className="relative w-full h-[240px] md:h-[360px] mt-6 rounded overflow-hidden bg-[var(--color-border-light)]">
          <Image
            src={item.image}
            alt={item.title || ""}
            fill
            className="object-cover"
          />
        </div>
      )}

      <h1 className="type-title mt-6">
        {item.title}
      </h1>

      {item.subtitle && (
        <p className="type-body text-[var(--color-text-secondary)] mt-2">{item.subtitle}</p>
      )}

      {item.author && (
        <div className="flex items-center gap-3 mt-5 pb-5 border-b border-[var(--color-border-light)]">
          {item.authorPhoto ? (
            <Image
              src={item.authorPhoto}
              alt={item.author}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--color-border-light)] flex items-center justify-center type-label-sm text-[var(--color-text-secondary)]">
              {item.author.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="type-label font-medium">{item.author}</p>
            <p className="type-label-sm text-[var(--color-text-muted)]">
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
