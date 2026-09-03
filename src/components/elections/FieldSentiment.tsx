"use client";

import { useMemo, useState } from "react";
import { arc as d3arc } from "d3-shape";
import { ChevronDown } from "lucide-react";

import { WedgeGlyph } from "@/components/charts/trilemma";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  forRace,
  splitOf,
  type FieldGroup,
  type FieldPick,
  type FieldQuestion,
  type Race,
  type Respondent,
  type Split,
} from "@/lib/elections/field-sentiment";

/* Where the whole field stands, issue by issue — a card per question.
 *
 * WHY NOT THE GRID
 *   A ward's questionnaire reads across: one row per question, one column per
 *   candidate. That works at four columns and collapses at thirty-two — the
 *   city-wide field is a kilometre of sideways drag, and the thing a reader
 *   wants from it is not any one candidate's column anyway. It is the shape of
 *   the distribution: where the people running to govern Toronto agree, and
 *   where they are split down the middle.
 *
 *   So the candidate stops being a column and becomes a slice. Every question
 *   is a card, and every card is the whole field on that one question.
 *
 * WHY A CARD
 *   A question and its answer distribution are one object, and a card is the
 *   shape that says so: the question, the pie, the options, the denominator,
 *   bounded together. Thirty-odd of them tile into a grid the reader can scan
 *   at whatever width they have — three across on a desktop, one on a phone —
 *   without the page becoming a table nobody can hold in their head.
 *
 * WHY A PIE
 *   These questions are a choice between three or four exhaustive, mutually
 *   exclusive options: every candidate who answered is in exactly one of them,
 *   and the parts are the whole. That is the one distribution a pie is
 *   actually for, and at this size it does the job a bar cannot — a reader
 *   sees "one big slice" or "three even thirds" as a shape, before reading a
 *   word of the labels. Which is the page's entire argument: consensus and
 *   division, visible at a glance, thirty-three times over.
 *
 * COLOUR
 *   Option position, from the brand's designated chart ramps — the first
 *   option is the same colour on all thirty-odd questions, which is what lets
 *   a grid of pies be scanned rather than read.
 */

type Order = "topic" | "consensus" | "division";
type Filter = Race | "all";

const ORDERS: { id: Order; label: string }[] = [
  { id: "topic", label: "By topic" },
  { id: "consensus", label: "Most agreed" },
  { id: "division", label: "Most divided" },
];

export function FieldSentiment({
  groups,
  respondents,
}: {
  groups: FieldGroup[];
  respondents: Respondent[];
}) {
  const [order, setOrder] = useState<Order>("topic");
  const [filter, setFilter] = useState<Filter>("all");

  const questions = useMemo(
    () => groups.flatMap((group) => group.questions),
    [groups],
  );

  /* Every question's split under the current filter, computed once. The
     filter is the reason this is client-side at all: "how does the mayoral
     field differ from the council field" is the question the page is for, and
     it is a re-tally of the same picks rather than a new fetch. */
  const splits = useMemo(() => {
    const map = new Map<string, Split>();
    for (const question of questions)
      map.set(
        question.questionId,
        splitOf(question, forRace(question.picks, filter)),
      );
    return map;
  }, [questions, filter]);

  const field = useMemo(
    () =>
      filter === "all"
        ? respondents
        : respondents.filter((r) => r.race === filter),
    [respondents, filter],
  );

  const ranked = useMemo(() => {
    const answered = questions
      .map((question) => ({
        question,
        split: splits.get(question.questionId)!,
      }))
      .filter((row) => row.split.answered > 0);
    return [...answered].sort((a, b) =>
      order === "division"
        ? b.split.division - a.split.division
        : a.split.division - b.split.division,
    );
  }, [questions, splits, order]);

  /* The two ends, named up top. A reader who takes nothing else off this page
     should still leave with the single most agreed-on statement and the single
     most contested one. */
  const consensus = ranked[0] ?? null;
  const contested = ranked[ranked.length - 1] ?? null;
  const [agreed, divided] =
    order === "division" ? [contested, consensus] : [consensus, contested];

  return (
    <div>
      {/* ── Controls ───────────────────────────────────────────── */}
      <div className="border-y-2 border-dark flex flex-wrap items-stretch justify-between">
        <div className="flex items-center gap-1 px-5 py-3.5">
          <span className="type-label-sm text-text-muted mr-2">Order</span>
          {ORDERS.map(({ id, label }) => (
            <Chip
              key={id}
              active={order === id}
              onClick={() => setOrder(id)}
              label={label}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 px-5 py-3.5 border-t md:border-t-0 md:border-l border-border-light grow md:grow-0">
          <span className="type-label-sm text-text-muted mr-2">Field</span>
          {(
            [
              ["all", "All"],
              ["mayor", "Mayoral"],
              ["councillor", "Council"],
            ] as const
          ).map(([id, label]) => (
            <Chip
              key={id}
              active={filter === id}
              onClick={() => setFilter(id)}
              label={label}
            />
          ))}
        </div>
      </div>

      {field.length === 0 ? (
        <p className="px-6 md:px-14 py-16 font-serif text-[1.05rem] text-dark/70">
          No one in this part of the field has answered the questionnaire yet.
        </p>
      ) : (
        <>
          {/* ── The two ends, as feature cards ─────────────────── */}
          {agreed && divided && agreed !== divided && (
            <div className="grid md:grid-cols-2 border-b-2 border-dark">
              <Feature
                eyebrow="Most agreed on"
                row={agreed}
                field={field.length}
              />
              <Feature
                eyebrow="Most divided"
                row={divided}
                field={field.length}
                className="border-t md:border-t-0 md:border-l border-border-light"
              />
            </div>
          )}

          <section className="pb-12">
            <div className="px-6 md:px-14 pt-9 pb-6">
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.75rem,3vw,2.4rem)]">
                {order === "topic"
                  ? "Issue by issue"
                  : order === "consensus"
                    ? "From agreement to division"
                    : "From division to agreement"}
              </h2>
              <p className="mt-3 font-serif text-[1.05rem] leading-[1.5] text-dark/80 max-w-[62ch] text-pretty">
                {order === "topic"
                  ? "The questionnaire in the order it was asked, so a reader who came for one subject can go straight to it. Open a card to see which candidates chose what."
                  : "Every question the field answered, ordered by how evenly the candidates split across the options. Open a card to see which candidates chose what."}
              </p>
            </div>

            {order === "topic" ? (
              groups.map((group) => (
                <div key={group.stepId} className="border-t-2 border-dark">
                  <h3 className="px-6 md:px-14 pt-6 pb-4 font-sans font-medium leading-[1.15] tracking-[-0.025em] text-[clamp(1.3rem,2vw,1.6rem)]">
                    {group.stepTitle}
                  </h3>
                  <CardGrid>
                    {group.questions.map((question) => (
                      <Card
                        key={question.questionId}
                        question={question}
                        split={splits.get(question.questionId)!}
                        field={field.length}
                      />
                    ))}
                  </CardGrid>
                </div>
              ))
            ) : (
              <CardGrid>
                {ranked.map(({ question, split }, rank) => (
                  <Card
                    key={question.questionId}
                    question={question}
                    split={split}
                    field={field.length}
                    rank={rank + 1}
                    topic={question.stepTitle}
                  />
                ))}
              </CardGrid>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`type-label-sm px-2.5 py-1.5 border transition-colors cursor-pointer ${
        active
          ? "border-dark bg-dark text-bg"
          : "border-border-light text-text-secondary hover:border-dark hover:text-dark"
      }`}
    >
      {label}
    </button>
  );
}

/* The grid the cards tile into.
 *
 * Borders on the container's top and left and on each card's bottom and right,
 * so the rules between cards are single-weight however the row wraps — the
 * usual trick, and the reason the cards carry no border of their own.
 *
 * FIVE ROW TRACKS PER CARD, AND WHY
 *   Each card spans five of the grid's rows and adopts them with
 *   `grid-rows-subgrid` — question, chart, options, footer, and the answers it
 *   opens into — and the trigger nests a second subgrid to claim the first
 *   four. Every block is therefore sized by the tallest of its kind in the
 *   row, and every card puts its question, its pie, its options and its rule
 *   on the same four lines as its neighbours.
 *
 *   One shared track per block, rather than one for the whole closed card.
 *   With a single track the card had spare height and nowhere honest to put
 *   it: pooled under the options it left a short list floating above its own
 *   rule, and pooled around the chart it set a card's pie lower than the two
 *   beside it. Split four ways there is no pool — each block is exactly as
 *   tall as that row needs, and nothing has to be centred in slack.
 *
 *   The obvious way to bottom-align — stretch the card to the row's height and
 *   push the footer down with `mt-auto` — cannot survive the disclosure. The
 *   slack a card is absorbing comes from whichever card in the row is tallest,
 *   and opening a card makes it the tallest, so the slack vanishes and
 *   everything the reader was looking at slides upward under the cursor. We
 *   shipped that once and it was the first thing anyone noticed.
 *
 *   Shared tracks have no such coupling. Every closed card is sized by the
 *   first track, so every footer sits on the same line. When one card opens,
 *   it is the second track that grows — for every card in the row at once,
 *   which costs the others nothing but empty space they do not draw — and the
 *   first track never moves. Nothing above the fold shifts. */
function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-6 md:mx-14 mb-10 grid grid-cols-1 border-t border-l border-border-light md:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Colour                                                              */
/* ------------------------------------------------------------------ */

/* Slice colours, by option position.
 *
 * The brand's four designated chart ramps — lake, copper, pine, steel, the
 * ones colours.css files under "Chart Colours" — rather than the trilemma
 * palette the ward grids use. That palette leads with auburn for a stated
 * reason: a trilemma *mixes* its corners, and the three have to stay
 * distinguishable when blended. A pie blends nothing. It is a categorical
 * split, which is exactly what the chart ramps are for, and auburn is the
 * brand's accent rather than one of them — a pie led by it competes with every
 * eyebrow and link on the page instead of sitting under them.
 *
 * Ordered so neighbouring slices contrast: deep blue, then copper, then green,
 * then the desaturated steel, which is the one that can sit beside the blue
 * again on a four-option question without the wrap reading as a repeat.
 *
 * As custom properties rather than hex, so the ramps follow their theme. It is
 * the whole reason this is not a hardcoded palette: under `.theme-election`
 * these resolve against the Toronto-blue overrides, and a pie drawn in raw hex
 * would go on rendering the national palette on a page whose every other
 * element had changed colour.
 */
const SLICE_COLORS = [
  "var(--color-lake-700)",
  "var(--color-copper-600)",
  "var(--color-pine-600)",
  "var(--color-steel-600)",
];

/** An option nobody chose, and the pie's own rim: quiet, and never a fifth
 *  colour a reader might try to read as a category. */
const EMPTY = "var(--color-charcoal-200)";

/**
 * Slice colours for a question with `n` options.
 *
 * Two options take the first and second ramps — the pair furthest apart in
 * hue, so a Yes/No never reads as a gradient.
 */
function sliceColors(n: number): string[] {
  return SLICE_COLORS.slice(0, Math.max(2, Math.min(n, SLICE_COLORS.length)));
}

/* ------------------------------------------------------------------ */
/* The pie                                                             */
/* ------------------------------------------------------------------ */

/* One question's field as a pie: a slice per option, in option order, starting
 * at twelve o'clock and running clockwise — the same order and the same hues
 * the legend beside it prints, and the same twelve-o'clock start the wedge
 * glyphs use, so a glyph in the legend points at its own slice.
 *
 * Slices are separated by a stroke in the page's own colour rather than by a
 * gap, so a 3% slice is still a visible sliver instead of vanishing between
 * its neighbours. A question nobody answered draws as an empty ring, which
 * says "no data" rather than "no chart".
 */
function Pie({
  question,
  split,
  /** the widest it may draw — it fills its column up to this, and no further */
  maxSize = 216,
}: {
  question: FieldQuestion;
  split: Split;
  maxSize?: number;
}) {
  const colors = sliceColors(question.options.length);

  /* Drawn in a fixed 100-unit box and scaled by the column, rather than
     rendered at a pixel size. A card is between roughly 300 and 640px wide
     depending on the breakpoint and the window, and a chart pinned to one
     number is either lost in the wide case or crowded in the narrow one — the
     fixed 124px left a third of every card empty around it.

     Strokes are the exception: `non-scaling-stroke` holds the separators at a
     true 1.5px however far the chart is scaled, so a big pie does not get fat
     white gutters between its slices and a small one does not lose them. */
  const view = `-50 -50 100 100`;
  const box = "mx-auto block h-auto w-full";

  if (split.answered === 0) {
    return (
      <svg
        viewBox={view}
        className={box}
        style={{ maxWidth: maxSize }}
        role="img"
        aria-label="No answers on record"
      >
        <circle
          r={49}
          fill="none"
          stroke={EMPTY}
          strokeWidth={1}
          strokeDasharray="3 4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  /* Each slice starts where everything before it ended. A prefix sum rather
     than a running total, so nothing is mutated while the component renders —
     the options number three or four, and the repeated sum costs nothing. */
  const turn = (n: number) => (n / split.answered) * Math.PI * 2;
  const slices = split.counts.map((count, i) => {
    const before = split.counts.slice(0, i).reduce((a, b) => a + b, 0);
    return {
      i,
      count,
      path:
        d3arc()({
          innerRadius: 0,
          outerRadius: 49,
          startAngle: turn(before),
          endAngle: turn(before + count),
        } as never) ?? "",
    };
  });

  return (
    <svg
      viewBox={view}
      className={box}
      style={{ maxWidth: maxSize }}
      role="img"
      aria-label={question.options
        .map(
          (option, i) => `${option}: ${split.counts[i]} of ${split.answered}`,
        )
        .join(", ")}
    >
      {slices.map(({ i, path, count }) =>
        count === 0 ? null : (
          <path
            key={i}
            d={path}
            fill={colors[i]}
            stroke="var(--color-bg)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ),
      )}
      {/* The rim, so a single-option pie still reads as a circle against the
          page rather than as a shape with no edge. */}
      <circle
        r={49}
        fill="none"
        stroke={EMPTY}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** The options under a pie, as the questionnaire actually put them.
 *
 *  Each choice was offered as a short name and its full wording — "Permission:
 *  permit substantially more housing as-of-right" — and for a while this
 *  printed only the name. That is the right form for a chart rim, where there
 *  is no room for a sentence, and the wrong form for the card's own key: on
 *  their own, "Permission", "Cost and speed" and "Public delivery" are three
 *  labels a reader has to guess at, and the guess is the whole answer. So the
 *  wording goes back in underneath, where the questionnaire had it, and the
 *  card reads as the question was actually asked.
 *
 *  Spans rather than a list, because this sits inside a disclosure trigger and
 *  a trigger is a button — phrasing content only. */
function Legend({
  question,
  split,
}: {
  question: FieldQuestion;
  split: Split;
}) {
  const colors = sliceColors(question.options.length);
  const total = Math.max(1, split.answered);

  return (
    <span className="grid content-start gap-3">
      {question.options.map((option, i) => {
        const empty = split.counts[i] === 0;
        return (
          <span key={i} className="block min-w-0">
            <span className="flex items-baseline gap-2 min-w-0">
              <span className="translate-y-[2px] flex-none">
                <WedgeGlyph
                  index={i}
                  count={question.options.length}
                  color={empty ? EMPTY : colors[i]}
                  size={12}
                />
              </span>
              <span
                className={`font-sans font-medium text-[0.95rem] leading-[1.3] tracking-[-0.01em] text-pretty flex-1 min-w-0 ${
                  empty ? "text-text-muted" : "text-dark"
                }`}
              >
                {option}
              </span>
              <span
                className={`type-label-sm tabular-nums flex-none ${
                  empty ? "text-text-muted" : "text-dark"
                }`}
              >
                {split.counts[i]}
                <span className="text-text-muted">
                  {" "}
                  {Math.round((split.counts[i] / total) * 100)}%
                </span>
              </span>
            </span>
            {question.details[i] && (
              /* Indented past the glyph, so the wording reads as belonging to
                 the option above it rather than as another option. */
              <span
                className={`block font-serif text-[0.9rem] leading-[1.35] text-pretty pl-5 mt-0.5 ${
                  empty ? "text-text-muted" : "text-text-secondary"
                }`}
              >
                {question.details[i]}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* The card                                                            */
/* ------------------------------------------------------------------ */

function Card({
  question,
  split,
  field,
  rank,
  topic,
}: {
  question: FieldQuestion;
  split: Split;
  field: number;
  /** the position in the ranking, where the cards are ranked rather than grouped */
  rank?: number;
  /** which part of the questionnaire this came from — printed only when the
   *  cards are ranked, since a topic section already says it otherwise */
  topic?: string;
}) {
  return (
    <Collapsible className="row-span-5 grid grid-rows-subgrid border-b border-r border-border-light">
      {/* Claims the first four tracks, so the blocks inside it are laid on the
          grid's own rows rather than on rows of its own. Horizontal padding
          only: vertical padding here would inset the nested tracks from the
          ones outside it, and the two would stop agreeing about where a row
          begins. Each block carries its own vertical space instead. */}
      <CollapsibleTrigger className="group row-span-4 grid w-full cursor-pointer grid-rows-subgrid px-5 text-left">
        <span className="block pt-5">
          {(rank || topic) && (
            <span className="mb-2.5 flex items-baseline gap-2">
              {rank && (
                <span className="type-label-sm tabular-nums text-text-muted">
                  {String(rank).padStart(2, "0")}
                </span>
              )}
              {topic && (
                <span className="type-caption truncate text-text-muted">
                  {topic}
                </span>
              )}
            </span>
          )}
          <span className="block font-sans text-[1.02rem] font-medium leading-[1.25] tracking-[-0.015em] text-pretty transition-colors group-hover:text-accent">
            {question.question}
          </span>
        </span>

        {/* The chart, centred in a track as tall as the tallest pie in the
            row — which, since every card in a row is the same width and a pie
            is square, is simply as tall as any of them.

            Above the options rather than beside them: set alongside, the pie
            took a third of the card and left the wording a column too narrow
            for it — "Decrease after inflation, with some responsibilities
            transferred" wrapped to four lines next to a chart four lines
            tall. */}
        <span className="flex items-center px-2 py-6">
          <Pie question={question} split={split} />
        </span>

        <Legend question={question} split={split} />

        <span className="type-caption mt-4 flex items-center gap-1.5 border-t border-border-light pt-4 pb-4 text-text-muted">
          <ChevronDown className="size-3 flex-none opacity-45 transition-transform group-data-[state=open]:rotate-180" />
          {split.answered === 0
            ? "Nobody has answered this one"
            : `${split.answered} of ${field} answered`}
          {split.answered > 0 && (
            <>
              <span className="text-border-light">·</span>
              {temperature(split.division)}
            </>
          )}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-5 pt-1 pb-6">
          <Who question={question} picks={question.picks} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* The two ends of the ranking, given a card each at the top of the page and a
   bigger pie — same object as the grid's cards, sized to be read first. */
function Feature({
  eyebrow,
  row,
  field,
  className = "",
}: {
  eyebrow: string;
  row: { question: FieldQuestion; split: Split };
  field: number;
  className?: string;
}) {
  const { question, split } = row;

  return (
    <div className={`px-6 md:px-14 py-8 ${className}`}>
      <p className="type-label text-accent mb-3.5">{eyebrow}</p>
      <p className="font-sans font-medium leading-[1.2] tracking-[-0.02em] text-[clamp(1.15rem,1.8vw,1.45rem)] text-balance mb-6">
        {question.question}
      </p>
      <div>
        <div>
          <Pie question={question} split={split} maxSize={260} />
        </div>
        <div className="mt-6">
          <Legend question={question} split={split} />
          <p className="type-caption text-text-muted mt-4 pt-3 border-t border-border-light">
            {split.answered} of {field} answered
            {split.answered < field
              ? ` · ${field - split.answered} skipped it`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

/** How a split reads in a word. Thresholds on the entropy rather than on the
 *  leader's share, so a three-way question and a four-way one are described on
 *  the same scale — 50% of four options is a much stronger lead than 50% of
 *  two. */
function temperature(division: number): string {
  if (division < 0.55) return "Broad agreement";
  if (division < 0.85) return "Leaning";
  return "Split";
}

/** Who picked what, once a card is opened. Surnames, filed under their option —
 *  the candidates are the evidence behind the pie, and a pie with no way to get
 *  to them is a statistic a reader has to take on trust. */
function Who({
  question,
  picks,
}: {
  question: FieldQuestion;
  picks: FieldPick[];
}) {
  const colors = sliceColors(question.options.length);
  const unplaced = picks.filter((pick) => pick.choice === null);

  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {question.options.map((option, i) => {
        const chose = picks
          .filter((pick) => pick.choice === i)
          /* Ordered by surname — a reader checking on one candidate needs
             somewhere to look them up — but printed in full, which is how the
             ballot and every other page in the tracker names them. */
          .sort(
            (a, b) =>
              a.surname.localeCompare(b.surname) ||
              a.name.localeCompare(b.name),
          );
        return (
          <div
            key={i}
            className="border-t-2 pt-2.5"
            style={{ borderColor: chose.length ? colors[i] : EMPTY }}
          >
            <p className="type-label-sm text-text-secondary mb-1.5 text-pretty">
              {option}
            </p>
            {chose.length === 0 ? (
              <p className="type-caption text-text-muted">Nobody</p>
            ) : (
              <ul className="m-0 p-0 list-none grid gap-0.5">
                {chose.map((pick) => (
                  <li
                    key={pick.key}
                    className="font-serif text-[0.95rem] leading-[1.35] text-dark/85"
                  >
                    {pick.name}
                    <span className="type-caption text-text-muted ml-1.5">
                      {pick.race === "mayor" ? "Mayor" : `Ward ${pick.ward}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {unplaced.length > 0 && (
        <div className="border-t-2 border-border-light pt-2.5">
          <p className="type-label-sm text-text-secondary mb-1.5">
            Answered in their own words
          </p>
          <ul className="m-0 p-0 list-none grid gap-1.5">
            {unplaced.map((pick) => (
              <li
                key={pick.key}
                className="font-serif text-[0.95rem] leading-[1.35] text-dark/85"
              >
                {pick.name}: &ldquo;{pick.answer}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
