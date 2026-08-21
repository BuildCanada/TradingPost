import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Good Deal Test",
  description:
    "A 100-point scorecard for judging the Canada–US tariff package: does it leave Canada more sovereign, more united, and more prosperous than the status quo?",
  alternates: {
    canonical: "/good-deal-test",
  },
};

/* ─── Status vocabulary ─────────────────────────────────────────────────────
   Bands are the scoring rubric (win / pass / fail). Provisional reads are the
   pre-release call on each criterion, drawn from leaks only. */

type BandTone = "win" | "pass" | "fail";
type ReadTone = "win" | "mixed" | "risk" | "unknown";

const bandToneClass: Record<BandTone, string> = {
  win: "bg-pine-100 text-pine-800",
  pass: "bg-copper-100 text-copper-800",
  fail: "bg-auburn-100 text-auburn-900",
};

const readToneClass: Record<ReadTone, string> = {
  win: "bg-pine-100 text-pine-800",
  mixed: "bg-copper-100 text-copper-800",
  risk: "bg-auburn-100 text-auburn-900",
  unknown: "bg-charcoal-200 text-charcoal-900",
};

type Band = { tone: BandTone; label: string; body: string };

type Criterion = {
  n: number;
  title: string;
  weight: string;
  check: string;
  bands: Band[];
  read: { tone: ReadTone; label: string; why: string };
};

type Pillar = { name: string; points: string; criteria: Criterion[] };

const pillars: Pillar[] = [
  {
    name: "Prosperity",
    points: "55 points",
    criteria: [
      {
        n: 1,
        title: "Effective tariff rate vs. status quo",
        weight: "12 pts",
        check: "Post-deal effective rate: tariff revenue ÷ total exports.",
        bands: [
          { tone: "win", label: "Win", body: "Below the pre-deal ~3.1%." },
          {
            tone: "pass",
            label: "Pass",
            body: "Roughly flat, offset by certainty gains.",
          },
          { tone: "fail", label: "Fail", body: "Above the pre-deal rate." },
        ],
        read: {
          tone: "win",
          label: "Leaning win",
          why: "232 cuts lower the rate; reported concessions are non-tariff. Verify no new baseline layer on non-CUSMA goods.",
        },
      },
      {
        n: 2,
        title: "CUSMA exemption in writing",
        weight: "10 pts",
        check:
          "The 0% exemption for compliant goods has existed at presidential discretion since March 2025.",
        bands: [
          {
            tone: "win",
            label: "Win",
            body: "Written commitment: compliant goods stay at 0%, with a dated renewal path (Canada asked for 16 years).",
          },
          {
            tone: "pass",
            label: "Pass",
            body: "Exemption reaffirmed in text, no long-term lock.",
          },
          {
            tone: "fail",
            label: "Fail",
            body: "Silent, narrowed, quota-ized, or revocable at will.",
          },
        ],
        read: {
          tone: "unknown",
          label: "Unknown",
          why: "Not addressed in any leak.",
        },
      },
      {
        n: 3,
        title: "Section 232 relief — steel, aluminum, autos, lumber",
        weight: "15 pts",
        check:
          "Carney's stated test: all four addressed. Score each against its industry's floor.",
        bands: [
          {
            tone: "win",
            label: "Steel · 4",
            body: "Win: 0%, or quota at/above recent volumes at ≤25%. Floor: reported 4Mt at 25% (CSPA accepts). Fail: quota below actual shipments.",
          },
          {
            tone: "win",
            label: "Alum. · 4",
            body: "Win: lower tariff, no volume quota (AAC red line). Fail: any cap, at any rate. Leaks conflict — check TRQ mechanics.",
          },
          {
            tone: "win",
            label: "Autos · 4",
            body: "Win: effective rate on a Canadian-built vehicle below ~6% (APMA margin test). Fail: 15% long-term with US-content-only carve-out.",
          },
          {
            tone: "win",
            label: "Lumber · 3",
            body: "Win: settlement ending AD/CVD plus 232 relief. Pass: cut with a dated track. Fail: excluded.",
          },
        ],
        read: {
          tone: "mixed",
          label: "Mixed",
          why: "Steel acceptable; aluminum hinges on quota; autos leaning fail; lumber likely out (reports conflict).",
        },
      },
      {
        n: 4,
        title: "Reciprocity ledger",
        weight: "8 pts",
        check:
          "New Canadian concessions (alcohol, procurement, dairy TRQ allocation, remaining counter-tariffs, digital, minerals/defence) vs. US concessions.",
        bands: [
          {
            tone: "win",
            label: "Win",
            body: "US tariff removals of comparable value. Canada's gives limited to low-cost items (alcohol; dairy TRQ allocation already lost at the 2023 panel).",
          },
          {
            tone: "pass",
            label: "Pass",
            body: "Balanced only if the shelved Section 338 threat counts as a US concession.",
          },
          {
            tone: "fail",
            label: "Fail",
            body: "Canada gives durable policy; US keeps tariffs it imposed unilaterally.",
          },
        ],
        read: {
          tone: "mixed",
          label: "Contested",
          why: "Depends on Q7–Q9.",
        },
      },
      {
        n: 5,
        title: "Durability mechanics",
        weight: "10 pts",
        check:
          "Precedent: USMCA (2018) and the EU deal (2025) were both reopened under tariff threat within two years. Score the mechanics, not the communiqué.",
        bands: [
          {
            tone: "win",
            label: "Win",
            body: "Signed text, defined term; Section 338 proclamations revoked; snap-back conditions written and narrow; dispute settlement intact; CUSMA annual-review path to renewal.",
          },
          {
            tone: "pass",
            label: "Pass",
            body: "Framework with dated milestones; 338 formally withdrawn.",
          },
          {
            tone: "fail",
            label: "Fail",
            body: "Handshake framework; tariffs returnable at presidential discretion; 338 held in reserve.",
          },
        ],
        read: {
          tone: "unknown",
          label: "Unknown",
          why: "Check legal form: proclamation vs. executive agreement; revoked vs. paused.",
        },
      },
    ],
  },
  {
    name: "Sovereignty",
    points: "30 points",
    criteria: [
      {
        n: 6,
        title: "Statutory red lines",
        weight: "10 pts",
        check:
          "Supply management (Bill C-202): no new quota volume — allocation changes acceptable. Cultural exemption. French-language requirements.",
        bands: [
          { tone: "win", label: "Win", body: "All held, explicitly, in text." },
          { tone: "pass", label: "Pass", body: "Held by omission." },
          {
            tone: "fail",
            label: "Fail",
            body: 'Any breached — including quota-volume expansion labelled "administration."',
          },
        ],
        read: {
          tone: "win",
          label: "Leaning win",
          why: 'LeBlanc: supply management "not subject to negotiation." Check dairy text against Trump\'s "non-existent agricultural tariffs" claim.',
        },
      },
      {
        n: 7,
        title: "Policy autonomy",
        weight: "10 pts",
        check:
          'Scope of "digital trade alignment" and "economic security commitments": data localization, Online News / Online Streaming Acts, DST non-reintroduction, China-facing alignment, critical-minerals right of first refusal, F-35 / Golden Dome, energy export commitments.',
        bands: [
          {
            tone: "win",
            label: "Win",
            body: "Cooperation language only; no binding constraint on future legislation or resource decisions.",
          },
          {
            tone: "pass",
            label: "Pass",
            body: "Narrow, reciprocal, time-limited commitments with exit clauses.",
          },
          {
            tone: "fail",
            label: "Fail",
            body: "US first-refusal rights over minerals, constraints on digital law, or defence procurement written into trade text.",
          },
        ],
        read: {
          tone: "unknown",
          label: "Unknown",
          why: "No text yet for either phrase.",
        },
      },
      {
        n: 8,
        title: "Leverage retained",
        weight: "10 pts",
        check:
          "Position going into the 2027 CUSMA annual review and the 2036 sunset.",
        bands: [
          {
            tone: "win",
            label: "Win",
            body: "No constraints on future counter-measures; no MFN obligations to the US; diversification unrestricted (China canola track, EU, Indo-Pacific).",
          },
          {
            tone: "pass",
            label: "Pass",
            body: "Consult-before-retaliating commitments; diversification untouched.",
          },
          {
            tone: "fail",
            label: "Fail",
            body: "No-retaliation clauses, or the US-content auto carve-out carried into the CUSMA rules-of-origin negotiation.",
          },
        ],
        read: {
          tone: "risk",
          label: "At risk",
          why: "US CUSMA ask already includes an 82% content rule with a 50% US-specific carve-out.",
        },
      },
    ],
  },
  {
    name: "Unity",
    points: "15 points",
    criteria: [
      {
        n: 9,
        title: "Regional balance",
        weight: "10 pts",
        check:
          "Ontario: steel, autos. Quebec: aluminum, dairy. BC: lumber. Prairies: energy, potash, canola. Atlantic: fish, forestry.",
        bands: [
          { tone: "win", label: "Win", body: "Every region gains." },
          {
            tone: "pass",
            label: "Pass",
            body: "Broad relief; excluded sectors get a named, dated track.",
          },
          {
            tone: "fail",
            label: "Fail",
            body: "Lumber excluded with nothing while other sectors settle.",
          },
        ],
        read: {
          tone: "risk",
          label: "At risk",
          why: 'Two reports say lumber excluded; one says "forest products" included. Eby conditioned cooperation on lumber.',
        },
      },
      {
        n: 10,
        title: "Provincial consent",
        weight: "5 pts",
        check:
          "Alcohol and procurement commitments require provincial implementation.",
        bands: [
          { tone: "win", label: "Win", body: "All premiers endorse." },
          { tone: "pass", label: "Pass", body: "Majority on side." },
          {
            tone: "fail",
            label: "Fail",
            body: "Provinces refuse to implement.",
          },
        ],
        read: {
          tone: "mixed",
          label: "Mostly on side",
          why: "Premiers restocked shelves Aug 20. Kinew dissenting. Ford silent.",
        },
      },
    ],
  },
];

const scoreBands: {
  score: string;
  verdict: string;
  tone: "good" | "ok" | "weak" | "bad";
  position: string;
}[] = [
  {
    score: "75–100",
    verdict: "Good deal",
    tone: "good",
    position: "Support. Credit what was defended and won.",
  },
  {
    score: "60–74",
    verdict: "Defensible deal",
    tone: "ok",
    position: "Support, with named fixes for the CUSMA review.",
  },
  {
    score: "45–59",
    verdict: "Weak deal",
    tone: "weak",
    position: "Push for changes before implementation.",
  },
  {
    score: "< 45",
    verdict: "Bad deal",
    tone: "bad",
    position: "Oppose. Status quo scored higher.",
  },
];

const verdictToneClass = {
  good: "text-pine-700",
  ok: "text-copper-700",
  weak: "text-auburn-800",
  bad: "text-auburn-800",
} as const;

const firstChecks = [
  {
    lead: "CUSMA exemption in writing?",
    rest: "(Criterion 2)",
  },
  {
    lead: "Aluminum quota?",
    rest: "Any volume cap fails criterion 3 regardless of rate.",
  },
  {
    lead: "Effective rate on a Canadian-built vehicle?",
    rest: "Above ~6% fails the APMA test.",
  },
  {
    lead: "Section 338: revoked or suspended?",
    rest: "(Criterion 5)",
  },
  {
    lead: "Lumber: in, out, or dated track?",
    rest: "(Criteria 3 and 9)",
  },
];

const checklist = [
  {
    label: "Q1 · Steel",
    body: "Quota confirmed at 4Mt? Admin method (allocated vs. first-come)? Derivative products covered?",
  },
  {
    label: "Q2 · Aluminum",
    body: "In-quota rate (25% or single-digit)? Any volume cap?",
  },
  {
    label: "Q3 · Autos",
    body: "15% confirmed? Content formula changed? Parts treatment? Volume caps? Canada's counter-tariff to zero when?",
  },
  {
    label: "Q4 · Lumber",
    body: "In or out? Interaction with the AR7 duty cut (to 24.83%) due within weeks?",
  },
  {
    label: "Q5 · CUSMA baseline",
    body: "Compliant-goods exemption in writing? Any 10% baseline layer on non-CUSMA goods?",
  },
  {
    label: "Q6 · Section 338",
    body: "Proclamations revoked, suspended, or held as snap-back?",
  },
  {
    label: "Q7 · Dairy",
    body: "Exact TRQ language — allocation only, or volume expansion? Supply management protected in text?",
  },
  {
    label: "Q8 · Agriculture",
    body: 'Text behind "non-existent tariffs for US farmers"?',
  },
  {
    label: "Q9 · Security",
    body: "F-35 completion, Golden Dome, minerals right-of-first-refusal, oil commitments — in or out?",
  },
  {
    label: "Q10 · Digital",
    body: "Binding DST non-return? Data flows and localization? Online News / Streaming Acts touched?",
  },
  {
    label: "Q11 · Duration",
    body: "Term, review clauses, snap-back triggers, fit with CUSMA annual review (next: July 2027) and 2036 sunset.",
  },
  {
    label: "Q12 · Other 232s",
    body: "Copper, pharma, furniture — any relief?",
  },
  {
    label: "Q13 · Legal form",
    body: "Executive agreement or proclamations? Congress or Parliament required? Provincial enforceability?",
  },
  {
    label: "Q14 · Refunds",
    body: "Settlement language on the ~$160B IEEPA refund litigation for Canadian-origin goods?",
  },
];

const benchmarks = [
  {
    label: "Test:",
    body: "Build Canada's published standard — more sovereign, more united, more prosperous than the status quo.",
  },
  {
    label: "Effective-rate math:",
    body: "Tombe (The Hub): ~3.1% effective, lowest among major US partners. RBC: CUSMA exemption worth ~6 points.",
  },
  {
    label: "Government:",
    body: 'Carney — "not a deal at any cost" (2025-07-22); "all 232s, all strategic sectors" (2026-08). LeBlanc red lines: supply management, cultural exemption. Canada\'s 16-year CUSMA renewal request (2026-06-02).',
  },
  {
    label: "Industry floors:",
    body: "CSPA/Cobden (steel quota acceptance); AAC/Simard (no aluminum quotas); APMA/Volpe (~6% margin test); BCLTC/Niquidet (durable lumber settlement); BCC/Hyder (CUSMA exemption; rate below every other US partner).",
  },
  {
    label: "Comparators:",
    body: "UK 10%, EU 15%, Japan 15%. Canada's pre-deal effective rate was below all three.",
  },
  {
    label: "Adjustments:",
    body: "Section 338 threat treated as anchor, not baseline. Pre-deal concessions treated as sunk. Durability scored on mechanics only.",
  },
];

function SectionHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-border pb-2.5">
      <h2 className="type-h2 text-dark">{title}</h2>
      {meta && <p className="type-label text-accent">{meta}</p>}
    </div>
  );
}

export default function GoodDealTestPage() {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg overflow-hidden">
      <article className="animate-fade-in px-5 pb-20 sm:px-10 md:px-16">
        <header className="border-b-[3px] border-accent py-12 sm:py-16">
          <div className="mx-auto max-w-[1080px]">
            <h1 className="type-display max-w-[16ch] text-dark">
              The Good Deal Test
            </h1>
            <p className="type-body mt-8 text-dark">
              Does this package leave Canada{" "}
              <strong className="text-accent">
                more sovereign, more united, and more prosperous than the status
                quo
              </strong>
              ?
            </p>
            <p className="type-caption mt-6 max-w-[60ch] text-text-muted">
              Prepared 2026-08-21, before the details release. 100 points across
              three pillars. Score from official text and fact sheets only. All
              pre-release terms below are leaks until confirmed.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-[1080px]">
          {/* ─── Baseline ─── */}
          <aside className="mt-10 border border-border-light border-l-4 border-l-accent bg-bg-alt px-6 py-5">
            <h2 className="type-label text-accent">Baseline</h2>
            <p className="type-default mt-3 text-text-secondary">
              Score against the tariff landscape of{" "}
              <strong className="text-dark">August 18, 2026</strong> — not the
              threatened Section 338 tariffs (~5% of exports; ~2.5 effective
              points).
            </p>
            <ul className="type-default mt-3 list-disc space-y-1 pl-5 text-text-secondary">
              <li>
                CUSMA-compliant goods: 0%. 85–89% of exports tariff-free.
                Effective tariff rate ~3.1% (Tombe; RBC).
              </li>
              <li>
                Section 232: steel 50%, aluminum 50%, autos 25% on non-US
                content, lumber ~45% all-in, copper semis 50%, patented pharma
                up to 100%.
              </li>
              <li>Energy, potash, critical minerals: exempt.</li>
              <li>
                DST repeal, border package, NATO pledge, dropped
                counter-tariffs: already conceded. Count only new concessions in
                this deal.
              </li>
            </ul>
          </aside>

          {/* ─── Pillars ─── */}
          {pillars.map((pillar) => (
            <section key={pillar.name} className="mt-14">
              <SectionHead title={pillar.name} meta={pillar.points} />
              {pillar.criteria.map((c) => (
                <div
                  key={c.n}
                  className="mt-4 border border-border-light bg-bg-alt px-6 py-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="type-h4 text-dark">
                      {c.n}. {c.title}
                    </h3>
                    <p className="shrink-0 font-mono text-lg font-bold tabular-nums whitespace-nowrap text-dark">
                      {c.weight}
                    </p>
                  </div>
                  <p className="type-default mt-2 text-text-secondary">
                    {c.check}
                  </p>

                  <dl className="mt-4 space-y-2">
                    {c.bands.map((b) => (
                      <div
                        key={b.label}
                        className="grid grid-cols-[max-content_minmax(0,1fr)] items-start gap-3"
                      >
                        <dt
                          className={`type-label mt-0.5 px-2.5 py-1.5 text-center font-bold whitespace-nowrap ${bandToneClass[b.tone]}`}
                        >
                          {b.label}
                        </dt>
                        <dd className="type-default text-text-secondary">
                          {b.body}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 flex flex-wrap items-baseline gap-2.5 border-t border-dashed border-border-light pt-3">
                    <span
                      className={`type-label rounded-full px-3 py-1.5 font-bold whitespace-nowrap ${readToneClass[c.read.tone]}`}
                    >
                      {c.read.label}
                    </span>
                    <span className="type-caption text-text-muted">
                      {c.read.why}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          ))}

          {/* ─── Score bands ─── */}
          <section className="mt-14">
            <SectionHead title="Score bands" meta="/ 100" />
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Score", "Verdict", "Position"].map((h) => (
                      <th
                        key={h}
                        className="type-label border-b-2 border-border pb-2 pr-4 text-left text-text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scoreBands.map((b) => (
                    <tr key={b.verdict}>
                      <td className="type-mono border-b border-border-light py-3 pr-4 align-top whitespace-nowrap">
                        {b.score}
                      </td>
                      <td
                        className={`type-default border-b border-border-light py-3 pr-4 align-top font-semibold whitespace-nowrap ${verdictToneClass[b.tone]}`}
                      >
                        {b.verdict}
                      </td>
                      <td className="type-default border-b border-border-light py-3 pr-4 align-top text-text-secondary">
                        {b.position}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── First checks ─── */}
          <section className="mt-14">
            <SectionHead title="First checks" meta="5 items" />
            <ol className="mt-5 list-decimal space-y-2.5 pl-6">
              {firstChecks.map((c) => (
                <li key={c.lead} className="type-default text-text-secondary">
                  <strong className="text-dark">{c.lead}</strong> {c.rest}
                </li>
              ))}
            </ol>
          </section>

          {/* ─── Details-release checklist ─── */}
          <section className="mt-14">
            <SectionHead
              title="Details-release checklist"
              meta="14 questions"
            />
            <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {checklist.map((q) => (
                <div
                  key={q.label}
                  className="border-l-[3px] border-border-light pl-3.5"
                >
                  <p className="type-label-sm text-accent">{q.label}</p>
                  <p className="type-default mt-1 text-text-secondary">
                    {q.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Benchmarks ─── */}
          <section className="mt-14">
            <SectionHead title="Benchmarks used" />
            <ul className="mt-5 list-disc space-y-2 pl-5">
              {benchmarks.map((b) => (
                <li key={b.label} className="type-default text-text-muted">
                  <strong className="text-text-secondary">{b.label}</strong>{" "}
                  {b.body}
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-16 border-t border-border-light pt-5">
            <p className="type-caption text-text-muted">
              Build Canada · Prepared 2026-08-21, before the details release.
              Pre-release terms are leaks until verified against official text.
              Sources: PMO statements, USTR releases, Globe and Mail, Bloomberg,
              CBC, The Hub, Policy Magazine, RBC/BMO/CIBC economics,
              industry-association statements, 2024–2026.
            </p>
          </footer>
        </div>
      </article>
    </div>
  );
}
