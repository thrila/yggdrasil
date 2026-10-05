// The compiled main process reads icon.png and the source lists relative to its own
// directory (dist-electron/electron). tsc only emits .js/.cjs, so copy the runtime
// assets across after every build. The type marker keeps Node from treating the
// emitted CommonJS files as ESM, since the package itself is "type": "module".
import fs from "node:fs";
import path from "node:path";

const from = path.resolve("electron");
const to = path.resolve("dist-electron/electron");

const assets = ["icon.png", "sources.json", "sources.private.json"];
let copied = 0;
const missing = [];

fs.mkdirSync(to, { recursive: true });
for (const a of assets) {
  const src = path.join(from, a);
  if (!fs.existsSync(src)) { missing.push(a); continue; }
  fs.copyFileSync(src, path.join(to, a));
  copied++;
}
fs.writeFileSync(path.resolve("dist-electron/package.json"), JSON.stringify({ type: "commonjs" }, null, 2) + "\n");

console.log(`copied ${copied}/${assets.length} electron assets -> dist-electron/electron${missing.length ? " (absent: " + missing.join(", ") + ")" : ""}`);