import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { parseInlineChart } from "./inline-chart";
import parse from "html-react-parser";
import { chartFenceSource } from "./chart-fence";
import { layoutChart } from "@buildcanada/charts-inline/core";

const fixture = JSON.parse(
  readFileSync(
    new URL("../../../docs/polls/inline-chart.json", import.meta.url),
    "utf8",
  ),
);

test("a self-contained chart lays out and preserves percentages", () => {
  const { definition, dataset } = parseInlineChart(JSON.stringify(fixture));
  assert.equal(dataset.columns.get("percent")?.values[0], 54);
  const scene = layoutChart({
    definition,
    dataset,
    size: { width: 720, height: 500 },
  });
  assert.ok(scene);
});

test("missing values stay missing, zero remains zero", () => {
  const raw = structuredClone(fixture);
  raw.dataset.rows[0].percent = null;
  raw.dataset.rows[1].percent = 0;
  const { dataset } = parseInlineChart(JSON.stringify(raw));
  assert.equal(dataset.columns.get("percent")?.values[0], null);
  assert.equal(dataset.columns.get("percent")?.values[1], 0);
});

test("rejects unknown metrics, invalid numbers and duplicate observations", () => {
  const raw = structuredClone(fixture);
  raw.definition.y = ["not-a-column"];
  assert.throws(() => parseInlineChart(JSON.stringify(raw)));
  raw.definition.y = ["percent"];
  raw.dataset.rows[0].percent = "NaN";
  assert.throws(() => parseInlineChart(JSON.stringify(raw)));
  raw.dataset.rows[0].percent = 54;
  raw.dataset.rows.push(raw.dataset.rows[0]);
  assert.throws(() => parseInlineChart(JSON.stringify(raw)));
});

test("rejects malformed or remote definitions without fetching", () => {
  assert.throws(() => parseInlineChart("not JSON"));
  const raw = structuredClone(fixture);
  raw.definition.data = "https://example.com/private-data";
  assert.throws(() => parseInlineChart(JSON.stringify(raw)));
  raw.definition.data = "inline";
  raw.definition.types = ["made-up-chart"];
  assert.throws(() => parseInlineChart(JSON.stringify(raw)));
});

test("CMS code fences decode their JSON text and ignore ordinary code", () => {
  const source = JSON.stringify(fixture)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const charts: string[] = [];
  parse(
    `<p>Before</p><pre><code class="language-buildcanada-chart">${source}</code></pre><pre><code class="language-json">{}</code></pre><p>After</p>`,
    {
      replace(node) {
        const content = chartFenceSource(node);
        if (content !== null) charts.push(content);
      },
    },
  );
  assert.equal(charts.length, 1);
  assert.equal(
    parseInlineChart(charts[0]).definition.title,
    fixture.definition.title,
  );
});

test("Commonmarker's highlighted pre[lang] output preserves chart JSON", () => {
  const source = JSON.stringify(fixture).replaceAll('"', "&quot;");
  let chartSource: string | null = null;
  parse(
    `<pre lang="buildcanada-chart" style="background-color:#2b303b"><code><span style="color:#c0c5ce">${source}</span></code></pre>`,
    {
      replace(node) {
        chartSource = chartFenceSource(node) ?? chartSource;
      },
    },
  );
  assert.ok(chartSource);
  assert.equal(
    parseInlineChart(chartSource).definition.title,
    fixture.definition.title,
  );
});
