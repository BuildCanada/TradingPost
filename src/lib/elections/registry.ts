// The elections this site has built pages for, and the region-specific paths
// and key dates the shared election pages need.
//
// York Factory knows about elections; only this file knows we have pages for
// them. Adding a region means adding an entry here plus its route folder —
// the pledge flow, the shared landing/ward pages, the /vote index and the
// API proxy all read from this.
//
// Every coverage region uses the same route shape, `/<city>/vote/<year>`, with
// `/wards/:n` and `/pledge` beneath it. Page *copy* is not here: it lives
// beside each region's route and is passed into the shared components, so this
// stays small enough to import from client code.
//
// Residency for pledging is decided upstream, per jurisdiction
// (york_factory Election::PledgeEligibility), so nothing here gates it.

/** A dated milestone in the election calendar, shown as a countdown. */
export type ElectionKeyDate = {
  /** "YYYY-MM-DD", parsed as local midnight by the countdown helpers */
  iso: string;
  /** e.g. "Oct 6 – 11" — the human range or day beneath the number */
  label: string;
};

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
  /** voting day, "YYYY-MM-DD" — the main countdown's target */
  electionDateIso: string;
  /** e.g. "Monday, October 26" — prose form, used mid-sentence */
  voteDayLabel: string;
  /** e.g. "Mon, Oct 26" — compact form, used in stat cells */
  electionDayLabel: string;
  /** e.g. "10:00 a.m. – 8:00 p.m." */
  pollHoursLabel: string;
  /**
   * Nomination day, "YYYY-MM-DD". Overrides York Factory's
   * `nomination_close_date` wherever we show it — set this when the city has
   * published a date the upstream record hasn't caught up to yet, and drop it
   * again once upstream agrees.
   */
  nominationCloseIso?: string;
  /** first day of advance voting; omitted until the city publishes it */
  advanceVote?: ElectionKeyDate;
  /** deadline to apply to vote by mail; omitted until published */
  mailIn?: ElectionKeyDate;
  /**
   * Palette class wrapped around this election's pages. Only Toronto sets one
   * — `.theme-election` is its blue palette, matching the rest of /toronto.
   * Every other region uses the site's own auburn-and-linen theme, so it
   * leaves this unset rather than borrowing Toronto's colours.
   */
  themeClass?: string;
  /**
   * Whether this region's coverage is switched off. The config stays here so
   * the routes keep type-checking and the pages can be turned back on in one
   * line, but a hidden election is dropped from the /vote index and its URLs
   * redirect there (see next.config.ts). Only Toronto is live right now.
   */
  hidden?: boolean;
};

const TORONTO_2026: SupportedElection = {
  slug: "toronto-2026",
  jurisdictionSlug: "toronto",
  cityLabel: "Toronto",
  regionLabel: "City of Toronto",
  eyebrow: "Municipal Election · City of Toronto",
  basePath: "/toronto/vote/2026",
  pledgePath: "/toronto/vote/2026/pledge",
  electionDateIso: "2026-10-26",
  voteDayLabel: "Monday, October 26",
  electionDayLabel: "Mon, Oct 26",
  pollHoursLabel: "10:00 a.m. – 8:00 p.m.",
  // Per the City Clerk's 2026 election calendar:
  // https://www.toronto.ca/city-government/elections/key-dates/
  nominationCloseIso: "2026-08-21",
  advanceVote: { iso: "2026-10-06", label: "Oct 6 – 11" },
  mailIn: { iso: "2026-09-24", label: "Thu, Sept 24" },
  themeClass: "theme-election",
};

const BRAMPTON_2026: SupportedElection = {
  slug: "brampton-2026",
  jurisdictionSlug: "brampton",
  cityLabel: "Brampton",
  regionLabel: "City of Brampton",
  eyebrow: "Municipal Election · City of Brampton",
  basePath: "/brampton/vote/2026",
  pledgePath: "/brampton/vote/2026/pledge",
  electionDateIso: "2026-10-26",
  voteDayLabel: "Monday, October 26",
  electionDayLabel: "Mon, Oct 26",
  pollHoursLabel: "10:00 a.m. – 8:00 p.m.",
  // Brampton hasn't published its advance-vote or vote-by-mail dates yet;
  // those countdowns stay off the page rather than guess at them.
  hidden: true,
};

const HAMILTON_2026: SupportedElection = {
  slug: "hamilton-2026",
  jurisdictionSlug: "hamilton",
  cityLabel: "Hamilton",
  regionLabel: "City of Hamilton",
  eyebrow: "Municipal Election · City of Hamilton",
  basePath: "/hamilton/vote/2026",
  pledgePath: "/hamilton/vote/2026/pledge",
  electionDateIso: "2026-10-26",
  voteDayLabel: "Monday, October 26",
  electionDayLabel: "Mon, Oct 26",
  pollHoursLabel: "10:00 a.m. – 8:00 p.m.",
  // As with Brampton — not yet published by the city.
  hidden: true,
};

const OTTAWA_2026: SupportedElection = {
  slug: "ottawa-2026",
  jurisdictionSlug: "ottawa",
  cityLabel: "Ottawa",
  regionLabel: "City of Ottawa",
  eyebrow: "Municipal Election · City of Ottawa",
  basePath: "/ottawa/vote/2026",
  pledgePath: "/ottawa/vote/2026/pledge",
  electionDateIso: "2026-10-26",
  voteDayLabel: "Monday, October 26",
  electionDayLabel: "Mon, Oct 26",
  pollHoursLabel: "10:00 a.m. – 8:00 p.m.",
  // As with Brampton and Hamilton — not yet published by the city.
  hidden: true,
};

export const SUPPORTED_ELECTIONS: Record<string, SupportedElection> = {
  [TORONTO_2026.slug]: TORONTO_2026,
  [BRAMPTON_2026.slug]: BRAMPTON_2026,
  [HAMILTON_2026.slug]: HAMILTON_2026,
  [OTTAWA_2026.slug]: OTTAWA_2026,
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
