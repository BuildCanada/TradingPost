export interface MemoItem {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    photo: string | null;
  };
  keyMessage1: string;
  keyMessage2: string | null;
  keyMessage3: string | null;
  splashImage: string | null;
  seoImage: string | null;
  category: string | null;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export function formatDate(dateStr: string | null, fallback: string) {
  const d = new Date(dateStr || fallback);
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function shortenName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
