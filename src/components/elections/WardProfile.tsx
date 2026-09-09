import Link from "next/link";
import { IncumbentBadge } from "./ElectionLanding";

/* What a ward is, above the race to represent it.

   A ward page opens with a name, a map and a candidate list, which tells a
   reader who is running but nothing about the place they would represent.
   This section is the missing half: a few sentences on the ward, and the
   statistics that back them up.

   Every figure is shown against the citywide figure, because a ward statistic
   read alone means very little — 45% of households renting is unremarkable
   until you know the city sits at 48%, and 88% of homes in towers is only
   legible next to a city average of 47%. Regions supply their own profiles
   (see scripts/gen-ward-profiles.mjs for how Toronto's statistics are
   generated); a region with none simply passes no profile and the section
   does not render. */

export type WardStat = {
  /** e.g. "Renter households" */
  label: string;
  /** the ward's figure, formatted — e.g. "45.5%", "$81,000", "115,120" */
  value: string;
  /** the same figure for the whole city; omit where a comparison would be
   *  meaningless, as with population density */
  cityValue?: string;
  /** a secondary figure or qualifier shown under the value */
  note?: string;
};

export type WardProfile = {
  /** two to four sentences on the ward; may be empty */
  brief: string;
  stats: WardStat[];
  /**
   * The sitting councillor, named only when they are registered to run in
   * this ward again. Absent both when the seat's holder is not seeking
   * re-election and when the region does not track who holds it, so the line
   * appears only where it is known to be true.
   */
  incumbent?: { name: string; href?: string };
  /** where the statistics come from, as it should read under them — e.g.
   *  "the 2021 Census of Population, via the City of Toronto's ward
   *  profiles". Each region words its own; omit to show no source line. */
  source?: string;
};

export function WardProfileSection({ profile }: { profile: WardProfile }) {
  const { brief, stats, source, incumbent } = profile;

  return (
    <section
      id="about-this-ward"
      aria-labelledby="about-this-ward-heading"
      className="border-t-2 border-dark"
    >
      <div className="px-6 md:px-14 pt-11 pb-8 grid gap-5">
        <h2
          id="about-this-ward-heading"
          className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.5rem)]"
        >
          About this ward
        </h2>
        {incumbent && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <IncumbentBadge />
            {incumbent.href ? (
              <Link
                href={incumbent.href}
                className="font-sans font-medium text-[1.05rem] hover:text-accent transition-colors"
              >
                {incumbent.name}
              </Link>
            ) : (
              <span className="font-sans font-medium text-[1.05rem]">
                {incumbent.name}
              </span>
            )}
            <span className="type-label-sm !tracking-[0.1em] text-text-secondary">
              Seeking re-election
            </span>
          </p>
        )}
        {brief && (
          <p className="font-serif text-[1.08rem] leading-[1.55] text-dark/85 max-w-[68ch] text-pretty">
            {brief}
          </p>
        )}
      </div>

      {stats.length > 0 && (
        <>
          {/* Borders are drawn on the leading edge of each cell rather than the
              trailing one, so the grid never paints a rule down its outer
              right edge on a row that happens to be full. */}
          <dl className="grid grid-cols-2 md:grid-cols-4 border-t border-border-light">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="px-6 py-7 md:px-14 border-b border-border-light [&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:border-r-0 md:[&:not(:nth-child(4n+1))]:border-l"
              >
                <dd className="font-sans font-semibold text-[2rem] leading-none tracking-[-0.03em] tabular-nums">
                  {stat.value}
                </dd>
                <dt className="type-label-sm !tracking-[0.1em] text-text-secondary mt-2.5 text-balance">
                  {stat.label}
                </dt>
                {(stat.note || stat.cityValue) && (
                  <p className="font-serif text-[0.9rem] leading-[1.4] text-text-secondary mt-2.5">
                    {stat.note}
                    {stat.note && stat.cityValue && " · "}
                    {stat.cityValue && (
                      <span className="tabular-nums">
                        {stat.cityValue} citywide
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </dl>
          {source && (
            <p className="px-6 md:px-14 py-5 type-label-sm !tracking-[0.08em] text-text-secondary">
              Figures from {source}.
            </p>
          )}
        </>
      )}
    </section>
  );
}
