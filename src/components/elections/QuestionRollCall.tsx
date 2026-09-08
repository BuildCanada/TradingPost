import { rollCall } from "@/lib/elections/candidate-answers";
import { EMPTY, optionColors } from "@/lib/elections/option-colors";
import type {
  ComparedQuestion,
  RollCallName,
} from "@/lib/elections/candidate-answers";

/* One question as a card, with the field sorted into the answers they gave.
 *
 * FORM
 *   The answer leads and the candidates sit inside it. That is the inversion
 *   the ward page needed: the grid it replaces gave every candidate a column
 *   and every question a row, which reads "what did this one person say" and
 *   makes the comparison — the thing the page is for — something a reader has
 *   to assemble across a sideways drag.
 *
 *   Grouped, the comparison is the layout. Three panels is a three-way split
 *   and one panel is a field that agrees, without a number, a chart, or a
 *   click. Nothing is behind a disclosure here for the same reason: a question
 *   whose answers are collapsed is a question the reader has to open to
 *   compare, which is the failure being fixed.
 *
 * WHY A PANEL PER ANSWER, AND A NAME PLATE PER CANDIDATE
 *   The first pass drew the groups as a left rule against a flat list of
 *   surnames, and the two things a reader has to pick out — which answer, and
 *   who gave it — were both just runs of text at slightly different weights.
 *   So an answer is now an enclosed, tinted block that a reader can see the
 *   edges of, and a candidate is a plate with their own border inside it. Both
 *   become objects you can count at a glance rather than sentences to read.
 *
 *   Names in full, never the surname. This page names the same handful of
 *   people thirty times over, which is the usual argument for cutting them
 *   down — but a surname is exactly what fails when the field is unfamiliar,
 *   and it fails worst on the names most likely to be misread ("Walied
 *   Khogali Ali" is not "Ali", and "Peter De Marco" is not "Marco").
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

  return (
    /* A column rather than a grid, so the "did not answer" foot can take
       `mt-auto` and sit on the bottom edge. Cards in a row stretch to the
       tallest of them, and with the foot floating directly under whatever
       content each card happened to have, the same line landed at a different
       height in every card — the one piece of every card that says the same
       thing was the piece a reader could never find twice in the same place. */
    <article className="flex flex-col gap-4 border border-border-light p-6 md:p-7">
      <h3
        id={headingId}
        className="scroll-mt-24 font-sans font-medium leading-[1.2] tracking-[-0.025em] text-[1.45rem] text-dark text-pretty"
      >
        {question.question}
      </h3>

      {empty ? (
        <p className="type-caption text-text-muted">
          No answers to this one yet.
        </p>
      ) : (
        <ul className="grid list-none gap-3 m-0 p-0">
          {groups.map((group) => (
            <AnswerPanel
              key={group.option}
              color={hue(group.option)}
              label={group.label}
              detail={group.detail}
              candidates={group.candidates}
              seats={seats}
              notes={notes}
              yourKey={yourKey}
            />
          ))}

          {/* On no option, because none of them fit what they wrote. Their own
              words are the whole of what they said here, so they are printed
              rather than summarised away. */}
          {verbatim.length > 0 && (
            <AnswerPanel
              color={EMPTY}
              label="In their own words"
              muted
              candidates={verbatim}
              seats={seats}
              notes={notes}
              yourKey={yourKey}
            />
          )}
        </ul>
      )}

      {/* One line, not a plate each. A ward can have ten registered candidates
          and two respondents, and a plate per silent name per question is
          three hundred cells of nothing — the grid's problem, restated. Named
          all the same, on every question: a reader deciding how to vote is
          owed the fact that their ballot line said nothing.

          Unless nobody answered anything, which `nameTheSilent` turns off.
          Then the line is the whole ballot, thirty times over, and it says
          nothing the "No answers to this one yet." above it did not — the
          roster at the top of the section is where those names belong. */}
      {unanswered.length > 0 && (
        <p className="type-caption mt-auto border-t border-border-light pt-3 text-text-muted text-pretty">
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
  /** how the seat prints on a plate — "Ward 9". Mayoral candidates carry
   *  none: the run they sit in is already headed "For mayor". */
  label?: string;
};

/* One answer, enclosed, with everyone who gave it inside it.
 *
 * The tint is the option's own hue at 7% — enough for the block to have an
 * inside and an outside at a glance, light enough that the names on top of it
 * are still the darkest thing in the card. */
function AnswerPanel({
  color,
  label,
  detail,
  candidates,
  seats,
  notes = true,
  yourKey,
  muted = false,
}: {
  color: string;
  label: string;
  detail?: string | null;
  candidates: (RollCallName & { answer?: string })[];
  seats?: Record<string, Seat>;
  notes?: boolean;
  yourKey?: string;
  /** the "own words" panel, which is a caveat rather than an option */
  muted?: boolean;
}) {
  /* The reader comes out of the run and sits above it.

     Filed by surname among the candidates, "You" is one plate in a line of a
     dozen, and the reader has to scan every panel on the card to find out
     which one they are in — on a page whose entire question is "where am I",
     that is the one thing that should never need looking for. Lifted to the
     top of the block it is the first thing under the answer, in the same
     place in every panel, so the panel a reader belongs to announces itself
     before they read a single name. */
  const you = yourKey
    ? candidates.find((candidate) => candidate.key === yourKey)
    : undefined;
  const field = you
    ? candidates.filter((candidate) => candidate.key !== yourKey)
    : candidates;

  /* Mayor first — one seat, and the race the whole city votes in. Both runs
     keep the surname order they arrived in. */
  const races = (["mayor", "councillor"] as const)
    .map(
      (race) =>
        [
          race,
          field.filter((candidate) => seats?.[candidate.key]?.race === race),
        ] as const,
    )
    .filter(([, named]) => named.length > 0);

  return (
    <li
      className="grid gap-2.5 border-l-[3px] p-3.5 pl-4"
      style={{
        borderColor: color,
        background: `color-mix(in oklab, ${color} 8%, transparent)`,
      }}
    >
      {/* The answer as it was put to the candidates, in full.

          The questionnaire gives most options a short handle and the real
          wording underneath — "Public delivery" over "Build or finance
          substantially more affordable and supportive housing" — and this
          panel used to title itself with the handle and print the wording as
          a caption below. That is a summary of the answer standing where the
          answer should be, and on a page whose whole job is what a candidate
          said, the reader gets the sentence they actually endorsed. Options
          with no expansion ("Yes") are already their own full wording.

          Set like a title all the same: the biggest thing inside the block,
          in serif rather than the question's sans, so the two read as heading
          and sub-heading instead of competing at one size. */}
      <p
        className={`leading-[1.25] text-pretty ${
          muted
            ? "type-label-sm text-text-muted"
            : "font-serif text-[1.28rem] font-medium tracking-[-0.015em] text-dark"
        }`}
      >
        {detail || label}
      </p>

      {/* BY RACE, WHERE THERE IS MORE THAN ONE

          A ward panel is one run of plates: everyone in it is running for the
          same seat, so a heading over them would say what the page says. The
          city-wide page puts thirty-odd plates in a panel drawn from two
          ballot lines a voter holds separately — the mayor they get one vote
          for, and the councillor they get one vote for — and undivided, the
          two are a single wall of names in which the handful that matter to
          any one reader are hidden. Split, a panel answers "did the mayoral
          field agree with my councillor" without being read end to end.

          Only where both races are actually present: a panel that happens to
          be all councillors gets no heading, because a heading over the whole
          of something is not a division. */}
      {you && (
        <Plates
          candidates={[you]}
          seats={seats}
          notes={notes}
          color={color}
          yourKey={yourKey}
        />
      )}

      {races.length > 1 ? (
        <div className="grid gap-2.5">
          {races.map(([race, named]) => (
            <div key={race} className="grid gap-1.5">
              <p className="type-label-sm text-text-muted">
                {race === "mayor" ? "For mayor" : "For council"}
              </p>
              <Plates
                candidates={named}
                seats={seats}
                notes={notes}
                color={color}
                yourKey={yourKey}
              />
            </div>
          ))}
        </div>
      ) : (
        field.length > 0 && (
          <Plates
            candidates={field}
            seats={seats}
            notes={notes}
            color={color}
            yourKey={yourKey}
          />
        )
      )}
    </li>
  );
}

/* One run of candidates.
 *
 * Not a row of plates and a stack of notes under it: split in two, a candidate
 * who explained their answer got their plate printed twice, which is the
 * repetition the plates were meant to end.
 *
 * So each candidate appears once. The ones who only picked the option flow
 * inline as plates; the ones who wrote something take a line of their own,
 * with their words set underneath their plate — a plate is a label and a
 * sentence is not, and running the two along one line makes the plate read as
 * the first few words of the sentence. A candidate who took the trouble to
 * explain has left the most useful thing on the page, so it prints in the
 * open: a note behind a disclosure is a note nobody reads. */
function Plates({
  candidates,
  seats,
  notes,
  color,
  yourKey,
}: {
  candidates: (RollCallName & { answer?: string })[];
  seats?: Record<string, Seat>;
  notes: boolean;
  color: string;
  yourKey?: string;
}) {
  return (
    <ul className="flex list-none flex-wrap items-baseline gap-1.5 m-0 p-0">
      {candidates.map((candidate) => {
        const note = notes ? candidate.note : null;
        const words = candidate.answer || note;
        return (
          <li key={candidate.key} className={words ? "basis-full" : ""}>
            <NamePlate
              name={candidate.name}
              seat={seats?.[candidate.key]?.label}
              color={color}
              you={candidate.key === yourKey}
            />
            {words && (
              <p className="mt-1.5 font-serif text-[1.02rem] leading-[1.5] text-text-secondary text-pretty">
                {candidate.answer && <>&ldquo;{candidate.answer}&rdquo;</>}
                {candidate.answer && note && " "}
                {note}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* A candidate, as an object rather than a word: their own border on the card's
   own background, so a name lifts off the tinted panel behind it. */
function NamePlate({
  name,
  seat,
  color,
  you = false,
}: {
  name: string;
  seat?: string;
  color: string;
  /** the reader's own plate — filled in the option's hue rather than outlined
   *  in it, so the one plate they are looking for is the one plate that is a
   *  solid block of colour in a panel of outlines. */
  you?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 align-middle font-sans text-[0.9rem] leading-none tracking-[-0.01em] ${
        you ? "font-semibold text-bg" : "bg-bg font-medium text-dark"
      }`}
      style={
        you
          ? { background: color, borderColor: color }
          : { borderColor: `color-mix(in oklab, ${color} 45%, transparent)` }
      }
    >
      <span
        className="size-1.5 flex-none rounded-full"
        style={{ background: you ? "var(--color-bg)" : color }}
        aria-hidden="true"
      />
      {name}
      {seat && (
        <span className="font-normal text-text-muted">{seat}</span>
      )}
    </span>
  );
}
