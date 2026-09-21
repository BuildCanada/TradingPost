import demographicTitles from "./demographic-titles.json";

type Label = string | { en?: string; fr?: string };
export interface CrosstabColumn { key: string; id: string; breakdownId: string; label: Label }
export interface CrosstabRow { id: string; kind: string; label: Label; values: Record<string, number | null> }
export interface CrosstabTable { suppressedColumns?: string[]; id: string; type: string; question: Label; columns: CrosstabColumn[]; rows: CrosstabRow[] }
export interface Crosstabs { schemaVersion: 2; breakdowns: { id: string; kind: string; label: Label }[]; tables: CrosstabTable[] }

export function crosstabLabel(label: Label, locale: string) {
  return typeof label === "string" ? label : label[locale === "fr" ? "fr" : "en"] || label.en || label.fr || "";
}

export function parseCrosstabs(value: unknown): Crosstabs {
  const report = value as Crosstabs;
  const label = (v: unknown) => typeof v === "string" || (!!v && typeof v === "object" && Object.values(v).some((text) => typeof text === "string"));
  if (!report || report.schemaVersion !== 2 || !Array.isArray(report.tables) || !Array.isArray(report.breakdowns) ||
    !report.breakdowns.every((g) => g && typeof g.id === "string" && label(g.label)) ||
    !report.tables.every((t) => t && typeof t.id === "string" && label(t.question) && Array.isArray(t.columns) && Array.isArray(t.rows) &&
      t.columns.every((c) => c && typeof c.key === "string" && typeof c.breakdownId === "string" && label(c.label)) &&
      t.rows.every((r) => r && label(r.label) && r.values && typeof r.values === "object" &&
        Object.values(r.values).every((v) => v === null || (typeof v === "number" && Number.isFinite(v)))))) {
    throw new Error("The crosstabs could not be read.");
  }
  if (new Set(report.tables.map((t) => t.id)).size !== report.tables.length) throw new Error("Duplicate crosstab questions.");
  return {
    ...report,
    tables: report.tables.map((table) => {
      const base = table.rows.find((row) => row.kind === "unweighted-sample-size");
      const suppressedColumns = table.columns.filter((column) => {
        const count = base?.values[column.key];
        return typeof count !== "number" || count < 50 || table.suppressedColumns?.includes(column.key);
      }).map((column) => column.key);
      return {
        ...table, suppressedColumns,
        rows: table.rows.map((row) => ({ ...row, values: Object.fromEntries(table.columns.map((column) =>
          [column.key, suppressedColumns.includes(column.key) ? null : row.values[column.key] ?? null],
        )) })),
      };
    }),
  };
}

export function questionCrosstabs(report: Crosstabs, questionId: string) {
  const table = report.tables.find((table) => table.id === questionId);
  if (!table) return null;
  const columns = table.columns.filter((c) => c.id?.toLowerCase() !== "unknown" && c.key.split(":").at(-1)?.toLowerCase() !== "unknown");
  const groups = report.breakdowns.filter((g) => columns.some((c) => c.breakdownId === g.id));
  return { table, columns, groups };
}

/** Use stable Surveyor IDs, never guess a demographic from question wording. */
export function demographicTitle(group: { id: string; label: Label }, locale: string) {
  return locale === "fr" ? crosstabLabel(group.label, locale) :
    (demographicTitles as Record<string, string>)[group.id] ?? crosstabLabel(group.label, locale);
}
