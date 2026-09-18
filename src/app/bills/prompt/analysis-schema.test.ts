import assert from "node:assert/strict";
import { test } from "node:test";
import { BILL_ANALYSIS_SCHEMA } from "./analysis-schema";

// The schema is `as const`, so every member is readonly; the walker below wants
// a plain shape to read.
const SCHEMA = BILL_ANALYSIS_SCHEMA as unknown as Node;

type Node = {
  type?: string;
  properties?: Record<string, Node>;
  required?: string[];
  additionalProperties?: boolean;
  items?: Node;
  enum?: unknown[];
};

/**
 * OpenAI rejects a malformed `strict: true` schema at request time, and
 * summarizeBillText turns that rejection into a fallback `abstain`. A silent
 * downgrade of every analysis is worth a test that costs nothing.
 */
function walkObjects(node: Node, path: string, visit: (n: Node, p: string) => void) {
  if (node.type === "object") {
    visit(node, path);
    for (const [key, child] of Object.entries(node.properties ?? {})) {
      walkObjects(child, `${path}.${key}`, visit);
    }
  }
  if (node.type === "array" && node.items) {
    walkObjects(node.items, `${path}[]`, visit);
  }
}

test("every object sets additionalProperties: false", () => {
  walkObjects(SCHEMA, "root", (node, path) => {
    assert.equal(
      node.additionalProperties,
      false,
      `${path} must set additionalProperties: false`,
    );
  });
});

test("every object lists all of its properties as required", () => {
  walkObjects(SCHEMA, "root", (node, path) => {
    const properties = Object.keys(node.properties ?? {}).sort();
    const required = [...(node.required ?? [])].sort();
    assert.deepEqual(
      required,
      properties,
      `${path}: strict mode requires every property in \`required\``,
    );
  });
});

test("the schema asks for the fields the analysis reads", () => {
  const properties = Object.keys(
    (SCHEMA).properties ?? {},
  );
  // These three were read by the parser but never requested, so they came back
  // empty on every bill ever analyzed.
  for (const field of ["steel_man", "needs_more_info", "missing_details"]) {
    assert.ok(properties.includes(field), `schema must request ${field}`);
  }
  // Answered here rather than by a second call that disagreed with this one.
  assert.ok(properties.includes("is_social_issue"));
});

test("judgment and alignment are closed enums", () => {
  const root = SCHEMA;
  assert.deepEqual(root.properties?.final_judgment.enum, [
    "yes",
    "no",
    "abstain",
  ]);
  assert.deepEqual(
    root.properties?.tenet_evaluations.items?.properties?.alignment.enum,
    ["aligns", "conflicts", "neutral"],
  );
});

test("the tenet ids are a closed set of eight", () => {
  const tenets = SCHEMA.properties?.tenet_evaluations;
  assert.deepEqual(tenets?.items?.properties?.id.enum, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("no keyword that strict mode rejects", () => {
  // OpenAI 400s a strict schema carrying any of these, and summarizeBillText
  // turns a 400 into a fallback `abstain` — so every bill would silently lose
  // its analysis. Array counts belong in `description` and the eval checks.
  const banned = [
    "minItems",
    "maxItems",
    "uniqueItems",
    "contains",
    "minContains",
    "maxContains",
    "unevaluatedItems",
    "minLength",
    "maxLength",
    "pattern",
    "format",
    "minimum",
    "maximum",
    "multipleOf",
    "patternProperties",
    "unevaluatedProperties",
    "propertyNames",
    "minProperties",
    "maxProperties",
  ];
  const serialized = JSON.stringify(BILL_ANALYSIS_SCHEMA);
  for (const keyword of banned) {
    assert.ok(
      !serialized.includes(`"${keyword}"`),
      `schema uses ${keyword}, which strict mode rejects`,
    );
  }
});
