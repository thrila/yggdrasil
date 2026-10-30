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
  } else if (path === "/gone") { res.writeHead(404); res.end(); }
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
