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
 * Curated bills spanning the decision space. Add a fixture by dropping a
 * `<id>.md` in this directory (see fetch-fixture.ts to bootstrap from a real
 * bill) and appending a labeled record below.
 */
export const FIXTURES: Fixture[] = [
  {
    id: "national-fiddle-day",
    name: "National Fiddle Day Act (observance)",
    markdownFile: "national-fiddle-day.md",
    expected: { isSocialIssue: true, finalJudgment: "abstain" },
  },
  {
    id: "national-symbol-tartan",
    name: "National Tartan Act (national symbol)",
    markdownFile: "national-symbol-tartan.md",
    expected: { isSocialIssue: true, finalJudgment: "abstain" },
  },
  {
    id: "indigenous-languages-recognition",
    name: "Indigenous Languages Recognition Act (rights/identity)",
    markdownFile: "indigenous-languages-recognition.md",
    expected: { isSocialIssue: true, finalJudgment: "abstain" },
  },
  {
    id: "resource-corridor-act",
    name: "National Resource and Energy Corridor Act (pro-tenet)",
    markdownFile: "resource-corridor-act.md",
    expected: { isSocialIssue: false, finalJudgment: "yes" },
  },
  {
    id: "small-business-tax-reform",
    name: "Small Business Growth Incentives Act (pro-tenet)",
    markdownFile: "small-business-tax-reform.md",
    expected: { isSocialIssue: false, finalJudgment: "yes" },
  },
  {
    id: "interprovincial-trade-barriers",
    name: "Internal Free Trade and Labour Mobility Act (pro-tenet)",
    markdownFile: "interprovincial-trade-barriers.md",
    expected: { isSocialIssue: false, finalJudgment: "yes" },
  },
  {
    id: "permit-expansion-act",
    name: "Commercial Construction Oversight Act (adds red tape)",
    markdownFile: "permit-expansion-act.md",
    expected: { isSocialIssue: false, finalJudgment: "no" },
  },
  {
    id: "departmental-reporting-amendment",
    name: "Financial Administration Act reporting-date amendment (administrative)",
    markdownFile: "departmental-reporting-amendment.md",
    // Genuinely neutral/administrative — no judgment label, structural checks only.
    expected: { isSocialIssue: false },
  },
];

const FIXTURE_DIR = dirname(fileURLToPath(import.meta.url));

export function loadFixtureText(f: Fixture): string {
  return readFileSync(join(FIXTURE_DIR, f.markdownFile), "utf8");
}
