// ─────────────────────────────────────────────────────────────────────────
// Toronto 2026 election — ward briefs (edit this file by hand).
//
// A ward's profile has two halves. The statistics are generated from the
// City's own ward profiles into ./wardStats — never edit those by hand, run
// `node scripts/gen-ward-profiles.mjs` instead. The brief is the half a
// person writes: what the ward actually is, and what the numbers next to it
// mean. This file holds the briefs, and combines the two.
//
// WRITING A BRIEF
//   Two to four sentences. Say where the ward is and which neighbourhoods it
//   takes in, then what distinguishes it — ideally something a reader can see
//   confirmed in the statistics beside it. Describe the place, not the race:
//   these are read by voters weighing candidates, so they must not favour any
//   of them. Anything that turns over during a campaign — who holds the seat,
//   which applications are at committee — belongs on the candidates, not here.
//
//   Neighbourhood names are the City's own (the 158-neighbourhood model),
//   assigned to wards by which ward contains each neighbourhood's centroid.
//
// A ward with no brief simply shows its statistics, so it is safe to leave
// one blank rather than write filler.
// ─────────────────────────────────────────────────────────────────────────

import { WARD_STATS, WARD_STATS_SOURCE } from "./wardStats";
import { WARD_COUNCILLORS } from "./wardCouncillors";
import { nameKey } from "@/lib/elections/election-data";
import { candidateSlug } from "@/lib/elections/candidate-profile";
import { getElection } from "@/lib/elections/registry";
import type {
  WardProfile,
  WardStat,
} from "@/components/elections/WardProfile";

// The shapes live with the component that renders them, as WardGeo does with
// <WardMap>. Re-exported so ./wardStats and this file's callers have one
// import site for a ward's data.
export type { WardProfile, WardStat };

// ── Briefs ─────────────────────────────────────────────────────────────────

/** Keyed by the zero-padded ward token ("01".."25"), as everything else in
 *  this directory is. */
export const WARD_BRIEFS: Record<string, string> = {
  "01": "Toronto's northwest corner, running from the Humber River to the airport lands and taking in Rexdale, Mount Olive-Silverstone-Jamestown, Kingsview Village-The Westway and Thistletown. Much of its 48 square kilometres is the Clairville employment lands rather than housing, which is why one of the city's largest wards is also one of its least dense. Well over half its residents were born outside Canada, and its households are among the largest in Toronto \u2014 just over three people on average, against a citywide 2.4.",

  "02": "The postwar heart of Etobicoke — Islington, Princess-Rosethorn, Markland Wood, Eringate-Centennial-West Deane and Willowridge-Martingrove-Richview. Close to half its homes are single-detached houses and only a third of households rent, both far from the city average. It has Toronto's oldest median age alongside Scarborough-Agincourt, and one of the two lowest rates of low income in the city.",

  "03": "Toronto's southwest lakeshore, from The Kingsway and Stonegate-Queensway down through Mimico, New Toronto, Long Branch and Alderwood. It grew almost 10 per cent between the 2016 and 2021 Censuses — among the fastest in the city — on condominium towers at Humber Bay Shores and around Etobicoke City Centre, which now sit beside streets of prewar lakeside cottages and postwar bungalows.",

  "04": "The west end between the Humber and Dufferin, taking in Roncesvalles, South Parkdale, High Park-Swansea, High Park North and Runnymede-Bloor West Village. More than half of households rent, but unusually little of that housing is in towers: fewer than one home in five is single-detached and fewer than two in five are in a building of five storeys or more, so most of the ward lives in the walk-up apartments, duplexes and converted houses in between. Its population edged down between Censuses.",

  "05": "The old City of York and the valleys north of it — Weston, Mount Dennis, Rockcliffe-Smythe, Brookhaven-Amesbury and Keelesdale-Eglinton West. It has one of the lowest median household incomes of any Toronto ward and, with Scarborough Southwest, the lowest average rent. The Eglinton Crosstown's western end runs through it, and Mount Dennis sits at the line's terminus.",

  "06": "North York west of Bathurst — Downsview, Bathurst Manor, Clanton Park, Westminster-Branson and York University Heights. More than half its residents were born outside Canada. The former Downsview Airport lands, one of the largest redevelopment sites anywhere in the city, fall inside this ward.",

  "07": "The northwest tower neighbourhoods, from Humber Summit and Humbermede down through Glenfield-Jane Heights, Oakdale-Beverley Heights and Black Creek. Only about one home in eight is single-detached and two in five are in buildings of five storeys or more, a housing mix that looks nothing like the suburbs around it. It has the lowest share of residents holding a bachelor's degree or higher in Toronto and one of the highest rates of low income.",

  "08": "A north-south strip of midtown and North York taking in Lawrence Park, Bedford Park-Nortown, Forest Hill North, Englemount-Lawrence, Briar Hill-Belgravia and Yorkdale-Glen Park. Its median household income is among the city's highest, but that single figure spans a wide range — some of Toronto's most expensive streets and some of its apartment neighbourhoods sit within a few blocks of each other here. The Eglinton Crosstown crosses its southern end.",

  "09": "A dense, mostly low-rise wedge of the west end: Little Portugal, Dufferin Grove, Dovercourt Village, Corso Italia-Davenport, Caledonia-Fairbank and Junction-Wallace Emerson. It is the closest thing Toronto has to a missing-middle ward — under a fifth of homes are in buildings of five storeys or more, and under a sixth are single-detached, with the rest in semis, rows, duplexes and small apartment buildings. Its population fell between the 2016 and 2021 Censuses, among the steeper declines in the city.",

  "10": "The downtown waterfront and the ward built on former rail and industrial land: Liberty Village, CityPlace, Fort York, the East Bayfront, St. Lawrence, the Toronto Islands, West Queen West and Trinity-Bellwoods. It grew 18 per cent between Censuses, the fastest in Toronto, and is now the most vertical ward in the city — 88 per cent of its homes are in buildings of five storeys or more and fewer than one in a hundred is single-detached. It also has the youngest median age, the highest share of degree holders and the highest average rent.",

  "11": "Downtown's western and northern core, from Kensington-Chinatown and Palmerston-Little Italy up through the Annex and the University of Toronto's campus to Rosedale-Moore Park. It holds two very different housing markets at once: student and rental housing around the university, and some of the oldest and most expensive houses in Toronto a short walk north. Nearly half of its renter households spend 30 per cent or more of their income on housing.",

  "12": "Midtown along the Yonge and Eglinton corridors, taking in Yonge-Eglinton, Davisville, North Toronto, Yonge-St. Clair, Casa Loma, Forest Hill South, Wychwood, Humewood-Cedarvale and Oakwood Village. It grew almost 9 per cent between Censuses on tower development around the Yonge-Eglinton and St. Clair subway stations, and more than 60 per cent of its households now rent — the second-highest share in the city.",

  "13": "The smallest ward in Toronto by land area and by far the densest, at roughly 20,000 residents per square kilometre. It covers Regent Park, Moss Park, St. James Town, Cabbagetown, Church-Wellesley and Downtown Yonge East. Seven in ten households rent and 85 per cent of homes are in buildings of five storeys or more. It has the lowest median household income and the highest rate of low income of any ward, and it grew more than 17 per cent between Censuses.",

  "14": "The east end from the Don Valley to Coxwell, taking in Riverdale, the Danforth, Greenwood-Coxwell, Playter Estates, Blake-Jones, Broadview North and Old East York. Housing here is mostly the semi-detached and row housing of the streetcar city — barely a fifth of homes are in buildings of five storeys or more. Its population has been essentially flat across recent Censuses.",

  "15": "The ward with the sharpest internal contrast in Toronto. It runs from the Bridle Path and St. Andrew-Windfields, among the wealthiest addresses in Canada, through Leaside and Mount Pleasant East, down to the apartment towers of Thorncliffe Park. Its median household income is among the highest in the city while its rate of low income sits close to the city average, because the ward's two halves are averaged into one number.",

  "16": "The Don Mills area and the neighbourhoods around it — Banbury-Don Mills, Flemingdon Park, Victoria Village, Parkwoods-O'Connor Hills and Fenside-Parkwoods. Don Mills was among Canada's first planned postwar communities, and the towers-in-parkland form it pioneered still shapes the ward: nearly 60 per cent of homes are in buildings of five storeys or more and more than half of households rent.",

  "17": "North York east of Bayview — Bayview Village, Don Valley Village, Hillcrest Village, Henry Farm, Pleasant View and Bayview Woods-Steeles. Three in five residents were born outside Canada, among the highest shares in Toronto, and a similar share of homes are in buildings of five storeys or more, concentrated around Sheppard and the Don Valley.",

  "18": "The Yonge Street corridor through North York, from Lansing-Westgate up to Newtonbrook at Steeles, including Yonge-Doris, Willowdale West and Avondale. Sixty per cent of its residents were born outside Canada and 60 per cent of its homes are in towers, most of them along Yonge. It has the highest share of rent-burdened tenant households in Toronto — nearly half spend 30 per cent or more of their income on housing — and one of the highest rates of low income.",

  "19": "The lakeshore east of Coxwell and the neighbourhoods above it: The Beaches, East End-Danforth, Woodbine Corridor, Woodbine-Lumsden, O'Connor-Parkview and Taylor-Massey. Its housing is almost entirely low-rise: a quarter of its homes are in buildings of five storeys or more and a little over a quarter are single-detached, with the rest in the semis, rows and walk-ups in between. Incomes vary widely across it, from the streets near the boardwalk to the apartment blocks along Victoria Park.",

  "20": "Scarborough's southwest corner along the Bluffs — Birchcliffe-Cliffside, Cliffcrest, Clairlea-Birchmount, Kennedy Park and Oakridge. It has the lowest average rent in Toronto alongside York South-Weston, and one of the lowest shares of rent-burdened tenant households of any ward. Roughly a third of its homes are single-detached houses.",

  "21": "The centre of Scarborough, taking in Wexford/Maryvale, Dorset Park, Bendale, Eglinton East and Ionview, and wrapping around the Scarborough Centre transit and civic hub. More than half its residents were born outside Canada. Its housing splits almost evenly between single-detached houses and apartment buildings, with little in between.",

  "22": "Northern Scarborough west of McCowan — Tam O'Shanter-Sullivan, L'Amoreaux and Steeles. It has Toronto's oldest median age alongside Etobicoke Centre, and nearly two-thirds of its residents were born outside Canada. Only a third of its households rent, though nearly half its homes are in apartment buildings, so much of the ward is owner-occupied condominium.",

  "23": "Agincourt, Milliken and Malvern West, at Toronto's northeast edge. It has the highest share of residents born outside Canada of any ward — close to two in three — and, with Scarborough-Rouge Park, the lowest share of renters, at about one household in five. Its population fell almost 4 per cent between the 2016 and 2021 Censuses, the steepest decline in the city.",

  "24": "Scarborough between Highland Creek and Bellamy: Woburn, Golfdale-Cedarbrae-Woburn, Morningside, Guildwood and Scarborough Village. About a third of its homes are single-detached and nearly half are in buildings of five storeys or more \u2014 the towers along Kingston Road, Eglinton and Markham Road, with subdivisions on the streets behind them. It has one of the lowest shares of rent-burdened tenant households in the city.",

  "25": "Toronto's eastern edge and its largest ward by land area, taking in West Hill, West Rouge, Highland Creek, Centennial Scarborough, Morningside Heights and Malvern East, along with much of Rouge National Urban Park. It is the least dense ward in the city, at under 1,900 residents per square kilometre. It also has the highest median household income, the largest share of single-detached houses, the smallest share of tower housing and the lowest rate of low income — and its population did not grow at all between the 2016 and 2021 Censuses.",
};

// ── Accessor ───────────────────────────────────────────────────────────────

/** One candidate on this ward's ballot, as much of them as the incumbent
 *  check needs. */
type Standing = { name: string; withdrawn?: boolean };

/**
 * The profile for one ward, or null for a ward with neither brief nor
 * statistics — so a caller can render the section only when there is one.
 *
 * `standing` is the ward's council candidates as the roster has them right
 * now. The sitting councillor is named only if they appear among the ones who
 * have not withdrawn, which is the only honest way to say "running again":
 * incumbency is a fact about the seat, candidacy is a fact about the roster,
 * and the second changes daily. Matching is by `nameKey`, so the Clerk's
 * spelling and the City's need only agree up to case, accents and
 * punctuation. Pass nothing and no incumbent is named.
 */
export function wardProfile(
  wardToken: string,
  standing: Standing[] = [],
): WardProfile | null {
  const stats = WARD_STATS[wardToken];
  const brief = WARD_BRIEFS[wardToken] ?? "";
  if (!stats?.length && !brief) return null;

  const councillor = WARD_COUNCILLORS[wardToken];
  const running =
    councillor !== undefined &&
    standing.some(
      (candidate) =>
        !candidate.withdrawn && nameKey(candidate.name) === nameKey(councillor),
    );

  return {
    brief,
    stats: stats ?? [],
    source: stats?.length ? WARD_STATS_SOURCE : undefined,
    incumbent: running
      ? {
          name: councillor,
          href: `${getElection("toronto-2026").basePath}/candidates/${candidateSlug(councillor)}`,
        }
      : undefined,
  };
}
