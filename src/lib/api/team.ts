import { apiFetch } from "./client";
import type { YFTeamMember, YFListResponse } from "./types";

const ROLE_MAP: Record<string, string> = {
  team: "CORE",
  board: "BOARD",
  advisor: "ADVISOR",
  volunteer: "CORE",
  employee: "CORE",
};

interface TeamMemberSerialized {
  id: string;
  name: string;
  title: string | null;
  role: string;
  photo: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  bio: string | null;
  order: number;
}

function mapTeamMember(m: YFTeamMember): TeamMemberSerialized {
  return {
    id: String(m.id),
    name: m.name,
    title: m.title,
    role: ROLE_MAP[m.role] ?? "CORE",
    photo: m.profile_photo_url,
    xUrl: m.twitter_url,
    linkedinUrl: m.linkedin_url,
    websiteUrl: null,
    bio: null,
    order: m.position,
  };
}

export async function fetchTeamMembers(
  opts?: { role?: string; excludeRole?: string },
): Promise<TeamMemberSerialized[]> {
  const params: Record<string, string> = {};
  if (opts?.role) params.role = opts.role;
  if (opts?.excludeRole) params.exclude_role = opts.excludeRole;

  const res = await apiFetch<YFListResponse<YFTeamMember>>("/team", {
    params,
    revalidate: 3600,
  });
  return res.data.map(mapTeamMember);
}
