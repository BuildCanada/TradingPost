import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WardMap } from "./WardMap";
import type { Ward } from "./data";

/**
 * One ward tile: number, locator map, name, candidate count. Used both for the
 * "Find your ward" grid and for the result of the postal-code lookup, so the
 * two always look the same.
 *
 * `className` carries placement, not appearance — the grid passes its lattice
 * borders, a standalone card passes its own. Requires <WardMapDefs /> once on
 * the page for the locator map to resolve.
 */
export function WardCard({
  ward,
  className,
}: {
  ward: Ward;
  className?: string;
}) {
  return (
    <Link
      href={`/toronto/elections/2026/wards/${ward.n}`}
      className={`group bg-bg px-6 py-5 flex flex-col gap-3 min-h-[172px] transition-colors hover:bg-linen-200 ${className ?? ""}`}
    >
      <div className="flex justify-between items-start gap-3">
        <span className="type-label text-accent pt-1 !tracking-[0.1em]">
          Ward {ward.n}
        </span>
        <WardMap
          activeWard={ward.n}
          className="w-[92px] h-auto flex-none block"
        />
      </div>
      <span className="font-sans font-medium text-[1.2rem] tracking-[-0.015em] leading-[1.15] flex-1">
        {ward.name}
      </span>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="type-label-sm text-text-secondary !tracking-[0.06em]">
          {ward.count} candidates
        </span>
        <ArrowRight className="size-4 text-text-secondary opacity-70 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
