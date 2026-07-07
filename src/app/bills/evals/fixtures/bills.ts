import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type Judgment = "yes" | "no" | "abstain";

export type FixtureLabel = {
  /** Hand-labeled ground truth for the social-issue classifier. */
  isSocialIssue: boolean;
  /**
   * Expected final_judgment. Omit where the correct call is genuinely
   * ambiguous — structural checks still run, accuracy just skips the case.
   */
  finalJudgment?: Judgment;
};

export type Fixture = {
  id: string;
  name: string;
  markdownFile: string;
  expected: FixtureLabel;
};

/**
 * Real Parliament-45 bills spanning the decision space, fetched via
 * fetch-fixture.ts. Labels are grounded in Build Canada's documented positions
 * (pro-growth, internal free trade + labour mobility, red-tape reduction,
 * resource/energy development, pro-reinvestment tax reform, government
 * efficiency; social/rights/identity issues are out of scope → abstain).
 *
 * Add a fixture by fetching a bill (`pnpm tsx fixtures/fetch-fixture.ts <id>`)
 * and appending a labeled record below. Omit `finalJudgment` where the bill
 * genuinely pulls in two directions — accuracy just skips it, structural
 * checks still run.
 */
export const FIXTURES: Fixture[] = [
  // --- Social / rights / identity → abstain -------------------------------
  {
    id: "arab-heritage-month",
    name: "S-227 — Arab Heritage Month (heritage month)",
    markdownFile: "arab-heritage-month.md",
    expected: { isSocialIssue: true, finalJudgment: "abstain" },
  },
  {
    id: "national-bird-canada-jay",
    name: "S-221 — Canada jay as national bird (national symbol)",
    markdownFile: "national-bird-canada-jay.md",
    expected: { isSocialIssue: true, finalJudgment: "abstain" },
  },
  {
    id: "criminal-hate-propaganda",
    name: "C-9 — Criminal Code hate propaganda / hate crime (rights/identity)",
    markdownFile: "criminal-hate-propaganda.md",
    expected: { isSocialIssue: true, finalJudgment: "abstain" },
  },

  // --- Clear alignment with the tenets → yes ------------------------------
  {
    id: "free-trade-labour-mobility",
    name: "C-5 — Free Trade and Labour Mobility + Building Canada Act (internal trade, major projects)",
    markdownFile: "free-trade-labour-mobility.md",
    // Research-confirmed flagship alignment: removes internal trade barriers,
    // labour mobility, single-authorization major-project permitting.
    expected: { isSocialIssue: false, finalJudgment: "yes" },
  },
  {
    id: "skilled-trades-labour-mobility",
    name: "C-266 — National framework for skilled trades & labour mobility",
    markdownFile: "skilled-trades-labour-mobility.md",
    expected: { isSocialIssue: false, finalJudgment: "yes" },
  },

  // --- Clear conflict with the tenets → no --------------------------------
  {
    id: "labour-code-replacement-workers",
    name: "C-284 — Canada Labour Code, ban on replacement workers (labour-market rigidity)",
    markdownFile: "labour-code-replacement-workers.md",
    expected: { isSocialIssue: false, finalJudgment: "no" },
  },
  {
    id: "supply-management-protection",
    name: "C-202 — Entrench supply management in trade policy (protectionism)",
    markdownFile: "supply-management-protection.md",
    // Locks dairy/poultry/egg tariff-rate quotas out of trade negotiations —
    // directly conflicts with the free-trade / exports / competitiveness tenets.
    expected: { isSocialIssue: false, finalJudgment: "no" },
  },
  {
    id: "basic-income-framework",
    name: "C-253 — National framework for a guaranteed livable basic income (redistribution/fiscal expansion)",
    markdownFile: "basic-income-framework.md",
    // Fiscal/redistributive (not rights/identity → not a social-issue abstain);
    // conflicts with government efficiency and "wealth creation before
    // redistribution".
    expected: { isSocialIssue: false, finalJudgment: "no" },
  },

  // --- Genuinely two-sided / administrative → no judgment label -----------
  {
    id: "industry-act-small-business",
    name: "C-291 — Mandatory small-business impact assessment on all legislation",
    markdownFile: "industry-act-small-business.md",
    // Pro-small-business intent, but adds a mandatory assessment gate to every
    // legislative initiative (red tape). Genuinely ambiguous — structural only.
    expected: { isSocialIssue: false },
  },
  {
    id: "financial-administration-amendment",
    name: "C-230 — Public registry of forgiven Crown debts (administrative transparency)",
    markdownFile: "financial-administration-amendment.md",
    expected: { isSocialIssue: false },
  },
];

const FIXTURE_DIR = dirname(fileURLToPath(import.meta.url));

export function loadFixtureText(f: Fixture): string {
  return readFileSync(join(FIXTURE_DIR, f.markdownFile), "utf8");
}
