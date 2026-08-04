import "@buildcanada/charts/styles.css";
import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/api";
import { getEconomicSeries } from "@/lib/api/economy";
import { buildGraph } from "@/lib/schemas/graph";
import { generateOrganizationSchema } from "@/lib/schemas/generators/organization";
import { generateBreadcrumbSchema } from "@/lib/schemas/generators/breadcrumb";
import StateChart from "./StateChart";
import {
  buildSections,
  SOTN_MEASURE_SLUGS,
  type SotnView,
} from "./state-of-the-nation";

const DESCRIPTION =
  "The key indicators of Canadian prosperity, read honestly. Where Canada leads, where we lag, and where the picture is genuinely mixed — measured against our own record.";

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

// A chart card: chart title + chart, and the source attribution the data
// licences require. Each card is its own bordered panel so the charts read as
// distinct objects rather than cells in a ruled grid; they tile 2-up on
// desktop within their section.
function IndicatorCard({
  indicator,
  wide,
}: {
  indicator: SotnView;
  wide?: boolean;
}) {
  return (
    <section
      className={`flex flex-col border-2 border-dark bg-bg p-[clamp(20px,2.5vw,32px)] ${wide ? "lg:col-span-2" : ""
        }`}
    >
      <StateChart spec={indicator.spec} title={indicator.title} wide={wide} />
      <div
        className="mt-5 pt-3.5 type-label-sm uppercase tracking-[0.08em]"
        style={{ color: GRAY, borderTop: `1px solid ${BD}` }}
      >
        {indicator.sources.length > 1 ? "Sources" : "Source"} ·{" "}
        {indicator.sources.map((source, i) => (
          <span key={source.name}>
            {i > 0 && " · "}
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-dark"
              >
                {source.name}
              </a>
            ) : (
              source.name
            )}
          </span>
        ))}
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

      {/* Compact masthead — the first chart must land above the fold on
          desktop. */}
      <header className="max-w-[1180px] px-[clamp(24px,5vw,88px)] pt-[clamp(28px,3.5vw,48px)] pb-[clamp(16px,2vw,28px)]">
        <div className="mb-4 type-label uppercase tracking-[0.16em] text-auburn-800">
          State of the Nation · 2026
        </div>
        <h1 className="m-0 font-display font-bold text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[0.99] tracking-[-0.03em] text-balance">
          State of the Nation
        </h1>
        <p className="mt-3 font-display text-[clamp(1.05rem,1.9vw,1.45rem)] leading-snug text-dark/70 text-balance">
          Canada should be the most prosperous country on earth. Here&rsquo;s
          the current state of play.
        </p>
      </header>

      <div id="indicators">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <div
              className="px-[clamp(24px,5vw,88px)] pt-[clamp(24px,3vw,40px)] pb-[clamp(12px,1.5vw,20px)]"
              style={{ borderBottom: `1px solid ${BD}` }}
            >
              <h2 className="m-0 font-display font-semibold text-[clamp(1.7rem,2.6vw,2.3rem)] leading-[1.02] tracking-[-0.02em]">
                {section.title}
              </h2>
            </div>
            {/* Cards carry their own borders now, so the page padding and the
                spacing between panels live on the grid rather than on each
                card. `wide` indicators still span both columns if any are
                ever reinstated. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(16px,2vw,28px)] px-[clamp(24px,5vw,88px)] py-[clamp(24px,3vw,40px)]">
              {section.indicators.map((indicator) => (
                <IndicatorCard
                  key={indicator.n}
                  indicator={indicator}
                  wide={indicator.wide}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="px-[clamp(24px,5vw,88px)] py-[clamp(48px,6vw,80px)] text-center">
        <h2 className="type-h3 text-dark">Are we missing something?</h2>
        <p className="mt-4 type-body text-dark/70 max-w-[640px] mx-auto">
          We&rsquo;re trying to answer the question: are we on the right track?
        </p>
        <p className="mt-3 type-body text-dark/70 max-w-[640px] mx-auto">
          It&rsquo;s a nuanced question. We can be growing our economy, but if
          our young people can&rsquo;t buy a house and start a family, we&rsquo;re
          not really prosperous. We care about prosperity in the broadest sense —
          so come tell us what we&rsquo;re missing on{" "}
          <a
            href="https://x.com/buildcanada"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-dark"
          >
            X
          </a>{" "}
          or email us at{" "}
          <a
            href="mailto:hi@buildcanada.com?subject=State%20of%20the%20Nation"
            className="underline underline-offset-2 hover:text-dark"
          >
            hi@buildcanada.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
