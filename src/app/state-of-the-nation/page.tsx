import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/api";
import {
  getEconomicSeries,
  type EconomySeriesResponse,
} from "@/lib/api/economy";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import StateChart from "./StateChart";
import {
  buildSections,
  SOTN_INDICATOR_COUNT,
  SOTN_MEASURE_SLUGS,
  type SotnView,
} from "./state-of-the-nation";

const DESCRIPTION =
  "Sixteen indicators, read honestly. Where Canada leads, where we lag, and where the picture is genuinely mixed — measured against our own record.";

export const metadata: Metadata = {
  title: "State of the Nation",
  description: DESCRIPTION,
  alternates: { canonical: "/state-of-the-nation" },
  openGraph: {
    title: "State of the Nation",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "State of the Nation",
  },
};

// Warm grey used by the design for secondary mono text; no site token.
const GRAY = "#6f6a63";
const BD = "#CDC4BD";

function lastUpdatedLabel(
  responses: (EconomySeriesResponse | null)[],
): string | null {
  const dates = responses
    .map((r) => r?.meta.source?.last_fetched_at)
    .filter((d): d is string => !!d)
    .sort();
  const latest = dates[dates.length - 1];
  if (!latest) return null;
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(new Date(latest));
}

// A chart card: meta row, chart title + chart, and the source attribution
// the data licences require. Cards tile 2×2 on desktop within their section,
// ruled by the design's warm hairlines; `wide` cards span both columns
// (the headline chart).
function IndicatorCard({
  indicator,
  wide,
}: {
  indicator: SotnView;
  wide?: boolean;
}) {
  return (
    <section
      className={`flex flex-col border-[#CDC4BD] border-b px-[clamp(24px,5vw,88px)] py-[clamp(32px,4vw,56px)] ${wide
        ? "lg:col-span-2"
        : "lg:[&:nth-child(odd):not(:last-child)]:border-r"
        }`}
    >
      <div className="mb-5 flex flex-wrap items-baseline gap-4">
        <span className="type-label text-auburn-800 tracking-[0.12em]">
          {indicator.n}
        </span>
        <span
          className="type-label uppercase tracking-[0.12em]"
          style={{ color: GRAY }}
        >
          {indicator.title}
        </span>
      </div>
      <StateChart spec={indicator.spec} wide={wide} />
      <div
        className="mt-5 pt-3.5 type-label-sm uppercase tracking-[0.08em]"
        style={{ color: GRAY, borderTop: `1px solid ${BD}` }}
      >
        Source · {indicator.source}
      </div>
    </section>
  );
}

export default async function StateOfTheNationPage() {
  const configData = getSiteConfig();

  // Canada only — this page reads Canada against its own record.
  const results = await Promise.all(
    SOTN_MEASURE_SLUGS.map((slug) =>
      getEconomicSeries(slug, { jurisdictions: "ca" }).catch(() => null),
    ),
  );
  const responseBySlug = new Map(
    SOTN_MEASURE_SLUGS.map((slug, i) => [slug, results[i]]),
  );

  const sections = buildSections((slug) => responseBySlug.get(slug) ?? null);
  const indicators = sections.flatMap((section) => section.indicators);
  const leadCount = indicators.filter((m) => m.verdict === "lead").length;
  const lagCount = indicators.filter((m) => m.verdict === "lag").length;
  const updated = lastUpdatedLabel(results);

  const jsonLd = buildGraph(
    generateOrganizationSchema(configData),
    generateBreadcrumbSchema(
      "/state-of-the-nation",
      "State of the Nation",
      configData.siteUrl,
    ),
  );

  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header
        className="max-w-[1180px] px-[clamp(24px,5vw,88px)] pt-[clamp(48px,8vw,104px)] pb-[clamp(36px,5vw,64px)]"
      >
        <div className="mb-7 type-label uppercase tracking-[0.16em] text-auburn-800">
          State of the Nation · 2026
        </div>
        <h1 className="m-0 mb-8 font-display font-medium text-[clamp(2.8rem,6.2vw,5.4rem)] leading-[0.99] tracking-[-0.03em] text-balance">
          State of the Nation
        </h1>

      </header>

      <div id="indicators">
        {sections.map((section) => {
          // Wide cards render full-width above the 2×2 grid, outside it so
          // the grid's odd/even column rules stay aligned.
          const wideIndicators = section.indicators.filter((i) => i.wide);
          const gridIndicators = section.indicators.filter((i) => !i.wide);
          return (
            <section key={section.id} id={section.id}>
              <div
                className="px-[clamp(24px,5vw,88px)] pt-[clamp(40px,5vw,72px)] pb-[clamp(16px,2vw,28px)]"
                style={{ borderBottom: `1px solid ${BD}` }}
              >
                <h2 className="m-0 font-display font-medium text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.02] tracking-[-0.02em]">
                  {section.title}
                </h2>
              </div>
              {wideIndicators.map((indicator) => (
                <IndicatorCard key={indicator.n} indicator={indicator} wide />
              ))}
              {gridIndicators.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {gridIndicators.map((indicator) => (
                    <IndicatorCard key={indicator.n} indicator={indicator} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="px-[clamp(24px,5vw,88px)] py-[clamp(48px,6vw,80px)] text-center">
        <h2 className="type-h3 text-dark">Missing a measure that matters?</h2>
        <p className="mt-2 type-body text-dark/70 max-w-[560px] mx-auto">
          We&rsquo;re expanding this dashboard. If there&rsquo;s an indicator
          that would sharpen the picture — for better or worse — tell us and
          we&rsquo;ll track it.
        </p>
        <a
          href="mailto:hi@buildcanada.com?subject=State%20of%20the%20Nation%20indicator%20request"
          className="mt-6 inline-block border border-dark px-5 py-2.5 type-label text-dark hover:bg-dark hover:text-bg transition-colors"
        >
          Email us
        </a>
      </section>
    </div>
  );
}
