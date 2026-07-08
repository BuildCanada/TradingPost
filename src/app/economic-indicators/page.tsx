import "@buildcanada/charts/styles.css";

import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/api";
import {
  getEconomicSeries,
  humanizeSourceName,
  type EconomySeriesResponse,
} from "@/lib/api/economy";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import IndicatorChartClient from "./IndicatorChartClient";
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

function formatFetchedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "long" }).format(date);
}

function SourceLine({ response }: { response: EconomySeriesResponse }) {
  const source = response.meta.source;
  if (!source) return null;
  const updated = source.last_fetched_at
    ? formatFetchedDate(source.last_fetched_at)
    : "";
  const sourceName = humanizeSourceName(source.name);
  return (
    <p className="mt-3 type-label-sm text-dark/60">
      Source:{" "}
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-dark"
        >
          {sourceName}
        </a>
      ) : (
        sourceName
      )}
      {updated && <> &middot; Updated {updated}</>}
    </p>
  );
}

function UnavailablePanel() {
  return (
    <div className="flex h-[360px] items-center justify-center border border-border-light bg-bg">
      <p className="type-body text-dark/60">
        Data is temporarily unavailable. Please check back soon.
      </p>
    </div>
  );
}

export default async function EconomicIndicatorsPage() {
  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema(
      "/economic-indicators",
      "Economic Indicators",
      configData.siteUrl,
    ),
  );

  const slugs = SECTIONS.flatMap((s) => s.indicators.map((i) => i.slug));
  const results = await Promise.all(
    slugs.map((slug) => getEconomicSeries(slug).catch(() => null)),
  );
  const responseBySlug = new Map(slugs.map((slug, i) => [slug, results[i]]));

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

      <nav
        aria-label="Indicator sections"
        className="border-b border-border-light px-5 py-3"
      >
        <div className="max-w-[1080px] mx-auto flex flex-wrap gap-x-6 gap-y-1">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="type-label text-dark/70 hover:text-dark underline-offset-4 hover:underline"
            >
              {section.title}
            </a>
          ))}
        </div>
      </nav>

      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto space-y-20">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
            >
              <h2 className="type-h2 text-dark">{section.title}</h2>
              <p className="mt-1 type-body text-dark/70 max-w-[720px]">
                {section.description}
              </p>

              <div className="mt-10 space-y-16">
                {section.indicators.map((indicator) => {
                  const response = responseBySlug.get(indicator.slug) ?? null;
                  return (
                    <section key={indicator.slug}>
                      <h3 className="type-h4 text-dark">
                        {indicator.heading}
                      </h3>
                      <p className="mt-1 mb-6 type-body-sm text-dark/60 max-w-[720px]">
                        {indicator.blurb ||
                          response?.data.measure.description ||
                          ""}
                      </p>
                      {response ? (
                        <>
                          <IndicatorChartClient response={response} />
                          <SourceLine response={response} />
                        </>
                      ) : (
                        <UnavailablePanel />
                      )}
                    </section>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="border-t border-border-light pt-12 text-center">
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
