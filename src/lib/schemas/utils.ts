export function stripNulls<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        const filtered = value.filter((v) => v !== null && v !== undefined);
        if (filtered.length > 0) result[key] = filtered;
      } else if (typeof value === "object" && value !== null) {
        result[key] = stripNulls(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }
  return result as Partial<T>;
}

export function toAbsoluteUrl(url: string | null | undefined, baseUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export function toISO8601(date: Date | string | null): string | null {
  if (!date) return null;
  return new Date(date).toISOString();
}

export function parseJSON<T>(json: string | null | undefined): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function buildSameAs(person: {
  xUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
}): string[] {
  return [person.xUrl, person.linkedinUrl, person.websiteUrl].filter(
    (url): url is string => typeof url === "string" && url.length > 0
  );
}
