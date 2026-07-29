// ─────────────────────────────────────────────────────────────────────────
// Toronto 2026 election — candidate enrichment (edit this file by hand).
//
// The candidate roster now comes from the York Factory API (see ./api and
// ./data), which mirrors the City Clerk's registered-candidate feeds daily.
// This file enriches that roster — photos, bios, Incumbent/Challenger tags,
// and hand-verified campaign sites — matched to API candidates by name
// (case-, accent-, and punctuation-insensitive). It is also the fallback
// roster when the API is unreachable. Entries for candidates no longer in
// the API roster are simply ignored. It is plain data — no framework code —
// so it is safe to edit without touching the page components.
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
    website: "https://oliviachow.ca",
    image: "/elections/toronto/2026/mayor/olivia-chow.png",
  },
  {
    name: "Cory Deville",
    tag: "Declared",
    bio: "",
    website: "https://deville2026.ca",
    image: "/elections/toronto/2026/mayor/cory-deville.png",
  },
  { name: "Laura Ellis", tag: "Declared", bio: "",
    website: "https://running4you.ca/",
    image: "/elections/toronto/2026/mayor/laura-ellis.png",
   },
  // Renato Fallico: no website, email, or socials on the Clerk's filing; no
  // published photo found.
  { name: "Renato Fallico", tag: "Declared", bio: "" },
  // Martin Fraser: no contact info on the Clerk's filing; name too generic to
  // safely match a photo.
  { name: "Martin Fraser", tag: "Declared", bio: "" },
  {
    name: "Edward Gong",
    tag: "Declared",
    bio: "",
    // His generic "for Mayor" site, kept current through 2026 (not on his
    // Clerk filing, which lists only email + socials).
    website: "https://gong4mayor.com",
    image: "/elections/toronto/2026/mayor/edward-gong.png",
  },
  {
    name: "Faizan Haider",
    tag: "Declared",
    bio: "",
    // Must be the www URL — the bare faizanhaider.ca domain has broken TLS.
    website: "https://www.faizanhaider.ca",
    image: "/elections/toronto/2026/mayor/faizan-haider.jpg",
  },
  {
    name: "Peter Handjis",
    tag: "Declared",
    bio: "",
    // Prior campaign domains are all dead; no website on his 2026 filing.
    // Photo from his VoteMate 2023 profile (him with his own campaign sign).
    image: "/elections/toronto/2026/mayor/peter-handjis.webp",
  },
  {
    name: "Heather He",
    tag: "Declared",
    bio: "",
    // Her Care Bank nonprofit site — printed on her campaign signs, but the
    // site itself has no campaign content. Photo shows her campaign banner.
    website: "https://www.carebank.world",
    image: "/elections/toronto/2026/mayor/heather-he.jpg",
  },
  // Mohamad Kaaki: registered 13-Jul-2026; no email, website, socials, or
  // photo found anywhere.
  { name: "Mohamad Kaaki", tag: "Declared", bio: "" },
  {
    name: "Georgios Kalkounis",
    tag: "Declared",
    bio: "",
    // kalkounis.com (from his email) is a parked domain; real URL is from the
    // Clerk's candidate JSON.
    website: "https://georgioskalkounisformayor.com/",
    image: "/elections/toronto/2026/mayor/georgios-kalkounis.jpg",
  },
  {
    name: "Isidoros Kyrlangitses",
    tag: "Declared",
    bio: "",
    // From the Clerk's candidate JSON. Single-page site with no headshot —
    // no photo of him found anywhere.
    website: "https://www.ambitioustoronto.com",
  },
  {
    name: "Michael Lamoureux",
    tag: "Declared",
    bio: "",
    website: "https://www.michaellamoureux.ca/",
    image: "/elections/toronto/2026/mayor/michael-lamoureux.jpg",
  },
  {
    name: "Rick Lee",
    tag: "Declared",
    bio: "",
    // Satirical Canva site, carried over from his 2023 run and updated for
    // 2026. Not filed with the Clerk, so identity match is likely-not-certain.
    website: "https://oscarpool.my.canva.site/voteforrick",
    image: "/elections/toronto/2026/mayor/rick-lee.png",
  },
  // Eddie Mayanja: no website or email on the Clerk's record; no reliably
  // attributable photo found.
  { name: "Eddie Mayanja", tag: "Declared", bio: "" },
  {
    name: "Sarah McVie",
    tag: "Declared",
    bio: "",
    // URL confirmed in the Clerk's candidate JSON. Photo is a landscape hero
    // shot (she's on the right third) — crop if a tighter portrait is needed.
    website: "https://www.mayormcvie.ca",
    image: "/elections/toronto/2026/mayor/sarah-mcvie.jpg",
  },
  // Joseph Osuji: no website or email on the Clerk's record; several Joseph
  // Osujis in Toronto, so no photo could be confidently attributed.
  { name: "Joseph Osuji", tag: "Declared", bio: "" },
  {
    name: "Odessa Paloma Parker",
    tag: "Declared",
    bio: "",
    website: "https://odessaformayor.ca",
    image: "/elections/toronto/2026/mayor/odessa-paloma-parker.jpg",
  },
  {
    name: "Amy Rosen",
    tag: "Declared",
    bio: "",
    website: "https://rosenformayor.ca",
    image: "/elections/toronto/2026/mayor/amy-rosen.jpg",
  },
  // Kannan S'ree Jr: no discoverable web presence beyond the Clerk's list.
  { name: "Kannan S'ree Jr", tag: "Declared", bio: "" },
  {
    name: "Lyall Sanders",
    tag: "Declared",
    bio: "",
    // sanders4mayor.ca is his campaign domain but currently stuck in a redirect
    // loop (Wix misconfig) — confirmed via Wayback 2026-07-14; re-check later.
    website: "https://sanders4mayor.ca",
    image: "/elections/toronto/2026/mayor/lyall-sanders.jpg",
  },
  // Naomi Sayers: no 2026 campaign site found; naomisayers.com is her law
  // practice, not a campaign site. Photo from her professional site.
  { name: "Naomi Sayers", tag: "Declared", bio: "",
    image: "/elections/toronto/2026/mayor/naomi-sayers.jpg",
    website: "https://www.naomisayers.com/"
  },
  {
    name: "Robert Shusterman",
    tag: "Declared",
    bio: "",
    // His realtor site, but it announces his mayoral run — matches Clerk's list.
    website: "https://www.robertshusterman.com/",
    image: "/elections/toronto/2026/mayor/robert-shusterman.png",
  },
  // Weizhen Tang: no site of his own (weizhentang.com/.ca DNS dead); campaign
  // info page lives on torontonewsnet.com/weizhentang/. Photo from that page.
  { name: "Weizhen Tang", tag: "Declared", bio: "",
    image: "/elections/toronto/2026/mayor/weizhen-tang.jpg",
    website: "https://weizhentang.today/?blogcategory=Toronto+Mayoral+Candidacy"
  },
  // Jeffery Tunney: 2023 site jefferytunney4mayor.ca is dead; no 2026 site yet.
  // Photo recovered from the Wayback archive of his own campaign site.
  { name: "Jeffery Tunney", tag: "Declared", bio: "",
    image: "/elections/toronto/2026/mayor/jeffery-tunney.png",
    website: "https://jefferytunney4mayor.com/"
  },
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
    {
      name: "Vincent Crisanti",
      tag: "Incumbent",
      bio: "",
      website: "https://www.vincentcrisanti.com",
      image: "/elections/toronto/2026/councillors/ward-1/vincent-crisanti.webp",
    },
    { name: "Abraham Abbey", tag: "Challenger", bio: "" },
    {
      name: "Ala'a Adib",
      tag: "Challenger",
      bio: "",
      website: "https://www.alaaadib.ca",
      image: "/elections/toronto/2026/councillors/ward-1/alaa-adib.png",
    },
    { name: "Saima Babar", tag: "Challenger", bio: "" },
    { name: "Norman Hamilton",
image: "/elections/toronto/2026/councillors/ward-1/norman-hamilton.png",
      tag: "Challenger",
      bio: "",
      website: "https://www.normanhamilton.ca/" },
  ],
  "02": [
    {
      name: "Stephen Holyday",
      tag: "Incumbent",
      bio: "",
      website: "https://stephenholyday.ca/",
      image: "/elections/toronto/2026/councillors/ward-2/stephen-holyday.jpg",
    },
    {
      name: "Jennifer Alexander",
      tag: "Challenger",
      bio: "",
      website: "https://jenalexander.ca/",
      // Cropped from a community-event photo on her campaign site — no dedicated
      // headshot is published.
      image: "/elections/toronto/2026/councillors/ward-2/jen-alexander.jpg",
    },
  ],
  "03": [
    {
      name: "Amber Morley",
      tag: "Incumbent",
      bio: "",
      website: "https://www.ambermorley.com/",
      image: "/elections/toronto/2026/councillors/ward-3/amber-morley.jpg",
    },
    // Anthony Internicola: perennial candidate; his old sites point to past
    // Scarborough/provincial runs, no current Ward 3 site or usable photo found.
    { name: "Anthony Internicola", tag: "Challenger", bio: "",
      website: "https://www.toronto4life.ca/meet-our-candidate.html"
     },
    {
      name: "Ted Opitz",
      tag: "Challenger",
      bio: "",
      // Former Conservative MP for Etobicoke Centre (2011–2015); no 2026
      // campaign site filed or found. Photo is an MP-era portrait.
      image: "/elections/toronto/2026/councillors/ward-3/ted-opitz.png",
    },
  ],
  "04": [
    // Incumbent Gord Perks is retiring — open seat, large field.
    // Michael Corcoran: no campaign site or photo found; no online footprint.
    { name: "Michael Corcoran", tag: "Challenger", bio: "" },
    {
      name: "Nadia Guerrera",
      tag: "Challenger",
      bio: "",
      website: "https://www.nadiaguerrera.ca",
      image: "/elections/toronto/2026/councillors/ward-4/nadia-guerrera.png",
    },
    {
      name: "Debbie King",
      tag: "Challenger",
      bio: "",
      website: "https://www.votedebbieking.ca/",
      // Cropped from her campaign banner — no standalone headshot published.
      image: "/elections/toronto/2026/councillors/ward-4/debbie-king.jpg",
    },
    {
      name: "Diana Chan McNally",
      tag: "Challenger",
      bio: "",
      website: "https://www.dianachanmcnally.ca",
      image: "/elections/toronto/2026/councillors/ward-4/diana-chan-mcnally.jpg",
    },
    // Bridget Ogundipe: site has no genuine portrait (only stock/streetscape
    // images), so no usable photo.
    {
      name: "Bridget Ogundipe",
      tag: "Challenger",
      bio: "",
      website: "https://www.bridgetogundipe.ca",
    },
    {
      name: "Adam Pham",
      tag: "Challenger",
      bio: "",
      website: "https://adampham.ca/",
      // Cropped from a High Park candid — only photos on his site are candids.
      image: "/elections/toronto/2026/councillors/ward-4/adam-pham.jpg",
    },
    {
      name: "Vanessa Raponi",
      tag: "Challenger",
      bio: "",
      website: "https://www.vanessaraponi.ca",
      // Her campaign site has no photo; this is a cropped 2023 McMaster
      // Engineering award photo (she's a P.Eng / EngiQueers Canada founder).
      image: "/elections/toronto/2026/councillors/ward-4/vanessa-raponi.jpg",
    },
    // Lloyd Traiforos: no campaign site or photo found.
    { name: "Lloyd Traiforos", tag: "Challenger", bio: "" },
    {
      name: "Holly Weber",
      tag: "Challenger",
      bio: "",
      website: "https://www.hollyweber.ca",
      image: "/elections/toronto/2026/councillors/ward-4/holly-weber.png",
    },
  ],
  "05": [
    {
      name: "Frances Nunziata",
      tag: "Incumbent",
      bio: "",
      // No campaign site filed; this is her own councillor site. Photo is the
      // official City of Toronto Ward 5 portrait.
      website: "https://www.councillornunziata.com/",
      image: "/elections/toronto/2026/councillors/ward-5/frances-nunziata.jpg",
    },
    // Sharmarke Ali: sharmarkeali.ca is a parked domain; no photo found.
    { name: "Sharmarke Ali", tag: "Challenger", bio: "" },
    {
      name: "Daniel Di Giorgio",
      tag: "Challenger",
      bio: "",
      website: "https://www.danieldigiorgio.com/",
      // His site has only candids (base64-embedded); cropped from a two-person
      // community photo.
      image: "/elections/toronto/2026/councillors/ward-5/daniel-digiorgio.jpg",
    },
    {
      name: "Nekpen Obasogie",
      tag: "Challenger",
      bio: "",
      website: "https://nekpenobasogie.ca",
      image: "/elections/toronto/2026/councillors/ward-5/nekpen-obasogie.png",
    },
    {
      name: "Chiara Padovani",
      tag: "Challenger",
      bio: "",
      website: "https://www.chiarapadovani.ca/",
      // Cropped from an environmental portrait outside the YSW Community Hub.
      image: "/elections/toronto/2026/councillors/ward-5/chiara-padovani.jpg",
    },
    {
      name: "Sileen Phillips",
      tag: "Challenger",
      bio: "",
      website: "https://www.sileenphillips-ysw.ca",
      image: "/elections/toronto/2026/councillors/ward-5/sileen-phillips.webp",
    },
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
