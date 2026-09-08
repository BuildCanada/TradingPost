import { CandidateName } from "./SurveyGrid";
import type { GridCandidate } from "./SurveyGrid";
import { lastName } from "@/lib/elections/names";

/* The ballot, in full, once.
 *
 * Respondents first and the rest under them, because "answered" and "did not"
 * is the most useful sort available here — it is the difference between a name
 * and a position — and it is the same split `surveyRoster` already applies. */
export function CandidateRoster({
  respondents,
  silent,
  election,
  race,
  ward,
  wardName,
  respondentsLabel = "Answered our questionnaire",
  silentLabel = "Also on the ballot, yet to answer our questionnaire",
}: {
  respondents: GridCandidate[];
  silent: GridCandidate[];
  election: string;
  race: "mayor" | "councillor" | "trustee";
  ward?: string;
  wardName?: string;
  /** what the first list is. The split into answered and not is the useful
   *  one on a ward page, where both halves are a handful of names — but a page
   *  that hands over the whole ballot in one list needs to say so, rather than
   *  labelling fifty-three candidates as the nine who wrote back. */
  respondentsLabel?: string;
  silentLabel?: string;
}) {
  /* Surname order within each half. The clerk's order is a filing order, and
     a reader checking whether their own councillor answered needs somewhere
     to look — the same sort the cards use, so the two agree. */
  const bySurname = (a: GridCandidate, b: GridCandidate) =>
    lastName(a.name).localeCompare(lastName(b.name)) ||
    a.name.localeCompare(b.name);

  /* One list shape for both halves. They were a three-column grid and a
     wrapped row, which made two lists of the same thing look like two
     different kinds of thing — and the grid left a four-name field as one
     short row and two empty columns. A run of names with separators is what
     this is: a list of candidates. */
  const list = (candidates: GridCandidate[]) => (
    <ul className="flex list-none flex-wrap items-baseline gap-x-4 gap-y-2 m-0 p-0">
      {candidates.map((candidate, i) => (
        <li key={candidate.key} className="flex items-baseline gap-4">
          {i > 0 && (
            <span className="text-border-light" aria-hidden="true">
              &middot;
            </span>
          )}
          <CandidateName
            candidate={candidate}
            election={election}
            race={race}
            ward={ward}
            wardName={wardName}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="grid gap-5">
      {respondents.length > 0 && (
        <div className="grid gap-2.5">
          <p className="type-label-sm text-text-muted">{respondentsLabel}</p>
          {list([...respondents].sort(bySurname))}
        </div>
      )}

      {silent.length > 0 && (
        <div className="grid gap-2.5">
          <p className="type-label-sm text-text-muted">{silentLabel}</p>
          {list([...silent].sort(bySurname))}
        </div>
      )}
    </div>
  );
}
