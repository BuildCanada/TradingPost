import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { builders, getBuilderBySlug } from "@/lib/builders";

export function generateStaticParams() {
  return builders.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const builder = getBuilderBySlug(slug);
  if (!builder) return { title: "Builder Not Found | Build Canada" };

  return {
    title: `${builder.name}: ${builder.tagline}`,
    description: builder.quote,
    openGraph: {
      title: `${builder.name}: ${builder.tagline} | Build Canada`,
      description: builder.quote,
      type: "article",
      images: [{ url: builder.gif }],
    },
  };
}

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const builder = getBuilderBySlug(slug);
  if (!builder) notFound();

  const paragraphs = builder.story.split("\n\n");

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <article className="animate-fade-in max-w-2xl mx-auto px-5 pt-[50px] pb-[60px]">
        <Link
          href="/builders"
          className="type-label text-text-muted hover:text-dark transition-colors"
        >
          &larr; Back to Great Canadian Builders
        </Link>

        <div className="relative w-full h-[240px] md:h-[360px] mt-6 overflow-hidden bg-border-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={builder.gif}
            alt={`${builder.name} — ${builder.tagline}`}
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="type-title mt-6">{builder.name}</h1>
        <p className="type-body text-text-secondary mt-1">{builder.tagline}</p>

        <blockquote className="border-l-2 border-border-light pl-4 my-6">
          <p className="type-body italic text-text-secondary">
            &ldquo;{builder.quote}&rdquo;
          </p>
        </blockquote>

        <div className="mt-6 space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="type-body text-dark leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
