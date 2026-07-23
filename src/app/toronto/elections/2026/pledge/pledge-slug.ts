export function slugifyName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "toronto-voter"
  );
}

/* Legacy unique path segment for a pledge: the name slugified plus a short
   random suffix. Only used when the API didn't return a share token. */
export function pledgeSlug(name: string) {
  const suffix = Math.random().toString(36).slice(2, 8).padEnd(6, "0");
  return `${slugifyName(name)}-${suffix}`;
}

/* The canonical shared URL for a pledge. With a share token from York
   Factory the page is server-verified (`/pledge/jane-doe-a1b2c3d4e5`);
   without one we fall back to the legacy random-suffix URL carrying the
   exact-case name in the query. */
export function pledgeSharePath(name: string, shareToken?: string | null) {
  const displayName = name.trim() || "A Toronto Voter";
  if (shareToken) {
    return `/toronto/elections/2026/pledge/${slugifyName(displayName)}-${shareToken}`;
  }
  return `/toronto/elections/2026/pledge/${pledgeSlug(displayName)}?n=${encodeURIComponent(displayName)}`;
}

/* York Factory share tokens are 10 lowercase-alphanumeric chars; the legacy
   client-generated suffix was 6. */
const SHARE_TOKEN_PATTERN = /^[a-z0-9]{10}$/;
const LEGACY_SUFFIX_PATTERN = /^[a-z0-9]{6}$/;

export function tokenFromSlug(slug: string): string | null {
  const last = decodeURIComponent(slug).split("-").pop() ?? "";
  return SHARE_TOKEN_PATTERN.test(last) ? last : null;
}

/* Recover a display name from a shared pledge slug by title-casing the name
   part, dropping the trailing share token or legacy random suffix. */
export function nameFromSlug(slug: string) {
  const parts = decodeURIComponent(slug).split("-");
  const last = parts[parts.length - 1];
  if (
    parts.length > 1 &&
    (SHARE_TOKEN_PATTERN.test(last) || LEGACY_SUFFIX_PATTERN.test(last))
  ) {
    parts.pop();
  }
  const name = parts
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ")
    .slice(0, 40);
  return name || "A Toronto Voter";
}
