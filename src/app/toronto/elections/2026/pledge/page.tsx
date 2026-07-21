import type { Metadata } from "next";
import PledgeClient from "./PledgeClient";

export const metadata: Metadata = {
  title: "I Pledge to Vote — Toronto 2026",
  description:
    "You pledged to vote in Toronto's 2026 municipal election. Here's your ballot for Monday, October 26, 2026.",
  alternates: { canonical: "/toronto/elections/2026/pledge" },
  openGraph: {
    title: "I Pledge to Vote — Toronto 2026 | Build Canada",
    description:
      "Pledge to vote in Toronto's 2026 municipal election on October 26, 2026.",
    type: "website",
  },
};

export default async function PledgePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; region?: string }>;
}) {
  const { name, region } = await searchParams;
  return <PledgeClient initialName={name ?? ""} region={region} />;
}
