import "@buildcanada/charts/styles.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import IndicatorChartClient from "../IndicatorChartClient";
import SectionNav from "../SectionNav";
import { SECTIONS } from "../indicators";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section: section.id }));
}

type PageProps = { params: Promise<{ section: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { section: sectionId } = await params;
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return {};
  const title = `${section.title} — Economic Indicators`;
  return {
    title,
    description: section.description,
    alternates: { canonical: `/economic-indicators/${section.id}` },
    openGraph: {
      title,
      description: section.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
    },
  };
}

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

export default async function IndicatorSectionPage({ params }: PageProps) {
  const { section: sectionId } = await params;
  const sectionIndex = SECTIONS.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) notFound();

  const section = SECTIONS[sectionIndex];
  const prev = sectionIndex > 0 ? SECTIONS[sectionIndex - 1] : null;
  const next =
    sectionIndex < SECTIONS.length - 1 ? SECTIONS[sectionIndex + 1] : null;

  const configData = getSiteConfig();

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema(
      `/economic-indicators/${section.id}`,
      section.title,
      configData.siteUrl,
    ),
  );

  const results = await Promise.all(
    section.indicators.map((indicator) =>
      getEconomicSeries(indicator.slug).catch(() => null),
    ),
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader title={section.title} description={section.description} />

      <SectionNav currentId={section.id} />

      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto space-y-16">
          {section.indicators.map((indicator, i) => {
            const response = results[i];
            return (
              <section key={indicator.slug}>
                <h2 className="type-h4 text-dark">{indicator.heading}</h2>
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

          <nav
            aria-label="Section pagination"
            className="flex justify-between gap-4 border-t border-border-light pt-8"
          >
            {prev ? (
              <Link
                href={`/economic-indicators/${prev.id}`}
                className="type-label text-dark/70 hover:text-dark underline-offset-4 hover:underline"
              >
                &larr; {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/economic-indicators/${next.id}`}
                className="type-label text-dark/70 hover:text-dark underline-offset-4 hover:underline text-right"
              >
                {next.title} &rarr;
              </Link>
            ) : (
              <span />
            )}
          </nav>

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
