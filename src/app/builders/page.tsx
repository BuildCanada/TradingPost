import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import { builders } from "@/lib/builders";

export const metadata: Metadata = {
  title: "Great Canadian Builders",
  description:
    "Short stories celebrating the incredible builders who shaped Canada.",
};

export default function BuildersPage() {
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={builder.gif}
                    alt={`${builder.name} — ${builder.tagline}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-display text-[1.25rem] font-normal leading-[1.2] text-dark mb-1 group-hover:underline">
                    {builder.name}
                  </h2>
                  <p className="type-label-sm text-text-secondary uppercase">
                    {builder.tagline}
                  </p>
                  <p className="type-body-sm text-text-secondary mt-2 line-clamp-2">
                    &ldquo;{builder.quote}&rdquo;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
