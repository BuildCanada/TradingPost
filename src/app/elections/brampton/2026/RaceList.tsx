"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { CandidateView, RaceView } from "./data";

/**
 * Every race, with Brampton's 1–10 ward filter. Selecting a ward shows the
 * races that ward votes in — its city councillor, regional councillor and
 * trustees — plus every at-large race (mayor, the two French-board trustees),
 * which everyone votes in.
 */
export default function RaceList({
  races,
  wards,
  nominationCloseLabel,
}: {
  races: RaceView[];
  wards: number[];
  nominationCloseLabel: string | null;
}) {
  const [ward, setWard] = useState<number | null>(null);

  const visible = useMemo(
    () =>
      ward === null
        ? races
        : races.filter((race) => race.atLarge || race.wardNumbers?.includes(ward)),
    [races, ward],
  );

  return (
    <>
      {/* ── Ward filter ──────────────────────────────────────── */}
      <div className="px-6 md:px-14 pb-8 border-b border-border-light">
        <p className="type-label text-text-secondary mb-3.5 !tracking-[0.1em]">
          Filter by ward
        </p>
        <div className="flex flex-wrap gap-2">
          <WardButton active={ward === null} onClick={() => setWard(null)}>
            All wards
          </WardButton>
          {wards.map((n) => (
            <WardButton key={n} active={ward === n} onClick={() => setWard(n)}>
              {n}
            </WardButton>
          ))}
        </div>
        <p className="mt-4 type-label-sm text-text-secondary !tracking-[0.06em]">
          {ward === null
            ? `${races.length} races on the ballot`
            : `${visible.length} races on a Ward ${ward} ballot`}
        </p>
      </div>

      {/* ── Races ────────────────────────────────────────────── */}
      {visible.map((race) => (
        <Race
          key={race.id}
          race={race}
          nominationCloseLabel={nominationCloseLabel}
        />
      ))}
    </>
  );
}

function WardButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`type-label-sm !tracking-[0.08em] px-3.5 py-2 border transition-colors cursor-pointer ${
        active
          ? "bg-dark text-bg border-dark"
          : "border-border-light text-dark hover:bg-bg-alt"
      }`}
    >
      {children}
    </button>
  );
}

function Race({
  race,
  nominationCloseLabel,
}: {
  race: RaceView;
  nominationCloseLabel: string | null;
}) {
  const registered = race.candidates.filter((c) => !c.withdrawn).length;

  return (
    <section className="border-b border-border-light">
      <div className="px-6 md:px-14 pt-9 pb-5 flex justify-between items-end gap-5 flex-wrap">
        <div>
          {race.officeBody && (
            <p className="type-label text-accent mb-2.5">{race.officeBody}</p>
          )}
          <h3 className="font-sans font-medium leading-[1.1] tracking-[-0.025em] text-[clamp(1.4rem,2.4vw,1.9rem)]">
            {race.label}
          </h3>
        </div>
        <p className="type-label-sm text-text-secondary !tracking-[0.06em] pb-1">
          {registered} {registered === 1 ? "candidate" : "candidates"}
          {race.atLarge && " · all wards vote"}
        </p>
      </div>

      {race.candidates.length === 0 ? (
        <p className="px-6 md:px-14 pb-9 font-serif text-[1.05rem] leading-[1.45] text-dark/70 max-w-[62ch]">
          No one has filed for this seat yet.
          {nominationCloseLabel
            ? ` Nominations close ${nominationCloseLabel} — check back as candidates register.`
            : " Check back as candidates register."}
        </p>
      ) : (
        <ul>
          {race.candidates.map((candidate) => (
            <Candidate key={candidate.key} candidate={candidate} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Candidate({ candidate }: { candidate: CandidateView }) {
  return (
    <li
      className={`flex gap-5 sm:gap-6 items-center px-6 md:px-14 py-5 border-t border-border-light ${
        candidate.withdrawn ? "opacity-55" : ""
      }`}
    >
      {/* No upstream portraits yet — initials stand in. */}
      <span
        aria-hidden="true"
        className="flex-none size-12 bg-dark flex items-center justify-center font-sans font-medium text-[1.05rem] tracking-[-0.02em] text-bg"
      >
        {candidate.initials}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <p
            className={`font-sans font-medium text-[1.25rem] tracking-[-0.02em] leading-[1.15] ${
              candidate.withdrawn ? "line-through decoration-1" : ""
            }`}
          >
            {candidate.name}
          </p>
          {candidate.withdrawn && (
            <span className="type-label-sm !text-[10px] !tracking-[0.12em] px-2 py-1 border border-border-light text-text-secondary">
              Withdrawn
            </span>
          )}
        </div>
        {candidate.socialLinks.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {candidate.socialLinks.map((link) => (
              <a
                key={`${link.name}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="type-label-sm !tracking-[0.06em] text-text-secondary hover:text-accent transition-colors"
              >
                {socialLabel(link.name)}
              </a>
            ))}
          </div>
        )}
      </div>
      {candidate.website ? (
        <a
          href={candidate.website}
          target="_blank"
          rel="noopener noreferrer"
          className="group/btn hidden sm:inline-flex flex-none items-center gap-1.5 type-label-sm text-accent hover:underline"
        >
          Campaign site
          <ArrowUpRight className="size-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </a>
      ) : (
        <span className="hidden sm:block flex-none type-label-sm text-text-secondary">
          No site listed
        </span>
      )}
    </li>
  );
}

/** `social_links[].name` is an open vocabulary ("web", "facebook", "tiktok",
 *  …), so unknown names are title-cased rather than dropped. */
function socialLabel(name: string): string {
  if (name.toLowerCase() === "web") return "Website";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
