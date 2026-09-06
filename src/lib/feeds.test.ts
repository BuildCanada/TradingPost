import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../app/feeds/[feed]/route";

test("RSS proxy preserves XML and does not forward private credentials or query parameters", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    assert.ok(url.endsWith("/feeds/all.xml"));
    assert.equal(new URL(url).search, "");
    assert.deepEqual(init.headers, { Accept: "application/rss+xml" });
    assert.equal(init.redirect, "error");
    return new Response('<?xml version="1.0"?><rss version="2.0"/>', {
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  });
  const response = await GET(new Request("https://buildcanada.com/feeds/all.xml?preview=true", {
    headers: { Authorization: "Bearer private", Cookie: "session=private" },
  }), { params: Promise.resolve({ feed: "all.xml" }) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/rss+xml; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "public, max-age=60");
  assert.equal(await response.text(), '<?xml version="1.0"?><rss version="2.0"/>');
});

test("unknown feed paths do not reach the backend", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Unexpected fetch"); });
  const response = await GET(new Request("https://buildcanada.com/feeds/private.xml"),
    { params: Promise.resolve({ feed: "private.xml" }) });
  assert.equal(response.status, 404);
});

test("upstream errors do not expose response bodies", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("Private upstream detail", { status: 500 }));
  const response = await GET(new Request("https://buildcanada.com/feeds/polls.xml"),
    { params: Promise.resolve({ feed: "polls.xml" }) });
  assert.equal(response.status, 502);
  assert.equal(await response.text(), "Feed unavailable");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("HTML responses are not served as feeds", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("<html>Login</html>", {
    headers: { "Content-Type": "text/html" },
  }));
  const response = await GET(new Request("https://buildcanada.com/feeds/posts.xml"),
    { params: Promise.resolve({ feed: "posts.xml" }) });
  assert.equal(response.status, 502);
});
