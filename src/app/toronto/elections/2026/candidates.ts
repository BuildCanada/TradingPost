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

// Registered candidates for Mayor (City Clerk's list). Ordered here by last
// name for readability; the pages re-sort by last name regardless. `bio`,
// `image`, and `website` are filled in manually per candidate.
export const MAYORAL_CANDIDATES: MayoralCandidate[] = [
  { name: "Bahira Abdulsalam", tag: "Declared", bio: "", 
    image: "/elections/toronto/2026/mayor/bahira-abdulsalam.png",
    website: "https://www.bahira.ca/",
  },
  { name: "Jamie Atkinson", tag: "Declared", bio: "",
    website: "https://jamieatkinson.ca/",
    image: "/elections/toronto/2026/mayor/jamie-atkinson.png",

   },
  {
    name: "Brad Bradford",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email bradford26.ca — verify before enabling
    website: "https://bradford26.ca",
    image: "/elections/toronto/2026/mayor/brad-bradford.png",
  },
  { name: "Darrell Brown", tag: "Declared", 
    bio: "",
  website: 'https://electdarrellbrown.ca/',
  image: "/elections/toronto/2026/mayor/darrell-brown.png",
 },
  // Braeden Chow: has a website per the Clerk's list, but only social links
  // (gmail email) — add the real URL manually.
  { name: "Braeden Chow", tag: "Declared", bio: "",
    website: "https://www.braedenchowfortoronto.ca/",
    image: "/elections/toronto/2026/mayor/braeden-chow.png",
   },
  {
    name: "Olivia Chow",
    tag: "Incumbent",
    bio: "",
    // website inferred from campaign email oliviachow.ca — verify before enabling
    website: "https://oliviachow.ca",
    image: "/elections/toronto/2026/mayor/olivia-chow.png",
  },
  {
    name: "Cory Deville",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email deville2026.ca — verify before enabling
    website: "https://deville2026.ca",
    image: "/elections/toronto/2026/mayor/cory-deville.png",
  },
  { name: "Laura Ellis", tag: "Declared", bio: "",
    website: "https://running4you.ca/",
    image: "/elections/toronto/2026/mayor/laura-ellis.png",
   },
  { name: "Renato Fallico", tag: "Declared", bio: "" },
  { name: "Martin Fraser", tag: "Declared", bio: "" },
  // Edward Gong: social links only (gmail email) — add the real URL manually.
  { name: "Edward Gong", tag: "Declared", bio: "" },
  {
    name: "Faizan Haider",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email faizanhaider.ca — verify before enabling
    website: "https://faizanhaider.ca",
  },
  { name: "Peter Handjis", tag: "Declared", bio: "" },
  { name: "Heather He", tag: "Declared", bio: "" },
  { name: "Mohamad Kaaki", tag: "Declared", bio: "" },
  {
    name: "Georgios Kalkounis",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email kalkounis.com — verify before enabling
    website: "https://kalkounis.com",
  },
  // Isidoros Kyrlangitses: has a website per the Clerk's list, but no email to
  // infer a domain from — add the real URL manually.
  { name: "Isidoros Kyrlangitses", tag: "Declared", bio: "" },
  {
    name: "Michael Lamoureux",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email michaellamoureux.ca — verify before enabling
    website: "https://michaellamoureux.ca",
  },
  { name: "Rick Lee", tag: "Declared", bio: "" },
  { name: "Eddie Mayanja", tag: "Declared", bio: "" },
  // Sarah McVie: has a website per the Clerk's list, but only a gmail email —
  // add the real URL manually.
  { name: "Sarah McVie", tag: "Declared", bio: "" },
  { name: "Joseph Osuji", tag: "Declared", bio: "" },
  {
    name: "Odessa Paloma Parker",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email odessaformayor.ca — verify before enabling
    website: "https://odessaformayor.ca",
  },
  {
    name: "Amy Rosen",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email rosenformayor.ca — verify before enabling
    website: "https://rosenformayor.ca",
  },
  { name: "Kannan S'ree Jr", tag: "Declared", bio: "" },
  {
    name: "Lyall Sanders",
    tag: "Declared",
    bio: "",
    // website inferred from campaign email sanders4mayor.ca — verify before enabling
    website: "https://sanders4mayor.ca",
  },
  { name: "Naomi Sayers", tag: "Declared", bio: "" },
  // Robert Shusterman: has a website per the Clerk's list, but only a gmail
  // email — add the real URL manually.
  { name: "Robert Shusterman", tag: "Declared", bio: "" },
  { name: "Weizhen Tang", tag: "Declared", bio: "" },
  { name: "Jeffery Tunney", tag: "Declared", bio: "" },
];

// ── Councillors, by ward ─────────────────────────────────────────────────────
//
// Keyed by zero-padded ward number ("01" … "25"). A ward mapped to an empty
// array (or not listed) shows a "no candidates registered yet" state on its
// page — it no longer falls back to placeholder candidates.
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

// Source: City Clerk's registered-candidate list. The sitting councillor is
// included only when their status is "Registered" (tagged "Incumbent");
// everyone else is tagged "Challenger". Incumbents who are retiring, running
// for mayor, or not yet registered are omitted. Wards 15 and 24 currently have
// no registered candidates. `bio`/`image`/`website` are filled in by hand.
export const WARD_CANDIDATES: Record<string, CouncillorCandidate[]> = {
  "01": [
    { name: "Vincent Crisanti", tag: "Incumbent", bio: "" },
    { name: "Abraham Abbey", tag: "Challenger", bio: "" },
    { name: "Ala'a Adib", tag: "Challenger", bio: "" },
    { name: "Saima Babar", tag: "Challenger", bio: "" },
    { name: "Norman Hamilton", tag: "Challenger", bio: "" },
  ],
  "02": [
    { name: "Stephen Holyday", tag: "Incumbent", bio: "" },
    { name: "Jennifer Alexander", tag: "Challenger", bio: "" },
  ],
  "03": [
    { name: "Amber Morley", tag: "Incumbent", bio: "" },
    { name: "Anthony Internicola", tag: "Challenger", bio: "" },
    { name: "Ted Opitz", tag: "Challenger", bio: "" },
  ],
  "04": [
    // Incumbent Gord Perks is retiring.
    { name: "Michael Corcoran", tag: "Challenger", bio: "" },
    { name: "Nadia Guerrera", tag: "Challenger", bio: "" },
    { name: "Debbie King", tag: "Challenger", bio: "" },
    { name: "Diana Chan McNally", tag: "Challenger", bio: "" },
    { name: "Bridget Ogundipe", tag: "Challenger", bio: "" },
    { name: "Adam Pham", tag: "Challenger", bio: "" },
    { name: "Vanessa Raponi", tag: "Challenger", bio: "" },
    { name: "Lloyd Traiforos", tag: "Challenger", bio: "" },
    { name: "Holly Weber", tag: "Challenger", bio: "" },
  ],
  "05": [
    { name: "Frances Nunziata", tag: "Incumbent", bio: "" },
    { name: "Sharmarke Ali", tag: "Challenger", bio: "" },
    { name: "Daniel Di Giorgio", tag: "Challenger", bio: "" },
    { name: "Nekpen Obasogie", tag: "Challenger", bio: "" },
    { name: "Chiara Padovani", tag: "Challenger", bio: "" },
    { name: "Sileen Phillips", tag: "Challenger", bio: "" },
  ],
  "06": [
    { name: "James Pasternak", tag: "Incumbent", bio: "" },
    { name: "Conroy Irving", tag: "Challenger", bio: "" },
  ],
  "07": [
    // Incumbent Anthony Perruzza is not registered.
    { name: "Lorna Antwi", tag: "Challenger", bio: "" },
    { name: "Amanda Coombs", tag: "Challenger", bio: "" },
  ],
  "08": [
    { name: "Mike Colle", tag: "Incumbent", bio: "" },
    { name: "Liz Grade", tag: "Challenger", bio: "" },
    { name: "Jason McDonald", tag: "Challenger", bio: "" },
    { name: "Enzo Torrone", tag: "Challenger", bio: "" },
    { name: "Daniel Trayes", tag: "Challenger", bio: "" },
  ],
  "09": [
    { name: "Alejandra Bravo", tag: "Incumbent", bio: "" },
    { name: "Neil Simon", tag: "Challenger", bio: "" },
  ],
  "10": [
    { name: "Ausma Malik", tag: "Incumbent", bio: "" },
    { name: "Ian Cunningham", tag: "Challenger", bio: "" },
    { name: "Xue Ding", tag: "Challenger", bio: "" },
    { name: "Andi Hoang-Lefranc", tag: "Challenger", bio: "" },
    { name: "Bashar Kassir", tag: "Challenger", bio: "" },
    { name: "Paul Nash", tag: "Challenger", bio: "" },
    { name: "Husain Neemuchwala", tag: "Challenger", bio: "" },
    { name: "Aanchal Vashistha", tag: "Challenger", bio: "" },
  ],
  "11": [
    { name: "Dianne Saxe", tag: "Incumbent", bio: "" },
    { name: "Gabe Blanc", tag: "Challenger", bio: "" },
    { name: "Keenan Courtis", tag: "Challenger", bio: "" },
    { name: "Dana Fisher", tag: "Challenger", bio: "" },
    { name: "Terri Hawkes", tag: "Challenger", bio: "" },
    { name: "Karina Lemke", tag: "Challenger", bio: "" },
    { name: "Alice Li", tag: "Challenger", bio: "" },
    { name: "Huy Lieu", tag: "Challenger", bio: "" },
    { name: "Gian Pileri", tag: "Challenger", bio: "" },
    { name: "Diana Yoon", tag: "Challenger", bio: "" },
  ],
  "12": [
    // Incumbent Josh Matlow is not registered.
    { name: "Jenny Kalimbet", tag: "Challenger", bio: "" },
    { name: "Ahmed Kamal", tag: "Challenger", bio: "" },
    { name: "Joshua Kishner", tag: "Challenger", bio: "" },
    { name: "Mina Nadimi", tag: "Challenger", bio: "" },
  ],
  "13": [
    // Incumbent Chris Moise is not registered.
    { name: "Joe Cadeau", tag: "Challenger", bio: "" },
    { name: "Tom Cai", tag: "Challenger", bio: "" },
    { name: "Victoria Davis", tag: "Challenger", bio: "" },
    { name: "Walied Khogali Ali", tag: "Challenger", bio: "" },
    { name: "Curran Stikuts", tag: "Challenger", bio: "" },
    { name: "Nicki Ward", tag: "Challenger", bio: "" },
  ],
  "14": [
    // Incumbent Paula Fletcher is not registered.
    { name: "Susan Chapelle", tag: "Challenger", bio: "" },
    { name: "Jason Stevens", tag: "Challenger", bio: "" },
  ],
  // Ward 15 (Don Valley West): no registered candidates yet.
  "15": [],
  "16": [
    { name: "Jon Burnside", tag: "Incumbent", bio: "" },
    { name: "Sinan Erdemir", tag: "Challenger", bio: "" },
    { name: "Stacey Moffatt", tag: "Challenger", bio: "" },
  ],
  "17": [
    { name: "Shelley Carroll", tag: "Incumbent", bio: "" },
    { name: "Jeffery Adamson", tag: "Challenger", bio: "" },
    { name: "Hassan Mubarak Noor Mohamed", tag: "Challenger", bio: "" },
    { name: "Gregory Rodriguez", tag: "Challenger", bio: "" },
    { name: "Roy Samathanam", tag: "Challenger", bio: "" },
    { name: "Sabrina Zuniga", tag: "Challenger", bio: "" },
  ],
  "18": [
    // Incumbent Lily Cheng is not registered.
    { name: "David Magazzinich", tag: "Challenger", bio: "" },
    { name: "Nathan Yusifov", tag: "Challenger", bio: "" },
    { name: "Ardeshir Zarezade", tag: "Challenger", bio: "" },
  ],
  "19": [
    // Incumbent Brad Bradford is running for mayor.
    { name: "Jaana Syeda Ali", tag: "Challenger", bio: "" },
    { name: "James Dann", tag: "Challenger", bio: "" },
    { name: "Natalie Johnson", tag: "Challenger", bio: "" },
    { name: "Tycen Legg", tag: "Challenger", bio: "" },
    { name: "Kevin Morrison", tag: "Challenger", bio: "" },
    { name: "Adam Smith", tag: "Challenger", bio: "" },
    { name: "Austin Vieira", tag: "Challenger", bio: "" },
    { name: "Jeff Wahl", tag: "Challenger", bio: "" },
    { name: "Devin Wilkins", tag: "Challenger", bio: "" },
    { name: "Jennie Worden", tag: "Challenger", bio: "" },
  ],
  "20": [
    // Incumbent Parthi Kandavel is not registered.
    { name: "Malik Ahmad", tag: "Challenger", bio: "" },
    { name: "Ariel-Rachel Karokis", tag: "Challenger", bio: "" },
    { name: "Philip Mills", tag: "Challenger", bio: "" },
    { name: "Sharmina Nasrin", tag: "Challenger", bio: "" },
    { name: "Mohammad Ali Reza", tag: "Challenger", bio: "" },
    { name: "Kevin Rupasinghe", tag: "Challenger", bio: "" },
  ],
  "21": [
    // Incumbent Michael Thompson is not registered.
    { name: "Taiba Ahmed", tag: "Challenger", bio: "" },
    { name: "Patience Evbagharu", tag: "Challenger", bio: "" },
    { name: "Madura Shanmugaratnam", tag: "Challenger", bio: "" },
    { name: "Krissan Veerasingam", tag: "Challenger", bio: "" },
  ],
  "22": [
    // Incumbent Nick Mantas is not registered.
    { name: "Madhuri Azad", tag: "Challenger", bio: "" },
    { name: "Bill Chan", tag: "Challenger", bio: "" },
    { name: "Jackson Ho", tag: "Challenger", bio: "" },
    { name: "Dan Lovell", tag: "Challenger", bio: "" },
    { name: "Donny Morgan", tag: "Challenger", bio: "" },
  ],
  "23": [
    { name: "Jamaal Myers", tag: "Incumbent", bio: "" },
    { name: "Han Dong", tag: "Challenger", bio: "" },
    { name: "Sajawal Javed", tag: "Challenger", bio: "" },
    { name: "Kevin Li", tag: "Challenger", bio: "" },
    { name: "John-Mark Oleh", tag: "Challenger", bio: "" },
  ],
  // Ward 24 (Scarborough-Guildwood): no registered candidates yet.
  "24": [],
  "25": [
    { name: "Neethan Shan", tag: "Incumbent", bio: "" },
    { name: "Shawn Allen", tag: "Challenger", bio: "" },
    { name: "Ashan Fernando", tag: "Challenger", bio: "" },
    { name: "Cheryl Lewis-Thurab", tag: "Challenger", bio: "" },
    { name: "Jannette Lumley", tag: "Challenger", bio: "" },
  ],
};
