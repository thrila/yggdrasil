import { test } from "node:test";
import assert from "node:assert/strict";
import { dedupe } from "../shared/dedupe.js";
import type { Job } from "../shared/types.js";

const job = (id: string, over: Partial<Job> = {}): Job => ({
  id, title: "Senior Rust Engineer", org: "Acme", location: "Remote", url: `https://x/${id}`, source: "Feed",
  posted: "2026-10-01T00:00:00Z", kind: "job", tags: ["remote", "rust"], first_seen: 5, last_seen: 5, active: true, ...over,
});

test("the same role across boards becomes one card led by the company board", () => {
  const out = dedupe([
    job("feed", { title: "Senior Rust engineer ", source: "RemoteOK", location: "Worldwide", score: 1 }),
    job("ats", { source: "greenhouse:acme", source_type: "ats", location: "Remote, Poland", tags: ["remote", "restricted", "rust"], score: 2, first_seen: 9 }),
  ]);
  assert.equal(out.length, 1);
  const [j] = out;
  assert.equal(j!.id, "ats");
  assert.deepEqual(j!.dupe_ids, ["feed"]);
  assert.deepEqual(j!.also_via, ["RemoteOK"]);
  assert.equal(j!.location, "Remote, Poland; Worldwide");
  assert.ok(!j!.tags.includes("restricted"), "one unrestricted copy keeps the role reachable");
  assert.equal(j!.score, 2);
  assert.equal(j!.first_seen, 5);
});

test("different stacks, kinds and companies are not merged", () => {
  const out = dedupe([
    job("ruby", { title: "Backend Engineer (Ruby)" }), job("py", { title: "Backend Engineer (Python)" }),
    job("other", { org: "Globex" }), job("hack", { kind: "hackathon" }), job("noorg1", { org: "" }), job("noorg2", { org: "" }),
  ]);
  assert.equal(out.length, 6);
});

test("a folded card is seen only when every copy is", () => {
  assert.equal(dedupe([job("a", { seen: true }), job("b")])[0]!.seen, false);
  assert.equal(dedupe([job("a", { seen: true }), job("b", { seen: true })])[0]!.seen, true);
});

test("a folded card is interested when any copy is", () => {
  const [j] = dedupe([job("a"), job("b", { interested: true, interested_ts: 7 })]);
  assert.equal(j!.interested, true);
  assert.equal(j!.interested_ts, 7);
});
