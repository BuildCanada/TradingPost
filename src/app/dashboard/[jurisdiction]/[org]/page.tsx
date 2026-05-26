import "@buildcanada/charts/styles.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrganization,
  listFactsForOrg,
  listMeasuresForOrg,
  listJurisdictions,
} from "@/lib/api/kpis";
import type { KPIFact, KPIMeasure } from "@/lib/api/kpis";
import OrgDashboardClient from "./OrgDashboardClient";
import type { MeasureWithFacts } from "./types";

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

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { jurisdiction, org } = await params;

  let orgData;
  try {
    orgData = await getOrganization(jurisdiction, org);
  } catch {
    notFound();
  }

  const [allJurisdictions, measures, facts] = await Promise.all([
    listJurisdictions().catch(() => []),
    listMeasuresForOrg(org).catch(() => [] as KPIMeasure[]),
    listFactsForOrg(org).catch(() => [] as KPIFact[]),
  ]);

  const jurisdictionName =
    allJurisdictions.find((j) => j.slug === jurisdiction)?.name ?? jurisdiction;

  const factsByMeasure = new Map<number, KPIFact[]>();
  for (const f of facts) {
    if (!factsByMeasure.has(f.measure_id)) factsByMeasure.set(f.measure_id, []);
    factsByMeasure.get(f.measure_id)!.push(f);
  }

  const items: MeasureWithFacts[] = measures
    .map((m) => ({ measure: m, facts: factsByMeasure.get(m.id) ?? [] }))
    .filter((item) =>
      item.facts.some((f) => f.value_numeric !== null),
    )
    .sort((a, b) => a.measure.canonical_name.localeCompare(b.measure.canonical_name));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-gray-500 transition-colors hover:text-gray-900"
        >
          &larr; All dashboards
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {orgData.canonical_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {jurisdictionName}
          {orgData.kind ? ` · ${orgData.kind}` : ""}
          {" · "}
          {items.length} measure{items.length === 1 ? "" : "s"} with data
        </p>
        {orgData.description && (
          <p className="mt-3 max-w-3xl text-sm text-gray-700">
            {orgData.description}
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          No numeric measures are currently tracked for this organization.
        </div>
      ) : (
        <OrgDashboardClient items={items} />
      )}
    </div>
  );
}
