export interface Builder {
  slug: string;
  name: string;
  tagline: string;
  quote: string;
  gif: string;
  story: string;
}

export const builders: Builder[] = [
  {
    slug: "diana-matheson",
    name: "Diana Matheson",
    tagline: "Building the Future of Canadian Soccer",
    quote:
      "If there\u2019s something you want to do and you feel like you\u2019re the right person for the job, go do it.",
    gif: "/assets/images/diana-matheson-canadian-soccer.gif",
    story: `Diana Matheson is one of Canada\u2019s most decorated soccer players \u2014 and now, one of its most ambitious sports entrepreneurs. After a career that included two Olympic bronze medals and over 200 international appearances, she turned her attention to building something new: a professional women\u2019s soccer league in Canada.

As co-founder of Project 8 Sports, Matheson launched the Northern Super League, Canada\u2019s first professional women\u2019s soccer league. The league debuted in April 2025 with eight founding clubs across the country.

For Matheson, building isn\u2019t just about creating a league \u2014 it\u2019s about building infrastructure for the next generation. She saw a gap in Canadian sport: world-class female athletes with no professional league to play in at home. Rather than wait for someone else to fix it, she went and built the solution herself.

Her story is a reminder that builders don\u2019t just work in tech or policy. They work wherever they see something broken and decide to fix it.`,
  },
  {
    slug: "robert-bourassa",
    name: "Robert Bourassa",
    tagline: "The Project of the Century",
    quote:
      "Never let it be said that we shall live like paupers on a land this rich.",
    gif: "/assets/images/robert-bourassa-quebec-premier.gif",
    story: `Robert Bourassa served as Premier of Quebec for a combined fifteen years across two stints in office. But his most enduring legacy is one of the most ambitious infrastructure projects in human history: the James Bay hydroelectric project.

Announced in 1971, the project sought to harness the rivers of northern Quebec to generate massive amounts of hydroelectric power. The scale was staggering \u2014 thousands of workers, billions of dollars, and some of the largest dams and reservoirs ever constructed. Critics called it impossible. Bourassa called it the project of the century.

He was right. The James Bay project transformed Quebec into a clean energy powerhouse, providing the province with some of the cheapest electricity in North America. It remains one of the largest hydroelectric systems in the world.

Bourassa\u2019s vision was rooted in a belief that Canada\u2019s natural resources should be a source of prosperity, not something to leave untouched. His willingness to think at a scale that others considered reckless is what made the project possible.`,
  },
  {
    slug: "mary-pickford",
    name: "Mary Pickford",
    tagline: "She Invented the Movie Star",
    quote:
      "You may have a fresh start any moment you choose, for this thing that we call \u2018failure\u2019 is not the falling down, but the staying down.",
    gif: "/assets/images/mary-pickford-hollywood-pioneer.gif",
    story: `Born Gladys Louise Smith in Toronto in 1892, Mary Pickford became the most famous woman in the world. She didn\u2019t just act in movies \u2014 she invented what it meant to be a movie star.

Pickford was the first actress to be billed by name, the first to earn a million-dollar contract, and the first to have true creative control over her films. She co-founded United Artists in 1919 alongside Charlie Chaplin, Douglas Fairbanks, and D.W. Griffith, giving artists ownership over their work in an industry that treated them as disposable.

She also co-founded the Academy of Motion Picture Arts and Sciences and won one of the first Academy Awards. In an era when women had few paths to power, Pickford built her own.

Pickford\u2019s legacy isn\u2019t just about entertainment. She proved that Canadians could compete on the world stage \u2014 and win. She left Toronto with almost nothing and built an empire through talent, shrewdness, and relentless ambition.`,
  },
  {
    slug: "alexander-graham-bell",
    name: "Alexander Graham Bell",
    tagline: "A Life Wired for Meaning",
    quote:
      "The inventor looks upon the world and is not contented with things as they are. He wants to improve whatever he sees.",
    gif: "/assets/images/alexander-graham-bell-inventor.gif",
    story: `Alexander Graham Bell is best known for inventing the telephone, but his story is really about a life devoted to solving problems that others overlooked.

Born in Edinburgh, Bell immigrated to Canada in 1870 and settled in Brantford, Ontario, where he conducted many of his early experiments. His interest in sound and communication was deeply personal \u2014 both his mother and his wife were deaf, and much of his early work focused on improving communication for the hearing impaired.

The telephone, patented in 1876, changed the world. But Bell didn\u2019t stop there. He went on to work on the photophone, the metal detector, and early concepts for the airplane. He co-founded the National Geographic Society and continued inventing until his death in 1922 at his estate in Nova Scotia.

Bell\u2019s Canadian years were formative. The quiet of Brantford gave him the space to think, and Canada\u2019s emerging scientific community gave him collaborators and supporters. He embodies the builder\u2019s mindset: see a problem, understand it deeply, and build something to solve it.`,
  },
];

export function getBuilderBySlug(slug: string): Builder | undefined {
  return builders.find((b) => b.slug === slug);
}
