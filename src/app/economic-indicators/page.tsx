import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/lib/api";
import { getEconomicSeries } from "@/lib/api/economy";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import SectionNav from "./SectionNav";
import SectionSparkline from "./SectionSparkline";
import { SECTIONS } from "./indicators";

const DESCRIPTION =
  "Are we moving in the right direction? Canada's growth, incomes, housing, safety, and wellbeing, measured against the G7 and OECD.";

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

export default async function EconomicIndicatorsPage() {
  const configData = getSiteConfig();

  const featuredSeries = await Promise.all(
    SECTIONS.map((section) =>
      getEconomicSeries(section.featuredSlug).catch(() => null),
    ),
  );

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
        description="Are we moving in the right direction? Canadian prosperity, measured."
      />

      <SectionNav />

      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">
          <div className="mb-10 max-w-[720px] space-y-4">

            <p className="type-body text-dark/80">

              <strong className="text-dark">

                Canada should be the most prosperous country in the world.

              </strong>{" "}

              We have the land, energy, talent, and institutions. The question is

              whether we are turning those advantages into better lives — and that is

              measurable.

            </p>

            <p className="type-body text-dark/80">

              The charts below track the foundations of prosperity: growth, incomes,

              housing, safety, and wellbeing. Canada is the red line, measured against

              its G7 and OECD peers. Each chart asks a simple question: are we moving

              in the right direction?

            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {SECTIONS.map((section, i) => {
              const preview = featuredSeries[i];
              const featuredHeading = section.indicators.find(
                (indicator) => indicator.slug === section.featuredSlug,
              )?.heading;
              return (
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
                  {preview && (
                    <div className="mt-5">
                      <p className="type-label-sm text-dark/50">
                        {featuredHeading}
                      </p>
                      <div className="mt-2">
                        <SectionSparkline response={preview} />
                      </div>
                    </div>
                  )}
                  <p className="mt-4 type-label-sm text-dark/50">
                    {section.indicators.map((i) => i.heading).join(" · ")}
                  </p>
                  <span className="mt-auto pt-4 type-label text-dark/70 group-hover:text-dark">
                    View {section.indicators.length}{" "}
                    {section.indicators.length === 1 ? "chart" : "charts"}{" "}
                    &rarr;
                  </span>
                </Link>
              );
            })}

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
              Missing a measure that matters?
            </h2>
            <p className="mt-2 type-body text-dark/70 max-w-[560px] mx-auto">
              We&rsquo;re expanding this dashboard. If there&rsquo;s an
              indicator that would sharpen the picture — for better or worse
              — tell us and we&rsquo;ll track it.
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
