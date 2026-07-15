/**
 * Manual eval suite for the /bills LLM features. Run explicitly — it spends
 * OpenAI tokens on a cache miss.
 *
 *   pnpm eval:bills                 # run all fixtures (cached where possible)
 *   pnpm eval:bills --refresh       # bypass cache, re-call the API
 *   pnpm eval:bills --only=social   # only the social-issue classifier
 *   pnpm eval:bills --only=analysis # only summarizeBillText
 *   pnpm eval:bills --grep=tax      # only fixtures whose id includes "tax"
 *   pnpm eval:bills --fallback      # force no-key fallback path (0 tokens)
 *
 * Exit code is non-zero when any structural check fails. Accuracy and
 * consistency are reported but never gate the run (they are probabilistic).
 */
import { summarizeBillText } from "@/app/bills/services/billApi";
import {
  socialIssueGrader,
  SOCIAL_ISSUE_GRADER_PROMPT,
} from "@/app/bills/services/social-issue-grader";
import { SUMMARY_AND_VOTE_PROMPT } from "@/app/bills/prompt/summary-and-vote-prompt";
import { FIXTURES, loadFixtureText } from "./fixtures/bills";
import { checkAnalysis } from "./checks/analysis-checks";
import { runCached, type CacheStats } from "./lib/cache";
import { printReport, writeJsonReport, type FixtureReport } from "./lib/report";

function parseArgs(argv: string[]) {
  const get = (name: string) =>
    argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  return {
    refresh: argv.includes("--refresh"),
    fallback: argv.includes("--fallback"),
    only: get("only") as "social" | "analysis" | undefined,
    grep: get("grep"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.fallback) {
    // Force every internal `if (!OPENAI_API_KEY)` fallback branch.
    delete process.env.OPENAI_API_KEY;
    console.log("Running in --fallback mode: no API calls, exercising fallbacks.");
  } else if (!process.env.OPENAI_API_KEY) {
    console.log(
      "\nOPENAI_API_KEY is not set. The functions will return fallback output.",
    );
    console.log(
      "Set the key for a real eval, or pass --fallback to exercise fallbacks intentionally.\n",
    );
  }

  const runAnalysis = args.only !== "social";
  const runSocial = args.only !== "analysis";

  const fixtures = FIXTURES.filter(
    (f) => !args.grep || f.id.includes(args.grep),
  );
  if (fixtures.length === 0) {
    console.error(`No fixtures match --grep=${args.grep}`);
    process.exit(1);
  }

  const stats: CacheStats = { hits: 0, misses: 0 };
  const reports: FixtureReport[] = [];

  for (const f of fixtures) {
    const text = loadFixtureText(f);
    const report: FixtureReport = {
      id: f.id,
      name: f.name,
      checks: [],
      cached: false,
      fallback: args.fallback,
    };
    let analysisAbstain: boolean | undefined;
    let socialResult: boolean | undefined;

    if (runAnalysis) {
      // In fallback mode the result is deterministic and free — skip the cache.
      const { value: analysis, cached } = args.fallback
        ? { value: await summarizeBillText(text, { bypassCap: true }), cached: false }
        : await runCached(
            "analysis",
            text,
            SUMMARY_AND_VOTE_PROMPT,
            () => summarizeBillText(text, { bypassCap: true }),
            { refresh: args.refresh, stats },
          );
      report.cached = cached;
      report.checks = checkAnalysis(analysis);
      analysisAbstain = analysis.final_judgment === "abstain";
      report.judgment = {
        actual: analysis.final_judgment,
        expected: f.expected.finalJudgment,
        match: f.expected.finalJudgment
          ? analysis.final_judgment === f.expected.finalJudgment
          : undefined,
      };
    }

    if (runSocial) {
      const { value: social } = args.fallback
        ? { value: await socialIssueGrader(text) }
        : await runCached(
            "social",
            text,
            SOCIAL_ISSUE_GRADER_PROMPT,
            () => socialIssueGrader(text),
            { refresh: args.refresh, stats },
          );
      socialResult = social;
      report.social = {
        actual: social,
        expected: f.expected.isSocialIssue,
        match: social === f.expected.isSocialIssue,
      };
    }

    if (analysisAbstain !== undefined && socialResult !== undefined) {
      report.consistency = {
        analysisAbstain,
        socialIssue: socialResult,
        agree: analysisAbstain === socialResult,
      };
    }

    reports.push(report);
  }

  const { errorFailures } = printReport(reports);
  const jsonPath = writeJsonReport(reports);

  console.log(
    `\ncache: ${stats.hits} hit(s), ${stats.misses} miss(es). report: ${jsonPath}`,
  );

  if (errorFailures > 0) {
    console.log(`\n${errorFailures} structural check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll structural checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
