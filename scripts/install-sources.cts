// Merge the verified catalog into the local override; preserve sources added by the user.
import fs from "node:fs";
import path from "node:path";
import { units } from "../electron/source-config.cjs";
import { repoRoot } from "./repo-root.cjs";
import type { Source, Unit } from "../shared/types";

const root = repoRoot();
const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as T;

const file = path.join(root, "electron/sources.private.json");
const existing: Source[] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
const incoming: Source[] = [
  ...read<Source[]>("research/sources.jobs.json"),
  ...read<Source[]>("research/sources.bonus.json"),
  read<Source[]>("research/sources.adapters.json")[0]!,
];

// Units, not entries: a board already covered must not be counted twice, whatever entry it came from.
const key = (s: Unit) => (s.board || (s as { url?: string }).url || `${s.type}:${(s as { category?: string }).category || ""}`).toLowerCase();
const seen = new Set(units(existing).map((s) => key(s)));

const additions = incoming.flatMap<Source>((s) => {
  if (s.type === "ats") {
    const boards = s.boards.filter((b) => !seen.has(key({ ...s, name: b, board: b } as Unit)));
    boards.forEach((b) => seen.add(b.toLowerCase()));
    return boards.length ? [{ ...s, boards }] : [];
  }
  const k = key(s as Unit);
  if (seen.has(k)) return [];
  seen.add(k);
  return [s];
});

fs.writeFileSync(file, JSON.stringify([...existing, ...additions], null, 2) + "\n");
console.log(`Installed ${units(additions).length} new source units in ${file}`);