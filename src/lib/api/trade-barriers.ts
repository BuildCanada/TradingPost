import { apiFetch } from "./client";
import type {
  YFAgreement,
  YFAgreementDetail,
  YFJurisdiction,
  YFListResponse,
  YFTheme,
} from "./types";

export async function fetchAgreements(): Promise<YFAgreement[]> {
  const res = await apiFetch<YFListResponse<YFAgreement>>(
    "/trade_barriers/agreements",
    { revalidate: 300 },
  );
  return res.data;
}

export async function fetchAgreement(
  slug: string,
): Promise<YFAgreementDetail | null> {
  try {
    return await apiFetch<YFAgreementDetail>(
      `/trade_barriers/agreements/${encodeURIComponent(slug)}`,
      { revalidate: 300 },
    );
  } catch (err) {
    if (err instanceof Error && /404/.test(err.message)) return null;
    throw err;
  }
}

export async function fetchAgreementSlugs(): Promise<string[]> {
  const agreements = await fetchAgreements();
  return agreements.map((a) => a.slug);
}

export async function fetchThemes(): Promise<YFTheme[]> {
  const res = await apiFetch<YFListResponse<YFTheme>>("/trade_barriers/themes", {
    revalidate: 3600,
  });
  return res.data;
}

export async function fetchJurisdictions(): Promise<YFJurisdiction[]> {
  const res = await apiFetch<YFListResponse<YFJurisdiction>>(
    "/warehouse/jurisdictions",
    { revalidate: 3600 },
  );
  return res.data;
}
