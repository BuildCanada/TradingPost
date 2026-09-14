import { MessageSquareText } from "lucide-react";

import { rollCall } from "@/lib/elections/candidate-answers";
import { lastName } from "@/lib/elections/names";
import { EMPTY, optionColors } from "@/lib/elections/option-colors";
import type {
  ComparedQuestion,
  RollCallName,
} from "@/lib/elections/candidate-answers";

/* One question as a card: the candidates down it, and what each of them said.
 *
 * FORM
 *   A row a candidate, in surname order, and the answer beside them. The two
 *   things a reader does here are run down the names looking for one person,
 *   and run down the answers looking for the split — so both are columns, and
 *   a candidate sits in the same place on all thirty-three cards.
 *
 *   This replaced a panel per answer with the people who gave it inside it.
 *   That read the split well and a single candidate badly: finding one
 *   person's position meant scanning every panel for their name, and the name
 *   landed somewhere different on every card. The split is still readable — it
 *   is the answer column, in the option's own colour, read downwards — and the
 *   whole-field version of it is what /issues draws.
 *
 * THE ANSWER IN FULL
 *   The column prints the answer as it was put to the candidates, not a
 *   handle for it. Most of these run to a phrase and some to ninety
 *   characters, so it is a block that wraps rather than a pill that cannot.
 *   On a page whose whole job is what a candidate said, the reader gets the
 *   sentence they actually endorsed.
 *
 * THE WRITING OPENS
 *   What a candidate wrote about their answer is behind the row rather than
 *   under it. It is the one thing on this card that is not simply printed,
 *   and it is what makes a table of thirty-three questions readable at all: a
 *   ward's respondents write a paragraph each. `<details>`, so it opens with
 *   JavaScript off and the card stays a server component. A candidate who
 *   wrote nothing gets no control, because an arrow onto nothing is worse
 *   than no arrow.
 *
 * ONLY THE PEOPLE WHO ANSWERED
 *   A candidate who never returned the questionnaire has no row. A ward of
 *   ten with one respondent would otherwise be nine identical "did not
 *   respond" rows on each of thirty-three cards, and they are already named
 *   and linked once in the roster over the section. The line under the
 *   question says how many of the ballot the rows account for.
 *
 * COLOUR
 *   Option position, from the ramps in lib/elections/option-colors — the same
 *   ones /issues and the mayoral page use, so an option is the same colour
 *   wherever a reader meets it. Yes/no scales take the diverging ramp rather
 *   than three unrelated hues, which is both the honest encoding of a scale
 *   and the thing that makes a direct question look different from a
 *   three-way one at a glance.
 */

export function QuestionRollCall({
  question,
  silent = [],
  nameTheSilent = true,
  seats,
  roles,
  ballotSize,
  notes = true,
  yourKey,
  headingId,
}: {
  question: ComparedQuestion;
  /** on the ballot, but never returned the questionnaire */
  silent?: { key: string; name: string }[];
  /** false where nobody in the race answered anything — see below */
  nameTheSilent?: boolean;
  /** which seat each candidate is running for, keyed by candidate key. A ward
   *  page passes none: everyone named on it is running for the same seat, and
   *  printing it on every plate would be the page's own title, repeated a few
   *  hundred times. City-wide, it is the difference between a name and a
   *  ballot line the reader can act on — and it is also what splits a panel
   *  of thirty plates into the two races a voter actually holds. */
  seats?: Record<string, Seat>;
  /** what each candidate is on this ballot — "Incumbent", "Challenger" —
   *  keyed by candidate key. Toronto's council races are non-partisan, so
   *  there is no party to print under a name and this is the only standing a
   *  candidate has. Optional: a caller with nothing to say leaves the second
   *  line off the row rather than filling it. */
  roles?: Record<string, string>;
  /** how many candidates are on the ballot this table is drawn from, for the
   *  line that says how much of it answered. Only respondents get a row, so
   *  without it a reader cannot tell a ward where everyone answered from one
   *  where two people did. Omitted, the line is not printed. */
  ballotSize?: number;
  /** print what each candidate wrote about their own answer.
   *
   *  A ward's four respondents leave four notes under a question and every
   *  one of them is worth the line. The city-wide page puts the same question
   *  to thirty-odd people, and a note under each turns a card a reader can
   *  take in at a glance into a page of prose they have to read to find the
   *  split — which is the comparison the form exists to make. So /issues
   *  files the names and leaves the writing to the ward and mayoral pages,
   *  where the field is small enough to read it.
   *
   *  An answer given in the candidate's own words is not a note and prints
   *  either way: it is the whole of what they said, and dropping it would
   *  leave a plate under a heading with nothing behind it. */
  notes?: boolean;
  /** the reader's own answers, filed among the candidates' — the survey
   *  results page passes themselves through the same pivot as everyone else,
   *  so "who agreed with me" is a plate sitting in the same block rather than
   *  a column to compare against. Their plate is marked; nobody else's is. */
  yourKey?: string;
  /** the id the scroll rail scrolls to. A question is a level-3 entry under
   *  its section, which is what makes the rail nest rather than run thirty-odd
   *  headings down one list. */
  headingId?: string;
}) {
  const { groups, verbatim, unanswered } = rollCall(
    question,
    nameTheSilent ? silent : [],
  );

  const colors = optionColors(question.options.length, question.ordinal);
  const hue = (option: number) => colors[option] ?? EMPTY;

  const empty = groups.length === 0 && verbatim.length === 0;

  /* One row a candidate, in surname order, whatever they answered.

     The card used to be the other way up: a panel per answer with the people
     who gave it inside it. That reads the split at a glance, and it reads a
     single candidate badly — to find out what one person said you scanned
     every panel until you found their name, and the name you were looking for
     sat in a different place on all thirty-three cards. A row apiece puts
     every candidate in the same place on every card, and the answer beside
     them in the same column, so a reader can run down either. */
  const rows: AnswerRow[] = [
    ...groups.flatMap((group) =>
      group.candidates.map((candidate) => ({
        ...candidate,
        option: group.option,
        answerLabel: group.detail || group.label,
      })),
    ),
    /* On no option, because none of them fit what they wrote. The column says
       so and their words are under it, rather than a choice they did not
       make. */
    ...verbatim.map((candidate) => ({
      ...candidate,
      option: null,
      answerLabel: "In their own words",
    })),
  ].sort(
    (a, b) =>
      lastName(a.name).localeCompare(lastName(b.name)) ||
      a.name.localeCompare(b.name),
  );

  return (
    /* `@container`, because the rows have to size against the card and not
       against the window. The cards sit two to a row on a wide screen, so a
       1440px viewport gives a card about 460 pixels of inside — and a row
       template keyed to the viewport would lay out three columns for a
       thousand pixels in a card that has half that, leaving the name a
       sliver. Asking the card how wide it is gets it right at both widths. */
    /* `content-start` is load-bearing, not tidiness.

       Two cards to a row means both are stretched to the height of the taller
       one, and a grid container's `align-content` defaults to `normal`, which
       behaves as `stretch`: its auto-sized rows grow to absorb whatever extra
       height they are given. So opening a row in one card stretched its
       neighbour, and the neighbour's heading, table and foot slid apart to
       fill the space — a reader opening one answer watched an unrelated card
       rearrange itself. Pinned to the start, the rows keep their own heights
       and the slack collects at the bottom of the card where nobody sees it.

       The card was `flex flex-col` before it was a table, which is why this
       never showed: a column flex container leaves its children alone. */
    <article className="@container grid content-start gap-5 border border-border-light p-6 md:p-7">
      <div className="grid content-start gap-1.5">
        <h3
          id={headingId}
          /* Smaller on a phone. Twenty-three pixels is a page heading, and
             this is one of thirty-three card headings on a narrow screen. */
          className="scroll-mt-24 font-sans font-medium leading-[1.2] tracking-[-0.025em] text-[1.2rem] text-dark text-balance wide:text-[1.45rem]"
        >
          {question.question}
        </h3>

        {/* How much of the ballot is in the table under this.
 
            Only the candidates who answered get a row, so without this line a
            reader has no way to tell a ward where everyone answered from one
            where two people did — the table looks the same, just shorter. It
            is the one denominator on the card and it earns its place by
            saying what is missing from the rows below it. */}
        {ballotSize !== undefined && ballotSize > 0 && (
          <p className="type-caption text-text-muted">
            {rows.length} of {ballotSize}{" "}
            {ballotSize === 1 ? "candidate" : "candidates"} responded
          </p>
        )}
      </div>

      {empty ? (
        <p className="type-caption text-text-muted">
          No answers to this one yet.
        </p>
      ) : (
        <div className="grid content-start">
          {/* The column heads, once per card. They are what makes the two
              runs read as columns rather than as a name with something after
              it — and the third says the rows open, which an arrow alone
              leaves a reader to discover. */}
          <div className="hidden @sm:grid @sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_1rem] @2xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)_1rem] items-end gap-x-4 border-b border-border-light pb-2 type-label-sm text-text-muted">
            <span>Candidate</span>
            <span className="@sm:text-right">Answer</span>
            <span />
          </div>

          <ul className="grid content-start list-none m-0 p-0">
            {rows.map((row) => (
              <AnswerRow
                key={row.key}
                row={row}
                color={row.option === null ? EMPTY : hue(row.option)}
                muted={row.option === null}
                seat={seats?.[row.key]?.label}
                role={roles?.[row.key]}
                notes={notes}
                you={row.key === yourKey}
              />
            ))}
          </ul>
        </div>
      )}

      {/* One line, not a row each. A row per absent name per question is
          three hundred cells of nothing — the grid's problem, restated.

          Who is on this line depends on what the caller passed as `silent`.
          The race pages pass none, so it is the respondents who skipped this
          particular question: people who did write back, and did not answer
          this. That is per-question and worth a line. The ones who never
          wrote back at all are named once by the roster over the section,
          which links them too.

          `nameTheSilent` turns the line off entirely where nobody answered
          anything, for callers that do pass a `silent` list. */}
      {unanswered.length > 0 && (
        <p className="type-caption border-t border-border-light pt-3 text-text-muted text-pretty">
          <span className="type-label-sm">Did not answer</span>{" "}
          {unanswered.map((candidate) => candidate.name).join(" · ")}
        </p>
      )}
    </article>
  );
}

/** A candidate's ballot line: which race, and the seat within it. */
export type Seat = {
  race: "mayor" | "councillor";
  /** how the seat prints on a row — "Ward 9". Mayoral candidates carry none:
   *  the race they sit in is already the page. */
  label?: string;
};

/** One candidate's answer to one question, as the table wants it. */
type AnswerRow = RollCallName & {
  /** their own words, where they answered in them rather than on an option */
  answer?: string;
  /** which option they picked, or null for an answer in their own words */
  option: number | null;
  /** the answer as it was put to them, which is what the column prints */
  answerLabel: string;
};

/*
 * One row: who, what they answered, and what they wrote about it.
 *
 * The writing opens rather than printing, which is the one thing here that
 * hides anything, and it is worth it: a ward's respondents write a paragraph
 * each, and thirty-three cards of paragraphs is the page this table replaced.
 * `<details>` and not a script — the row opens with JavaScript off, it is
 * keyboard-operable for free, and the card stays a server component.
 *
 * A candidate who wrote nothing gets no control. An arrow that opens onto
 * nothing is worse than no arrow.
 */
function AnswerRow({
  row,
  color,
  muted,
  seat,
  role,
  notes,
  you,
}: {
  row: AnswerRow;
  color: string;
  /** an answer on no option — set in the empty hue, and named rather than
   *  coloured in as a choice */
  muted?: boolean;
  seat?: string;
  /** Incumbent, Challenger — what they are on this ballot. Toronto's council
   *  races carry no party, so this is the only standing a name has. */
  role?: string;
  notes: boolean;
  /** the reader's own row, on the survey results */
  you?: boolean;
}) {
  const words = row.answer || (notes ? row.note : null);

  const body = (
    <>
      <span className="col-start-1 row-start-1 grid content-start gap-0.5">
        <span className="font-sans font-medium leading-[1.3] tracking-[-0.01em] text-[0.95rem] text-dark">
          {row.name}
        </span>
        {(seat || role) && (
          <span className="type-label-sm text-text-muted">
            {[seat, role].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>

      {/* The answer as it was put to the candidates, in full. Most of these
          are a phrase and not a word — "Concentrate growth on major streets
          and near rapid transit" — so it is a block that wraps rather than a
          pill that cannot, set in the option's own hue so the column can be
          read down as a split. */}
      <span
        className={`col-span-2 row-start-2 justify-self-start @sm:col-span-1 @sm:col-start-2 @sm:row-start-1 @sm:justify-self-end rounded-[3px] px-2 py-1 font-sans text-[0.9rem] leading-[1.3] tracking-[-0.01em] text-pretty ${
          muted ? "italic" : "font-medium"
        }`}
        style={{
          background: `color-mix(in oklab, ${color} 14%, transparent)`,
          color: muted
            ? "var(--color-text-muted)"
            : `color-mix(in oklab, ${color} 72%, var(--color-dark))`,
        }}
      >
        {row.answerLabel}
      </span>
    </>
  );

  /* Stacked on a narrow screen and in columns from `cards` (612px) up: the
     answer runs to ninety characters on some questions, and beside a name in
     four hundred pixels that is a column of two or three words a line. */
  const grid =
    "grid grid-cols-[minmax(0,1fr)_1rem] gap-x-3 gap-y-1 @sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_1rem] @2xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)_1rem] @sm:items-start @sm:gap-x-4";

  return (
    <li
      className={`border-b border-border-light last:border-b-0 ${
        you ? "bg-bg-alt" : ""
      }`}
    >
      {words ? (
        <details className="answer-reveal group">
          <summary
            className={`${grid} cursor-pointer list-none py-2 [&::-webkit-details-marker]:hidden`}
          >
            {body}
            {/* Not a chevron. The icon only appears on rows that have
                something behind them, so it can say what that something is —
                the candidate wrote about this answer — instead of only that
                the row opens.

                Lines of text in a bubble — a picture of the thing it opens
                onto. All three inner strokes are straight rules, so it holds
                together at sixteen pixels where a glyph built from small
                curled quote marks would not.

                It darkens rather than turns: this is not a chevron and
                rotating it would only make it unrecognisable. */}
            <MessageSquareText
              /* Held to the first line of the answer beside it, which is
                 the thing it actually sits next to — not to the row, and not
                 to the name in the column before it.

                 The row is as tall as the answer, and an answer can wrap to
                 three lines, so centring dropped the icon down the row away
                 from its own candidate. But the answer's first line starts
                 four pixels down inside the badge's own padding, so matching
                 the name instead left the icon sitting high. Six pixels puts
                 the middle of the icon on the middle of that first line, and
                 on a single-line answer — which is most of them — that is
                 the middle of the badge as well. */
              className="col-start-2 row-start-1 mt-[2px] size-4 self-start justify-self-end text-text-muted transition-colors duration-150 group-open:text-dark @sm:col-start-3 @sm:mt-1.5"
              aria-hidden="true"
            />
          </summary>
          <p className="pb-3 font-serif text-[1.02rem] leading-[1.5] text-text-secondary text-pretty @sm:max-w-[68ch]">
            {row.answer && <>&ldquo;{row.answer}&rdquo;</>}
            {row.answer && notes && row.note && " "}
            {notes && row.note}
          </p>
        </details>
      ) : (
        <div className={`${grid} py-2`}>{body}</div>
      )}
    </li>
  );
}
