// The elections this site has built pages for, and the region-specific copy
// and paths the shared pledge flow needs.
//
// York Factory knows about elections; only this file knows we have pages for
// them. Adding a region means adding an entry here plus its route folder —
// the pledge flow, the /elections index and the API proxy all read from this.
//
// Residency for pledging is decided upstream, per jurisdiction
// (york_factory Election::PledgeEligibility), so nothing here gates it.

export type SupportedElection = {
  /** York Factory election slug, e.g. "toronto-2026" */
  slug: string;
  /** jurisdiction slug — also the default pledge region */
  jurisdictionSlug: string;
  /** e.g. "Toronto" — used in prose and the default voter name */
  cityLabel: string;
  /** e.g. "City of Toronto" — used when telling someone they're outside it */
  regionLabel: string;
  /** e.g. "Municipal Election · City of Toronto" */
  eyebrow: string;
  /** the election's landing page on this site */
  basePath: string;
  /** the pledge page; shared pledges live under `${pledgePath}/:slug` */
  pledgePath: string;
  /** e.g. "Monday, October 26" */
  voteDayLabel: string;
  /** e.g. "10:00 a.m. – 8:00 p.m." */
  pollHoursLabel: string;
};

const TORONTO_2026: SupportedElection = {
  slug: "toronto-2026",
  jurisdictionSlug: "toronto",
  cityLabel: "Toronto",
  regionLabel: "City of Toronto",
  eyebrow: "Municipal Election · City of Toronto",
  basePath: "/toronto/elections/2026",
  pledgePath: "/toronto/elections/2026/pledge",
  voteDayLabel: "Monday, October 26",
  pollHoursLabel: "10:00 a.m. – 8:00 p.m.",
};

const BRAMPTON_2026: SupportedElection = {
  slug: "brampton-2026",
  jurisdictionSlug: "brampton",
  cityLabel: "Brampton",
  regionLabel: "City of Brampton",
  eyebrow: "Municipal Election · City of Brampton",
  basePath: "/elections/brampton/2026",
  pledgePath: "/elections/brampton/2026/pledge",
  voteDayLabel: "Monday, October 26",
  pollHoursLabel: "10:00 a.m. – 8:00 p.m.",
};

export const SUPPORTED_ELECTIONS: Record<string, SupportedElection> = {
  [TORONTO_2026.slug]: TORONTO_2026,
  [BRAMPTON_2026.slug]: BRAMPTON_2026,
};

/** The election the pledge flow assumes when a caller names none — Toronto,
 *  where the flow shipped first. */
export const DEFAULT_ELECTION_SLUG = TORONTO_2026.slug;

/** Look up an election, falling back to the default rather than throwing:
 *  every caller here is rendering a page or proxying a form post, and neither
 *  should 500 over a bad slug. Use `isSupportedElection` to validate input. */
export function getElection(slug: string = DEFAULT_ELECTION_SLUG): SupportedElection {
  return SUPPORTED_ELECTIONS[slug] ?? SUPPORTED_ELECTIONS[DEFAULT_ELECTION_SLUG];
}

/** Whether we have pages for this election — the allowlist for anything that
 *  forwards a client-supplied slug upstream. */
export function isSupportedElection(slug: unknown): slug is string {
  return typeof slug === "string" && slug in SUPPORTED_ELECTIONS;
}

/** Whether a path is one of the full-bleed pledge pages, which run without
 *  site chrome (see Navbar / Footer). */
export function isPledgePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return Object.values(SUPPORTED_ELECTIONS).some((election) =>
    pathname.startsWith(election.pledgePath),
  );
}
