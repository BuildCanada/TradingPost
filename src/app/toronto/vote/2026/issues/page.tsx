import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  QuestionnaireCards,
  questionnaireHeadings,
} from "@/components/elections/QuestionnaireCards";
import { QuestionnaireRail } from "@/components/elections/QuestionnaireRail";
import { SurveyCta } from "@/components/elections/SurveyCta";
import { ANSWERS_WITHHELD, surveyHref } from "@/lib/elections/registry";
import CountdownDays from "@/components/elections/CountdownDays";
import { fieldSentiment } from "@/lib/elections/field-sentiment";
import {
  candidateAnswers,
  comparedQuestions,
  questionnaireShape,
} from "@/lib/elections/candidate-answers";
import {
  CANDIDATE_QUESTIONNAIRE_SLUG,
  fetchCandidateResponses,
} from "@/lib/elections/candidate-responses";
import { fetchSurvey } from "@/lib/elections/survey";
import { daysUntil } from "@/lib/elections/dates";
import { ELECTION } from "../data";

/* Where the field stands, across every issue we asked about.
 *
 * The ward pages and the mayoral page each show one ballot's answers as a
 * grid. This page shows all of them at once, and drops the grid to do it:
 * thirty-two respondents will not fit as columns, and the city-wide question
 * is not "what did this candidate say" anyway. It is where the people running
 * to govern Toronto converge, and where they split.
 *
 * A card per question, and on this page the card is a band: how the
 * field divided, with the options in full under it. The ward and mayoral pages name
 * names under each answer, because four or five candidates under a question is
 * the comparison their reader came for. Here the same form put thirty-odd
 * names under each of two dozen questions — several hundred plates, none of
 * them a ballot line any one reader votes on, and all of them standing between
 * the reader and the split the page exists to show. The names stay on the
 * pages where a reader can act on them; this one shows the shape of the field.
 *
 * The shell around them is deliberately short. Two dozen questions is the
 * page; every band of prose above them is a band the reader scrolls past to
 * reach it, so the hero states the premise once and the stats row carries the
 * rest of what a masthead would say.
 */

export const metadata: Metadata = {
  title: "Where the candidates stand",
  description:
    "Every candidate answer to our Toronto 2026 questionnaire, read across the whole field: where the candidates agree, and where they split.",
  alternates: { canonical: `${ELECTION.basePath}/issues` },
  openGraph: {
    title: "Where the candidates stand — Toronto 2026 Election",
    description:
      "How the field answered our questionnaire, issue by issue: the consensus, and the fights.",
    type: "website",
  },
};

export default async function IssuesPage() {
  /* Unlike the ward and mayoral pages, the questionnaire is not a
     nice-to-have here — it is the entire page. A failed fetch has nothing to
     fall back to, so it renders as the empty state rather than as a roster. */
  const [survey, published] = await Promise.all([
    fetchSurvey(ELECTION.slug, CANDIDATE_QUESTIONNAIRE_SLUG).catch(() => null),
    fetchCandidateResponses(ELECTION.slug),
  ]);

  /* Held back at the top of the page rather than at each place that draws
     them — see `questionnaireHidden` in the registry. This page is nothing but
     the answers, so emptying the array empties the page; what is left is the
     masthead saying so. */
  const withheld = ELECTION.questionnaireHidden ?? false;
  const responses = withheld ? [] : published;

  /* `fieldSentiment` is still what tells us who counts as a respondent and
     what seat they are running for — it reads the responses against the
     ballot and drops anyone who returned the form without answering a policy
     question. The cards themselves come from the same pivot the ward and
     mayoral pages use, over the whole city's entries rather than one race's. */
  /* Nothing while the voter survey is closed — see `surveyClosed` in the
     registry. Named for the invitation because `survey` here is already the
     candidate questionnaire. */
  const surveyInvite = surveyHref(ELECTION);

  const field = survey ? fieldSentiment(survey, responses) : null;
  const respondents = field?.respondents ?? [];
  const mayoral = respondents.filter((r) => r.race === "mayor").length;
  const council = respondents.length - mayoral;
  const wards = new Set(respondents.filter((r) => r.ward).map((r) => r.ward))
    .size;

  /* The field the bands are drawn over, in the order `fieldSentiment` sorted it
     (surname), and the seat each of them is running for. The cards lead with
     shares rather than names, but the names are behind every slice, and a name
     on a city-wide page is only useful to a reader once they can see whether
     it is on their ballot. */
  const roster = respondents.map((r) => ({ key: r.key, name: r.name }));
  const seats = Object.fromEntries(
    respondents.map((r) => [
      r.key,
      r.ward
        ? { race: "councillor" as const, label: `Ward ${r.ward}` }
        : { race: "mayor" as const },
    ]),
  );

  const entries = survey ? candidateAnswers(survey, responses) : [];
  const groups = comparedQuestions(
    entries,
    roster,
    survey ? questionnaireShape(survey, responses) : undefined,
  );
  /* Counted off the cards rather than off the questionnaire: a question
     nobody has answered yet draws no card, and a stats row that claims one
     more question than the page shows is a stats row a reader can catch. */
  const questionCount = groups.reduce(
    (n, group) => n + group.questions.length,
    0,
  );

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="px-6 md:px-14 py-4 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5">
          <Link
            href={ELECTION.basePath}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            Toronto 2026
          </Link>
          <span className="text-border-light">/</span>
          <span>Where they stand</span>
        </div>

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="px-6 py-8 md:px-14 md:py-10 border-b-2 border-dark">
          <p className="type-label text-accent mb-3.5">The whole field</p>
          <h1 className="font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2.25rem,4.5vw,3.75rem)] max-w-[17ch] text-balance mb-4">
            Where the candidates stand
          </h1>
          <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[58ch] text-pretty">
            {withheld ? (
              <>
                {ANSWERS_WITHHELD} This page reads the whole field&rsquo;s
                answers across every issue we asked about.
              </>
            ) : (
              <>
                The same {questionCount} questions, put to everyone running for
                mayor and for council. Read across the whole field, the answers
                show what no single ballot can: what Toronto&rsquo;s next
                council already agrees on, and what it will spend four years
                fighting over.
              </>
            )}
          </p>
        </section>

        {/* ── Key stats ──────────────────────────────────────── */}
        {/* Every one of these four counts the answers, so with them withheld
            the row is four zeros — a page-wide claim that nobody answered
            anything. It goes rather than lies. */}
        {!withheld && (
          <section className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-dark">
            <Stat value={respondents.length} label="Candidates answered" />
            <Stat value={questionCount} label="Policy questions" />
            <Stat
              value={`${mayoral} / ${council}`}
              label="Mayoral / council"
              small
            />
            <Stat value={wards} label="Wards represented" last />
          </section>
        )}

        {/* ── The field, question by question ────────────────── */}
        {groups.length > 0 && respondents.length > 0 ? (
          <section className="px-6 md:px-14 py-9 md:py-11 border-b-2 border-dark">
            {/* No roster above the cards, unlike the ward and mayoral pages.
                Theirs names one ballot line and links each candidate to their
                campaign; this page's field is thirty-odd people across a
                mayoral race and two dozen wards, and a flat list of them is a
                list with no ballot behind it. The links out at the foot of the
                page are the pointer instead. */}
            <QuestionnaireRail headings={questionnaireHeadings(groups)}>
              <QuestionnaireCards
                groups={groups}
                respondents={roster}
                silent={[]}
                chart
                seats={seats}
                answerNote={
                  <>
                    Each segment is the share of the candidates who answered
                    that particular question who gave that answer. Options
                    nobody picked are not shown. Select an answer to see which
                    candidates gave it; what they wrote about it is on the{" "}
                    <span className="text-dark">mayoral</span> and{" "}
                    <span className="text-dark">ward</span> pages.
                  </>
                }
              />
            </QuestionnaireRail>
          </section>
        ) : (
          <section className="px-6 md:px-14 py-16 border-b-2 border-dark">
            <p className="font-serif text-[1.1rem] leading-[1.5] text-dark/80 max-w-[58ch] text-pretty">
              {withheld
                ? ANSWERS_WITHHELD
                : "No candidate answers have been published yet. Responses appear here as they are reviewed and released."}
            </p>
          </section>
        )}

        {/* ── Your turn ──────────────────────────────────────── */}
        {/* The whole band goes while the survey is closed, not just its
            button: "Now answer them yourself" over a paragraph promising the
            reader they can, with nothing to answer, is worse than silence.

            The countdown goes with it, which is the one thing here worth
            regretting — it is this page's only clock. It is not worth keeping
            a band alive for: the days to polls are on the landing page, the
            mayoral page and every ward page. */}
        {surveyInvite && (
          <section className="px-6 md:px-14 py-9 md:py-10 border-t-2 border-dark grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.6rem,2.6vw,2.1rem)] max-w-[20ch] text-balance">
                Now answer them yourself
              </h2>
              <p className="mt-3.5 font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[56ch] text-pretty">
                These are the same questions we asked the candidates. Answer
                them and see which of the {respondents.length} line up with you
                — and where you sit against the field you just read.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
                <CountdownDays
                  initialDays={daysUntil(ELECTION.electionDateIso)}
                  targetIso={ELECTION.electionDateIso}
                  className="font-sans font-semibold text-[2.25rem] leading-none tracking-[-0.03em] tabular-nums"
                />
                <span className="type-label-sm !tracking-[0.1em] text-text-secondary">
                  Days until polls open
                </span>
              </div>
            </div>
            <SurveyCta href={surveyInvite} />
          </section>
        )}

        {/* ── Method ─────────────────────────────────────────── */}
        {/* How to read cards that are not on the page is not method, it is
            noise — and the second paragraph explains where the notes went,
            which is a distinction with nothing to draw it between. */}
        {!withheld && (
          <section className="px-6 md:px-14 py-4 border-t border-border-light grid gap-2">
            <p className="type-label-sm text-text-muted max-w-[80ch] text-pretty">
              Each card is one question, drawn as the share of the field that
              gave each answer. The options are listed in full under the band,
              in the wording the candidates were shown, with the number who
              chose each. Options nobody picked are not shown, and a candidate
              who answered in their own words is counted in the unshaded segment
              rather than on any option. Shares are of the candidates who
              answered that particular question, not of the whole field — a
              questionnaire can come back half filled in, so the number behind a
              card is the counts in its own legend added up. Hover or select any
              answer to see the candidates who gave it, with the seat each is
              running for.
            </p>
            <p className="type-label-sm text-text-muted max-w-[80ch] text-pretty">
              The note most candidates wrote to explain their answer lives on
              the ward and mayoral pages — thirty notes under every question is
              more reading than this page can carry, and it is on those pages
              that a reader has a ballot to weigh them against. Answers appear
              as candidates return the questionnaire and staff review them, so
              the field shown here grows through the campaign.
            </p>
          </section>
        )}

        {/* ── Elsewhere ──────────────────────────────────────── */}
        <section className="border-t border-dark grid md:grid-cols-2">
          <Link
            href={`${ELECTION.basePath}/mayor`}
            className="group px-6 md:px-14 py-6 flex items-center justify-between gap-4 transition-colors hover:bg-linen-50"
          >
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              The mayoral field, side by side
            </span>
            <ArrowRight className="size-4 flex-none text-text-secondary transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={`${ELECTION.basePath}#wards`}
            className="group px-6 md:px-14 py-6 flex items-center gap-2.5 border-t md:border-t-0 md:border-l border-border-light transition-colors hover:bg-linen-50"
          >
            <ArrowLeft className="size-3.5 text-text-secondary" />
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              Find your ward
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  small = false,
  last = false,
}: {
  value: number | string;
  label: string;
  small?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`px-6 py-4 md:px-14 border-b md:border-b-0 border-border-light ${
        last ? "" : "border-r"
      }`}
    >
      <div
        className={`font-sans font-semibold leading-none tracking-[-0.03em] tabular-nums ${
          small ? "text-[1.5rem] pt-1.5" : "text-[2rem]"
        }`}
      >
        {value}
      </div>
      <div className="type-label-sm !tracking-[0.1em] text-text-secondary mt-1.5">
        {label}
      </div>
    </div>
  );
}
