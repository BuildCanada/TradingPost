import { Graph, Thing } from "schema-dts";

export function buildGraph(...entities: (Thing | null)[]): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": entities.filter((e): e is Thing => e !== null),
  };
}
