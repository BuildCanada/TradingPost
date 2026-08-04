import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WardDetail } from "@/components/elections/WardDetail";
import { WardMap, WardMapDefs } from "@/components/elections/WardMap";
import { ELECTION, WARD_NUMBERS, getToronto2026, getToronto2026Ward } from "../../data";
import { WARD_GEO, WARD_SHAPES } from "../../wardGeo";

export function generateStaticParams() {
  return WARD_NUMBERS.map((n) => ({ ward: n }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string }>;
}): Promise<Metadata> {
  const { ward } = await params;
  const w = WARD_SHAPES.find((shape) => parseInt(shape.n, 10) === parseInt(ward, 10));
  if (!w) return { title: "Ward not found" };
  return {
    title: `Ward ${w.n} — ${w.name}`,
    description: `The council race in Ward ${w.n} (${w.name}) for Toronto's October 26, 2026 municipal election. See every candidate registered to represent it.`,
    alternates: { canonical: `${ELECTION.basePath}/wards/${w.n}` },
    openGraph: {
      title: `Ward ${w.n} — ${w.name} — Toronto 2026 Election`,
      description: `Candidates for councillor in ${w.name}.`,
      type: "website",
    },
  };
}

export default async function WardDetailPage({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const [data, view] = await Promise.all([
    getToronto2026Ward(ward),
    getToronto2026(),
  ]);
  if (!data) notFound();

  return (
    <WardDetail
      election={ELECTION}
      data={data}
      nominationCloseLabel={view.nominationCloseLabel}
      wardMapDefs={<WardMapDefs geo={WARD_GEO} />}
      wardMap={
        <WardMap
          geo={WARD_GEO}
          activeWard={data.ward.n}
          className="hidden md:block w-[260px] h-auto flex-none"
        />
      }
    />
  );
}
