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

export default async function ProsperityDashboardPage() {
  const configData = getSiteConfig();

  const featuredSeries = await Promise.all(
    SECTIONS.map((section) =>
      getEconomicSeries(section.featuredSlug).catch(() => null),
    ),
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
      <PageHeader
        title="Prosperity Dashboard"
        description="Are we moving in the right direction? Canadian prosperity, measured."
      />

      <SectionNav />

      <section className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">


          <div className="grid gap-5 sm:grid-cols-2">
            {SECTIONS.map((section, i) => {
              const preview = featuredSeries[i];
              const featuredHeading = section.indicators.find(
                (indicator) => indicator.slug === section.featuredSlug,
              )?.heading;
              return (
                <Link
                  key={section.id}
                  href={`/prosperity-dashboard/${section.id}`}
                  className="group flex flex-col border border-border-light p-6 hover:border-dark transition-colors"
                >
                  <h2 className="type-h4 text-dark group-hover:underline underline-offset-4">
                    {section.title}
                  </h2>
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
