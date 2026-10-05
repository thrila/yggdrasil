import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanBuildOutputDir, writeAssets, writeRootConfig, writeWorkerConfig, readBuildOutput } from "@cloudflare/build-output-utils";
import config from "../cloudflare.config.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = path.join(root, "dist");
await access(path.join(sourceDirectory, "index.html"));

// Only Vite's public artifact is copied, never the repository or collector cache.
async function checkPublicFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || entry.name.startsWith(".") || entry.name.endsWith(".map")) {
      throw new Error(`Unexpected public asset: ${entry.name}`);
    }
    if (entry.isDirectory()) await checkPublicFiles(path.join(directory, entry.name));
  }
}
await checkPublicFiles(sourceDirectory);
await cleanBuildOutputDir(root);
await writeRootConfig(root, {}, { isPreview: false, mode: "production" });
await writeWorkerConfig({ root, config: config.worker });
await writeAssets({ root, sourceDirectory });
const output = await readBuildOutput(root);
console.log(`Prepared ${output.workers.default.config.name}: static assets only, no collector database.`);
