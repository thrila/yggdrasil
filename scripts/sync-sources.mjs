// Copies the private source list into the installed app's data folder.
// Packaged builds leave sources.private.json out, and the app reads this copy instead.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = path.join(root, "electron", "sources.private.json");
const base = process.platform === "win32" ? process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming")
  : process.platform === "darwin" ? path.join(os.homedir(), "Library", "Application Support")
  : process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
const dir = path.join(base, "Yggdrasil");

if (!fs.existsSync(from)) {
  console.error(`No private source list at ${from}. Copy electron/sources.json there first.`);
  process.exit(1);
}
const list = JSON.parse(fs.readFileSync(from, "utf8"));
fs.mkdirSync(dir, { recursive: true });
fs.copyFileSync(from, path.join(dir, "sources.private.json"));
console.log(`copied ${list.length} source entries -> ${path.join(dir, "sources.private.json")}`);
console.log("The app picks it up on its next refresh.");
