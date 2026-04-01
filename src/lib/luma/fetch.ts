import { LumaEvent, LumaEventHost, LumaEventAddress } from "./types";

const LUMA_API_BASE = "https://public-api.luma.com";

function getApiKey(): string {
  const key = process.env.LUMA_API_KEY;
  if (!key) throw new Error("LUMA_API_KEY is not set");
  return key;
}

async function lumaFetch(path: string): Promise<unknown> {
  const res = await fetch(`${LUMA_API_BASE}${path}`, {
    headers: { "x-luma-api-key": getApiKey() },
  });
  if (!res.ok) {
    throw new Error(`Luma API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

interface LumaListEventEntry {
  event: {
    id: string;
    name: string;
    start_at: string;
    end_at: string;
    timezone: string;
    cover_url: string;
    url: string;
    geo_address_json: {
      city: string | null;
      region: string | null;
      country: string | null;
      full_address: string | null;
      description: string | null;
    } | null;
  };
}

interface LumaEventDetail {
  event: {
    id: string;
    name: string;
    start_at: string;
    end_at: string;
    timezone: string;
    cover_url: string;
    url: string;
    geo_address_json: {
      city: string | null;
      region: string | null;
      country: string | null;
      full_address: string | null;
      description: string | null;
    } | null;
  };
  hosts: Array<{
    name: string | null;
    avatar_url: string;
  }>;
}

function mapAddress(raw: LumaListEventEntry["event"]["geo_address_json"]): LumaEventAddress | null {
  if (!raw) return null;
  return {
    city: raw.city,
    region: raw.region,
    country: raw.country,
    fullAddress: raw.full_address,
    description: raw.description,
  };
}

function mapHosts(hosts: LumaEventDetail["hosts"]): LumaEventHost[] {
  return hosts.map((h) => ({
    name: h.name,
    avatarUrl: h.avatar_url,
  }));
}

export async function fetchUpcomingEvents(limit: number): Promise<LumaEvent[]> {
  const now = new Date().toISOString();
  const listData = await lumaFetch(
    `/v1/calendar/list-events?after=${encodeURIComponent(now)}&sort_column=start_at&sort_direction=asc&pagination_limit=${limit}`
  ) as { entries: LumaListEventEntry[] };

  const entries = listData.entries;
  if (!entries || entries.length === 0) return [];

  const detailed = await Promise.all(
    entries.map((entry) =>
      lumaFetch(`/v1/event/get?id=${encodeURIComponent(entry.event.id)}`) as Promise<LumaEventDetail>
    )
  );

  return detailed.map((detail) => ({
    id: detail.event.id,
    name: detail.event.name,
    startAt: detail.event.start_at,
    endAt: detail.event.end_at,
    timezone: detail.event.timezone,
    coverUrl: detail.event.cover_url,
    url: detail.event.url,
    address: mapAddress(detail.event.geo_address_json),
    hosts: mapHosts(detail.hosts),
  }));
}
