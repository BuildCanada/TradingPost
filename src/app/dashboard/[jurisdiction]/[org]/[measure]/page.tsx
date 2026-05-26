import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getMeasure,
  listCitationsForMeasure,
  listFactsForMeasure,
  listMeasuresForOrg,
} from "@/lib/api/kpis";
import type { KPICitation } from "@/lib/api/kpis";
import MeasureChartClient from "./MeasureChartClient";
import MeasureSources from "./MeasureSources";

interface PageParams {
  jurisdiction: string;
  org: string;
  measure: string;
}

async function resolveMeasure(orgSlug: string, measureSlug: string) {
  const measures = await listMeasuresForOrg(orgSlug);
  const found = measures.find((m) => m.slug === measureSlug);
  if (!found) return null;
  // Index lookup returns most of the measure, but the show endpoint includes
  // description and lineages. Fetch the full record for the detail page.
  try {
    return await getMeasure(found.id);
  } catch {
    return found;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { jurisdiction, org, measure } = await params;
  const m = await resolveMeasure(org, measure).catch(() => null);
  if (!m) return { title: "Measure" };
  return {
    title: `${m.canonical_name} — ${m.organization?.canonical_name ?? "KPI"}`,
    description:
      m.description ??
      `Performance measure tracked for ${m.organization?.canonical_name ?? "this organization"}.`,
    alternates: {
      canonical: `/dashboard/${jurisdiction}/${org}/${measure}`,
    },
  };
}

export default async function MeasurePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { org, measure } = await params;

  const measureData = await resolveMeasure(org, measure).catch(() => null);
  if (!measureData) notFound();

  const [facts, citations] = await Promise.all([
    listFactsForMeasure(measureData.id).catch(() => []),
    listCitationsForMeasure(measureData.id).catch(
      () => [] as KPICitation[],
    ),
  ]);

  const numericYears = facts
    .filter((f) => f.value_numeric !== null)
    .map((f) => f.measurement_year);
  const range =
    numericYears.length === 0
      ? null
      : numericYears.length === 1
        ? `${numericYears[0]}`
        : `${Math.min(...numericYears)}–${Math.max(...numericYears)}`;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {measureData.canonical_name}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {measureData.unit.symbol}
          {range ? ` · ${range}` : ""}
          {measureData.service_category
            ? ` · ${measureData.service_category}`
            : ""}
        </p>
        {measureData.description && (
          <p className="mt-2 max-w-3xl text-sm text-gray-700">
            {measureData.description}
          </p>
        )}
      </div>

      <MeasureChartClient measure={measureData} facts={facts} />

      <MeasureSources citations={citations} />
    </div>
  );
}
