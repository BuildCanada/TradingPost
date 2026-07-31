import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { WardView } from "@/lib/elections/election-data";

/**
 * One ward tile: number, optional locator map, name, candidate count. Used
 * both for the "Find your ward" grid and for the result of the postal-code
 * lookup, so the two always look the same.
 *
 * `map` is the region's locator graphic for this ward — Toronto has ward
 * geometry, the other regions don't, and the tile lays out either way.
 * `className` carries placement, not appearance: the grid passes its lattice
 * borders, a standalone card passes its own.
 */
export function WardCard({
  ward,
  basePath,
  map,
  countLabel,
  className,
}: {
  ward: WardView;
  /** the election's landing path, e.g. "/hamilton/elections/2026" */
  basePath: string;
  map?: ReactNode;
  /**
   * Replaces the "N candidates" line. Used where a region's wards are drawn
   * before its roster exists, so the tile doesn't read "0 candidates" — which
   * says nobody registered, not that nobody could have yet.
   */
  countLabel?: string;
  className?: string;
}) {
  return (
    <Link
      href={`${basePath}/wards/${ward.n}`}
      className={`group bg-bg px-6 py-5 flex flex-col gap-3 min-h-[172px] transition-colors hover:bg-linen-200 ${className ?? ""}`}
    >
      <div className="flex justify-between items-start gap-3">
        <span className="type-label text-accent pt-1 !tracking-[0.1em]">
          Ward {ward.n}
        </span>
        {map}
      </div>
      <span className="font-sans font-medium text-[1.2rem] tracking-[-0.015em] leading-[1.15] flex-1">
        {ward.name}
      </span>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="type-label-sm text-text-secondary !tracking-[0.06em]">
          {countLabel ?? `${ward.count} candidates`}
        </span>
        <ArrowRight className="size-4 text-text-secondary opacity-70 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
