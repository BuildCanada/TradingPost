import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CACHE_DIR } from "./cache";
import type { CheckResult } from "../checks/analysis-checks";

/* ------------------------------ tiny ansi ------------------------------ */
const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

export type FixtureReport = {
  id: string;
  name: string;
  checks: CheckResult[];
  judgment?: { actual: string; expected?: string; match?: boolean };
  social?: { actual: boolean; expected: boolean; match: boolean };
  /** actual abstain-vs-grader agreement, for the cross-consistency flag */
  consistency?: { analysisAbstain: boolean; socialIssue: boolean; agree: boolean };
  cached: boolean;
  /** true when produced via the no-key fallback path (--fallback), not the API */
  fallback?: boolean;
};

/* ---------------------------- confusion math --------------------------- */
type Confusion = { tp: number; fp: number; tn: number; fn: number };

function socialMetrics(reports: FixtureReport[]) {
  const m: Confusion = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const r of reports) {
    if (!r.social) continue;
    const { actual, expected } = r.social;
    if (expected && actual) m.tp++;
    else if (!expected && actual) m.fp++;
    else if (!expected && !actual) m.tn++;
    else m.fn++;
  }
  const total = m.tp + m.fp + m.tn + m.fn;
  const acc = total ? (m.tp + m.tn) / total : NaN;
  const precision = m.tp + m.fp ? m.tp / (m.tp + m.fp) : NaN;
  const recall = m.tp + m.fn ? m.tp / (m.tp + m.fn) : NaN;
  return { ...m, total, acc, precision, recall };
}

function pct(x: number): string {
  return Number.isNaN(x) ? "n/a" : `${(x * 100).toFixed(1)}%`;
}

/* ------------------------------- printing ------------------------------ */
export function printReport(reports: FixtureReport[]): { errorFailures: number } {
  let errorFailures = 0;

  console.log(c.bold("\n=== Per-fixture checks ===\n"));
  for (const r of reports) {
    const errs = r.checks.filter((x) => x.severity === "error" && !x.pass);
    const warns = r.checks.filter((x) => x.severity === "warn" && !x.pass);
    errorFailures += errs.length;

    const status = errs.length === 0 ? c.green("PASS") : c.red("FAIL");
    const cacheTag = r.fallback
      ? c.dim(" (fallback)")
      : r.cached
        ? c.dim(" (cached)")
        : c.dim(" (live)");
    console.log(`${status} ${c.bold(r.id)} — ${r.name}${cacheTag}`);

    for (const e of errs) console.log(`   ${c.red("✗")} ${e.name}: ${e.message}`);
    for (const w of warns)
      console.log(`   ${c.yellow("⚠")} ${w.name}: ${w.message}`);

    if (r.judgment) {
      const j = r.judgment;
      if (j.expected == null) {
        console.log(`   ${c.dim("·")} judgment=${j.actual} ${c.dim("(no label)")}`);
      } else {
        const mark = j.match ? c.green("✓") : c.red("✗");
        console.log(
          `   ${mark} judgment=${j.actual} expected=${j.expected}`,
        );
      }
    }
    if (r.social) {
      const mark = r.social.match ? c.green("✓") : c.red("✗");
      console.log(
        `   ${mark} social_issue=${r.social.actual} expected=${r.social.expected}`,
      );
    }
    if (r.consistency && !r.consistency.agree) {
      console.log(
        `   ${c.yellow("⚠")} consistency: analysis abstain=${r.consistency.analysisAbstain} but grader social_issue=${r.consistency.socialIssue}`,
      );
    }
  }

  /* ---- structural summary ---- */
  const totalErrChecks = reports.reduce(
    (n, r) => n + r.checks.filter((x) => x.severity === "error").length,
    0,
  );
  console.log(c.bold("\n=== Structural checks ===\n"));
  console.log(
    `  ${totalErrChecks - errorFailures}/${totalErrChecks} passed` +
      (errorFailures ? c.red(`  (${errorFailures} failed)`) : c.green("  ✓")),
  );

  /* ---- judgment accuracy ---- */
  const judged = reports.filter((r) => r.judgment?.expected != null);
  if (judged.length) {
    const correct = judged.filter((r) => r.judgment!.match).length;
    console.log(c.bold("\n=== Judgment accuracy (vs label) ===\n"));
    console.log(
      `  ${correct}/${judged.length} correct  (${pct(correct / judged.length)})`,
    );
  }

  /* ---- social-issue accuracy ---- */
  const hasSocial = reports.some((r) => r.social);
  if (hasSocial) {
    const s = socialMetrics(reports);
    console.log(c.bold("\n=== Social-issue classifier ===\n"));
    console.log(
      `  accuracy=${pct(s.acc)}  precision=${pct(s.precision)}  recall=${pct(s.recall)}`,
    );
    console.log(
      c.dim(`  confusion: TP=${s.tp} FP=${s.fp} TN=${s.tn} FN=${s.fn} (n=${s.total})`),
    );
  }

  /* ---- consistency warnings ---- */
  const disagreements = reports.filter((r) => r.consistency && !r.consistency.agree);
  if (disagreements.length) {
    console.log(c.bold("\n=== Cross-consistency warnings ===\n"));
    console.log(
      c.yellow(
        `  ${disagreements.length} fixture(s): summarizeBillText abstain disagrees with socialIssueGrader`,
      ),
    );
    console.log(
      c.dim(
        "  (expected: summarizeBillText ignores its own is_social_issue field; abstain is model-driven)",
      ),
    );
  }

  return { errorFailures };
}

export function writeJsonReport(reports: FixtureReport[]): string {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const path = join(CACHE_DIR, "report.json");
  writeFileSync(
    path,
    JSON.stringify(
      { generatedFrom: "eval:bills", social: socialMetrics(reports), reports },
      null,
      2,
    ),
  );
  return path;
}
