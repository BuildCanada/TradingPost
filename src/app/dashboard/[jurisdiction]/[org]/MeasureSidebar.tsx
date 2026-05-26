"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarMeasure {
  id: number;
  slug: string;
  canonical_name: string;
  service_category: string | null;
}

export default function MeasureSidebar({
  jurisdiction,
  org,
  measures,
}: {
  jurisdiction: string;
  org: string;
  measures: SidebarMeasure[];
}) {
  const pathname = usePathname();
  const orgRoot = `/dashboard/${jurisdiction}/${org}`;

  const categories = Array.from(
    new Set(measures.map((m) => m.service_category ?? "Other")),
  ).sort();

  return (
    <aside className="lg:max-h-[640px] lg:overflow-y-auto">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Measures
      </h2>
      <div className="space-y-4">
        {categories.map((cat) => {
          const inCat = measures.filter(
            (m) => (m.service_category ?? "Other") === cat,
          );
          return (
            <div key={cat}>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                {cat}
              </div>
              <ul className="space-y-1">
                {inCat.map((m) => {
                  const href = `${orgRoot}/${m.slug}`;
                  const active = pathname === href;
                  return (
                    <li key={m.id}>
                      <Link
                        href={href}
                        className={
                          "block rounded-md px-2 py-1.5 text-sm transition-colors " +
                          (active
                            ? "bg-gray-900 text-white"
                            : "text-gray-800 hover:bg-gray-100")
                        }
                      >
                        {m.canonical_name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
