// Run the same collectors as Electron without requiring a display server.
import fs from "node:fs";
import path from "node:path";
import { createStore, runUnit } from "../electron/collect.cjs";
import { units } from "../electron/source-config.cjs";
import { inTab } from "../electron/opportunities.cjs";
import { repoRoot } from "./repo-root.cjs";
import type { Settings, Source } from "../shared/types";

const root = repoRoot();
const file = process.argv[2] || path.join(root, ".cache/opportunities.json");
const sourceFiles = process.argv.slice(3);
const files = sourceFiles.length ? sourceFiles : ["electron/sources.json", "electron/sources.private.json"].map((f) => path.join(root, f));
const sources = files.flatMap<Source>((f) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : []);

fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
const store = createStore(file);

(async () => {
  for (const source of units(sources)) {
    await runUnit(store, source, {} as Settings);
    store.save();
    const health = store.d.runs[source.name];
    console.error(`${source.name}: ${health?.ok ? "OK " + health.count : health?.error || "cached"}`);
  }
  const counts = Object.fromEntries(["worldwide", "nigeria", "grants"]
    .map((tab) => [tab, Object.values(store.d.jobs).filter((j) => inTab(j, tab)).length]));
  console.log(JSON.stringify({ file: path.resolve(file), indexed: Object.keys(store.d.jobs).length, ...counts,
    health: store.d.runs }, null, 2));
})().catch((e) => { console.error(e.message); process.exitCode = 1; });