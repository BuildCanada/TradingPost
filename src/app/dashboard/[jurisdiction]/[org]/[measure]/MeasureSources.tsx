import type { KPICitation } from "@/lib/api/kpis";

interface DocSummary {
  id: number;
  doc_title: string;
  doc_url: string;
  published_at: string | null;
  fiscal_year: number | null;
  years: Set<number>;
  valueTypes: Set<string>;
  pages: Set<number>;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  // Render as a stable date — server-rendered so locale flux is fine here.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function summarizeYears(years: number[]): string {
  if (years.length === 0) return "";
  const sorted = [...years].sort((a, b) => a - b);
  if (sorted.length === 1) return String(sorted[0]);
  // Build run-length compressed ranges.
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const y = sorted[i];
    if (y === prev + 1) {
      prev = y;
      continue;
    }
    ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = y;
    prev = y;
  }
  ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
  return ranges.join(", ");
}

export default function MeasureSources({
  citations,
}: {
  citations: KPICitation[];
}) {
  if (citations.length === 0) return null;

  const byDoc = new Map<number, DocSummary>();
  for (const c of citations) {
    const docId = c.document.id;
    let entry = byDoc.get(docId);
    if (!entry) {
      entry = {
        id: docId,
        doc_title: c.document.doc_title,
        doc_url: c.document.doc_url,
        published_at: c.document.published_at,
        fiscal_year: c.document.fiscal_year,
        years: new Set(),
        valueTypes: new Set(),
        pages: new Set(),
      };
      byDoc.set(docId, entry);
    }
    entry.years.add(c.measurement_year);
    entry.valueTypes.add(c.value_type);
    if (c.page_number != null) entry.pages.add(c.page_number);
  }

  const docs = Array.from(byDoc.values()).sort((a, b) => {
    const ad = a.published_at ?? "";
    const bd = b.published_at ?? "";
    if (ad !== bd) return bd.localeCompare(ad);
    return (b.fiscal_year ?? 0) - (a.fiscal_year ?? 0);
  });

  return (
    <section className="mt-8">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Sources
      </h3>
      <ul className="space-y-3">
        {docs.map((doc) => {
          const published = formatDate(doc.published_at);
          const years = summarizeYears(Array.from(doc.years));
          const pages =
            doc.pages.size === 0
              ? null
              : doc.pages.size === 1
                ? `p. ${Array.from(doc.pages)[0]}`
                : `pp. ${Array.from(doc.pages).sort((a, b) => a - b).join(", ")}`;
          return (
            <li
              key={doc.id}
              className="rounded-md border border-gray-200 bg-white p-3"
            >
              <a
                href={doc.doc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                {doc.doc_title}
              </a>
              <div className="mt-1 text-xs text-gray-500">
                {published && <span>{published}</span>}
                {doc.fiscal_year && (
                  <span>
                    {published ? " · " : ""}FY {doc.fiscal_year}
                  </span>
                )}
                {years && <span> · {years}</span>}
                {pages && <span> · {pages}</span>}
                {doc.valueTypes.size > 0 && (
                  <span>
                    {" · "}
                    {Array.from(doc.valueTypes).sort().join(", ")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
