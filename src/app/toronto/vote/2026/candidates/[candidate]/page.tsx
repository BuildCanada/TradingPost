import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { CandidateSiteLink } from "@/components/elections/CandidateSiteLink";
import {
  QuestionnaireCards,
  questionnaireHeadings,
} from "@/components/elections/QuestionnaireCards";
import { QuestionnaireRail } from "@/components/elections/QuestionnaireRail";
import CountdownDays from "@/components/elections/CountdownDays";
import { IncumbentBadge } from "@/components/elections/ElectionLanding";
import {
  BIO_QUESTION_ID,
  comparedQuestions,
} from "@/lib/elections/candidate-answers";
import { rosterSurvey } from "@/lib/elections/survey-answers";
import { ANSWERS_WITHHELD } from "@/lib/elections/registry";
import { daysUntil } from "@/lib/elections/dates";
import { firstName, possessive } from "@/lib/elections/names";
import type { CandidateProfile, RaceView } from "@/lib/elections/election-data";
import {
  ELECTION,
  candidateSlug,
  getToronto2026Candidate,
  getToronto2026Candidates,
} from "../../data";

/* One candidate, on a page of their own.
 *
 * WHY IT EXISTS
 *   A candidate's name was a link to their campaign site — on the landing
 *   page, on every ward page, in every questionnaire roster. So the one thing
 *   on the page that identifies a person was also the way off the site, and a
 *   reader who clicked it left holding a campaign's own account of the
 *   candidate: no ward, no questionnaire answers, no indication of whether
 *   they had answered at all, and no way back but the back button.
 *
 *   Everything we know about a candidate now has somewhere to live. The name
 *   goes here; the campaign site is a link on this page, one fact among the
 *   ward they are running in, the answers they gave us, and where the rest of
 *   their ballot line is. The outbound link is still instrumented exactly as
 *   it was (CandidateSiteLink), so the click-through funnel survives with a
 *   step in front of it.
 *
 * THE SLUG
 *   `candidateSlug(name)` — the roster is rebuilt from the City Clerk's feed
 *   daily and carries no candidate ids, so the URL has to come from the name.
 *   That makes the set of valid URLs a function of today's roster: a name the
 *   Clerk corrects is a new URL, and a slug naming nobody 404s rather than
 *   rendering an empty profile.
 *
 * WHAT IT DOES NOT DO
 *   It does not editorialise. Bios are hand-written where we have them and
 *   absent for most of a fifty-three-name ballot; where there is no bio, no
 *   site and no questionnaire, the page says plainly that this is a registered
 *   candidate we know little about, rather than padding the gap. */

/**
 * One race, named in full: "Mayor", "Councillor — Etobicoke North", "Trustee —
 * Toronto Catholic District School Board, Ward 2".
 *
 * `race.label` is enough for the two races the rest of the site covers, and
 * not enough for a school board: the boards publish no district names, so a
 * trustee race's label is the bare word "Trustee" and its district lives in
 * `districtNumber`, in the board's own ward numbering.
 */
function raceTitle(race: RaceView): string {
  if (race.districtName) return race.label;
  if (race.officeBody) {
    return race.districtNumber !== null
      ? `${race.seat} — ${race.officeBody}, Ward ${race.districtNumber}`
      : `${race.seat} — ${race.officeBody}`;
  }
  return race.seat;
}

/** The races they are standing in — `races` has already set aside the ones
 *  they withdrew from, which the page names separately. */
function raceLabel(profile: CandidateProfile): string {
  return profile.races.map(raceTitle).join(" and ");
}

export async function generateStaticParams() {
  const profiles = await getToronto2026Candidates();
  return profiles.map((profile) => ({
    candidate: candidateSlug(profile.candidate.name),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ candidate: string }>;
}): Promise<Metadata> {
  const { candidate: slug } = await params;
  const profile = await getToronto2026Candidate(slug);
  if (!profile) return { title: "Candidate not found" };

  const { name } = profile.candidate;
  const race = raceLabel(profile);

  return {
    title: `${name} — ${race}`,
    description: `${name} is a registered candidate for ${race} in Toronto's October 26, 2026 municipal election. Their campaign site, and how they answered our questionnaire.`,
    alternates: { canonical: `${ELECTION.basePath}/candidates/${slug}` },
    openGraph: {
      title: `${name} — Toronto 2026 Election`,
      description: `Where ${name} stands, and how to reach their campaign.`,
      type: "profile",
    },
  };
}

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ candidate: string }>;
}) {
  const { candidate: slug } = await params;
  const profile = await getToronto2026Candidate(slug);
  if (!profile) notFound();

  const { candidate, races, wards } = profile;
  const ward = wards[0];
  const race = races[0];

  /* The one-candidate case of what every roster page does: the questionnaire
     is fetched for the whole election — the counts beside each answer are the
     field's split — and narrowed to this candidate by key. A missing
     questionnaire costs the answers, not the page. */
  const { answers, written } = await rosterSurvey(
    ELECTION.slug,
    new Set([candidate.key]),
  );
  const surveyAnswers = answers[candidate.key];

  /* What the candidate wrote, as against what they picked.
     55 of the 58 candidates who returned the questionnaire wrote a bio in it,
     and until now the page showed none of them: the bio sits in the
     questionnaire's `about-you` step, which the policy pivot excludes, so the
     only bio this page could print was the hand-maintained one in
     candidates.ts — which is empty for all but a handful. Theirs is a self
     description and ours is not, so it is attributed rather than merged into
     the same paragraph. */
  /* The answers come back empty either way, so the page has to ask rather
     than infer — see `questionnaireHidden` in the registry. The bio survives
     it: a self-description is not one of the positions being held back, and
     without it most of these pages have nothing on them. */
  const withheld = ELECTION.questionnaireHidden ?? false;

  const prose = written[candidate.key] ?? [];
  const selfBio = prose.find(
    (entry) => entry.questionId === BIO_QUESTION_ID,
  )?.text;
  const otherProse = prose.filter(
    (entry) => entry.questionId !== BIO_QUESTION_ID,
  );

  /* The ward pages' cards, given a roster of one.
     `comparedQuestions` is the same pivot a ward runs — question first, the
     candidates filed under the answer they gave — so this page's cards are
     literally the ward's cards with a field of one person in them. A card
     therefore shows the one option this candidate picked, in the option's own
     colour, with their note printed in the open underneath their name plate.
     What it cannot show is the split, since the other candidates are not in
     the roster; "How the whole city answered" at the foot is the way to it. */
  const roster = [
    {
      key: candidate.key,
      name: candidate.name,
      website: candidate.website,
      bio: candidate.bio || undefined,
    },
  ];
  const groups = surveyAnswers
    ? comparedQuestions([surveyAnswers], roster)
    : [];

  const raceKind = profile.officeTypes[0] === "mayor" ? "mayor" : profile.officeTypes[0] === "trustee" ? "trustee" : "councillor";

  /* Where the rest of this candidate's ballot line is — the ward page for a
     councillor, the mayoral field for a mayoral candidate. */
  const ballotHref = ward
    ? `${ELECTION.basePath}/wards/${ward.n}`
    : raceKind === "mayor"
      ? `${ELECTION.basePath}/mayor/candidates`
      : ELECTION.basePath;
  const ballotLabel = ward
    ? `Everyone running in ${ward.name}`
    : raceKind === "mayor"
      ? "Everyone running for mayor"
      : "The whole ballot";

  return (
    <div className={`${ELECTION.themeClass ?? ""} bg-bg text-dark`}>
      <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-x-clip">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <div className="px-6 md:px-14 py-4 border-b border-border-light type-label-sm !tracking-[0.1em] flex items-center gap-2.5 flex-wrap">
          <Link
            href={ELECTION.basePath}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            Toronto 2026
          </Link>
          <span className="text-border-light">/</span>
          {/* A link only where the crumb has its own page. Toronto's
              school-board races have none — the site covers the mayor and the
              25 council wards — so a board crumb that pointed back at the
              election index would have been a link to the crumb beside it. */}
          {ballotHref === ELECTION.basePath ? (
            <span className="text-text-secondary">
              {race.officeBody ?? race.seat}
            </span>
          ) : (
            <Link
              href={ballotHref}
              className="text-text-secondary hover:text-accent transition-colors"
            >
              {ward ? `Ward ${ward.number}` : race.seat}
            </Link>
          )}
          <span className="text-border-light">/</span>
          <span>{candidate.name}</span>
        </div>

        {/* ── Hero ───────────────────────────────────────────── */}
        {/* No eyebrow over the name. It printed the race — "Councillor —
            Toronto Centre" — which the row directly beneath now says twice
            over, as "Running for / Councillor" and "Ward 13 / Toronto
            Centre". The breadcrumb above has already placed the reader too.
            `raceTitle` still writes the page title and its description, where
            the race is the one thing distinguishing one candidate from
            another. */}
        <section className="px-6 py-8 md:px-14 md:py-10 border-b-2 border-dark">
          <div className="flex flex-wrap items-start gap-6 sm:gap-8">
            <div className="relative flex-none size-24 sm:size-32 overflow-hidden bg-dark flex items-center justify-center font-sans font-medium text-[2rem] tracking-[-0.02em] text-bg">
              {candidate.image ? (
                <Image
                  src={candidate.image}
                  alt={candidate.name}
                  fill
                  sizes="128px"
                  className="object-cover object-center"
                />
              ) : (
                candidate.initials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3.5 flex-wrap mb-3">
                <h1
                  className={`font-sans font-medium leading-[0.98] tracking-[-0.04em] text-[clamp(2rem,4vw,3.25rem)] text-balance ${
                    candidate.withdrawn ? "line-through decoration-1" : ""
                  }`}
                >
                  {candidate.name}
                </h1>
                {candidate.tag === "Incumbent" && <IncumbentBadge />}
                {candidate.withdrawn && (
                  <span className="type-label-sm !text-[10px] !tracking-[0.12em] px-2 py-1 border border-border-light text-text-secondary">
                    Withdrawn
                  </span>
                )}
              </div>

              {candidate.withdrawn && (
                <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[58ch] text-pretty mb-4">
                  Registered and since withdrawn — {candidate.name} cannot be
                  voted for. The page is kept because the name still appears on
                  lists elsewhere.
                </p>
              )}

              {/* A candidate who registered somewhere, withdrew, and
                  registered somewhere else. Ten people on Toronto's 2026
                  ballot have done it, and the page above names the race they
                  are actually standing in — this is the rest of the story, for
                  a reader who arrived from the ward they left. */}
              {profile.withdrawnFrom.length > 0 && (
                <p className="font-serif text-[1.02rem] leading-[1.5] text-dark/75 max-w-[58ch] text-pretty mb-4">
                  {`Previously registered for ${profile.withdrawnFrom
                    .map(raceTitle)
                    .join(" and ")}, and withdrawn.`}
                </p>
              )}

              {candidate.bio && (
                <p className="font-serif text-[1.08rem] leading-[1.5] text-dark/85 max-w-[62ch] text-pretty">
                  {candidate.bio}
                </p>
              )}

              {/* Where we have nothing hand-written, say so rather than leave
                  the reader to read absence as a judgement. Most of a
                  fifty-three-name ballot is in exactly this state, and it is
                  the ordinary condition of a municipal candidate. */}
              {!candidate.bio && !candidate.website && !selfBio && (
                <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/80 max-w-[62ch] text-pretty">
                  A registered candidate on the City Clerk&rsquo;s list. We have
                  no campaign site or profile for {candidate.name} yet — this
                  page fills in as we learn more.
                </p>
              )}

              {/* ── Links out ──────────────────────────────── */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                {candidate.website && (
                  <CandidateSiteLink
                    href={candidate.website}
                    candidate={candidate.name}
                    candidateKey={candidate.key}
                    election={ELECTION.slug}
                    race={raceKind}
                    tag={candidate.tag}
                    ward={ward?.n}
                    wardName={ward?.name}
                    className="group/btn inline-flex items-center gap-2 border border-dark px-4 py-2.5 font-sans font-medium text-[1rem] tracking-[-0.015em] transition-colors hover:bg-dark hover:text-bg"
                  >
                    Campaign site
                    <ArrowUpRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </CandidateSiteLink>
                )}

                {candidate.socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {candidate.socialLinks.map((link) => (
                      <a
                        key={`${link.name}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="type-label-sm !tracking-[0.06em] text-text-secondary hover:text-accent transition-colors"
                      >
                        {socialLabel(link.name)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Where they're running ──────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-3 border-b-2 border-dark">
          <Stat value={race.seat} label="Running for" />
          {/* Only a genuinely at-large race is city-wide. A school-board
              district is neither a city ward nor the whole city, and its own
              ward number is the only name it has. */}
          {/* The caption names which district, the line under it says what
              that district is: "Ward 13" over "Toronto Centre". A city-wide
              race is the same pair the other way about — "City-wide" is the
              district's name and "Every ward votes" is what it amounts to —
              so it swaps rather than putting a whole statement in the caption
              slot. */}
          <Stat
            label={
              ward
                ? `Ward ${ward.number}`
                : race.atLarge
                  ? "City-wide"
                  : race.districtNumber !== null
                    ? `Board ward ${race.districtNumber}`
                    : "District"
            }
            value={
              ward
                ? ward.name
                : race.atLarge
                  ? "Every ward votes"
                  : (race.officeBody ?? "District")
            }
          />
          <div className="px-6 py-4 md:px-14 border-b md:border-b-0 border-border-light col-span-2 md:col-span-1">
            <div className="type-label-sm !tracking-[0.1em] text-text-secondary">
              Days until polls open
            </div>
            <CountdownDays
              initialDays={daysUntil(ELECTION.electionDateIso)}
              targetIso={ELECTION.electionDateIso}
              className="font-sans font-semibold text-[2rem] leading-none tracking-[-0.03em] tabular-nums mt-1.5 block"
            />
          </div>
        </section>

        {/* ── In their own words ─────────────────────────────── */}
        {/* Their bio, and any other prose the questionnaire asked them to
            write, in one place and plainly attributed.

            A section of its own rather than a paragraph in the hero: these run
            to a median of 800 characters and half of them are several
            paragraphs, so in the hero the longest of them pushed the ballot
            facts and the questionnaire off the screen. Here they have the room
            the length needs, in the reading order a candidate page actually
            has — who is this, then what do they think.

            TWO COLUMNS, because prose has a measure and a band does not. Set
            as one column this was 640px of serif — the width a paragraph can
            be read at — sitting in a 1300px section, so two-thirds of the band
            was air with a heading floating at the top of it. The heading and
            the attribution take a rail of their own and the prose keeps its
            measure beside them, which spends the width on structure rather
            than on a line too long to read. */}
        {(selfBio || otherProse.length > 0) && (
          <section className="px-6 md:px-14 py-9 border-b-2 border-dark grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14 lg:items-start">
            <div className="grid gap-3 lg:sticky lg:top-24">
              {/* No eyebrow. "In their own words" over a line that already
                  says the candidate wrote this and we did not was the label
                  and its own caption, stacked. */}
              <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.6rem,2.6vw,2.1rem)] text-balance">
                About {firstName(candidate.name)}
              </h2>
              {/* Whose words these are, said before they are read. A
                  candidate's account of themselves set in the same type as the
                  rest of the page would read as ours. In the rail it stays
                  beside the prose it qualifies rather than becoming a line the
                  reader passes once and scrolls away from. */}
              <p className="type-label-sm text-text-muted text-pretty">
                Written by {candidate.name} in answer to our questionnaire, and
                published as given. Not our description of them.
              </p>
            </div>

            {/* No measure cap. The prose runs the full width of its column:
                capped at 70ch it left a third of the band empty, and filling
                the width was the call. Leading goes up with the line length —
                a long line needs more space beneath it for the eye to find
                the start of the next one, which is the one thing that can be
                done for readability without narrowing the column again. */}
            <div>
              {selfBio && (
                <Prose
                  text={selfBio}
                  className="font-serif text-[1.15rem] leading-[1.75] text-dark text-pretty"
                />
              )}

              {otherProse.map((entry) => (
                <div
                  key={entry.questionId}
                  className="mt-7 border-t border-border-light pt-5"
                >
                  <h3 className="font-sans text-[1.05rem] font-medium leading-[1.35] tracking-[-0.015em] text-dark text-pretty mb-2.5">
                    {entry.question}
                  </h3>
                  <Prose
                    text={entry.text}
                    className="font-serif text-[1.1rem] leading-[1.7] text-dark/90 text-pretty"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Questionnaire ──────────────────────────────────── */}
        <section className="px-6 md:px-14 py-9">
          <p className="type-label text-accent mb-3">Our questionnaire</p>
          <h2 className="font-sans font-medium leading-[1.05] tracking-[-0.03em] text-[clamp(1.6rem,2.6vw,2.1rem)] mb-3">
            {surveyAnswers
              ? `Where ${candidate.name} stands`
              : withheld
                ? "Coming soon"
                : "Yet to answer"}
          </h2>

          {surveyAnswers ? (
            <>
              <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[62ch] text-pretty mb-8">
                {possessive(candidate.name)} own answers to the questions we put
                to every candidate, published as given — including, where they
                wrote one, their reasoning in their own words.
              </p>
              <QuestionnaireRail headings={questionnaireHeadings(groups)}>
                <QuestionnaireCards
                  groups={groups}
                  respondents={roster}
                  silent={[]}
                  issuesHref={`${ELECTION.basePath}/issues`}
                  answerNote={
                    `Each card is one question, with ${candidate.name} filed ` +
                    "under the answer they gave and their own words underneath " +
                    "it. The other options offered are not shown, nor how the " +
                    "rest of the field answered."
                  }
                />
              </QuestionnaireRail>
            </>
          ) : withheld ? (
            /* Held back, which is not the same as never sent — and this page
               of all of them must not confuse the two. "X has not returned our
               questionnaire" printed under a named person's photograph is a
               claim about that person, and here it would be our doing and
               untrue. Nor does it point at /issues, which is showing the same
               nothing. */
            <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[62ch] text-pretty">
              {ANSWERS_WITHHELD}
            </p>
          ) : (
            <p className="font-serif text-[1.05rem] leading-[1.5] text-dark/85 max-w-[62ch] text-pretty">
              {candidate.name} has not returned our questionnaire. We publish
              answers as they arrive, so check back — and{" "}
              <Link
                href={`${ELECTION.basePath}/issues`}
                className="text-accent hover:underline"
              >
                see where the rest of the field stands
              </Link>{" "}
              in the meantime.
            </p>
          )}
        </section>

        {/* ── Source note ────────────────────────────────────── */}
        <section className="px-6 md:px-14 py-4 border-t-2 border-dark">
          <p className="type-label-sm text-text-muted max-w-[80ch] text-pretty">
            Registered candidates from the City Clerk&rsquo;s official list,
            refreshed daily. Campaign sites are linked as published by the
            candidate; a link is not an endorsement.
          </p>
        </section>

        {/* ── Elsewhere ──────────────────────────────────────── */}
        <section className="border-t border-dark grid md:grid-cols-2">
          <Link
            href={ballotHref}
            className="group px-6 md:px-14 py-6 flex items-center gap-2.5 transition-colors hover:bg-linen-50"
          >
            <ArrowLeft className="size-3.5 flex-none text-text-secondary" />
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              {ballotLabel}
            </span>
          </Link>
          <Link
            href={`${ELECTION.basePath}/issues`}
            className="group px-6 md:px-14 py-6 flex items-center justify-between gap-4 border-t md:border-t-0 md:border-l border-border-light transition-colors hover:bg-linen-50"
          >
            <span className="font-sans font-medium text-[1.15rem] tracking-[-0.015em]">
              Where the whole field stands
            </span>
            <ArrowRight className="size-4 flex-none text-text-secondary transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>
      </div>
    </div>
  );
}

/* A cell of the "where they're running" row: what the cell is, then what it
   says — "Running for" over "Councillor", not "Councillor" over "Running for".
   The stat rows elsewhere on the site put the figure first because the figure
   is the point and the caption is a unit ("53" / "On the ballot"). These cells
   are not figures: "Councillor" arriving above the words telling you what it
   is means the reader meets an answer before the question, and reads the cell
   twice. */
/* A written answer, as the candidate typed it.
 *
 * Blank lines are paragraph breaks — half of these bios have them, and run
 * together into one block the reader gets a wall of prose that reads as though
 * we had transcribed it carelessly. Single newlines inside a paragraph are
 * kept by `whitespace-pre-line` rather than collapsed, because in these
 * answers they are usually a deliberate list. */
function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-4">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={`whitespace-pre-line ${className ?? ""}`}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-6 py-4 md:px-14 border-r border-b md:border-b-0 border-border-light">
      <div className="type-label-sm !tracking-[0.1em] text-text-secondary">
        {label}
      </div>
      <div className="font-sans font-medium text-[1.35rem] leading-[1.15] tracking-[-0.025em] mt-1.5">
        {value}
      </div>
    </div>
  );
}

/** `social_links[].name` is an open vocabulary ("web", "facebook", "tiktok",
 *  …), so unknown names are title-cased rather than dropped. */
function socialLabel(name: string): string {
  if (name.toLowerCase() === "web") return "Website";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
