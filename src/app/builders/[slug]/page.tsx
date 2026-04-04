import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchBuilder, fetchBuilders } from "@/lib/api/builders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const builder = await fetchBuilder(slug);
    return {
      title: `${builder.name}: ${builder.tagline}`,
      description: builder.quote ?? undefined,
      openGraph: {
        title: `${builder.name}: ${builder.tagline} | Build Canada`,
        description: builder.quote ?? undefined,
        type: "article",
        images: builder.imageUrl ? [{ url: builder.imageUrl }] : undefined,
      },
    };
  } catch {
    return { title: "Builder Not Found | Build Canada" };
  }
}

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let builder;
  try {
    builder = await fetchBuilder(slug);
  } catch {
    notFound();
  }

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <article className="animate-fade-in max-w-2xl mx-auto px-5 pt-[50px] pb-[60px]">
        <Link
          href="/builders"
          className="type-label text-text-muted hover:text-dark transition-colors"
        >
          &larr; Back to Great Canadian Builders
        </Link>

        {builder.imageUrl && (
          <div className="relative w-full h-[240px] md:h-[360px] mt-6 overflow-hidden bg-border-light">
            <Image
              src={builder.imageUrl}
              alt={`${builder.name} — ${builder.tagline}`}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        )}

        <h1 className="type-title mt-6">{builder.name}</h1>
        <p className="type-body text-text-secondary mt-1">{builder.tagline}</p>

        {builder.quote && (
          <blockquote className="border-l-2 border-border-light pl-4 my-6">
            <p className="type-body italic text-text-secondary">
              &ldquo;{builder.quote}&rdquo;
            </p>
          </blockquote>
        )}

        {builder.body && (
          <div
            className="mt-6 prose-bc"
            dangerouslySetInnerHTML={{ __html: builder.body }}
          />
        )}

        {builder.author && (
          <p className="type-body-sm text-text-secondary mt-8">
            Written by {builder.author}
          </p>
        )}
      </article>
    </div>
  );
}
