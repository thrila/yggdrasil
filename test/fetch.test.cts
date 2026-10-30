import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { ADAPTERS, FETCH } from "../electron/collect.cjs";
import type { Unit } from "../shared/types.js";

const saved = { ...FETCH };
let base = "", hits: Record<string, number> = {};
const server = http.createServer((req, res) => {
  const path = req.url!;
  const n = hits[path] = (hits[path] ?? 0) + 1;
  const rss = '<rss><channel><item><title>Rust Engineer</title><link>https://jobs.example/1</link></item></channel></rss>';
  if (path === "/slow-but-steady") { // Longer overall than the stall limit, never idle for that long.
    res.write(rss.slice(0, 20));
    let i = 20;
    const t = setInterval(() => {
      if (i >= rss.length) { clearInterval(t); res.end(); return; }
      res.write(rss.slice(i, i + 20)); i += 20;
    }, 15);
  } else if (path === "/stalls-once") {
    if (n === 1) { res.write(rss.slice(0, 20)); return; } // Never finishes.
    res.end(rss);
  } else if (path === "/busy-once") {
    if (n === 1) { res.writeHead(429, { "Retry-After": "0" }); res.end(); return; }
    res.end(rss);
  } else if (path === "/broken-once") {
    if (n === 1) { res.writeHead(503); res.end(); return; }
    res.end(rss);
  } else if (path === "/reset-once") {
    if (n === 1) { req.socket.destroy(); return; }
    res.end(rss);
  } else if (path === "/challenge") { res.writeHead(403, { "Cf-Mitigated": "challenge" }); res.end(); }
  else if (path === "/gone") { res.writeHead(404); res.end(); }
  else if (path === "/always-down") { res.writeHead(500); res.end(); }
  else res.end(rss);
});
const rss = (path: string) => ADAPTERS.rss({ name: path, type: "rss", url: base + path } as Unit, {} as never, {} as never);

before(async () => {
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  Object.assign(FETCH, { stallMs: 80, totalMs: 2000, backoffMs: 5, attempts: 3 });
});
after(() => { Object.assign(FETCH, saved); server.closeAllConnections(); server.close(); });

test("a download longer than the stall limit succeeds while data keeps arriving", async () => {
  const [item] = await rss("/slow-but-steady");
  assert.equal(item!.title, "Rust Engineer");
  assert.equal(hits["/slow-but-steady"], 1);
});

for (const path of ["/stalls-once", "/busy-once", "/broken-once", "/reset-once"]) {
  test(`${path} is retried and recovers`, async () => {
    assert.equal((await rss(path)).length, 1);
    assert.equal(hits[path], 2);
  });
}

test("a missing page fails at once and a dead server stops after the attempt limit", async () => {
  await assert.rejects(rss("/gone"), /HTTP 404/);
  assert.equal(hits["/gone"], 1);
  await assert.rejects(rss("/always-down"), /HTTP 500/);
  assert.equal(hits["/always-down"], 3);
});

test("a bot challenge is reported plainly and never retried", async () => {
  await assert.rejects(rss("/challenge"), /Blocked by the site's bot check/);
  assert.equal(hits["/challenge"], 1);
});

test("a paid POST is never repeated", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => { calls++; return new Response("{}", { status: 503 }); }) as typeof fetch;
  try {
    const store = { d: { jobs: {}, runs: {}, meta: {} }, save() {} };
    const cfg = { xaiKey: "k", xQueries: ["q"], xModel: "m", xCallsPerDay: 5 };
    await assert.rejects(ADAPTERS.xsearch({ name: "X", type: "xsearch" } as Unit, cfg as never, store as never), /HTTP 503/);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});

test("a refresh never exceeds its limits, and one hung host does not hold up the others", async () => {
  const { runAll, RUN } = await import("../electron/collect.cjs");
  const original = ADAPTERS.ats, originalRss = ADAPTERS.rss;
  const active: Record<string, number> = {}, peak: Record<string, number> = {};
  let total = 0, maxTotal = 0, fastDone = 0, slowDoneAt = 0, fastDoneAt = 0;
  const hold = async (host: string, ms: number) => {
    active[host] = (active[host] ?? 0) + 1; total++;
    peak[host] = Math.max(peak[host] ?? 0, active[host]!); maxTotal = Math.max(maxTotal, total);
    await new Promise((r) => setTimeout(r, ms));
    active[host]!--; total--;
  };
  ADAPTERS.ats = async (u) => {
    const kind = (u as { board: string }).board.split(":")[0]!;
    await hold(kind, kind === "greenhouse" ? 60 : 1);
    if (kind === "greenhouse") slowDoneAt = Date.now();
    else { fastDone++; fastDoneAt = Date.now(); }
    return [];
  };
  ADAPTERS.rss = async () => { await hold("rss", 1); return []; };
  const boards = Array.from({ length: 8 }, (_, i) => `greenhouse:g${i}`).concat(Array.from({ length: 8 }, (_, i) => `ashby:a${i}`));
  const store = { d: { jobs: {}, runs: {}, meta: {} }, save() {} };
  try {
    await runAll(store as never, {} as never, [{ name: "boards", type: "ats", boards }] as never);
    assert.equal(Object.keys(store.d.runs).length, 16);
    assert.ok(peak.greenhouse! <= RUN.perHost && peak.ashby! <= RUN.perHost);
    assert.ok(maxTotal <= RUN.total);
    assert.equal(fastDone, 8);
    assert.ok(fastDoneAt < slowDoneAt, "the quick host finishes first instead of waiting for the slow one");
  } finally { ADAPTERS.ats = original; ADAPTERS.rss = originalRss; }
});

test("a failed source keeps its listings, retries next refresh, and remembers its last success", async () => {
  const { runAll } = await import("../electron/collect.cjs");
  const original = ADAPTERS.rss;
  const store = { d: { jobs: {} as Record<string, { active: boolean }>, runs: {} as Record<string, { ok: boolean; fails?: number; last_ok?: number }>, meta: {} }, save() {} };
  const source = [{ name: "Feed", type: "rss", url: "https://feed.example/rss", min_interval_hours: 6 }];
  let calls = 0;
  try {
    ADAPTERS.rss = async () => { calls++; return [{ title: "Engineer", url: "https://x.example/1", org: "Acme", location: "Remote", posted: "", text: "" }]; };
    await runAll(store as never, {} as never, source as never);
    const lastOk = store.d.runs.Feed!.last_ok;
    ADAPTERS.rss = async () => { calls++; throw new Error("No data for 30s"); };
    delete (store.d.meta as { polls?: unknown }).polls;
    await runAll(store as never, {} as never, source as never);
    await runAll(store as never, {} as never, source as never);
    assert.equal(calls, 3, "a failure leaves no polling cooldown");
    assert.equal(store.d.runs.Feed!.ok, false);
    assert.equal(store.d.runs.Feed!.fails, 2);
    assert.equal(store.d.runs.Feed!.last_ok, lastOk);
    assert.equal(Object.values(store.d.jobs)[0]!.active, true);
  } finally { ADAPTERS.rss = original; }
});

test("saving is atomic and a corrupt store is set aside, not overwritten", async () => {
  const { createStore } = await import("../electron/collect.cjs");
  const fs = await import("node:fs"), os = await import("node:os"), path = await import("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ygg-store-"));
  const file = path.join(dir, "jobs.json");
  try {
    const store = createStore(file);
    store.d.meta.mark = 1;
    store.save();
    assert.deepEqual(fs.readdirSync(dir), ["jobs.json"]);
    assert.equal(createStore(file).d.meta.mark, 1);
    fs.writeFileSync(file, '{"jobs":{"half');
    createStore(file);
    assert.equal(fs.readFileSync(`${file}.corrupt`, "utf8"), '{"jobs":{"half');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("source health lists configured sources only, failures first", async () => {
  const { healthRows } = await import("../electron/collect.cjs");
  const run = (source: string, ok: boolean) => ({ source, ok, count: 0, error: "", ts: 1 });
  const runs = { A: run("A", true), B: run("B", false), Removed: run("Removed", false) };
  assert.deepEqual(healthRows(runs, [{ name: "A" }, { name: "B" }]).map((r) => r.source), ["B", "A"]);
});
