import type { Alignment, CandidateScore } from "@/lib/elections/alignment";

/* How much of the questionnaire each candidate answered the way you did.
 *
 * WHAT THIS REPLACED
 *   A card per candidate, each carrying a grid of thirty-three little squares —
 *   one per question, coloured by the option they picked and faded where it was
 *   not yours. It was a handsome object and the wrong one. Three faults:
 *
 *   · It answered the wrong question. A reader arriving here has just spent ten
 *     minutes on a questionnaire and wants a ranking: who is closest to me. The
 *     card grid gave a ranking you had to assemble by reading a two-digit
 *     figure out of every card and holding all of them in your head, because
 *     the cards were laid across four columns and the eye cannot compare down a
 *     grid.
 *   · The squares were unreadable at their size. Thirty-three cells across a
 *     card three hundred pixels wide are seven pixels each; which question a
 *     cell stood for was recoverable only by hovering it one at a time.
 *   · It matched nothing else on the site. Every other page in the tracker is
 *     rules, plates and house type. This was a heatmap.
 *
 * WHAT IT IS NOW
 *   A ranked list, one candidate per ruled row, each with a single bar divided
 *   into how you and they compare. The ranking is the layout: the longest bar
 *   is at the top and a reader gets the order by looking down the left edge,
 *   which is the thing they came for.
 *
 *   The bar is the whole questionnaire every time, so the rows are comparable —
 *   a candidate who answered nine questions and agreed on all nine does not
 *   draw the same bar as one who answered thirty-three and agreed on all of
 *   them. Silence takes up its own share of the bar, which is the honest
 *   picture of a candidate who barely filled the thing in.
 *
 * WHERE THE DETAIL WENT
 *   Nowhere it was not already. The question cards below this chart file every
 *   candidate under the answer they gave — and the reader's own plate sits in
 *   those blocks too, so "where do we differ" is answered by scrolling rather
 *   than by hovering thirty-three squares in turn. A hover panel here was the
 *   same information in a worse format, and it reserved five empty lines under
 *   every card to say "Hover a square for the question".
 */

/* The bands, in the order they stack along the bar: agreement first, from the
   left edge, because that is the quantity being ranked and a reader compares
   the length of the run that starts in the same place on every row.

   Agreement takes the accent. Everything else is the same ink at descending
   strengths rather than four hues — the bar is one quantity split up, not four
   competing ones, and a palette here would say that disagreeing and not
   answering are different in kind rather than different in degree. */
const BANDS = [
  {
    key: "agreed",
    label: "Same as you",
    className: "bg-accent",
  },
  {
    key: "differed",
    label: "Different",
    className: "bg-dark/30",
  },
  {
    key: "unclear",
    label: "Their own words",
    className: "bg-dark/12",
  },
  {
    key: "unanswered",
    label: "No answer",
    className: "bg-dark/6",
  },
] as const;

type BandKey = (typeof BANDS)[number]["key"];

export function AgreementChart({
  alignment,
  scores,
}: {
  alignment: Alignment;
  /** the candidates in the order they should print; defaults to the
   *  alignment's own ranking, which is by agreement */
  scores?: CandidateScore[];
}) {
  const { rows } = alignment;
  const ordered = scores ?? alignment.scores;
  if (rows.length === 0 || ordered.length === 0) return null;

  const total = rows.length;

  /* A band that never occurs is left out of the key. Most fields produce three
     of the four, and a key naming a colour nobody can find on the page is a
     colour the reader goes looking for. */
  const present = BANDS.filter((band) =>
    ordered.some((score) => score[band.key] > 0),
  );

  return (
    <div>
      <p className="type-caption mb-4 text-text-secondary text-pretty">
        Every bar is the same {total} questions. The filled run is how many of
        them that candidate answered the way you did.
      </p>

      <div className="border-t border-border-light">
        {ordered.map((score) => (
          <Row key={score.candidateName} score={score} total={total} />
        ))}
      </div>

      {/* The key, under the rows rather than over them: a reader looks at the
          bars first and comes here only when a band needs naming. */}
      <ul className="mt-3.5 flex list-none flex-wrap items-center gap-x-5 gap-y-2 m-0 p-0">
        {present.map((band) => (
          <li key={band.key} className="flex items-center gap-2">
            <span
              className={`size-2.5 flex-none ${band.className}`}
              aria-hidden="true"
            />
            <span className="type-label-sm text-text-muted">{band.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* One candidate.
 *
 * Three tracks on a wide screen — name, bar, figures — so the bars all start
 * and end on the same two lines and their lengths can be read against each
 * other without a gridline to help. Below `sm` the name takes its own line
 * above the bar, because a name column narrow enough to leave a usable bar is
 * a name column that wraps every candidate onto three lines. */
function Row({ score, total }: { score: CandidateScore; total: number }) {
  const share = score.share === null ? null : Math.round(score.share * 100);

  return (
    <div className="grid items-center gap-x-5 gap-y-2 border-b border-border-light py-3.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto]">
      <p className="font-sans font-medium leading-[1.2] tracking-[-0.015em] text-[1.05rem] text-dark text-pretty">
        {score.candidateName}
      </p>

      <Bar score={score} total={total} />

      {/* The count is the honest figure and leads; the share follows it in
          muted ink. "24 of 33" is a fact about a questionnaire, where a bare
          73% invites being read as a poll result. */}
      <p className="flex items-baseline gap-2 justify-self-start tabular-nums sm:justify-self-end">
        <span className="font-sans font-semibold leading-none tracking-[-0.03em] text-[1.35rem] text-dark">
          {score.agreed}
        </span>
        <span className="type-label-sm text-text-muted">
          of {total}
          {share !== null && ` · ${share}%`}
        </span>
      </p>
    </div>
  );
}

function Bar({ score, total }: { score: CandidateScore; total: number }) {
  /* Everything the candidate did with the questionnaire, summing to its whole
     length — including the questions they never reached, which is why the
     denominator here is the question count and not `compared`. */
  const segments = BANDS.map((band) => ({
    ...band,
    n: score[band.key as BandKey],
  })).filter((segment) => segment.n > 0);

  return (
    <span
      className="flex h-3.5 w-full overflow-hidden bg-dark/6"
      role="img"
      aria-label={segments
        .map((segment) => `${segment.n} ${segment.label.toLowerCase()}`)
        .join(", ")}
    >
      {segments.map((segment) => (
        <span
          key={segment.key}
          className={segment.className}
          style={{ width: `${(segment.n / total) * 100}%` }}
        />
      ))}
    </span>
  );
}
