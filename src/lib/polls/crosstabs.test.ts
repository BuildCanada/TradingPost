import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCrosstabs, questionCrosstabs, crosstabLabel, demographicTitle } from "./crosstabs";
const fixture = {
  schemaVersion: 2,
  breakdowns: [{ id: "all", kind: "overall", label: { en: "All" } }, { id: "age", kind: "census", label: { en: "Age", fr: "Âge" } }],
  tables: [{ id: "q2", type: "single", question: { en: "Same wording" }, columns: [
    { key: "all:total", id: "total", breakdownId: "all", label: "Total" },
    { key: "age:unknown", id: "unknown", breakdownId: "age", label: "Unknown" },
    { key: "age:young", id: "young", breakdownId: "age", label: "18–34" },
  ], rows: [{ id: "base", kind: "unweighted-sample-size", label: "Sample size", values: { "all:total": 50, "age:unknown": 10, "age:young": 120 } }, { id: "yes", kind: "weighted-percent", label: "Yes", values: { "all:total": 0, "age:unknown": 90, "age:young": null } }] }],
};
test("matches question IDs exactly and retains demographic order, zero and missing values", () => {
  const report = parseCrosstabs(fixture);
  const match = questionCrosstabs(report, "q2")!;
  assert.deepEqual(match.columns.map((c) => c.key), ["all:total", "age:young"]);
  assert.deepEqual(match.groups.map((g) => g.id), ["all", "age"]);
  assert.equal(match.table.rows[1].values["all:total"], 0);
  assert.equal(match.table.rows[1].values["age:young"], null);
  assert.equal(questionCrosstabs(report, "Same wording"), null);
  assert.equal(questionCrosstabs(report, "q1"), null);
});
test("rejects invalid downloads and ambiguous question matches", () => {
  for (const value of [null, {}, { ...fixture, schemaVersion: 1 }, { ...fixture, tables: [fixture.tables[0], fixture.tables[0]] }]) assert.throws(() => parseCrosstabs(value));
  const invalid = structuredClone(fixture);
  invalid.tables[0].rows[0].values["all:total"] = Infinity;
  assert.throws(() => parseCrosstabs(invalid));
});
test("uses localized demographic labels with English fallback", () => {
  assert.equal(crosstabLabel({ en: "Age", fr: "Âge" }, "fr"), "Âge");
  assert.equal(crosstabLabel({ en: "Age" }, "fr"), "Age");
});

test("simplifies known demographic titles without rewriting unknown questions", () => {
  assert.equal(demographicTitle({ id: "qx5-income", label: "What is your household income?" }, "en"), "Household income");
  assert.equal(demographicTitle({ id: "custom", label: "Custom subgroup" }, "en"), "Custom subgroup");
});

test("suppresses every value for bases below 50, preserving 50 and missing-base suppression", () => {
  const raw = structuredClone(fixture);
  raw.tables[0].rows[0].values["age:young"] = 49;
  raw.tables[0].rows[1].values["age:young"] = 12;
  const table = parseCrosstabs(raw).tables[0];
  assert.equal(table.rows[1].values["all:total"], 0);
  assert.equal(table.rows[0].values["age:young"], null);
  assert.equal(table.rows[1].values["age:young"], null);
  assert.ok(table.suppressedColumns?.includes("age:young"));
  assert.equal(raw.tables[0].rows[1].values["age:young"], 12);
  raw.tables[0].rows.shift();
  assert.equal(parseCrosstabs(raw).tables[0].rows[0].values["all:total"], null);
});
