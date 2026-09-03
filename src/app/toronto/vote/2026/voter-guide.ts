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

import { MYVOTE_URL, SOURCE_URLS } from "./key-dates";

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
      "An Ontario driver's licence or photo card, or any document issued by the government of Canada, Ontario, or a municipality.",
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
      "Court-issued documents, or Band Council documents issued in Ontario.",
  },
];

/** The two rules people most often get wrong, worth stating outright. */
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

/** The process in order. Written as an actual sequence, because "how to vote"
 *  is a procedural query and the answer is a procedure. */
export const VOTING_STEPS: VotingStep[] = [
  {
    title: "Check that you can vote",
    body:
      "You need to be a Canadian citizen, 18 or older on election day, and either living in Toronto or renting or owning property here. All four conditions have to be true, not just one.",
    action: {
      label: "Read the City's eligibility rules",
      href: SOURCE_URLS.city,
      external: true,
    },
  },
  {
    title: "Look yourself up on the voters' list",
    body:
      "MyVote is the City's own portal. Enter your address and it tells you whether you're registered, which ward you're in, and where your voting place is. If you're missing or your details are out of date, you fix it there. Registering online closes October 11 at 7 p.m.",
    action: { label: "Open MyVote", href: MYVOTE_URL, external: true },
  },
  {
    title: "Pick how you want to vote",
    body:
      "Three options, and you only use one: in person on election day, in person during advance voting from October 6 to 11, or by mail. Voting by mail is the only one with an application deadline, and it has already started.",
  },
  {
    title: "Sort out your ID before you go",
    body:
      "Bring one document showing your name and your Toronto address. Photo ID is not required. Your voter information card does not count as ID, which is the single most common reason people get turned away.",
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
