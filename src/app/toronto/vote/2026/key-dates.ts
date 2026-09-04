// Toronto's 2026 voting calendar, with the times of day the shared registry
// doesn't carry.
//
// `ElectionKeyDate` in @/lib/elections/registry is date-only and deliberately
// generic across four cities — three of which have published no dates at all.
// Two of Toronto's deadlines turn on a time of day (mail-in applications close
// at 4:30 p.m.; completed ballots must *arrive* by noon), and two of its
// periods are ranges rather than days, so the minute-accurate countdowns on
// /when-is-the-election need a richer model than the registry should grow.
//
// The day values the registry already owns are read from it rather than
// retyped, so the two can't drift apart. Only the facts it has no field for —
// times of day, period end dates, the Oct 14 ballot-return deadline, the
// voters'-list dates — are written out here.
//
// Source: the City Clerk's 2026 election calendar.
// https://www.toronto.ca/city-government/elections/key-dates/

import { getElection } from "@/lib/elections/registry";

export const ELECTION = getElection("toronto-2026");

/** Every date in the 2026 Toronto calendar falls before the Nov 1 DST change,
 *  so each one is Eastern *Daylight* Time. A date past Nov 1 would need
 *  "-05:00" — this is why the offset is named rather than inlined. */
const EDT = "-04:00";

/** An absolute instant from a "YYYY-MM-DD" day plus a "HH:MM:SS" Toronto
 *  wall-clock time. */
function at(iso: string, time: string): string {
  return `${iso}T${time}${EDT}`;
}

export const KEY_DATES_PATH = "/toronto/vote/2026/when-is-the-election";
export const HOW_TO_VOTE_PATH = "/toronto/vote/2026/how-to-vote";
/* The two voting periods that used to be countdown cards on the key-dates
   page. Each has enough of its own detail — two deadlines and a drop-box
   network for mail, six days and a separate set of places for advance — that
   the one page could not hold all of it without burying the thing most people
   came for, which is the date of election day. */
export const ADVANCE_VOTING_PATH = "/toronto/vote/2026/advance-voting";
export const VOTE_BY_MAIL_PATH = "/toronto/vote/2026/vote-by-mail";

const CITY_ELECTIONS_URL = "https://www.toronto.ca/city-government/elections/";
const MAIL_IN_URL =
  "https://www.toronto.ca/city-government/elections/voter-information/mail-in-voting/";
const VOTERS_LIST_URL =
  "https://www.toronto.ca/city-government/elections/voter-information/voters-list/";
const ID_URL =
  "https://www.toronto.ca/city-government/elections/voter-information/identification/";
const KEY_DATES_URL =
  "https://www.toronto.ca/city-government/elections/key-dates/";
/** Proxy voting, curbside voting, Voter Assist Terminals and the language
 *  services all live on one City page. Linked from the "how to vote" steps,
 *  which is the only place we mention voting by proxy. */
const VOTING_OPTIONS_URL =
  "https://www.toronto.ca/city-government/elections/voter-information/voting-options/";

/** MyVote is the City's own voter portal — where you check or update your
 *  registration and request a mail-in package. The primary action on this page
 *  points here rather than at a toronto.ca explainer. */
export const MYVOTE_URL = "https://myvote.toronto.ca/home";

export const SOURCE_URLS = {
  city: CITY_ELECTIONS_URL,
  myVote: MYVOTE_URL,
  mailIn: MAIL_IN_URL,
  votersList: VOTERS_LIST_URL,
  identification: ID_URL,
  keyDates: KEY_DATES_URL,
  votingOptions: VOTING_OPTIONS_URL,
};

/** A voting period with a live countdown. Copy is spelled out per state rather
 *  than derived, because "Until advance voting opens" and "Left to apply" read
 *  nothing like each other and a generic "Closes in" would be wrong for both. */
export type VotingPeriod = {
  id: "mail-in-apply" | "advance" | "mail-in-return" | "election-day";
  /** card heading, e.g. "Advance voting" */
  title: string;
  /** absolute instant the period opens; omitted for a pure deadline, which is
   *  treated as live until it passes */
  opensAt?: string;
  /** absolute instant the period closes — always present */
  closesAt: string;
  /** the human date or range, e.g. "Oct 6 – 11" */
  dateLabel: string;
  /** e.g. "10 a.m. – 7 p.m. daily" */
  hoursLabel?: string;
  /** what this period is, in one sentence */
  blurb: string;
  /** label beside the countdown before the period opens */
  upcomingLabel: string;
  /** label beside the countdown while it is running */
  openLabel: string;
  /** what the card says once it has passed */
  closedLabel: string;
  /** where the reader goes to act on it */
  href: string;
  /** link text for `href` */
  hrefLabel: string;
};

/** Election day — the page's headline countdown, kept separate from the grid
 *  because it gets the hero treatment. */
export const ELECTION_DAY: VotingPeriod = {
  id: "election-day",
  title: "Election day",
  opensAt: at(ELECTION.electionDateIso, "10:00:00"),
  closesAt: at(ELECTION.electionDateIso, "20:00:00"),
  dateLabel: `${ELECTION.voteDayLabel}, ${ELECTION.electionDateIso.slice(0, 4)}`,
  hoursLabel: ELECTION.pollHoursLabel,
  blurb:
    "The main voting day. Vote at your assigned voting place — the one on your voter information card, or the one MyVote gives you.",
  upcomingLabel: "Until polls open",
  openLabel: "Left to vote",
  closedLabel: "Polls have closed",
  href: CITY_ELECTIONS_URL,
  hrefLabel: "Find your voting place",
};

/** The three periods that run before election day, in the order they close. */
export const VOTING_PERIODS: VotingPeriod[] = [
  {
    id: "mail-in-apply",
    title: "Apply to vote by mail",
    opensAt: "2026-09-01T00:00:00" + EDT,
    // The day comes from the registry; only the 4:30 p.m. cutoff is new here.
    closesAt: at(ELECTION.mailIn!.iso, "16:30:00"),
    dateLabel: `${ELECTION.mailIn!.label}, 4:30 p.m.`,
    blurb:
      "Request a mail-in voting package through MyVote. Applications opened September 1 and this is the last moment to ask for one.",
    upcomingLabel: "Until applications open",
    openLabel: "Left to apply",
    closedLabel: "Applications have closed",
    href: MAIL_IN_URL,
    hrefLabel: "Apply to vote by mail",
  },
  {
    id: "advance",
    title: "Advance voting",
    opensAt: at(ELECTION.advanceVote!.iso, "10:00:00"),
    closesAt: "2026-10-11T19:00:00" + EDT,
    dateLabel: ELECTION.advanceVote!.label,
    hoursLabel: "10 a.m. – 7 p.m. daily",
    blurb:
      "Six days of early voting, open to every eligible voter with no reason or excuse required. Advance voting places are separate from election-day ones, so check yours before you travel.",
    upcomingLabel: "Until advance polls open",
    openLabel: "Left to vote early",
    closedLabel: "Advance voting has closed",
    href: CITY_ELECTIONS_URL,
    hrefLabel: "Find an advance voting place",
  },
  {
    id: "mail-in-return",
    // A pure deadline: no opensAt, so it counts down from the moment the page
    // is first published rather than waiting for a window to open.
    title: "Mail-in ballot must arrive",
    closesAt: "2026-10-14T12:00:00" + EDT,
    dateLabel: "Wed, Oct 14, 12 p.m. (noon)",
    blurb:
      "Toronto Elections must have your completed package in hand by noon — not postmarked by then. Mail early or use a drop-off location.",
    upcomingLabel: "Until ballots are due",
    openLabel: "Left to return your ballot",
    closedLabel: "The return deadline has passed",
    href: MAIL_IN_URL,
    hrefLabel: "How to return your ballot",
  },
];

/** Every period the page counts down, election day last. */
export const ALL_PERIODS: VotingPeriod[] = [...VOTING_PERIODS, ELECTION_DAY];

/** One period by id. Throws rather than returning undefined: every caller is
 *  a page that cannot render without it, so a missing id is a build-time bug
 *  and should read like one instead of a blank countdown. */
export function votingPeriod(id: VotingPeriod["id"]): VotingPeriod {
  const found = ALL_PERIODS.find((p) => p.id === id);
  if (!found) throw new Error(`key-dates has no "${id}" period`);
  return found;
}

/** One row of the full calendar table. Includes milestones with no countdown
 *  (nominations, the voters'-list dates) — they still answer real queries. */
export type CalendarRow = {
  label: string;
  dateLabel: string;
  /** absolute instant this milestone passes, for the closed/upcoming marker */
  instant: string;
  note?: string;
};

export const FULL_CALENDAR: CalendarRow[] = [
  {
    label: "Nominations closed",
    dateLabel: "Fri, Aug 21, 2 p.m.",
    instant: at(ELECTION.nominationCloseIso!, "14:00:00"),
    note: "The final field of candidates was set at this point.",
  },
  {
    label: "Voters' list and mail-in applications open",
    dateLabel: "Tue, Sept 1",
    instant: "2026-09-01T00:00:00" + EDT,
    note: "MyVote opened for checking your registration and requesting a mail-in package.",
  },
  {
    label: "Register by this date to be mailed a voter information card",
    dateLabel: "Sun, Sept 20, 11:59 p.m.",
    instant: "2026-09-20T23:59:00" + EDT,
    note: "The card is a convenience, not ID — see below.",
  },
  {
    label: "Deadline to apply to vote by mail",
    dateLabel: "Thu, Sept 24, 4:30 p.m.",
    instant: at(ELECTION.mailIn!.iso, "16:30:00"),
  },
  {
    label: "Advance voting begins",
    dateLabel: "Tue, Oct 6, 10 a.m.",
    instant: at(ELECTION.advanceVote!.iso, "10:00:00"),
  },
  {
    label: "Advance voting ends",
    dateLabel: "Sun, Oct 11, 7 p.m.",
    instant: "2026-10-11T19:00:00" + EDT,
  },
  {
    label: "Deadline to check or update the voters' list online",
    dateLabel: "Sun, Oct 11, 7 p.m.",
    instant: "2026-10-11T19:00:00" + EDT,
    note: "After this you can still be added in person at the voting place.",
  },
  {
    label: "Completed mail-in ballots must be received",
    dateLabel: "Wed, Oct 14, 12 p.m. (noon)",
    instant: "2026-10-14T12:00:00" + EDT,
    note: "Received, not postmarked.",
  },
  {
    label: "Election day",
    dateLabel: "Mon, Oct 26, 10 a.m. – 8 p.m.",
    instant: at(ELECTION.electionDateIso, "20:00:00"),
  },
];
