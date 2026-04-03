import { apiFetch } from "./client";
import type { YFTool, YFListResponse } from "./types";
import type { ProjectData } from "@/components/widgets/types";

function mapTool(t: YFTool): ProjectData {
  return {
    id: String(t.id),
    slug: t.slug,
    title: t.title,
    description: t.description,
    externalUrl: t.url,
    size: t.size,
    featured: t.featured,
    order: t.position,
    accentColor: t.accent_color,
  };
}

export async function fetchTools(params?: {
  featured?: boolean;
}): Promise<ProjectData[]> {
  const queryParams: Record<string, string> = {};
  if (params?.featured) queryParams.featured = "true";

  const res = await apiFetch<YFListResponse<YFTool>>("/tools", {
    params: queryParams,
    revalidate: 3600,
  });
  return res.data.map(mapTool);
}
