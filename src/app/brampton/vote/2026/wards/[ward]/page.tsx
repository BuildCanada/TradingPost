import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WardDetail } from "@/components/elections/WardDetail";
import { ELECTION, getBrampton2026, getBrampton2026Ward } from "../../data";

/** Brampton's ten wards. Listed here so the routes prerender without a build
 *  -time API call; a ward the API doesn't know about still 404s at request
 *  time via getBrampton2026Ward. */
const WARDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function generateStaticParams() {
  return WARDS.map((ward) => ({ ward }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string }>;
}): Promise<Metadata> {
  const { ward } = await params;
  const data = await getBrampton2026Ward(ward);
  if (!data) return { title: "Ward not found" };
  return {
    title: `Ward ${data.ward.n} — Brampton 2026 Election`,
    description: `The council races in Ward ${data.ward.n} for Brampton's October 26, 2026 municipal election — the city councillor, the regional councillor, and the school board trustees on this ballot.`,
    alternates: { canonical: `${ELECTION.basePath}/wards/${data.ward.n}` },
    openGraph: {
      title: `Ward ${data.ward.n} — Brampton 2026 Election`,
      description: `Candidates running in Ward ${data.ward.n}.`,
      type: "website",
    },
  };
}

export default async function BramptonWardPage({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const [data, view] = await Promise.all([
    getBrampton2026Ward(ward),
    getBrampton2026(),
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
