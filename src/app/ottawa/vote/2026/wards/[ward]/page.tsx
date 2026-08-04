import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WardDetail } from "@/components/elections/WardDetail";
import { WardMap, WardMapDefs } from "@/components/elections/WardMap";
import { WARD_GEO, WARD_SHAPES } from "../../wardGeo";
import {
  ELECTION,
  WARD_NUMBERS,
  WARDS,
  getOttawa2026,
  getOttawa2026Ward,
} from "../../data";

export function generateStaticParams() {
  return WARD_NUMBERS.map((n) => ({ ward: n }));
}

/** The ward as the City draws it, by route token ("01" or "1"). */
function shapeFor(token: string) {
  return WARD_SHAPES.find((w) => parseInt(w.n, 10) === parseInt(token, 10));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string }>;
}): Promise<Metadata> {
  const { ward } = await params;
  const w = shapeFor(ward);
  if (!w) return { title: "Ward not found" };
  return {
    title: `Ward ${w.n} — ${w.name}`,
    description: `The council race in Ward ${w.n} (${w.name}) for Ottawa's October 26, 2026 municipal election.`,
    alternates: { canonical: `${ELECTION.basePath}/wards/${w.n}` },
    openGraph: {
      title: `Ward ${w.n} — ${w.name} — Ottawa 2026 Election`,
      description: `Candidates for councillor in ${w.name}.`,
      type: "website",
    },
  };
}

export default async function OttawaWardPage({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const [data, view] = await Promise.all([
    getOttawa2026Ward(ward),
    getOttawa2026(),
  ]);

  // Before the roster is published there are no races to list, but the ward
  // itself is real and mapped — so show it rather than 404.
  if (!data) {
    const w = shapeFor(ward);
    if (!w) notFound();
    return <PreRosterWard n={w.n} name={w.name} />;
  }

  return (
    <WardDetail
      election={ELECTION}
      data={data}
      nominationCloseLabel={view?.nominationCloseLabel ?? null}
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

function PreRosterWard({ n, name }: { n: string; name: string }) {
  const idx = WARDS.findIndex((w) => w.n === n);
  const prev = WARDS[(idx + WARDS.length - 1) % WARDS.length];
  const next = WARDS[(idx + 1) % WARDS.length];

  return (
    <div className="bg-bg text-dark">
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        <WardMapDefs geo={WARD_GEO} />

        <div className="px-6 md:px-14 py-5 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
          <Link
            href={`${ELECTION.basePath}#wards`}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            All wards
          </Link>
          <span className="text-border-light">/</span>
          <span>Ward {n}</span>
        </div>

        <section className="grid md:grid-cols-[1fr_auto] gap-10 md:items-center px-6 py-12 md:px-14 md:py-14 border-b-2 border-dark">
          <div>
            <p className="type-label text-accent mb-5">City Council · Ward {n}</p>
            <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.75rem,6vw,5rem)] max-w-[16ch] text-balance mb-6">
              {name}
            </h1>
          </div>
          <WardMap
            geo={WARD_GEO}
            activeWard={n}
            className="hidden md:block w-[260px] h-auto flex-none"
          />
        </section>

        <section className="px-6 py-14 md:px-14">
          <p className="font-serif text-[1.15rem] leading-[1.5] max-w-[56ch] text-dark/80">
            Nominations for Ottawa&rsquo;s 2026 election haven&rsquo;t opened
            yet, so there are no registered candidates in {name} to show.
            We&rsquo;ll list them here as they file.
          </p>
        </section>

        <section className="grid grid-cols-2 border-t border-border-light border-dark">
          <Link
            href={`${ELECTION.basePath}/wards/${prev.n}`}
            className="group px-6 md:px-14 py-7 border-r border-border-light transition-colors hover:bg-linen-200"
          >
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mb-2">
              Ward {prev.n}
            </div>
            <div className="font-sans font-medium text-[1.25rem] tracking-[-0.015em]">
              {prev.name}
            </div>
          </Link>
          <Link
            href={`${ELECTION.basePath}/wards/${next.n}`}
            className="group px-6 md:px-14 py-7 text-right transition-colors hover:bg-linen-200"
          >
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary mb-2">
              Ward {next.n}
            </div>
            <div className="font-sans font-medium text-[1.25rem] tracking-[-0.015em]">
              {next.name}
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
