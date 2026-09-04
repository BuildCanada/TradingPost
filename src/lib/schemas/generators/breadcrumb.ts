const ROUTE_LABELS: Record<string, string> = {
  memos: "Memos",
  about: "About",
  projects: "Projects",
  content: "Content",
  "state-of-the-nation": "State of the Nation",
  toronto: "Toronto",
  vote: "Vote",
  wards: "Wards",
  "2026": "Toronto 2026 Election",
};

export function generateBreadcrumbSchema(
  path: string,
  pageTitle: string,
  siteUrl: string
) {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const items = [
    {
      "@type": "ListItem" as const,
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    items.push({
      "@type": "ListItem" as const,
      position: i + 2,
      name: isLast ? pageTitle : (ROUTE_LABELS[segment] ?? segment),
      item: `${siteUrl}/${segments.slice(0, i + 1).join("/")}`,
    });
  }

  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items,
  };
}
