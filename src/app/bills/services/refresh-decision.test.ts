import assert from "node:assert/strict";
import { test } from "node:test";
import { analysisReason } from "./refresh-decision";

const ANALYSED = new Date("2026-03-01T00:00:00Z");

test("a bill we have never seen is analyzed", () => {
  assert.equal(analysisReason(undefined, "a.xml", 1, false), "new");
});

test("a stored bill with no analysis is analyzed", () => {
  assert.equal(
    analysisReason({ source: "a.xml", billTextsCount: 1, hasAnalysis: false }, "a.xml", 1, false),
    "no-analysis",
  );
});

test("a new bill text means the verdict is re-run", () => {
  const stored = { source: "first-reading.xml", billTextsCount: 1, hasAnalysis: true, analysedAt: ANALYSED };
  assert.equal(
    analysisReason(stored, "third-reading.xml", 1, false),
    "source-changed",
  );
});

test("an extra bill text means the verdict is re-run", () => {
  const stored = { source: "a.xml", billTextsCount: 1, hasAnalysis: true, analysedAt: ANALYSED };
  assert.equal(analysisReason(stored, "a.xml", 2, false), "count-changed");
});

test("an unchanged bill costs no OpenAI call", () => {
  const stored = { source: "a.xml", billTextsCount: 1, hasAnalysis: true, analysedAt: ANALYSED };
  assert.equal(analysisReason(stored, "a.xml", 1, false), null);
});

test("force re-runs an unchanged bill", () => {
  const stored = { source: "a.xml", billTextsCount: 1, hasAnalysis: true, analysedAt: ANALYSED };
  assert.equal(analysisReason(stored, "a.xml", 1, true), "forced");
});

test("a bill that has never had a source stays unchanged", () => {
  const stored = { source: undefined, billTextsCount: 0, hasAnalysis: true, analysedAt: ANALYSED };
  assert.equal(analysisReason(stored, undefined, 0, false), null);
});

test("a legacy row with an analysis but no timestamp is not re-analyzed", () => {
  // Rows predating `analysisGeneratedAt` have a verdict but no date. Treating
  // them as unanalyzed would re-pay for every bill in the database at once.
  const legacy = { source: "a.xml", billTextsCount: 1, hasAnalysis: true };
  assert.equal(analysisReason(legacy, "a.xml", 1, false), null);
  assert.equal(analysisReason(legacy, "b.xml", 1, false), "source-changed");
});
