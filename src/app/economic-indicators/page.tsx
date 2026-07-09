import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import SectionNav from "./SectionNav";
import { SECTIONS } from "./indicators";

const DESCRIPTION =
  "How Canada stacks up against the G7 and OECD — growth, productivity, incomes, inequality, and housing.";

export const metadata: Metadata = {
  title: "Economic Indicators",
  description: DESCRIPTION,
  alternates: { canonical: "/economic-indicators" },
  openGraph: {
    title: "Economic Indicators",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Economic Indicators",
  },
};

export default function EconomicIndicatorsPage() {
  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema(
      "/economic-indicators",
      "Economic Indicators",
      configData.siteUrl,
    ),
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title="Economic Indicators"
        description="How Canada stacks up against its peers — growth, incomes, and housing."
      />

      <SectionNav />

      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid gap-5 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={`/economic-indicators/${section.id}`}
                className="group flex flex-col border border-border-light p-6 hover:border-dark transition-colors"
              >
                <h2 className="type-h4 text-dark group-hover:underline underline-offset-4">
                  {section.title}
                </h2>
                <p className="mt-2 type-body-sm text-dark/70">
                  {section.description}
                </p>
                <p className="mt-4 type-label-sm text-dark/50">
                  {section.indicators.map((i) => i.heading).join(" · ")}
                </p>
                <span className="mt-auto pt-4 type-label text-dark/70 group-hover:text-dark">
                  View {section.indicators.length}{" "}
                  {section.indicators.length === 1 ? "chart" : "charts"} &rarr;
                </span>
              </Link>
            ))}

            <Link
              href="/economic-indicators/canvas"
              className="group flex flex-col border border-border-light p-6 hover:border-dark transition-colors"
            >
              <h2 className="type-h4 text-dark group-hover:underline underline-offset-4">
                Indicator Canvas
              </h2>
              <p className="mt-2 type-body-sm text-dark/70">
                Overlay up to three indicator series and eyeball how they move
                together.
              </p>
              <span className="mt-auto pt-4 type-label text-dark/70 group-hover:text-dark">
                Open the canvas &rarr;
              </span>
            </Link>
          </div>

          <div className="mt-16 border-t border-border-light pt-12 text-center">
            <h2 className="type-h3 text-dark">
              Want to see another indicator?
            </h2>
            <p className="mt-2 type-body text-dark/70 max-w-[560px] mx-auto">
              We&rsquo;re expanding this dashboard. If there&rsquo;s a metric
              you&rsquo;d like us to track, let us know.
            </p>
            <a
              href="mailto:hi@buildcanada.com?subject=Economic%20indicators%20request"
              className="mt-6 inline-block border border-dark px-5 py-2.5 type-label text-dark hover:bg-dark hover:text-bg transition-colors"
            >
              Email us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
