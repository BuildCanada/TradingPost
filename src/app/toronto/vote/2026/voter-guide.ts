// The "how to vote" facts for Toronto's 2026 municipal election: who may vote,
// what to bring, and the steps in order.
//
// Kept apart from ./key-dates, which owns the calendar. This module owns the
// procedure. Both are restatements of the City Clerk's own pages and every
// claim here is linked back to the page it came from — Toronto Elections is
// the authority, we are only making it findable.
//
// Sources:
//   https://www.toronto.ca/city-government/elections/voter-information/who-can-vote/
//   https://www.toronto.ca/city-government/elections/voter-information/identification/
//   https://www.toronto.ca/city-government/elections/voter-information/voters-list/
//   https://www.toronto.ca/city-government/elections/voter-information/mail-in-voting/
//   https://www.toronto.ca/city-government/elections/voter-information/voting-options/

import {
  ADVANCE_VOTING_PATH,
  ELECTION_DAY,
  MYVOTE_URL,
  SOURCE_URLS,
  VOTE_BY_MAIL_PATH,
  votingPeriod,
} from "./key-dates";

/** Every condition a voter has to meet — all of them, not any of them. */
export const ELIGIBILITY: { requirement: string; detail: string }[] = [
  {
    requirement: "A Canadian citizen",
    detail:
      "Permanent residents and other non-citizens cannot vote in Ontario municipal elections, however long they have lived in Toronto.",
  },
  {
    requirement: "At least 18 years old",
    detail:
      "You must be 18 on election day itself — October 26, 2026 — not on the day you register.",
  },
  {
    requirement: "A resident of Toronto, or an owner or tenant of property here",
    detail:
      "Non-residents qualify if they, or their spouse, own or rent property in Toronto. You still get only one vote, in one ward.",
  },
  {
    requirement: "Not prohibited from voting under any law",
    detail:
      "This is the narrow statutory exclusion — for example, someone serving a sentence in a penal institution.",
  },
];

/** What counts as ID at the polls. Deliberately labelled as examples: the
 *  City's list runs to dozens of documents under Ontario regulation 304/13,
 *  and we link to it rather than pretending this is exhaustive. */
export const ACCEPTED_ID: { category: string; examples: string }[] = [
  {
    category: "Government ID",
    examples:
      "An Ontario driver's licence or photo card, or another document issued by the government of Canada, Ontario, or an Ontario municipality — as long as it shows your Toronto address.",
  },
  {
    category: "Where you bank",
    examples:
      "A bank or credit card statement, or a cancelled personalised cheque.",
  },
  {
    category: "Where you work or study",
    examples:
      "A pay stub, a T4, a post-secondary transcript, or student residence documentation.",
  },
  {
    category: "Where you live",
    examples:
      "A lease or rental agreement, a mortgage statement, a property tax assessment, or a home insurance policy.",
  },
  {
    category: "Household bills",
    examples:
      "A hydro, water, gas, telephone or cable bill in your name at your Toronto address.",
  },
  {
    category: "Other",
    examples:
      "A government benefit statement — Employment Insurance, Old Age Security or CPP — court-issued documents, or Band Council documents issued in Ontario.",
  },
];

/** The rules people most often get wrong, worth stating outright. Each of
 *  these is a documented reason voters get turned away, so the page leads with
 *  them rather than with the list of accepted documents. */
export const ID_GOTCHAS: { claim: string; truth: string }[] = [
  {
    claim: "You need photo ID",
    truth:
      "You don't. One document showing your name and your qualifying Toronto address is enough — a utility bill on its own will do.",
  },
  {
    claim: "Your voter information card is your ID",
    truth:
      "It isn't. The card tells you where to vote, but it is not accepted as identification. Bring something from the list as well.",
  },
  {
    claim: "My passport will do",
    truth:
      "It won't. A passport carries no address, and the City lists it as not acceptable. Every accepted document has to show your qualifying Toronto address.",
  },
  {
    claim: "A photo of a document on your phone works",
    truth:
      "Only if the document was issued electronically in the first place — a digital phone bill is fine, a photo or scan of a paper one is not.",
  },
];

export type VotingStep = {
  /** the imperative, e.g. "Check that you can vote" */
  title: string;
  /** two or three sentences of what to actually do */
  body: string;
  /** the action, when there is one to take */
  action?: { label: string; href: string; external: boolean };
};

/* ── Where we are in the calendar ─────────────────────────────────────────
   The steps used to be a static array, which meant the page kept telling
   readers to apply for a mail-in package after applications had closed, and
   to register online after the online deadline had passed. The instants come
   from ./key-dates rather than being retyped, so the phase boundaries can't
   drift away from the calendar the rest of the site counts down to. */

const instant = (iso: string) => new Date(iso).getTime();

/** Sept 24, 4:30 p.m. — last moment to request a mail-in package. */
const MAIL_APPLY_CLOSES = instant(votingPeriod("mail-in-apply").closesAt);
/** Oct 6, 10 a.m. — advance voting places open. */
const ADVANCE_OPENS = instant(votingPeriod("advance").opensAt!);
/** Oct 11, 7 p.m. — advance voting closes, and the same instant is the
 *  deadline to check or update the voters' list online. */
const ONLINE_REGISTRATION_CLOSES = instant(votingPeriod("advance").closesAt);
/** Oct 14, noon — completed mail-in packages must be in hand. Not a phase
 *  boundary: it falls inside `election-day-only`, and a voter still holding a
 *  package needs telling about it right up to the minute it passes. */
const MAIL_RETURN_DUE = instant(votingPeriod("mail-in-return").closesAt);
/** Oct 26, 8 p.m. — polls close. */
const POLLS_CLOSE = instant(ELECTION_DAY.closesAt);

type Phase =
  | "before-mail-deadline"
  | "mail-closed"
  | "advance-open"
  | "election-day-only"
  | "over";

function phaseAt(now: number): Phase {
  if (now > POLLS_CLOSE) return "over";
  if (now > ONLINE_REGISTRATION_CLOSES) return "election-day-only";
  if (now >= ADVANCE_OPENS) return "advance-open";
  if (now > MAIL_APPLY_CLOSES) return "mail-closed";
  return "before-mail-deadline";
}

/** Step 2 — the voters' list. Only the closing sentence moves. */
function registrationBody(phase: Phase): string {
  const lead =
    "MyVote is the City's own portal. Enter your address and it tells you whether you're registered, which ward you're in, and where your voting place is.";

  if (phase === "before-mail-deadline" || phase === "mail-closed" || phase === "advance-open") {
    return `${lead} If you're missing or your details are out of date, you fix it there. Registering online closes October 11 at 7 p.m.`;
  }
  if (phase === "election-day-only") {
    return `${lead} Online updates closed on October 11 — but you can still add your name to the voters' list in person at your voting place on election day.`;
  }
  return `${lead} Online updates for the 2026 election closed on October 11, 2026.`;
}

/** Step 3 — the ways to vote. Toronto has four, not three: election day,
 *  advance voting, mail-in, and appointing a proxy. Two of them have
 *  deadlines, which is why this can't be a fixed sentence.
 *
 *  Takes `now` as well as the phase because the mail-in return deadline sits
 *  three days *inside* `election-day-only`: from Oct 11 at 7 p.m. the phase no
 *  longer changes, but until noon on Oct 14 there are voters holding a package
 *  who still have to get it back, and dropping the sentence at the phase
 *  boundary would be the one omission that costs someone their ballot. */
function waysToVoteBody(phase: Phase, now: number): string {
  switch (phase) {
    case "before-mail-deadline":
      return "Four ways, and you only use one: in person on election day, in person during advance voting from October 6 to 11, by mail, or by appointing someone you trust as your proxy. Voting by mail is the one with the earliest deadline — applications opened September 1 and close September 24 at 4:30 p.m.";
    case "mail-closed":
      return "Mail-in applications closed on September 24, so three ways are left: in person on election day, in person during advance voting from October 6 to 11, or by appointing someone you trust as your proxy. If you already have a mail-in package, Toronto Elections must receive it by noon on October 14 — received, not postmarked.";
    case "advance-open":
      return "Advance voting is running now, through October 11, and election day is October 26 — either one works, and you only vote once. You can also still appoint a proxy. Mail-in applications closed on September 24; if you already have a package it must arrive by noon on October 14.";
    case "election-day-only": {
      const mailStillDue =
        now < MAIL_RETURN_DUE
          ? " If you are holding a mail-in package, it is not too late: Toronto Elections must receive it by noon on October 14 — received, not postmarked."
          : "";
      return `Advance voting and mail-in applications have closed. Election day is October 26, 10 a.m. to 8 p.m., at the voting place assigned to your address. If you can't get there yourself, you can still appoint an eligible voter as your proxy — the form is certified by the City Clerk up to 4:30 p.m. on election day, and on election day itself only at Toronto City Hall.${mailStillDue}`;
    }
    case "over":
      return "Voting in the 2026 election has closed. Election day was October 26, 2026.";
  }
}

/** Step 3's action points at the City page that covers proxy voting, curbside
 *  voting and the assist terminals — the options a reader who can't simply
 *  walk in on election day needs. Before the mail deadline the useful link is
 *  still the mail-in page, which MyVote applications run through. */
function waysToVoteAction(phase: Phase): VotingStep["action"] {
  if (phase === "over") return undefined;
  if (phase === "before-mail-deadline") {
    return {
      label: "Mail-in deadlines and how to apply",
      href: VOTE_BY_MAIL_PATH,
      external: false,
    };
  }
  if (phase === "mail-closed") {
    return {
      label: "Advance voting dates and places",
      href: ADVANCE_VOTING_PATH,
      external: false,
    };
  }
  return {
    label: "Proxy voting and accessibility options",
    href: SOURCE_URLS.votingOptions,
    external: true,
  };
}

/** The process in order. Written as an actual sequence, because "how to vote"
 *  is a procedural query and the answer is a procedure.
 *
 *  Takes `now` so the page renders the phase it is actually in; the default
 *  makes it usable as a plain call. The page it feeds revalidates hourly,
 *  because two of the boundaries above land at 4:30 p.m. and 7 p.m. and a
 *  daily revalidate would leave the wrong copy up for most of a day. */
export function getVotingSteps(now: Date = new Date()): VotingStep[] {
  const phase = phaseAt(now.getTime());

  return [
    {
      title: "Check that you can vote",
      body:
        "You need to be a Canadian citizen, 18 or older on election day, either living in Toronto or renting or owning property here, and not prohibited from voting under any law. All four conditions have to be true, not just one.",
      action: {
        label: "Read the City's eligibility rules",
        href: SOURCE_URLS.city,
        external: true,
      },
    },
    {
      title: "Look yourself up on the voters' list",
      body: registrationBody(phase),
      action: { label: "Open MyVote", href: MYVOTE_URL, external: true },
    },
    {
      title: "Pick how you want to vote",
      body: waysToVoteBody(phase, now.getTime()),
      action: waysToVoteAction(phase),
    },
    {
      title: "Sort out your ID before you go",
      body:
        "Bring one document showing your name and your Toronto address. Photo ID is not required, and a passport doesn't work because it has no address on it. Your voter information card does not count as ID either, which is the single most common reason people get turned away.",
      action: {
        label: "See what ID is accepted",
        href: SOURCE_URLS.identification,
        external: true,
      },
    },
    {
      title: "Vote — and know who you're voting for",
      body:
        "Your ballot has three choices: mayor, the councillor for your ward, and a school board trustee. The council race is the one that decides what actually gets built on your street, and it is usually the one nobody has read about.",
      action: {
        label: "See the candidates in your ward",
        href: "/toronto/vote/2026#wards",
        external: false,
      },
    },
  ];
}

/** What a single voter actually chooses. Not to be confused with the 26 mayor
 *  and council races running across the city — one voter votes in one of them. */
export const BALLOT_RACES: { office: string; detail: string }[] = [
  {
    office: "Mayor",
    detail: "One citywide race. Every Toronto voter votes in it.",
  },
  {
    office: "Your ward councillor",
    detail:
      "One of 25 ward races. You vote only in the ward you live in — which is why looking up your ward is the first useful thing you can do.",
  },
  {
    office: "A school board trustee",
    detail:
      "Which board you vote for depends on your school-support designation. MyVote shows you the trustee race on your own ballot.",
  },
];
