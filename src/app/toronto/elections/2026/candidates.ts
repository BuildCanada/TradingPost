// ─────────────────────────────────────────────────────────────────────────
// Toronto 2026 election — candidate data (edit this file by hand).
//
// This is the single place to maintain the mayoral field and the councillor
// field for each ward. It is plain data — no framework code — so it is safe
// to edit without touching the page components.
//
// IMAGES
//   Drop candidate photos in /public/elections/toronto/2026/… and reference
//   them from `image` with a leading "/", e.g.
//       image: "/elections/toronto/2026/mayor/eleanor-voss.jpg"
//       image: "/elections/toronto/2026/councillors/ward-10/aisha-okafor.jpg"
//   Portraits look best at a 4:5 ratio (mayor) or square (councillors).
//   Leave `image` unset to show the initials placeholder instead.
//
// INITIALS
//   `initials` is optional — when omitted it is derived from the name.
// ─────────────────────────────────────────────────────────────────────────

export type MayoralTag = "Incumbent" | "Declared" | "Exploratory";
export type CouncillorTag = "Incumbent" | "Challenger" | "Registered";

export type MayoralCandidate = {
  name: string;
  tag: MayoralTag;
  bio: string;
  /** path under /public, e.g. "/elections/toronto/2026/mayor/name.jpg" */
  image?: string;
  /** full campaign-site URL, e.g. "https://voteeleanor.ca" */
  website?: string;
  /** optional override; derived from `name` when omitted */
  initials?: string;
};

export type CouncillorCandidate = {
  name: string;
  tag: CouncillorTag;
  bio: string;
  /** path under /public, e.g. "/elections/toronto/2026/councillors/ward-10/name.jpg" */
  image?: string;
  /** full campaign-site URL, e.g. "https://voteaisha.ca" */
  website?: string;
  /** optional override; derived from `name` when omitted */
  initials?: string;
};

// ── Mayor ──────────────────────────────────────────────────────────────────

export const MAYORAL_CANDIDATES: MayoralCandidate[] = [
  {
    name: "Eleanor Voss",
    tag: "Incumbent",
    bio: "Incumbent mayor and former provincial minister of transportation, seeking a second term.",
    // image: "/elections/toronto/2026/mayor/eleanor-voss.jpg",
    // website: "https://voteeleanor.ca",
  },
  {
    name: "David Cheng",
    tag: "Declared",
    bio: "Home-builder and past chair of the Toronto Region Board of Trade.",
  },
  {
    name: "Amara Okonkwo",
    tag: "Declared",
    bio: "Two-term east-end city councillor and community-housing advocate.",
  },
  {
    name: "Julien Tremblay",
    tag: "Declared",
    bio: "Transit engineer who led the delivery of the Line 5 Eglinton project.",
  },
  {
    name: "Ruth Halloran",
    tag: "Declared",
    bio: "Small-business owner and two-term public school trustee.",
  },
  {
    name: "Sanjay Mehta",
    tag: "Exploratory",
    bio: "Public-health physician and former deputy medical officer of health.",
  },
];

// ── Councillors, by ward ─────────────────────────────────────────────────────
//
// Keyed by zero-padded ward number ("01" … "25"). Any ward NOT listed here (or
// listed with an empty array) falls back to illustrative placeholder
// candidates so the pages stay populated while you fill this in. Once a ward
// has real data, add its entry and the placeholders disappear for that ward.
//
// Example (copy this shape):
//   "10": [
//     {
//       name: "Aisha Okafor",
//       tag: "Incumbent",
//       bio: "Incumbent councillor since 2022; chairs the planning and housing committee.",
//       image: "/elections/toronto/2026/councillors/ward-10/aisha-okafor.jpg",
//       website: "https://voteaisha.ca",
//     },
//     { name: "Marco Bianchi", tag: "Challenger", bio: "Community organizer and tenant-rights advocate." },
//   ],

export const WARD_CANDIDATES: Record<string, CouncillorCandidate[]> = {
  // Add wards here as you populate them.
};
