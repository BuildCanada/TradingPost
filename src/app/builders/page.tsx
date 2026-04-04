import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import { fetchBuilders } from "@/lib/api/builders";

export const metadata: Metadata = {
  title: "Great Canadian Builders",
  description:
    "Short stories celebrating the incredible builders who shaped Canada.",
};

export default async function BuildersPage() {
  const builders = await fetchBuilders();

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">
          <SectionLabel as="h2">Great Canadian Builders</SectionLabel>
          <p className="type-body text-text-secondary mb-8">
            Short stories celebrating the incredible builders who shaped Canada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {builders.map((builder) => (
              <Link
                key={builder.slug}
                href={`/builders/${builder.slug}`}
                className="group border border-border-light overflow-hidden hover:border-dark transition-colors"
              >
                <div className="relative w-full h-[200px] overflow-hidden bg-border-light">
                  {builder.imageUrl && (
                    <Image
                      src={builder.imageUrl}
                      alt={`${builder.name} — ${builder.tagline}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-display text-[1.25rem] font-normal leading-[1.2] text-dark mb-1 group-hover:underline">
                    {builder.name}
                  </h2>
                  <p className="type-label-sm text-text-secondary uppercase">
                    {builder.tagline}
                  </p>
                  {builder.quote && (
                    <p className="type-body-sm text-text-secondary mt-2 line-clamp-2">
                      &ldquo;{builder.quote}&rdquo;
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
