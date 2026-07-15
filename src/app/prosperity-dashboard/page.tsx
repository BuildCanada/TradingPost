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
import JoinForm from "./JoinForm";
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
  alternates: { canonical: "/prosperity-dashboard" },
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

const VERDICT_BADGE = {
  lead: {
    label: "Where we lead",
    className: "bg-transparent border-dark text-dark",
  },
  lag: {
    label: "Where we lag",
    className: "bg-auburn-800 border-auburn-800 text-bg",
  },
  mixed: {
    label: "Mixed",
    className: "bg-transparent border-[#CDC4BD] text-[#6f6a63]",
  },
} as const;

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
  const badge = VERDICT_BADGE[indicator.verdict];
  return (
    <section
      className={`flex flex-col border-[#CDC4BD] border-b px-[clamp(24px,5vw,88px)] py-[clamp(32px,4vw,56px)] ${
        wide
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
        <span
          className={`type-label-sm uppercase tracking-[0.1em] px-2.5 py-[5px] leading-none whitespace-nowrap border ${badge.className}`}
        >
          {badge.label}
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
      "/prosperity-dashboard",
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
        style={{ borderBottom: `1px solid ${BD}` }}
      >
        <div className="mb-7 type-label uppercase tracking-[0.16em] text-auburn-800">
          State of the Nation · 2026
        </div>
        <h1 className="m-0 mb-8 font-display font-medium text-[clamp(2.8rem,6.2vw,5.4rem)] leading-[0.99] tracking-[-0.03em] text-balance">
          Canada is not a poor country.
          <br />
          It is a country underperforming its potential.
        </h1>
        <p className="m-0 mb-10 max-w-[760px] font-body text-[clamp(1.2rem,2vw,1.5rem)] leading-normal tracking-[-0.01em] text-pretty">
          Sixteen indicators, read honestly. Where we lead, where we lag, and
          where the picture is genuinely mixed — Canada measured against its
          own record. The numbers below are the starting point for every plan
          we publish.
        </p>
        <div className="flex flex-wrap items-end gap-[clamp(20px,3vw,48px)]">
          <div className="flex gap-8">
            <div>
              <div className="font-display text-[2.6rem] leading-none text-dark">
                {leadCount}
              </div>
              <div
                className="mt-2 type-label-sm uppercase tracking-[0.1em]"
                style={{ color: GRAY }}
              >
                Areas we lead
              </div>
            </div>
            <div>
              <div className="font-display text-[2.6rem] leading-none text-auburn-800">
                {lagCount}
              </div>
              <div
                className="mt-2 type-label-sm uppercase tracking-[0.1em]"
                style={{ color: GRAY }}
              >
                Areas we lag
              </div>
            </div>
          </div>
          <div
            className="type-label-sm uppercase tracking-[0.09em] leading-[1.7] pl-6"
            style={{ color: GRAY, borderLeft: `1px solid ${BD}` }}
          >
            {SOTN_INDICATOR_COUNT} indicators tracked
            <br />
            All figures from live sources
            {updated && (
              <>
                <br />
                Last updated · {updated}
              </>
            )}
          </div>
        </div>
      </header>

      <div id="indicators">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <div
              className="px-[clamp(24px,5vw,88px)] pt-[clamp(40px,5vw,72px)] pb-[clamp(16px,2vw,28px)]"
              style={{ borderBottom: `1px solid ${BD}` }}
            >
              <h2 className="m-0 font-display font-medium text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.02] tracking-[-0.02em]">
                {section.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {section.indicators.map((indicator) => (
                <IndicatorCard
                  key={indicator.n}
                  indicator={indicator}
                  wide={section.indicators.length === 1}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section
        id="join"
        className="bg-dark text-bg px-[clamp(24px,5vw,88px)] py-[clamp(56px,8vw,104px)]"
      >
        <div className="max-w-[820px]">
          <div className="mb-6 type-label uppercase tracking-[0.16em] text-[#c9877f]">
            Turn the numbers into plans
          </div>
          <h2 className="m-0 mb-6 font-display font-medium text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] tracking-[-0.02em] text-balance">
            The state of the nation is a choice. Help us change it.
          </h2>
          <p className="m-0 mb-10 max-w-[620px] font-body text-[clamp(1.1rem,2vw,1.4rem)] leading-normal text-[#d8cfc6] text-pretty">
            We publish memos on behalf of Canada&rsquo;s top builders —
            concrete plans to close the gaps above. Be first to know
            what&rsquo;s possible.
          </p>
          <JoinForm />
          <div className="mt-4 type-label-sm uppercase tracking-[0.08em] text-[#8f8880]">
            No spam. Unsubscribe anytime.
          </div>
        </div>
      </section>
    </div>
  );
}
