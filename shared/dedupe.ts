// Collapses the same role posted on several boards, or once per country, into one listing.
// Applied when a tab is read, so the store keeps every source's record intact.
import type { Job } from "./types";

/** Lowercased words only, so "Full-stack" and "Full stack " compare equal. Parentheses are kept: "(Ruby)" and "(Python)" are different roles. */
const norm = (s: string) => s.toLowerCase().replace(/full[\s-]+stack/g, "fullstack").replace(/[^a-z0-9+#()]+/g, " ").trim();

export const dupeKey = (j: Pick<Job, "title" | "org" | "kind">) => `${j.kind}|${norm(j.org)}|${norm(j.title)}`;

const isAts = (j: Job) => j.source_type === "ats" || /^(greenhouse|lever|ashby):/.test(j.source);

/** Company boards carry the full description and country rules, so they win; then the newest posting. */
const better = (a: Job, b: Job) =>
  Number(isAts(b)) - Number(isAts(a)) || (Date.parse(b.posted) || b.first_seen) - (Date.parse(a.posted) || a.first_seen);

const MAX_LOCATIONS = 6;

export function dedupe(jobs: Job[]): Job[] {
  const groups = new Map<string, Job[]>();
  for (const j of jobs) {
    // An org-less listing could be anyone's, so it is never merged.
    const k = j.org.trim() ? dupeKey(j) : `id|${j.id}`;
    const g = groups.get(k);
    if (g) g.push(j); else groups.set(k, [j]);
  }
  return [...groups.values()].map((g) => {
    if (g.length === 1) return g[0]!;
    const ordered = [...g].sort(better);
    const [lead, ...rest] = ordered;
    const locations = [...new Set(ordered.flatMap((j) => j.location.split(/\s*;\s*/)).filter(Boolean))];
    const tags = new Set(g.flatMap((j) => j.tags));
    // Restricted only if every copy is: one open copy means the role is reachable.
    if (!g.every((j) => j.tags.includes("restricted"))) tags.delete("restricted");
    return {
      ...lead!,
      location: locations.slice(0, MAX_LOCATIONS).join("; ") + (locations.length > MAX_LOCATIONS ? ` +${locations.length - MAX_LOCATIONS} more` : ""),
      tags: [...tags].sort(),
      score: Math.max(...g.map((j) => j.score ?? 0)),
      matched: [...new Set(g.flatMap((j) => j.matched ?? []))],
      first_seen: Math.min(...g.map((j) => j.first_seen)),
      seen: g.every((j) => j.seen),
      dupe_ids: rest.map((j) => j.id),
      also_via: [...new Set(rest.map((j) => j.source).filter((s) => s !== lead!.source))],
    };
  });
}
