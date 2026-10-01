import assert from "node:assert/strict";
import { test } from "node:test";
import { applyApiFacts, mergeBillLists } from "./merge-bill";
import type { UnifiedBill } from "./billConverters";
import type { BillSummary } from "../types";

function storedBill(overrides: Partial<UnifiedBill> = {}): UnifiedBill {
  return {
    billId: "C-5",
    title: "An Act respecting one thing",
    summary: "The stored summary.",
    status: "Introduced",
    stages: [
      {
        stage: "First Reading",
        state: "Completed",
        house: "House of Commons",
        date: new Date("2026-01-10T00:00:00Z"),
      },
    ],
    final_judgment: "yes",
    rationale: "The stored rationale.",
    steel_man: "The stored steel man.",
    sponsorParty: "Liberal",
    ...overrides,
  };
}

function apiBill(overrides: Partial<UnifiedBill> = {}): UnifiedBill {
  return {
    billId: "C-5",
    title: "An Act respecting one thing",
    summary: "",
    status: "Royal Assent",
    stages: [
      {
        stage: "First Reading",
        state: "Completed",
        house: "House of Commons",
        date: new Date("2026-01-10T00:00:00Z"),
      },
      {
        stage: "Third Reading",
        state: "Completed",
        house: "Senate",
        date: new Date("2026-06-02T00:00:00Z"),
      },
    ],
    final_judgment: "abstain",
    analysisPending: true,
    ...overrides,
  };
}

test("applyApiFacts takes status and stages from the API, verdict from storage", () => {
  const merged = applyApiFacts(storedBill(), apiBill());

  // Facts follow the API — this is the disagreement the detail page used to show.
  assert.equal(merged.status, "Royal Assent");
  assert.equal(merged.stages.length, 2);

  // The verdict stays with the stored analysis.
  assert.equal(merged.final_judgment, "yes");
  assert.equal(merged.summary, "The stored summary.");
  assert.equal(merged.rationale, "The stored rationale.");
  assert.equal(merged.steel_man, "The stored steel man.");
  assert.equal(merged.analysisPending, undefined);
});

test("applyApiFacts leaves the stored bill alone when the API is unavailable", () => {
  const stored = storedBill();
  assert.deepEqual(applyApiFacts(stored, null), stored);
});

test("applyApiFacts keeps stored facts the API omits", () => {
  const merged = applyApiFacts(
    storedBill({ sponsorParty: "Liberal", genres: ["Finance"] }),
    apiBill({ sponsorParty: undefined, genres: [], stages: [] }),
  );
  assert.equal(merged.sponsorParty, "Liberal");
  assert.deepEqual(merged.genres, ["Finance"]);
  // An empty stages array from the API is absence, not a bill losing its stages.
  assert.equal(merged.stages.length, 1);
});

test("mergeBillLists keeps API order and appends database-only bills", () => {
  const api: BillSummary[] = [
    {
      billID: "C-5",
      title: "An Act respecting one thing",
      description: "",
      status: "Passed",
      sponsorParty: "Liberal",
      sponsorName: "Someone",
      chamber: "House of Commons",
      introducedOn: "2026-01-10T00:00:00.000Z",
      lastUpdatedOn: "2026-06-02T00:00:00.000Z",
    },
  ];

  const merged = mergeBillLists(api, [
    storedBill(),
    storedBill({ billId: "S-9", title: "A Senate bill", final_judgment: "no" }),
  ]);

  assert.equal(merged.length, 2);
  assert.equal(merged[0].billID, "C-5");
  // API status wins, stored verdict wins.
  assert.equal(merged[0].status, "Passed");
  assert.equal(merged[0].final_judgment, "yes");
  assert.equal(merged[0].summary, "The stored summary.");

  assert.equal(merged[1].billID, "S-9");
  assert.equal(merged[1].final_judgment, "no");
});
