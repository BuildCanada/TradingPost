import type { KPIFact, KPIMeasure } from "@/lib/api/kpis";

export interface MeasureWithFacts {
  measure: KPIMeasure;
  facts: KPIFact[];
}
