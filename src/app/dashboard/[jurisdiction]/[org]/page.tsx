import type { Metadata } from "next";
import Link from "next/link";
import {
  getOrganization,
  listFactsForOrg,
  listMeasuresForOrg,
} from "@/lib/api/kpis";
import type { KPIFact, KPIMeasure } from "@/lib/api/kpis";

interface PageParams {
  jurisdiction: string;
  org: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { jurisdiction, org } = await params;
  try {
    const o = await getOrganization(jurisdiction, org);
    return {
      title: `${o.canonical_name} — KPI Dashboard`,
      description:
        o.description ??
        `Tracked performance measures for ${o.canonical_name}.`,
      alternates: { canonical: `/dashboard/${jurisdiction}/${org}` },
    };
  } catch {
    return { title: "KPI Dashboard" };
  }
}

function latestActual(facts: KPIFact[]): KPIFact | null {
  const actuals = facts.filter(
    (f) =>
      f.value_type === "actual" &&
      f.period_basis === "full_year" &&
      f.value_numeric !== null,
  );
  if (actuals.length === 0) return null;
  return actuals.reduce((acc, f) =>
    f.measurement_year > acc.measurement_year ? f : acc,
  );
}

function formatValue(value: number, unit: KPIMeasure["unit"]): string {
  const abs = Math.abs(value);
  const decimals = abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  const formatted = value.toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ${unit.symbol}`;
}

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { jurisdiction, org } = await params;

  const [orgData, measures, facts] = await Promise.all([
    getOrganization(jurisdiction, org).catch(() => null),
    listMeasuresForOrg(org).catch(() => [] as KPIMeasure[]),
    listFactsForOrg(org).catch(() => [] as KPIFact[]),
  ]);

  const factsByMeasure = new Map<number, KPIFact[]>();
  for (const f of facts) {
    if (!factsByMeasure.has(f.measure_id)) factsByMeasure.set(f.measure_id, []);
    factsByMeasure.get(f.measure_id)!.push(f);
  }

  const items = measures
    .map((m) => ({ measure: m, facts: factsByMeasure.get(m.id) ?? [] }))
    .filter((i) => i.facts.some((f) => f.value_numeric !== null))
    .sort((a, b) =>
      a.measure.canonical_name.localeCompare(b.measure.canonical_name),
    );

  return (
    <div>
      {orgData?.description && (
        <p className="mb-6 max-w-3xl text-sm text-gray-700">
          {orgData.description}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          No numeric measures are currently tracked for this organization.
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Pick a measure to see its trend over time, or browse the cards
            below.
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map(({ measure, facts: mFacts }) => {
              const latest = latestActual(mFacts);
              return (
                <li key={measure.id}>
                  <Link
                    href={`/dashboard/${jurisdiction}/${org}/${measure.slug}`}
                    className="block h-full rounded-md border border-gray-200 bg-white p-4 transition-colors hover:border-gray-400 hover:bg-gray-50"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {measure.canonical_name}
                    </div>
                    {measure.service_category && (
                      <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">
                        {measure.service_category}
                      </div>
                    )}
                    <div className="mt-3 flex items-baseline gap-2">
                      {latest && latest.value_numeric !== null ? (
                        <>
                          <span className="text-lg font-semibold text-gray-900">
                            {formatValue(latest.value_numeric, measure.unit)}
                          </span>
                          <span className="text-xs text-gray-500">
                            actual · {latest.measurement_year}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">
                          target/projection only
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
