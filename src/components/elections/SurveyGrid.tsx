"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

import { WedgeGlyph, palette } from "@/components/charts/trilemma";
import { AnswerChart, isDial, sharedRadius } from "./AnswerChart";
import { CandidateSiteLink } from "./CandidateSiteLink";
import { lastName } from "@/lib/elections/names";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  AnswerCell,
  ComparedGroup,
  ComparedQuestion,
} from "@/lib/elections/candidate-answers";

/* A ward's questionnaire, read across: one row per question, one column per
 * candidate.
 *
 * WHY NOT PER CANDIDATE
 *   The answers used to live on each candidate's card, in full — the question,
 *   the option they picked, every alternative in its own wording, a dial of the
 *   field's split, their note. That is the right shape for one candidate and it
 *   does not survive being repeated: one respondent ran a ward page to nineteen
 *   screens, and a ward with four would have run to sixty. Worse, the thing a
 *   voter is on the page to do — hold two candidates against each other on a
 *   question — meant scrolling between cards a screen apart and remembering
 *   what the first one said.
 *
 *   Read across, the comparison is the layout. Two candidates who agree show
 *   as the same glyph in the same colour side by side; a row of three different
 *   colours is a question the ward is split on, visible without reading a word
 *   of it.
 *
 * WHAT A CLOSED ROW SHOWS
 *   The question, and each candidate's pick as its wedge glyph and the head of
 *   the option's wording. Not the full option — a row has a column's width for
 *   it, and "Permit substantially more housing as-of-right in every ward" does
 *   not go there. The head is enough to tell the options apart, and the full
 *   wording is one click away, which is where the option list, the field's
 *   chart and the candidates' own notes are too.
 *
 *   Nothing is hidden by default: every question on the questionnaire is a row
 *   on the page, answered or not. An empty cell is a finding.
 *
 * ON A PHONE
 *   There is no width for a column per candidate, and a table that scrolls
 *   sideways puts the answers off screen behind the questions — the one thing
 *   the reader came for. So the row stops being a row: the question, then a
 *   line per candidate, each naming who it belongs to. The comparison survives
 *   because the answers are still gathered under their question; only the
 *   direction changes.
 *
 * COLOUR
 *   Option position, from the chart palette's corner hues — the first option is
 *   the same colour on all thirty-odd questions, and the same colour it has on
 *   the survey page's charts. That is what lets a column be scanned for
 *   "always the first option" without reading the labels.
 */

/** A column of the grid: one candidate on the ballot, answered or not. */
export type GridCandidate = {
  key: string;
  name: string;
  website?: string;
};

export function SurveyGrid({
  groups,
  candidates,
  election,
  race = "councillor",
  ward,
  wardName,
  yourKey,
}: {
  groups: ComparedGroup[];
  /** every candidate on this ballot, in the order the clerk lists them —
   *  not only the ones who wrote back */
  candidates: GridCandidate[];
  /** York Factory election slug, for the outbound-link tracking */
  election: string;
  /** which ballot line these candidates are on, for the same tracking */
  race?: "mayor" | "councillor" | "trustee";
  /** the ward, where the race has one — a mayoral field does not */
  ward?: string;
  wardName?: string;
  /**
   * The column that is the reader's own, where the grid has one. It is a
   * column like any other to look at, and no part of any count: the tallies
   * under each question are how the ward's candidates answered, and folding
   * the reader into them would have them agreeing with themselves.
   */
  yourKey?: string;
}) {
  /* The column heads are as tall as the longest name plus its link, which is
     not a number this component can know: it depends on the names, the column
     width and the reader's font size. The section titles park directly under
     the heads, so the offset they stick at is measured rather than guessed —
     a hardcoded height was fine when a head was a name on two short lines and
     is not fine now that it carries a full name and a campaign link. */
  const head = useRef<HTMLDivElement>(null);
  const [headHeight, setHeadHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = head.current;
    if (!el) return;
    const measure = () => setHeadHeight(el.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const questions = groups.flatMap((group) => group.questions);

  /* The columns by key, so a stacked answer can name its candidate the way
     the column heads do — in full, and linked where there is a campaign site.
     A phone has no heads to carry that, and a surname on its own was the one
     place the two layouts said different things about the same candidate. */
  const roster = new Map(candidates.map((candidate) => [candidate.key, candidate]));

  /* Who wrote back. Every question's cells carry it, and they all agree — the
     first question is as good a witness as any. */
  const responded = new Set(
    questions[0]?.cells.filter((cell) => cell.responded).map((cell) => cell.key),
  );
  // One radius for every dial behind every row, so the expanded charts stay
  // comparable with each other and with the ones on the survey page.
  const radius = sharedRadius(questions);

  /* Columns: the question takes the room it needs to stay readable and the
     candidates split what is left evenly, down to a floor.

     The floor is what makes this scroll sideways, and it is not optional now
     that the columns are the whole ballot rather than the handful who wrote
     back: a Toronto ward runs to a dozen registered candidates, and twelve
     columns sharing a laptop's width are 80px each — a column too narrow to
     print a surname, let alone an answer. Better to hold every column at a
     readable width and let the reader drag.

     230px a candidate, which is about 30 characters of the answer type: a
     column that breaks a two-word option over two lines is still squeezed,
     and the reader is dragging either way — the only thing a tighter floor
     buys is a couple of extra columns on screen, each of them harder to
     read.

     The ceiling stays too: it keeps a ward of one respondent from setting its
     single column adrift at the right-hand edge of a very wide page — the grid
     grows with the number of candidates rather than with the window. */
  const columns = `minmax(0,1.6fr) repeat(${candidates.length}, minmax(0,1fr))`;

  /* The widths and the pinning offset ride on custom properties so the
     breakpoint can decide whether they apply at all: below `md` the grid is
     not a grid — the answers stack and name their own candidate — so a floor
     meant for columns would only push the page off the side of the screen. */
  const vars = {
    "--cols": columns,
    "--grid-min": `${368 + candidates.length * 230}px`,
    "--grid-max": `${640 + candidates.length * 260}px`,
    /* Where the section titles park: the measured height of the head row, or
       nothing at all before the first measurement and on a phone, where the
       heads are not rendered and nothing sticks. */
    "--head-h": headHeight === null ? "0px" : `${headHeight}px`,
  } as CSSProperties;

  return (
    /* A scroll region of its own on wide screens. It is what carries the
       sideways scroll the column floor forces, and it is also the only thing
       the heads and section titles can pin to: `position: sticky` resolves
       against the nearest scrolling ancestor, and an `overflow-x` on its own
       would make this that ancestor anyway — the axes cannot be separated.
       Capped just under the viewport so the pinned rows sit at the top of the
       box while the questions run under them. Below `md` the grid is not a
       grid, every answer names its own candidate, and the cap, the floor and
       the scrolling all go away. */
    /* `min-w-0` matters as much as the overflow does: as a grid or flex item —
       which is how the survey page's results place it — this box would
       otherwise be sized to its own content's minimum, which is the whole
       twelve-thousand-pixel width of the columns. It would then push its
       parent wide instead of scrolling inside it, and the scrollbar this box
       exists for would never appear. */
    <div
      className="min-w-0 max-w-full md:max-h-[calc(100vh-6rem)] md:overflow-auto"
      style={vars}
    >
      <div className="md:[max-width:var(--grid-max)] md:[min-width:var(--grid-min)]">
        {/* What a phone gets instead of column heads.

            Stacked, there are no columns to head, and for a while that meant
            the ballot appeared on a phone only as surnames scattered through
            thirty questions: no full names, no campaign links, and no way to
            see who is running without reading the whole questionnaire. So the
            roster is printed once, at the top, in the order the columns take —
            answered first, then the rest — with the same names and the same
            links the heads carry. */}
        <ul className="grid list-none gap-2 border-b-2 border-dark pb-4 m-0 p-0 md:hidden">
          {candidates.map((candidate) => (
            <li
              key={candidate.key}
              className="flex items-baseline justify-between gap-3"
            >
              <CandidateName
                candidate={candidate}
                election={election}
                race={race}
                ward={ward}
                wardName={wardName}
              />
              <span className="type-caption flex-none text-text-muted">
                {responded.has(candidate.key) ? "Answered" : "Did not respond"}
              </span>
            </li>
          ))}
        </ul>

        {/* The column heads, once, at the top of the grid and pinned there.
            They were repeated per section on the reasoning that a reader
            arriving in the middle of a page needs to know whose column is
            whose — which is true, and is the job of a sticky header rather
            than of five copies of one. */}
        <div
          ref={head}
          className="hidden items-end gap-x-4 gap-y-1 border-b border-dark bg-bg pt-1 pb-2 md:sticky md:top-0 md:z-20 md:grid md:[grid-template-columns:var(--cols)]"
        >
          {/* The question column pins to the left edge as well as the top, so
              the corner cell has to sit above its own row's other cells —
              which come after it in the DOM and would otherwise paint over
              it — while the row as a whole stays above the grid. It fills the
              row's height and steps out into the column gutter for the same
              reason the question cells below it do: the names are two lines
              deep and were sliding past above a label one line tall. */}
          <span className="type-label-sm flex items-end bg-bg text-text-muted md:sticky md:left-0 md:z-[1] md:-mr-4 md:h-full md:pr-4">
            Question
          </span>
          {candidates.map((candidate) => (
            <span key={candidate.key} className="grid gap-0.5">
              <CandidateName
                candidate={candidate}
                election={election}
                race={race}
                ward={ward}
                wardName={wardName}
              />
            </span>
          ))}
        </div>

        {groups.map((group) => (
          <section key={group.stepId} className="mt-10 first:mt-3 last:mb-0">
            {/* The section rule needs air on both sides of the title: above it
                so the heavy line reads as the start of a section rather than
                as the bottom of the last row of the previous one, and below it
                so the title is not sitting on the first question's hairline.

                It sticks under the column heads, so a reader thirty rows into
                a section can still see which part of the questionnaire they
                are in — the same argument that pinned the names. The air above
                it is margin rather than padding on purpose: the rule is the
                element's own top edge, so when the title parks under the heads
                there is no transparent band for rows to show through. */}
            <h4 className="border-t-2 border-dark bg-bg pt-3.5 pb-2.5 font-sans font-medium leading-[1.15] tracking-[-0.025em] text-[clamp(1.3rem,2vw,1.6rem)] text-dark md:sticky md:top-[var(--head-h)] md:z-10">
              {/* The heading is as wide as the grid, so its background covers
                  the row however far it is scrolled; the words themselves ride
                  the left edge, where the question column is. */}
              <span className="md:sticky md:left-0 md:inline-block">
                {group.stepTitle}
              </span>
            </h4>

            {group.questions.map((question) => (
              <QuestionRow
                key={question.questionId}
                question={question}
                radius={radius}
                roster={roster}
                yourKey={yourKey}
                election={election}
                race={race}
                ward={ward}
                wardName={wardName}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * A candidate's name, and where they have a campaign site the name is the way
 * to it — a name is what a reader is looking for and what they will click, and
 * "Campaign site" on a line of its own spent a second line of a narrow column
 * saying so. The arrow is the whole tell that a name is a link, so it only
 * appears where there is somewhere to go.
 *
 * Shared by the column heads and the roster a phone gets instead of them, so
 * the two cannot drift apart.
 */
function CandidateName({
  candidate,
  election,
  race,
  ward,
  wardName,
}: {
  candidate: GridCandidate;
  election: string;
  race: "mayor" | "councillor" | "trustee";
  ward?: string;
  wardName?: string;
}) {
  const type =
    "font-sans text-[1rem] font-medium leading-[1.15] tracking-[-0.015em] text-dark text-balance";

  if (!candidate.website) return <span className={type}>{candidate.name}</span>;

  return (
    <CandidateSiteLink
      href={candidate.website}
      candidate={candidate.name}
      candidateKey={candidate.key}
      election={election}
      race={race}
      ward={ward}
      wardName={wardName}
      className={`group/site transition-colors hover:text-accent ${type}`}
    >
      {candidate.name}
      <ArrowUpRight className="ml-1 inline size-3 align-[1px] transition-transform group-hover/site:translate-x-0.5 group-hover/site:-translate-y-0.5" />
    </CandidateSiteLink>
  );
}

function QuestionRow({
  question,
  radius,
  roster,
  yourKey,
  election,
  race,
  ward,
  wardName,
}: {
  question: ComparedQuestion;
  radius?: number;
  /** the columns by key, for the names a phone prints beside each answer */
  roster: Map<string, GridCandidate>;
  /** the reader's own column, kept out of the counts */
  yourKey?: string;
  election: string;
  race: "mayor" | "councillor" | "trustee";
  ward?: string;
  wardName?: string;
}) {
  const full = palette(question.options.length);

  return (
    <Collapsible className="border-t border-border-light">
      {/* The whole row is the control, so a reader does not have to find a
          disclosure arrow in a grid of thirty-odd of them. */}
      <CollapsibleTrigger className="group flex w-full flex-col items-start gap-5 py-3 text-left transition-colors md:grid md:items-start md:gap-x-4 md:gap-y-0 md:[grid-template-columns:var(--cols)]">
        {/* Pinned to the left edge: a reader dragging sideways to reach the
            twelfth candidate is doing it to read that candidate's answer to a
            particular question, and an answer whose question has scrolled off
            the screen is an answer to nothing. Opaque, so the answers pass
            underneath it, and it carries the row's hover state itself — a
            sticky cell has its own background and would otherwise stay
            unhighlighted while the rest of its row lit up — which is why the
            row no longer fills on hover at all: the mark of the pointer is on
            the question itself, where the disclosure arrow already is.

            Full height and a step out into the column gap, because the cover
            has to be the size of what it covers: sized to its own text, the
            pinned cell let the taller answers beside it slide past above and
            below the question, and the 1rem gutter let a sliver through. */}
        <span className="flex w-full items-start gap-2 bg-bg pr-4 md:sticky md:left-0 md:z-[1] md:-mr-4 md:h-full">
          <ChevronDown
            className="mt-[3px] size-3.5 flex-none text-text-muted transition-[transform,color] group-hover:text-accent group-data-[panel-open]:rotate-180"
            aria-hidden="true"
          />
          {/* The question is set exactly as the answers beside it — same
              family, size, weight and measure. A row is one sentence and the
              replies to it, and typing the question in serif at a smaller size
              made it read as a caption for its own answers rather than as the
              first cell of the row. */}
          <span className="font-sans text-[1.2rem] font-medium leading-[1.3] tracking-[-0.015em] text-dark text-pretty transition-colors group-hover:text-accent">
            {question.question}
          </span>
        </span>

        {/* On a phone a candidate who never wrote back is dropped from every
            question rather than repeating "Did not respond" down thirty rows
            of a single column — the roster at the top of the grid has already
            said so once, which is the right number of times. `contents` keeps
            the wrapper out of the grid's way where the columns do exist. */}
        {question.cells.map((cell) => (
          <span
            key={cell.key}
            className={cell.responded ? "contents" : "hidden md:contents"}
          >
            <Cell
              cell={cell}
              colors={full}
              candidate={roster.get(cell.key)}
              election={election}
              race={race}
              ward={ward}
              wardName={wardName}
            />
          </span>
        ))}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <QuestionDetail
          question={question}
          radius={radius}
          yourKey={yourKey}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * One candidate's answer to one question, at row width: the option's wedge,
 * the head of its wording, and whatever they wrote about it.
 *
 * The note goes in the column, under the answer it is about, rather than
 * waiting behind the row's disclosure. It is the part of a questionnaire a
 * candidate actually wrote, and a reader comparing three candidates on a
 * question wants the three sentences side by side — which is exactly what a
 * grid is for, and exactly what a disclosure per row prevents. Everything a
 * candidate wrote prints in full — the option they picked, any answer in
 * their own wording, and the note — because a truncated answer is a different
 * answer. A long note makes its row taller; that is the cost of printing what
 * was said, and it is the right one.
 *
 * The name rides along, hidden wherever the column heads carry it. Stacked on a
 * phone there are no heads, and an answer that does not say whose it is on a
 * page comparing several candidates is worse than no answer.
 */
function Cell({
  cell,
  colors,
  candidate,
  election,
  race,
  ward,
  wardName,
}: {
  cell: AnswerCell;
  colors: string[];
  /** their column, for the name a phone prints above the answer */
  candidate?: GridCandidate;
  election: string;
  race: "mayor" | "councillor" | "trustee";
  ward?: string;
  wardName?: string;
}) {
  const answer = cell.answer;

  /* Stacked on a phone the name leads its own line rather than sharing a
     baseline with the answer: an option runs to a sentence, and a name tucked
     in front of one reads as the first words of it. It is the same name the
     column heads print — in full, and linked to their campaign site where they
     have one — because a reader on a phone is owed what a reader on a laptop
     gets. Above `md` the heads carry it and this is not rendered at all. */
  const name = (
    <span className="md:hidden">
      {candidate ? (
        <CandidateName
          candidate={candidate}
          election={election}
          race={race}
          ward={ward}
          wardName={wardName}
        />
      ) : (
        <span className="type-caption text-text-muted">
          {lastName(cell.candidateName)}
        </span>
      )}
    </span>
  );

  /* Answers sit under their question on a phone, indented and ruled, so a
     screen of them reads as replies to the question above rather than as more
     questions. In the grid the columns do that job and the rule would only be
     a line down the middle of a row.

     They also stand well apart from each other. Stacked, the only thing
     separating one candidate's answer from the next is white space, and at a
     tight gap four candidates read as one long paragraph with names in it —
     the row's own gap does most of that work, and the block holds together
     because its name, option and note are closer to each other than the block
     is to its neighbours. */
  const wrap =
    "grid gap-1.5 border-l border-border-light pl-4 md:gap-1 md:border-0 md:pl-0";

  /* The answer type steps down on a phone. In the grid it matches the
     question exactly — one row, one voice — but stacked, a question and its
     answers in the same size is a wall with no way in. */
  const optionType =
    "font-sans text-[1.05rem] md:text-[1.2rem] font-medium leading-[1.3] tracking-[-0.015em]";

  /* Two different silences, and the difference matters to a voter: one
     candidate answered our questionnaire and left this question alone, the
     other never wrote back at all. The second is about them rather than about
     the question, so it says so in as many words. */
  if (!answer) {
    return (
      <span className={wrap}>
        {name}
        <span className={`${optionType} text-text-muted`}>
          {cell.responded ? "Not answered" : "Did not respond"}
        </span>
      </span>
    );
  }

  /* Their note, and — where their answer was prose of its own — the answer
     itself, which is the only wording they gave and so belongs in the column
     rather than being summarised as "in their own words". */
  const said = (
    <>
      {answer.verbatim && answer.answer && (
        <span className="font-serif italic text-[1.1rem] leading-[1.4] text-dark text-pretty">
          &ldquo;{answer.answer}&rdquo;
        </span>
      )}
      {answer.explanation && (
        <span className="font-serif italic text-[0.98rem] leading-[1.45] text-text-secondary">
          {answer.explanation}
        </span>
      )}
    </>
  );

  if (answer.choice === null) {
    return (
      <span className={wrap}>
        {name}
        <span className={`${optionType} text-text-secondary`}>
          In their own words
        </span>
        {said}
      </span>
    );
  }

  return (
    <span className={wrap}>
      {name}
      <span className="flex items-start gap-2">
        <span className="mt-[3px] flex-none">
          <WedgeGlyph
            index={answer.choice}
            count={answer.options.length}
            color={colors[answer.choice]}
          />
        </span>
        {/* The option in the wording it was offered in. It used to take the
            rim label's stub — the short form that exists so three options can
            sit around a circle — and a stub is not an answer: "Decrease after
            inflation…" and "Decrease after inflation, with some
            responsibilities transferred to civilian services" are different
            positions, and the ellipsis was standing where the difference was.
            The column wraps instead. */}
        <span className={`${optionType} text-dark text-pretty`}>
          {answer.options[answer.choice]}
        </span>
      </span>
      {said}
    </span>
  );
}

/**
 * The row opened up: the options in the wording the questionnaire offered
 * them, what each one actually says, and how many of the ward's respondents
 * picked it.
 *
 * Not a second copy of the row. It used to be one — the same candidates, the
 * same notes, the same wording, pivoted from by-candidate to by-option — which
 * was worth opening back when the row above showed a stub of the option and
 * four lines of the note. The row prints all of it now, so what is left in
 * here is the part a grid of answers cannot carry:
 *
 *   · the fine print. Several options are a headline plus a sentence of
 *     detail, and the cells have room for the headline only.
 *   · the options nobody picked. A cell can only show a position someone
 *     took; that a whole ward declined one is a finding of its own, and it
 *     only exists as an empty row in a list of every option.
 *   · the count, as a shape. Twelve cells tallied by eye against a dial that
 *     does the tallying.
 */
function QuestionDetail({
  question,
  radius,
  yourKey,
}: {
  question: ComparedQuestion;
  radius?: number;
  /** the reader's own column, which is nobody's candidate */
  yourKey?: string;
}) {
  const full = palette(question.options.length);

  /* The candidates, which on the survey page is every column but the reader's
     own. Everything below counts these and only these. */
  const field = question.cells.filter((cell) => cell.key !== yourKey);
  const answered = field.filter((cell) => cell.answer);

  /* Respondents, not candidates: nobody can pick an option on a form they did
     not fill in, and counting the silent ones in the denominator would make
     every option look less popular than the answers say it is. */
  const respondents = field.filter((cell) => cell.responded).length;

  /* The dial draws this ward on this question, not the election. It was the
     whole field's split — thirty-odd respondents — sitting beside the ward's
     four, which put two different populations a centimetre apart under one
     question and left the reader to notice that the numbers could not be
     compared. The page is a ward page: the candidates on this ballot are the
     subject, and the chart should have the same subject as everything around
     it. */
  const wardCounts = question.options.map(
    (_, i) => answered.filter((cell) => cell.answer?.choice === i).length,
  );

  return (
    /* Held to a reading width and pinned to the left edge, rather than being
       laid out across the grid.

       An opened row is a child of the grid's inner wrapper, which is as wide
       as every column put together — 12,000px on a mayoral field of fifty-odd.
       Left to fill that, an option list and a dial were stretched across a
       dozen screens of nothing, and a reader who had dragged sideways to reach
       a column found the detail they opened somewhere off to the left. It is
       one block about one question; it does not get wider because the ballot
       did. */
    <div className="grid gap-8 pb-7 pt-1 md:sticky md:left-0 md:w-[min(100%,58rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-10">
      {/* Every option in full, in the order they were offered — including the
          ones nobody took. The rule down the left carries the option's hue on
          the three-way questions, which is what ties this list to the dial
          beside it and to the wedge glyphs in the cells above; the ordered
          questions keep a neutral rule, since their options are points on a
          scale rather than three rivals. */}
      <ul className="grid content-start list-none gap-2.5 m-0 p-0">
        {question.options.map((option, i) => (
          <li
            key={option}
            className={`grid gap-1 border-l-2 pl-3 ${
              isDial(question) ? "" : "border-border-light"
            }`}
            style={isDial(question) ? { borderColor: full[i] } : undefined}
          >
            <div className="flex items-baseline gap-3">
              <span className="flex-1 font-serif text-[1rem] leading-[1.35] text-dark text-pretty">
                {option}
                {question.details[i] && (
                  <span className="text-text-secondary">
                    : {question.details[i]}
                  </span>
                )}
              </span>
              <span className="type-caption flex-none tabular-nums text-text-secondary">
                {wardCounts[i]} of {respondents}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid content-start gap-2">
        {/* The ward's split, all three thirds in their own colour: nobody's
            position is being picked out here, so muting two of them would say
            something the chart does not mean.

            Counts rather than shares. A ward has two to six respondents, and
            "50%" of four people is a statistic with nothing behind it — the
            same reason the list beside it prints "2 of 4". */}
        <AnswerChart
          shape={question}
          counts={wardCounts}
          choice={null}
          colors={full}
          valueColors={full}
          fieldSize={respondents}
          radius={radius}
          valueFormat={(n) => `${n}`}
          ariaLabel={`${question.question} — how the ward's ${respondents} responding candidates answered: ${question.options
            .map((option, i) => `${option} ${wardCounts[i]}`)
            .join(", ")}`}
        />
        <p className="type-caption text-center text-text-secondary text-pretty">
          Candidates in this ward who picked each option, out of the{" "}
          {respondents} who returned the questionnaire
        </p>
      </div>
    </div>
  );
}
