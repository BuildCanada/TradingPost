import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WardDetail } from "@/components/elections/WardDetail";
import { ELECTION, getHamilton2026, getHamilton2026Ward } from "../../data";

/** Hamilton's fifteen wards. Listed here so the routes prerender without a
 *  build-time API call; a ward the API doesn't know about still 404s at
 *  request time via getHamilton2026Ward. */
const WARDS = Array.from({ length: 15 }, (_, i) => String(i + 1));

export function generateStaticParams() {
  return WARDS.map((ward) => ({ ward }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string }>;
}): Promise<Metadata> {
  const { ward } = await params;
  const data = await getHamilton2026Ward(ward);
  if (!data) return { title: "Ward not found" };
  return {
    title: `Ward ${data.ward.n} — Hamilton 2026 Election`,
    description: `The council race in Ward ${data.ward.n} for Hamilton's October 26, 2026 municipal election. See every candidate registered to represent it.`,
    alternates: { canonical: `${ELECTION.basePath}/wards/${data.ward.n}` },
    openGraph: {
      title: `Ward ${data.ward.n} — Hamilton 2026 Election`,
      description: `Candidates for councillor in Ward ${data.ward.n}.`,
      type: "website",
    },
  };
}

export default async function HamiltonWardPage({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const [data, view] = await Promise.all([
    getHamilton2026Ward(ward),
    getHamilton2026(),
  ]);
  if (!data) notFound();

  return (
    <WardDetail
      election={ELECTION}
      data={data}
      nominationCloseLabel={view?.nominationCloseLabel ?? null}
    />
  );
}
