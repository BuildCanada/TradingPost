import "@buildcanada/charts/styles.css";

import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/api";
import {
  getEconomicSeries,
  type EconomySeriesResponse,
} from "@/lib/api/economy";
import { PageHeader } from "@/components/ui/page-header";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import IndicatorChartClient from "./IndicatorChartClient";
import DashboardNav from "./DashboardNav";
import SourceLine from "./SourceLine";
import {
  DASHBOARD_INDICATORS,
  DASHBOARD_SECTIONS,
  type DashboardIndicator,
} from "./dashboard";

const DESCRIPTION =
  "Are we moving in the right direction? Canada's growth, jobs, cost of living, and immigration on one page, measured against the G7 and OECD.";

export const metadata: Metadata = {
  title: "Prosperity Dashboard",
  description: DESCRIPTION,
  alternates: { canonical: "/prosperity-dashboard" },
  openGraph: {
    title: "Prosperity Dashboard",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prosperity Dashboard",
  },
};

// Anchor targets must clear the sticky navbar + DashboardNav stack, whose
// height grows as the nav links wrap on narrower screens.
const SECTION_SCROLL_MT = "scroll-mt-[220px] sm:scroll-mt-[160px]";

// Chart headings link to their own anchor so a reader can grab a URL
// straight to one chart.
function AnchoredHeading({ id, text }: { id: string; text: string }) {
  return (
    <h3 className="type-h4 text-dark">
      <a href={`#${id}`} className="group">
        {text}
        <span
          aria-hidden="true"
          className="ml-2 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          #
        </span>
      </a>
    </h3>
  );
}

function UnavailablePanel() {
  return (
    <div className="flex h-[320px] items-center justify-center border border-border-light bg-bg">
      <p className="type-body text-dark/60">
        Data is temporarily unavailable. Please check back soon.
      </p>
    </div>
  );
}

function ChartCard({
  indicator,
  response,
}: {
  indicator: DashboardIndicator;
  response: EconomySeriesResponse | null;
}) {
  return (
    <div id={indicator.slug} className={SECTION_SCROLL_MT}>
      <AnchoredHeading id={indicator.slug} text={indicator.heading} />
      <p className="mt-1 mb-6 type-body-sm text-dark/60 max-w-[720px]">
        {indicator.blurb}
      </p>
      {response ? (
        <>
          <IndicatorChartClient
            response={response}
            benchmark={indicator.benchmark}
          />
          <SourceLine response={response} />
        </>
      ) : (
        <UnavailablePanel />
      )}
    </div>
  );
}

export default async function ProsperityDashboardPage() {
  const configData = getSiteConfig();

  const results = await Promise.all(
    DASHBOARD_INDICATORS.map((indicator) =>
      getEconomicSeries(indicator.slug).catch(() => null),
    ),
  );
  const responseBySlug = new Map(
    DASHBOARD_INDICATORS.map((indicator, i) => [indicator.slug, results[i]]),
  );

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema(
      "/prosperity-dashboard",
      "Prosperity Dashboard",
      configData.siteUrl,
    ),
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader title="Prosperity Dashboard" description={DESCRIPTION} />

      <DashboardNav />

      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto space-y-20">
          {DASHBOARD_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={SECTION_SCROLL_MT}
            >
              <h2 className="type-h3 text-dark">{section.title}</h2>
              {section.description && (
                <p className="mt-2 type-body text-dark/70 max-w-[720px]">
                  {section.description}
                </p>
              )}

              {section.indicators.length > 0 && (
                <div
                  className={
                    section.hero
                      ? "mt-8 space-y-12"
                      : "mt-8 grid gap-x-10 gap-y-12 lg:grid-cols-2"
                  }
                >
                  {section.indicators.map((indicator) => (
                    <ChartCard
                      key={indicator.slug}
                      indicator={indicator}
                      response={responseBySlug.get(indicator.slug) ?? null}
                    />
                  ))}
                </div>
              )}

              {section.planned && section.planned.length > 0 && (
                <div className="mt-8 border border-dashed border-border-light px-5 py-4">
                  <p className="type-label text-dark/70">In the works</p>
                  <ul className="mt-2 space-y-1">
                    {section.planned.map((planned) => (
                      <li
                        key={planned.heading}
                        className="type-body-sm text-dark/60"
                      >
                        {planned.heading}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}

          <div className="border-t border-border-light pt-12 text-center">
            <h2 className="type-h3 text-dark">
              Missing a measure that matters?
            </h2>
            <p className="mt-2 type-body text-dark/70 max-w-[560px] mx-auto">
              We&rsquo;re expanding this dashboard. If there&rsquo;s an
              indicator that would sharpen the picture — for better or worse
              — tell us and we&rsquo;ll track it.
            </p>
            <a
              href="mailto:hi@buildcanada.com?subject=Prosperity%20dashboard%20indicator%20request"
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
