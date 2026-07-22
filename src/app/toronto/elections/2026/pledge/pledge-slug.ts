/* Unique, shareable path segment for a pledge: the name slugified plus a
   short random suffix so every pledge gets its own URL */
export function pledgeSlug(name: string) {
  const base =
    name
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "toronto-voter";
  const suffix = Math.random().toString(36).slice(2, 8).padEnd(6, "0");
  return `${base}-${suffix}`;
}

/* The canonical shared URL for a pledge, carrying the exact-case name */
export function pledgeSharePath(name: string) {
  const displayName = name.trim() || "A Toronto Voter";
  return `/toronto/elections/2026/pledge/${pledgeSlug(displayName)}?n=${encodeURIComponent(displayName)}`;
}
