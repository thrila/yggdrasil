import { test } from "node:test";
import assert from "node:assert/strict";
import { ADAPTERS, runAll } from "../electron/collect.cjs";
import { inTab } from "../electron/opportunities.cjs";
import { createBrowserApi } from "../src/browser-api.js";
import type { Job, JobStore, Source } from "../shared/types.js";

const memStore = (): JobStore => ({ d: { jobs: {}, runs: {}, meta: {} }, save() { /* no disk */ } });
const only = (store: JobStore): Job => Object.values(store.d.jobs)[0]!;

test("an interested mark survives refreshes on both the rebuild and the lightweight-merge paths", async () => {
  const originalAts = ADAPTERS.ats, originalRss = ADAPTERS.rss;
  const store = memStore();
  const ats: Source = { name: "ATS", type: "ats", boards: ["ashby:employer"] };
  const rss: Source = { name: "Feed", type: "rss", url: "https://feed.example/rss" };
  const posting = { title: "Backend Engineer", location: "Remote Worldwide", url: "https://employer.example/job", org: "Employer", posted: "", text: "Rust" };
  try {
    ADAPTERS.ats = async () => [posting];
    await runAll(store, {} as never, [ats]);
    only(store).interested = true;
    only(store).interested_ts = 1750000000000;
    await runAll(store, {} as never, [ats]);
    assert.equal(only(store).interested, true);
    assert.equal(only(store).interested_ts, 1750000000000);

    ADAPTERS.rss = async () => [{ ...posting, org: "", location: "" }];
    await runAll(store, {} as never, [ats, rss]);
    assert.equal(only(store).interested, true);
  } finally { ADAPTERS.ats = originalAts; ADAPTERS.rss = originalRss; }
});

test("the Interested tab holds any kind of listing, including closed ones, and nothing else", () => {
  assert.equal(inTab({ active: false, kind: "grant", tags: [], interested: true }, "interested"), true);
  assert.equal(inTab({ active: true, kind: "job", tags: ["remote"] }, "interested"), false);
  // Shortlisting does not pull a closed listing back into the other tabs.
  assert.equal(inTab({ active: false, kind: "job", tags: ["remote"], interested: true }, "worldwide"), false);
});

test("the preview shortlists and unshortlists through browser storage", async () => {
  const values = new Map<string, string>();
  const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
  const api = createBrowserApi(storage);
  assert.equal((await api.jobs("interested")).length, 0);
  const [first] = await api.jobs("worldwide");
  await api.markInterested([first!.id], true);
  const restored = createBrowserApi(storage);
  assert.deepEqual((await restored.jobs("interested")).map((j) => j.id), [first!.id]);
  await restored.markInterested([first!.id], false);
  assert.equal((await restored.jobs("interested")).length, 0);
});
