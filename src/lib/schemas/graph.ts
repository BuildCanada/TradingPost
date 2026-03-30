import { Graph, Thing } from "schema-dts";

export function buildGraph(...entities: Thing[]): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": entities,
  };
}
