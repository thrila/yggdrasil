// Turns a pasted URL into a source entry, and expands source entries into the units
// the collectors actually poll. One ATS board is one unit, so its health is tracked
// separately from every other board on the same entry.
import type { AtsSource, Board, Source, Unit } from "../shared/types";

const ATS_HOSTS: Record<string, "greenhouse" | "lever" | "ashby"> = {
  "job-boards.greenhouse.io": "greenhouse", "boards.greenhouse.io": "greenhouse",
  "jobs.lever.co": "lever", "jobs.ashbyhq.com": "ashby",
};

/** Classifies a feed or board URL. Throws on anything that is not HTTP(S). */
export function sourceFromUrl(value: string): Source {
  const url = new URL(value.trim());
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Use an HTTP or HTTPS feed URL");

  const kind = ATS_HOSTS[url.hostname];
  const slug = url.pathname.split("/").filter(Boolean)[0];
  // Slugs keep dots (e.g. ashby:magic.dev), so the board id survives the round trip.
  if (kind && slug && /^[\w.-]+$/.test(slug)) {
    const board = `${kind}:${slug}` as Board;
    return { name: board, type: "ats", boards: [board] } satisfies AtsSource;
  }

  if (url.hostname === "www.arbeitnow.com" && url.pathname === "/api/job-board-api")
    return { name: "Arbeitnow", type: "arbeitnow" };
  if (url.hostname === "himalayas.app" && /^\/jobs\/api(?:\/search)?\/?$/.test(url.pathname))
    return { name: "Himalayas API", type: "himalayas", url: url.href };
  if (url.hostname === "jobicy.com" && url.pathname === "/api/v2/remote-jobs")
    return { name: "Jobicy API", type: "jobicy", url: url.href };

  // Different feeds on the same host must have independent source health.
  return { name: url.hostname + url.pathname + url.search, type: "rss", url: url.href };
}

/** Expands source entries into pollable units, dropping disabled and duplicate ones. */
export function units(sources: Source[]): Unit[] {
  const seen = new Set<string>();
  const expanded: Unit[] = sources.flatMap((s): Unit[] => s.type === "ats"
    ? (s.boards || []).map((board) => ({ ...s, name: board, board }))
    : [s]);

  return expanded.filter((s) => {
    if (s.enabled === false) return false;
    const key = s.type === "ats"
      ? s.board!.toLowerCase()
      : (s as { url?: string }).url || `${s.type}:${(s as { category?: string }).category || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}