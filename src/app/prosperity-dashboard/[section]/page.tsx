import "@buildcanada/charts/styles.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/api";
import { getEconomicSeries } from "@/lib/api/economy";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import { Signpost } from "@/components/custom/signpost";
import CombinedSectionChartClient from "../CombinedSectionChartClient";
import IndicatorChartClient from "../IndicatorChartClient";
import SectionNav from "../SectionNav";
import SourceLine from "../SourceLine";
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
  const title = `${section.title} — Prosperity Dashboard`;
  return {
    title,
    description: section.description,
    alternates: { canonical: `/prosperity-dashboard/${section.id}` },
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

// Deep-link targets must clear the sticky navbar + SectionNav stack, whose
// height grows as the section links wrap on narrower screens.
const SECTION_SCROLL_MT =
  "scroll-mt-[300px] sm:scroll-mt-[220px] md:scroll-mt-[200px]";

// Chart headings link to their own anchor so a reader can grab a URL
// straight to one chart.
function AnchoredHeading({ id, text }: { id: string; text: string }) {
  return (
    <h2 className="type-h4 text-dark">
      <a href={`#${id}`} className="group">
        {text}
        <span
          aria-hidden="true"
          className="ml-2 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          #
        </span>
      </a>
    </h2>
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
      `/prosperity-dashboard/${section.id}`,
      section.title,
      configData.siteUrl,
    ),
  );

  const results = await Promise.all(
    section.indicators.map((indicator) =>
      getEconomicSeries(indicator.slug).catch(() => null),
    ),
  );

  const combinedItems = section.combined
    ? section.indicators.flatMap((indicator, i) => {
        const response = results[i];
        return response
          ? [{ label: indicator.chartLabel ?? indicator.heading, response }]
          : [];
      })
    : [];

  const signpostHeadings = [
    ...(section.combined && combinedItems.length > 0
      ? [{ id: "combined", text: section.combined.heading, level: 2 as const }]
      : []),
    ...section.indicators.map((indicator) => ({
      id: indicator.slug,
      text: indicator.heading,
      level: 2 as const,
    })),
  ];

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader title={section.title} description={section.description} />

      <SectionNav currentId={section.id} />

      <section className="px-5 py-12">
        {/* Same layout as memo pages: a signpost rail column appears at
            2xl-memo; below that, SectionNav is the page's navigation. The
            rail's sticky top and scroll offset clear the navbar (~70px)
            plus the sticky SectionNav (up to two wrapped rows). */}
        <div className="max-w-[1400px] mx-auto 2xl-memo:grid 2xl-memo:grid-cols-[240px_minmax(0,1fr)] 2xl-memo:gap-12">
          <Signpost
            headings={signpostHeadings}
            desktopTopClass="top-[170px]"
            scrollOffset={200}
            showMobileBar={false}
            showTopBorder={false}
          />
          <div className="max-w-[1080px] mx-auto 2xl-memo:mx-0 w-full min-w-0 space-y-16">
            {section.combined && combinedItems.length > 0 && (
              <section id="combined" className={SECTION_SCROLL_MT}>
                <AnchoredHeading id="combined" text={section.combined.heading} />
                <p className="mt-1 mb-6 type-body-sm text-dark/60 max-w-[720px]">
                  {section.combined.blurb}
                </p>
                <CombinedSectionChartClient
                  heading={section.combined.heading}
                  items={combinedItems}
                  benchmark={section.benchmark}
                />
                <SourceLine response={combinedItems[0].response} />
              </section>
            )}

            {section.indicators.map((indicator, i) => {
              const response = results[i];
              return (
                <section
                  key={indicator.slug}
                  id={indicator.slug}
                  className={SECTION_SCROLL_MT}
                >
                  <AnchoredHeading
                    id={indicator.slug}
                    text={indicator.heading}
                  />
                  <p className="mt-1 mb-6 type-body-sm text-dark/60 max-w-[720px]">
                    {indicator.blurb ||
                      response?.data.measure.description ||
                      ""}
                  </p>
                  {response ? (
                    <>
                      <IndicatorChartClient
                        response={response}
                        benchmark={section.benchmark}
                      />
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
                  href={`/prosperity-dashboard/${prev.id}`}
                  className="type-label text-dark/70 hover:text-dark underline-offset-4 hover:underline"
                >
                  &larr; {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/prosperity-dashboard/${next.id}`}
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
        </div>
      </section>
    </div>
  );
}
