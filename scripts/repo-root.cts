// Walks up from the compiled script to the repo root, so a script works the same
// whether it runs from scripts/ or from its compiled copy in dist-electron/scripts/.
// The build output carries its own package.json type marker, so the root is the
// first ancestor holding vite.config.ts, not the first holding a package.json.
import fs from "node:fs";
import path from "node:path";

const markers = ["vite.config.ts", "vite.config.js", "tsconfig.json"];

export const repoRoot = (from: string = __dirname): string => {
  let dir = from;
  for (;;) {
    if (markers.some((m) => fs.existsSync(path.join(dir, m)))) return dir;
    const up = path.dirname(dir);
    if (up === dir) throw new Error("repository root not found above " + from);
    dir = up;
  }
};