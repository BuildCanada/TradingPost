import type { Metadata } from "next";
import Link from "next/link";
import { listJurisdictions, listOrganizations } from "@/lib/api/kpis";
import type { KPIJurisdiction, KPIOrganization } from "@/lib/api/kpis";

export const metadata: Metadata = {
  title: "KPI Dashboards",
  description:
    "Government performance indicators sourced from federal, provincial, and municipal departmental plans and results reports.",
};

const LEVEL_ORDER: Record<KPIJurisdiction["level"], number> = {
  federal: 0,
  provincial: 1,
  territorial: 2,
  municipal: 3,
  regional: 4,
  crown_corp: 5,
  authority: 6,
};

const LEVEL_LABELS: Record<KPIJurisdiction["level"], string> = {
  federal: "Federal",
  provincial: "Provincial",
  territorial: "Territorial",
  municipal: "Municipal",
  regional: "Regional",
  crown_corp: "Crown Corporation",
  authority: "Authority",
};

export default async function DashboardIndexPage() {
  let jurisdictions: KPIJurisdiction[] = [];
  try {
    jurisdictions = await listJurisdictions();
  } catch {
    jurisdictions = [];
  }

  jurisdictions = [...jurisdictions].sort((a, b) => {
    const la = LEVEL_ORDER[a.level] ?? 99;
    const lb = LEVEL_ORDER[b.level] ?? 99;
    if (la !== lb) return la - lb;
    return a.name.localeCompare(b.name);
  });

  const orgsByJurisdiction = await Promise.all(
    jurisdictions.map(async (j) => {
      try {
        const orgs = await listOrganizations(j.slug);
        return { jurisdiction: j, orgs };
      } catch {
        return { jurisdiction: j, orgs: [] as KPIOrganization[] };
      }
    }),
  );

  const populated = orgsByJurisdiction.filter((g) => g.orgs.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          KPI Dashboards
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Government performance indicators sourced from federal Departmental
          Plans / Results Reports, provincial Annual Business Plans, and
          municipal budget notes. Pick an organization to see its tracked
          measures over time.
        </p>
      </header>

      {populated.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          KPI data is not currently available. Once the York Factory KPI API is
          deployed at <code>{`/api/v1/kpis`}</code>, dashboards will appear
          here.
        </div>
      ) : (
        <div className="space-y-12">
          {populated.map(({ jurisdiction, orgs }) => (
            <section key={jurisdiction.slug}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                  {jurisdiction.name}
                </h2>
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {LEVEL_LABELS[jurisdiction.level] ?? jurisdiction.level} •{" "}
                  {orgs.length} org{orgs.length === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[...orgs]
                  .sort((a, b) =>
                    a.canonical_name.localeCompare(b.canonical_name),
                  )
                  .map((org) => (
                    <li key={org.slug}>
                      <Link
                        href={`/dashboard/${jurisdiction.slug}/${org.slug}`}
                        className="block rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50"
                      >
                        {org.canonical_name}
                        {org.kind && (
                          <span className="ml-2 text-xs text-gray-500">
                            {org.kind}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
