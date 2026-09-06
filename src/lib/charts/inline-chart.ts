import {
  buildDataset,
  parseDefinition,
  parseManifest,
  parseJsonRows,
  resolveBindings,
  resolveDefinitionTimes,
  validateDataset,
} from "@buildcanada/charts-inline/core";

/** A self-contained definition: no fetches, executable code or remote datasets. */
export function parseInlineChart(source: string) {
  const raw = JSON.parse(source);
  if (!raw || typeof raw !== "object" || raw.definition?.data !== "inline") {
    throw new Error('Inline charts require definition.data = "inline".');
  }
  const definitionResult = parseDefinition(raw.definition);
  const manifestResult = parseManifest(raw.dataset?.manifest);
  const definition = definitionResult.definition;
  const manifest = manifestResult.manifest;
  if (!definition || !manifest)
    throw new Error("Invalid chart definition or dataset manifest.");
  const parsed = parseJsonRows(raw.dataset?.rows, manifest);
  const built = buildDataset(manifest, parsed.rows);
  const times = resolveDefinitionTimes(definition, manifest.timeGrain);
  const diagnostics = [
    ...definitionResult.diagnostics,
    ...manifestResult.diagnostics,
    ...parsed.diagnostics,
    ...built.diagnostics,
    ...validateDataset(manifest, parsed.rows),
    ...resolveBindings(definition, manifest).diagnostics,
    ...times.diagnostics,
  ];
  const errors = diagnostics.filter((d) => d.severity === "error");
  if (errors.length) throw new Error(errors.map((d) => d.message).join(" "));
  return { definition: times.definition, dataset: built.dataset };
}
