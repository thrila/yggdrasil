import { test } from "node:test";
import assert from "node:assert/strict";
import { applyFilters, defaultFilters, parseQuery, restoreFilters, tagCounts } from "../shared/filters.js";
import type { Job } from "../shared/types.js";

const now = Date.parse("2026-10-30T12:00:00Z");
const day = 864e5;
const job = (id: string, over: Partial<Job> = {}): Job => ({
  id, title: id, org: "Acme", location: "Worldwide", url: "", source: "Board", posted: new Date(now - day).toISOString(),
  kind: "job", tags: ["remote"], first_seen: 0, last_seen: 0, active: true, score: 1, ...over,
});
const ids = (jobs: Job[]) => jobs.map((j) => j.id);

test("search requires every word and drops -excluded words", () => {
  assert.deepEqual(parseQuery("  Rust -Senior - "), { include: ["rust"], exclude: ["senior"] });
  const jobs = [job("Rust engineer"), job("Senior Rust engineer"), job("Go engineer")];
  assert.deepEqual(ids(applyFilters(jobs, defaultFilters(false), "rust -senior", false, now).visible), ["Rust engineer"]);
});

test("location-restricted and non-matching roles are hidden by default, relocation always passes", () => {
  const jobs = [job("ok"), job("us-only", { tags: ["remote", "restricted"] }), job("off-topic", { score: 0 }),
    job("relocate", { score: 0, tags: ["relocation"] })];
  assert.deepEqual(ids(applyFilters(jobs, defaultFilters(false), "", false, now).visible).sort(), ["ok", "relocate"]);
  const loose = { ...defaultFilters(false), matching: false, hideRestricted: false };
  assert.equal(applyFilters(jobs, loose, "", false, now).visible.length, 4);
});

test("posted-within uses first_seen when a feed gave no date", () => {
  const jobs = [job("fresh"), job("old", { posted: new Date(now - 40 * day).toISOString() }),
    job("undated-new", { posted: "", first_seen: now - day }), job("undated-old", { posted: "", first_seen: now - 40 * day })];
  const f = { ...defaultFilters(false), days: 7 };
  assert.deepEqual(ids(applyFilters(jobs, f, "", false, now).visible).sort(), ["fresh", "undated-new"]);
});

test("sorts by newest, best match, or soonest deadline with undated deadlines last", () => {
  const jobs = [job("a", { score: 1, posted: new Date(now - 3 * day).toISOString() }),
    job("b", { score: 3, posted: new Date(now - 2 * day).toISOString(), deadline: "2026-12-01" }),
    job("c", { score: 2, posted: new Date(now - day).toISOString(), deadline: "2026-11-05" })];
  const run = (sort: "newest" | "match" | "deadline") => ids(applyFilters(jobs, { ...defaultFilters(false), sort }, "", false, now).visible);
  assert.deepEqual(run("newest"), ["c", "b", "a"]);
  assert.deepEqual(run("match"), ["b", "c", "a"]);
  assert.deepEqual(run("deadline"), ["c", "b", "a"]);
});

test("tag counts reflect active tags and keep a selected tag even when nothing has it", () => {
  const jobs = [job("1", { tags: ["remote", "rust"] }), job("2", { tags: ["remote", "python"] }), job("3", { tags: ["rust"] })];
  assert.deepEqual(tagCounts(jobs, ["rust"]), [["rust", 2], ["remote", 1]]);
  assert.deepEqual(tagCounts(jobs, ["zk"]), [["zk", 0]]);
});

test("hide seen keeps seen listings out of the list but in the bulk-action set", () => {
  const jobs = [job("seen", { seen: true }), job("unseen")];
  const r = applyFilters(jobs, { ...defaultFilters(false), hideSeen: true }, "", false, now);
  assert.deepEqual(ids(r.visible), ["unseen"]);
  assert.equal(r.shown.length, 2);
});

test("restored filters ignore malformed fields", () => {
  const fallback = defaultFilters(true);
  assert.deepEqual(restoreFilters(null, fallback), fallback);
  const r = restoreFilters({ tags: ["rust", 3], days: 5, sort: "match", hideSeen: true, source: "Board" }, fallback);
  assert.deepEqual(r, { ...fallback, sort: "match", hideSeen: true, source: "Board" });
});

test("the added sort lists the most recently shortlisted first", () => {
  const jobs = [job("old", { interested_ts: 1 }), job("new", { interested_ts: 3 }), job("mid", { interested_ts: 2 })];
  assert.deepEqual(ids(applyFilters(jobs, { ...defaultFilters(true), sort: "added" }, "", true, now).visible), ["new", "mid", "old"]);
});
