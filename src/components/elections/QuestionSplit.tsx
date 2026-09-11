import { rollCall } from "@/lib/elections/candidate-answers";
import { EMPTY, optionColors } from "@/lib/elections/option-colors";
import { QuestionSplitFigure } from "./QuestionSplitFigure";
import type { SplitSlice } from "./QuestionSplitFigure";
import type { Seat } from "./QuestionRollCall";
import type { ComparedQuestion } from "@/lib/elections/candidate-answers";

/* One question as a card, read as a share of the field rather than a roll call.
 *
 * WHY THIS EXISTS ALONGSIDE QuestionRollCall
 *   The two cards answer different questions, and which one a page wants is
 *   decided by the size of its field. A ward runs four or five candidates: the
 *   names ARE the answer, because the reader is choosing between those people
 *   and there is room to print what each of them said. /issues puts the same
 *   questionnaire to the whole city — thirty-odd names under every one of two
 *   dozen questions, filed into three or four blocks. Printed as plates that
 *   is several hundred names on one page, and the reader cannot see the thing
 *   the page exists to show (where the field agrees, and where it splits)
 *   through them.
 *
 *   So this card prints the split and not the field: a single 100% band of who
 *   picked what — the charts package's OptionBar — with the options in full
 *   under it. A question the field agrees on is one colour, a question it is
 *   torn on is a divided band, and both read without a word.
 *
 * NO DENOMINATOR PRINTED
 *   The card used to carry a line at its foot saying how many candidates had
 *   answered this particular question — the figure every percentage above is
 *   taken against, which is not the same from card to card. It is off the
 *   card now, and not lost with it: the legend prints a count beside every
 *   option, so a reader who wants the denominator can add them, and one who
 *   only wants the shape of the split is not made to read a sentence of
 *   bookkeeping under all thirty-three cards to get it.
 *
 * THE NAMES ARE STILL HERE
 *   Behind the legend rows, one option at a time — see QuestionSplitFigure.
 *   Hidden, they stop crowding out the split; reachable, the reader can still
 *   check who is in a segment, which is the difference between a chart and a
 *   chart you have to take on trust. Each name carries the seat it is running
 *   for, because a name on a city-wide page is only useful once the reader
 *   knows whether it is on their ballot. What they WROTE stays on the ward and
 *   mayoral pages: a note is a paragraph, and a panel of thirty paragraphs is
 *   the page this card was drawn to get away from.
 *
 * COLOUR
 *   The same ramps as everywhere else in the tracker (lib/elections/
 *   option-colors), handed to OptionBar rather than left to the charts
 *   package's own palette — so an option sits at the same hue here as on the
 *   ward page a reader came from. Nothing else in this card carries meaning by
 *   colour, which is what lets the band use all of it.
 */

export function QuestionSplit({
  question,
  seats,
  headingId,
}: {
  question: ComparedQuestion;
  /** the seat each candidate is running for, keyed by candidate key — printed
   *  beside their name in the panel behind a segment. */
  seats?: Record<string, Seat>;
  /** the id the scroll rail scrolls to — see QuestionRollCall */
  headingId?: string;
}) {
  const { groups, verbatim } = rollCall(question);

  const colors = optionColors(question.options.length, question.ordinal);

  const named = (candidate: { key: string; name: string }) => ({
    key: candidate.key,
    name: candidate.name,
    /* Mayoral candidates carry no label of their own — a ward number is the
       thing that tells a reader whether a name is on their ballot, and "For
       mayor" has to be spelled out rather than left blank beside it. */
    seat: seats?.[candidate.key]
      ? (seats[candidate.key].label ?? "For mayor")
      : undefined,
  });

  const slices: SplitSlice[] = groups.map((group) => ({
    key: String(group.option),
    /* The wording the candidates were shown, where the option has one. The
       handle over it ("Public delivery") is a summary standing where the
       answer should be. */
    label: group.detail || group.label,
    color: colors[group.option] ?? EMPTY,
    names: group.candidates.map(named),
  }));

  /* Answers that matched no option are part of the field and so part of the
     band — left out, every share on the card would be computed against a
     denominator the card does not show. Drawn in the neutral, because they are
     not a position the field took, they are the absence of one. */
  if (verbatim.length > 0) {
    slices.push({
      key: "verbatim",
      label: "Answered in their own words",
      color: EMPTY,
      names: verbatim.map(named),
    });
  }

  const answered = slices.reduce((n, slice) => n + slice.names.length, 0);

  return (
    <article className="flex flex-col gap-4 border border-border-light p-6 md:p-7">
      <h3
        id={headingId}
        className="scroll-mt-24 font-sans font-medium leading-[1.2] tracking-[-0.025em] text-[1.45rem] text-dark text-pretty"
      >
        {question.question}
      </h3>

      {answered === 0 ? (
        <p className="type-caption text-text-muted">
          No answers to this one yet.
        </p>
      ) : (
        <QuestionSplitFigure
          slices={slices}
          total={answered}
          question={question.question}
        />
      )}

    </article>
  );
}
