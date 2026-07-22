import type { Metadata } from "next";
import SharedPledgeClient from "./SharedPledgeClient";

/* Recover a display name from a shared pledge URL. The exact-case name
   travels in the ?n= query param; the slug (name plus a random 6-char
   suffix, e.g. "jane-doe-k3x9p2") is the fallback for stripped URLs. */
function displayName(slug: string, n?: string) {
  const fromQuery = n?.trim();
  if (fromQuery) return fromQuery.slice(0, 40);

  const parts = decodeURIComponent(slug).split("-");
  if (parts.length > 1 && /^[a-z0-9]{6}$/.test(parts[parts.length - 1])) {
    parts.pop();
  }
  const name = parts
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ")
    .slice(0, 40);
  return name || "A Toronto Voter";
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ n?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { n } = await searchParams;
  const name = displayName(slug, n);
  return {
    title: `${name} pledged to vote — Toronto 2026`,
    description: `${name} is on the record for Toronto's 2026 municipal election, Monday, October 26. Will you be?`,
    openGraph: {
      title: `${name} pledged to vote — Toronto 2026 | Build Canada`,
      description: `${name} pledged to vote in Toronto's 2026 municipal election on October 26, 2026. Join them on the record.`,
      type: "website",
    },
  };
}

export default async function SharedPledgePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { n } = await searchParams;
  return <SharedPledgeClient name={displayName(slug, n)} />;
}
