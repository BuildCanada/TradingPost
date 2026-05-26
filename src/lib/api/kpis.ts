import { apiFetch } from "./client";

export interface KPIJurisdiction {
  id: number;
  slug: string;
  name: string;
  code: string;
  level:
    | "federal"
    | "provincial"
    | "territorial"
    | "municipal"
    | "regional"
    | "crown_corp"
    | "authority";
  region_code: string | null;
  fiscal_year_start_month: number;
  default_currency: string;
}

export interface KPIOrganization {
  id: number;
  slug: string;
  canonical_name: string;
  kind: string | null;
  active_from_year: number | null;
  active_to_year: number | null;
  description: string | null;
  jurisdiction_id: number;
}

export interface KPIUnit {
  id: number;
  symbol: string;
  kind: "absolute" | "rate" | "ratio" | string;
  base_unit: string;
  scale: number;
  currency_code: string | null;
  denominator_unit: string | null;
  denominator_scale: number | null;
}

export interface KPIMeasure {
  id: number;
  slug: string;
  canonical_name: string;
  organization: {
    id: number;
    slug: string;
    canonical_name: string;
    active_from_year: number | null;
    active_to_year: number | null;
  } | null;
  unit: KPIUnit;
  service_category: string | null;
  first_seen_year: number | null;
  last_seen_year: number | null;
  description?: string | null;
}

export type KPIValueType =
  | "actual"
  | "target"
  | "projected"
  | "plan"
  | "budget";

export type KPIPeriodBasis =
  | "full_year"
  | "ytd_q1"
  | "ytd_q2"
  | "ytd_q3"
  | "as_of_date";

export interface KPIFact {
  measure_id: number;
  measurement_year: number;
  value_type: KPIValueType;
  period_basis: KPIPeriodBasis;
  value_numeric: number | null;
  value_text: string | null;
  citation_id: number;
  document_id: number;
}

interface KPIListResponse<T> {
  data: T[];
}

interface KPIPaginatedResponse<T> {
  data: T[];
  meta: { page: number; pages: number; count: number; per_page: number };
}

const REVALIDATE = 600;

export async function listJurisdictions(): Promise<KPIJurisdiction[]> {
  const res = await apiFetch<KPIListResponse<KPIJurisdiction>>(
    "/kpis/jurisdictions",
    { revalidate: REVALIDATE },
  );
  return res.data;
}

export async function listOrganizations(
  jurisdictionSlug: string,
): Promise<KPIOrganization[]> {
  const res = await apiFetch<KPIListResponse<KPIOrganization>>(
    `/kpis/jurisdictions/${jurisdictionSlug}/organizations`,
    { revalidate: REVALIDATE },
  );
  return res.data;
}

export async function getOrganization(
  jurisdictionSlug: string,
  orgSlug: string,
): Promise<KPIOrganization> {
  return apiFetch<KPIOrganization>(
    `/kpis/jurisdictions/${jurisdictionSlug}/organizations/${orgSlug}`,
    { revalidate: REVALIDATE },
  );
}

export async function listMeasuresForOrg(
  orgSlug: string,
): Promise<KPIMeasure[]> {
  const all: KPIMeasure[] = [];
  let page = 1;
  while (true) {
    const res = await apiFetch<KPIPaginatedResponse<KPIMeasure>>(
      "/kpis/measures",
      {
        params: {
          organization_slug: orgSlug,
          per_page: "100",
          page: String(page),
        },
        revalidate: REVALIDATE,
      },
    );
    all.push(...res.data);
    if (page >= res.meta.pages) break;
    page++;
  }
  return all;
}

export async function listFactsForMeasure(
  measureId: number,
): Promise<KPIFact[]> {
  const all: KPIFact[] = [];
  let page = 1;
  while (true) {
    const res = await apiFetch<KPIPaginatedResponse<KPIFact>>(
      `/kpis/measures/${measureId}/facts`,
      {
        params: { per_page: "100", page: String(page) },
        revalidate: REVALIDATE,
      },
    );
    all.push(...res.data);
    if (page >= res.meta.pages) break;
    page++;
  }
  return all;
}

export interface KPICitationDocument {
  id: number;
  fiscal_year: number | null;
  published_at: string | null;
  doc_url: string;
  doc_title: string;
}

export interface KPICitation {
  id: number;
  measure_id: number;
  measurement_year: number;
  value_type: KPIValueType;
  period_basis: KPIPeriodBasis;
  value_numeric: number | null;
  value_text: string | null;
  value_raw_text: string | null;
  page_number: number | null;
  notes: string | null;
  agent_run_id: number | null;
  document: KPICitationDocument;
}

export async function listCitationsForMeasure(
  measureId: number,
): Promise<KPICitation[]> {
  const all: KPICitation[] = [];
  let page = 1;
  while (true) {
    const res = await apiFetch<KPIPaginatedResponse<KPICitation>>(
      `/kpis/measures/${measureId}/citations`,
      {
        params: { per_page: "100", page: String(page) },
        revalidate: REVALIDATE,
      },
    );
    all.push(...res.data);
    if (page >= res.meta.pages) break;
    page++;
  }
  return all;
}

export async function getMeasure(measureId: number): Promise<KPIMeasure> {
  return apiFetch<KPIMeasure>(`/kpis/measures/${measureId}`, {
    revalidate: REVALIDATE,
  });
}

export async function listFactsForOrg(orgSlug: string): Promise<KPIFact[]> {
  const all: KPIFact[] = [];
  let page = 1;
  while (true) {
    const res = await apiFetch<KPIPaginatedResponse<KPIFact>>("/kpis/facts", {
      params: {
        organization_slug: orgSlug,
        per_page: "100",
        page: String(page),
      },
      revalidate: REVALIDATE,
    });
    all.push(...res.data);
    if (page >= res.meta.pages) break;
    page++;
  }
  return all;
}
