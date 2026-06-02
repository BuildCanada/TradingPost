import "@buildcanada/charts/styles.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrganization,
  listJurisdictions,
  listMeasuresForOrg,
} from "@/lib/api/kpis";
import type { KPIMeasure } from "@/lib/api/kpis";
import MeasureSidebar from "./MeasureSidebar";

interface LayoutParams {
  jurisdiction: string;
  org: string;
}

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { jurisdiction, org } = await params;

  let orgData;
  try {
    orgData = await getOrganization(jurisdiction, org);
  } catch {
    notFound();
  }

  const [allJurisdictions, measures] = await Promise.all([
    listJurisdictions().catch(() => []),
    listMeasuresForOrg(jurisdiction, org).catch(() => [] as KPIMeasure[]),
  ]);

  const jurisdictionName =
    allJurisdictions.find((j) => j.slug === jurisdiction)?.name ?? jurisdiction;

  const sortedMeasures = [...measures].sort((a, b) =>
    a.canonical_name.localeCompare(b.canonical_name),
  );

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
          <Link
            href={`/dashboard/${jurisdiction}/${org}`}
            className="hover:underline"
          >
            {orgData.canonical_name}
          </Link>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {jurisdictionName}
          {orgData.kind ? ` · ${orgData.kind}` : ""}
          {" · "}
          {sortedMeasures.length} measure
          {sortedMeasures.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <MeasureSidebar
          jurisdiction={jurisdiction}
          org={org}
          measures={sortedMeasures.map((m) => ({
            id: m.id,
            slug: m.slug,
            canonical_name: m.canonical_name,
            service_category: m.service_category,
          }))}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
