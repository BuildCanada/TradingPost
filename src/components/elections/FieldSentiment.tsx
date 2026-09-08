"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  EMPTY,
  optionColors as rampFor,
} from "@/lib/elections/option-colors";
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
 * WHY UNIT BARS, AND NOT A PIE
 *   This page used to draw each question as a pie, on the reasoning that the
 *   options are exhaustive and mutually exclusive. True, and still the wrong
 *   mark at this size. A pie asks the reader to compare angles, which is the
 *   comparison people are worst at, and — the fatal part on a page of two
 *   dozen questions — two pies cannot be compared to each other at all. Every
 *   pie is the same circle whatever its denominator, so a question 26 people
 *   answered drew exactly as big as one 32 answered.
 *
 *   So: a bar per option, each built out of one cell per candidate, all of
 *   them on a scale of the whole field. Every bar on the page is in the same
 *   units, which makes them comparable to each other rather than only to
 *   themselves — a reader scanning the grid is reading two dozen charts on one
 *   axis. The cells are countable, which is the honest register for n = 32:
 *   "twenty of thirty-two" is a fact, where 63% of a circle is a shape. And
 *   the candidates who skipped a question get a bar of their own rather than
 *   disappearing into a denominator in the caption, so a thin answer looks
 *   thin. See UnitRows.
 *
 * COLOUR
 *   Option position, from the brand's chart ramps, with a separate diverging
 *   assignment for the Yes/No questions — see `optionColors`.
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
  race,
}: {
  groups: FieldGroup[];
  respondents: Respondent[];
  /** Pins the whole page to one ballot line and drops the field control.
   *  Passed by the mayoral page, which is a race rather than a city: the
   *  filter would be a two-state toggle whose other state is empty. Left
   *  unset, the reader chooses, which is what the city-wide page wants. */
  race?: Race;
}) {
  const [order, setOrder] = useState<Order>("topic");
  const [chosen, setChosen] = useState<Filter>("all");
  const filter: Filter = race ?? chosen;

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

  /* The picks behind each question, narrowed the same way the bars are.
     The panel used to open on `question.picks` — the whole election — while
     the chart above it drew the filtered field, so a mayoral page whose bars
     counted nine listed all thirty-two underneath. One filter, applied once,
     read by both. */
  const picks = useMemo(() => {
    const map = new Map<string, FieldPick[]>();
    for (const question of questions)
      map.set(question.questionId, forRace(question.picks, filter));
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
      {/* ── The two ends, as the page's headline numbers ───────── */}
      {agreed && divided && agreed !== divided && (
        <div className="grid md:grid-cols-2 border-b-2 border-dark">
          <Feature eyebrow="Most agreed on" row={agreed} field={field.length} />
          <Feature
            eyebrow="Most divided"
            row={divided}
            field={field.length}
            className="border-t md:border-t-0 md:border-l border-border-light"
          />
        </div>
      )}

      {/* ── Controls ───────────────────────────────────────────── */}
      <div className="border-b-2 border-dark flex flex-wrap items-stretch justify-between">
        <div className="flex items-center gap-1 px-5 py-3">
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

        {!race && (
          <div className="flex items-center gap-1 px-5 py-3 border-t md:border-t-0 md:border-l border-border-light grow md:grow-0">
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
                onClick={() => setChosen(id)}
                label={label}
              />
            ))}
          </div>
        )}
      </div>

      {field.length === 0 ? (
        <p className="px-6 md:px-14 py-16 font-serif text-[1.05rem] text-dark/70">
          No one in this part of the field has answered the questionnaire yet.
        </p>
      ) : (
        <section className="pb-8">
          {order === "topic" ? (
            groups.map((group, i) => (
              <div key={group.stepId}>
                <SectionRule
                  title={group.stepTitle}
                  note={
                    i === 0
                      ? "One cell per candidate · open a card for who chose what"
                      : undefined
                  }
                />
                <CardGrid>
                  {group.questions.map((question) => (
                    <Card
                      key={question.questionId}
                      question={question}
                      split={splits.get(question.questionId)!}
                      picks={picks.get(question.questionId)!}
                      field={field.length}
                    />
                  ))}
                </CardGrid>
              </div>
            ))
          ) : (
            <>
              <SectionRule
                title={
                  order === "consensus"
                    ? "From agreement to division"
                    : "From division to agreement"
                }
                note={`${ranked.length} questions · one cell per candidate · open a card for who chose what`}
              />
              <CardGrid>
                {ranked.map(({ question, split }, rank) => (
                  <Card
                    key={question.questionId}
                    question={question}
                    split={split}
                    picks={picks.get(question.questionId)!}
                    field={field.length}
                    rank={rank + 1}
                    topic={question.stepTitle}
                  />
                ))}
              </CardGrid>
            </>
          )}
        </section>
      )}
    </div>
  );
}

/* A section head that costs one line rather than a screen: the title set on
   the rule that opens the section, with the optional note pushed to the far
   end of the same line. Two dozen cards under eight headings is a page that
   scrolls; the headings should not be why. */
function SectionRule({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-6 md:mx-14 mt-6 mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <h2 className="font-sans font-medium leading-none tracking-[-0.02em] text-[1.15rem]">
        {title}
      </h2>
      {note && <p className="type-label-sm text-text-muted">{note}</p>}
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
 * FOUR ROW TRACKS PER CARD, AND WHY
 *   Each card spans four of the grid's rows and adopts them with
 *   `grid-rows-subgrid` — question, chart, footer, and the answers it opens
 *   into — and the trigger nests a second subgrid to claim the first three.
 *   Every block is therefore sized by the tallest of its kind in the row, so
 *   every card in a row starts its bar on the same line as its neighbours.
 *   Which is the whole point of a bar that means the same thing on every card:
 *   aligned, the row can be read across.
 *
 *   The obvious way to bottom-align — stretch the card to the row's height and
 *   push the footer down with `mt-auto` — cannot survive the disclosure. The
 *   slack a card is absorbing comes from whichever card in the row is tallest,
 *   and opening a card makes it the tallest, so the slack vanishes and
 *   everything the reader was looking at slides upward under the cursor. We
 *   shipped that once and it was the first thing anyone noticed.
 *
 *   Shared tracks have no such coupling. Every closed card is sized by the
 *   first three tracks, so every footer sits on the same line. When one card
 *   opens, it is the fourth track that grows — for every card in the row at
 *   once, which costs the others nothing but empty space they do not draw —
 *   and the tracks above it never move. Nothing above the fold shifts. */
function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-6 md:mx-14 grid grid-cols-1 border-t border-l border-border-light cards:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Colour                                                              */
/* ------------------------------------------------------------------ */

/* Option colours, by position — see src/lib/elections/option-colors.ts, which
 * this page shares with the ward cards so an option is the same colour on
 * both. */
function optionColors(question: FieldQuestion): string[] {
  return rampFor(question.options.length, question.ordinal);
}

/* ------------------------------------------------------------------ */
/* The bars                                                            */
/* ------------------------------------------------------------------ */

/**
 * One question's field as a small horizontal bar chart, one bar per option,
 * and every bar built out of one cell per candidate.
 *
 * A ROW PER OPTION, RATHER THAN ONE STACKED LINE
 *   The single line was one row of thirty-two cells, split into runs by
 *   option, with the option names printed underneath as a key. It reads the
 *   shape of a split well and everything else badly. Only the first run starts
 *   at the left edge, so comparing the second option to the third is comparing
 *   two floating runs with no shared baseline — the comparison bar charts
 *   exist to make trivial. And the names sat in a key, which means every
 *   reading costs a colour lookup: find the swatch, match the hue, come back.
 *
 *   Broken into rows, every bar starts at the same left edge on the same
 *   scale, longest is longest at a glance, and each name sits directly over
 *   its own bar — so the key disappears, and colour goes back to being what it
 *   should be here, a second channel rather than the only one.
 *
 * THE SCALE IS THE FIELD, ON EVERY ROW AND EVERY CARD
 *   Each row is `field` cells wide — everyone who returned the questionnaire —
 *   with the unchosen remainder left as a faint track. So the rows within a
 *   card share an axis, and so do the cards: a bar half across is sixteen
 *   candidates on every question on the page, which is what makes a grid of
 *   two dozen of these scannable rather than merely present.
 *
 *   Candidates who skipped the question get a row of their own at the bottom
 *   rather than a footnote, so a question the field ducked looks ducked.
 */
function UnitRows({
  question,
  split,
  field,
}: {
  question: FieldQuestion;
  split: Split;
  /** how many candidates are in the filtered field — the cells in a row */
  field: number;
}) {
  const colors = optionColors(question);
  const total = Math.max(1, split.answered);

  type Row = {
    label: string;
    count: number;
    /** the option's colour, or null for the row of candidates who skipped it */
    color: string | null;
    share: number | null;
    lead: boolean;
  };

  const rows: Row[] = question.options.map((option, i) => ({
    label: option,
    count: split.counts[i],
    color: colors[i],
    share: Math.round((split.counts[i] / total) * 100),
    lead: split.counts[i] > 0 && i === split.lead,
  }));

  const skipped = Math.max(0, field - split.answered);
  if (skipped > 0)
    rows.push({
      label: "Did not answer",
      count: skipped,
      color: null,
      /* No share: every other row on the card is a share of the candidates who
         answered, and this row is the ones who did not. A percentage here
         would be a percentage of something else printed in the same column. */
      share: null,
      lead: false,
    });

  return (
    <span className="block">
      {rows.map((row, i) => (
        <span key={i} className={`block ${i === 0 ? "" : "mt-2"}`}>
          <span className="mb-1 flex items-baseline justify-between gap-2.5">
            <span
              className={`font-sans leading-[1.25] tracking-[-0.01em] text-pretty ${"text-[0.9rem]"} ${
                row.lead
                  ? "font-semibold text-dark"
                  : row.count === 0 || row.color === null
                    ? "font-medium text-text-muted"
                    : "font-medium text-text-secondary"
              }`}
            >
              {row.label}
            </span>
            {/* The tally itself is the row of cells below — countable, and
                the only place the number needs to be. What stays here is the
                share, which the cells cannot show. The count survives for a
                screen reader, which has no cells to count. */}
            <span className="type-label-sm flex-none tabular-nums text-text-muted">
              <span className="sr-only">{row.count} </span>
              {row.share !== null && <>{row.share}%</>}
            </span>
          </span>

          {/* The cells carry the count for a sighted reader, but a screen
              reader gets it as the number beside the label instead: walking
              a grid of thirty-two blank cells is not counting them. */}
          <span
            aria-hidden="true"
            className="grid gap-px md:gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${field}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: field }, (_, cell) =>
              cell < row.count ? (
                <span
                  key={cell}
                  className={`h-3 rounded-[1px] ${
                    row.color === null ? "bg-dark/25" : ""
                  }`}
                  style={
                    row.color === null ? undefined : { background: row.color }
                  }
                />
              ) : (
                <span key={cell} className="h-3 rounded-[1px] bg-dark/8" />
              ),
            )}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* The card                                                            */
/* ------------------------------------------------------------------ */

function Card({
  question,
  split,
  picks,
  field,
  rank,
  topic,
}: {
  question: FieldQuestion;
  split: Split;
  /** the answers behind this card's bars — already narrowed to the field on
   *  screen, so the panel and the chart can never disagree */
  picks: FieldPick[];
  field: number;
  /** the position in the ranking, where the cards are ranked rather than grouped */
  rank?: number;
  /** which part of the questionnaire this came from — printed only when the
   *  cards are ranked, since a topic section already says it otherwise */
  topic?: string;
}) {
  const notes = picks.filter((pick) => pick.note?.trim()).length;

  return (
    <Collapsible className="row-span-4 grid grid-rows-subgrid border-b border-r border-border-light">
      {/* Claims the first three tracks, so the blocks inside it are laid on the
          grid's own rows rather than on rows of its own. Horizontal padding
          only: vertical padding here would inset the nested tracks from the
          ones outside it, and the two would stop agreeing about where a row
          begins. Each block carries its own vertical space instead. */}
      <CollapsibleTrigger className="group row-span-3 grid w-full cursor-pointer grid-rows-subgrid px-4 text-left">
        <span className="block pt-3.5 pb-3">
          <span className="mb-2 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-baseline gap-2">
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
            {split.answered > 0 && (
              <span className="type-label-sm flex-none text-text-muted">
                {temperature(split.division)}
              </span>
            )}
          </span>
          <span className="block font-sans text-[0.97rem] font-medium leading-[1.28] tracking-[-0.015em] text-pretty transition-colors group-hover:text-accent">
            {question.question}
          </span>
        </span>

        {/* The chart, on a track of its own, so every card in the row starts
            its bars on the same line as its neighbours.

            No width cap here. A cap is the wrong instrument: it holds the
            chart at one size while the card around it keeps growing, so a wide
            screen buys nothing but a strip of empty card to the right of every
            bar. The chart fills the card, and the card is kept to a sane width
            by the column count instead — see CardGrid. */}
        <span className="block">
          <UnitRows question={question} split={split} field={field} />
        </span>

        {/* THE FOOTER IS THE INVITATION
            It used to be a caption — "9 of 9 answered · 8 comments" — set in
            muted ink beside a chevron, which describes what is behind the card
            without ever asking the reader to go there. A count is not a call
            to action, and a card that hides a dozen candidates' own words
            deserves one: the ask leads, in the accent, and the denominator
            follows it as the supporting fact it always was. */}
        <span className="type-caption mt-3 flex flex-wrap items-center gap-x-1.5 border-t border-border-light pt-2.5 pb-3">
          <ChevronDown className="size-3 flex-none text-text-muted opacity-45 transition-transform group-data-[state=open]:rotate-180" />
          {split.answered === 0 ? (
            <span className="text-text-muted">
              Nobody has answered this one
            </span>
          ) : (
            <>
              <span className="font-medium text-accent group-hover:underline">
                <span className="group-data-[state=open]:hidden">
                  {notes > 0
                    ? `See comments from candidates (${notes})`
                    : "See who chose what"}
                </span>
                <span className="hidden group-data-[state=open]:inline">
                  Hide
                </span>
              </span>
              <span className="text-border-light">·</span>
              <span className="text-text-muted">
                {split.answered} of {field} answered
              </span>
            </>
          )}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pt-1 pb-5">
          <Who question={question} picks={picks} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* The two ends of the ranking, given the top of the page and a headline number
   each. Same object as the grid's cards — same bar, same key, same colours —
   sized so the one thing a reader takes away is legible from across the room,
   and so a screenshot of this block is a complete statement on its own: the
   share, what it is a share of, and the field it came out of. */
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
  const lead = split.lead >= 0 ? question.options[split.lead] : null;
  const share = Math.round(split.leadShare * 100);

  return (
    /* THE CLAIM ON THE LEFT, THE EVIDENCE ON THE RIGHT
       A feature gets half the page, which is far more width than a chart of
       thirty-two cells should ever take. Stacked down that column — number,
       then option, then question, then chart — every one of those lines ran
       out well before the column did, and the block was mostly the empty
       right-hand half of itself.

       Set as two columns, the width is spent instead of left over: the claim
       reads as a sentence at a comfortable measure, the chart sits beside it
       at the same size the grid's cards draw, and the whole thing is shorter
       than the stack it replaces. Below `lg` there is no width to divide and
       it stacks, which is the arrangement the cards use anyway. */
    <div className={`px-6 md:px-14 py-6 ${className}`}>
      <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
        <div>
          <p className="type-label text-accent mb-3">{eyebrow}</p>
          <p className="flex items-baseline gap-3">
            <span className="font-sans font-semibold leading-[0.8] tracking-[-0.045em] tabular-nums text-[clamp(2.5rem,4vw,3.25rem)]">
              {share}%
            </span>
            {lead && (
              <span className="min-w-0 font-sans font-medium leading-[1.2] tracking-[-0.02em] text-[1.02rem] text-pretty">
                {lead}
              </span>
            )}
          </p>
          <p className="mt-3 font-serif text-[1.02rem] leading-[1.4] text-dark/85 max-w-[42ch] text-pretty">
            {question.question}
          </p>
        </div>

        <div>
          <UnitRows question={question} split={split} field={field} />
          <p className="type-caption text-text-muted mt-3 pt-2.5 border-t border-border-light">
            {split.answered} of {field} answered
            {split.answered < field
              ? ` · ${field - split.answered} skipped it`
              : ""}
            {" · "}
            {temperature(split.division)}
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
  if (division < 0.45) return "Broad agreement";
  if (division < 0.8) return "Leaning";
  return "Split";
}

/** Who picked what, once a card is opened — the full wording each option was
 *  offered under, the candidates filed beneath it, and what each of them wrote
 *  about their own answer.
 *
 *  That wording used to print under the chart on every card, and it was most
 *  of the page's height: two dozen cards each carrying three sentences nobody
 *  had asked for yet. It belongs here, next to the candidates who chose it,
 *  where a reader wanting to know exactly what "Public delivery" meant is
 *  already asking. */
function Who({
  question,
  picks,
}: {
  question: FieldQuestion;
  picks: FieldPick[];
}) {
  const colors = optionColors(question);
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
            <p className="type-label-sm text-text-secondary text-pretty">
              {option}
            </p>
            {question.details[i] && (
              <p className="font-serif text-[0.9rem] leading-[1.35] text-text-secondary mt-1 text-pretty">
                {question.details[i]}
              </p>
            )}
            {chose.length === 0 ? (
              <p className="type-caption text-text-muted mt-1.5">Nobody</p>
            ) : (
              <ul className="m-0 mt-1.5 p-0 list-none grid gap-2">
                {chose.map((pick) => (
                  <li key={pick.key}>
                    <span className="block font-sans font-medium text-[0.92rem] leading-[1.3] tracking-[-0.01em]">
                      {pick.name}
                      <span className="type-caption text-text-muted ml-1.5 font-normal">
                        {pick.race === "mayor" ? "Mayor" : `Ward ${pick.ward}`}
                      </span>
                    </span>
                    {/* Their own words, verbatim, set against a rule so it is
                        never mistaken for ours. Most candidates who answered
                        also wrote something, and the writing is the part that
                        says why — a chart can show that nine picked the same
                        option and cannot show that they meant nine different
                        things by it. */}
                    {pick.note?.trim() && (
                      <span className="mt-1 block border-l-2 border-border-light pl-2.5 font-serif text-[1.02rem] leading-[1.5] text-text-secondary text-pretty">
                        {pick.note.trim()}
                      </span>
                    )}
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
              <li key={pick.key}>
                <span className="block font-serif text-[1.08rem] leading-[1.45] text-dark/85">
                  {pick.name}: &ldquo;{pick.answer}&rdquo;
                </span>
                {pick.note?.trim() && (
                  <span className="mt-1 block border-l-2 border-border-light pl-2.5 font-serif text-[1.02rem] leading-[1.5] text-text-secondary text-pretty">
                    {pick.note.trim()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
