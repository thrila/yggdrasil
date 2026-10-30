// Renderer-side filtering and sorting for the job list. Pure, so it can be tested
// without React, and dependency-free so both tsconfigs can include it.
import type { Job } from "./types";

export type SortKey = "newest" | "match" | "deadline" | "added";

/** Posted-within windows the filter bar offers, in days. 0 means any time. */
export const POSTED_WITHIN_DAYS = [0, 1, 3, 7, 14, 30] as const;

export interface Filters {
  /** Tags that must all be present. */
  tags: string[];
  /** Restrict to one source, or "" for all. */
  source: string;
  /** Only listings posted in the last N days; 0 for any. */
  days: number;
  /** Only listings that score against the user's interests (relocation always passes). */
  matching: boolean;
  /** Drop listings tagged location-restricted (US-only, EU-only…). */
  hideRestricted: boolean;
  hideSeen: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  tags: [], source: "", days: 0, matching: true, hideRestricted: true, hideSeen: false, sort: "newest",
};

/** Grants have no interest score and are rarely location-restricted, so those filters start off. */
export const defaultFilters = (grants: boolean): Filters =>
  grants ? { ...DEFAULT_FILTERS, matching: false, hideRestricted: false, sort: "deadline" } : { ...DEFAULT_FILTERS };

/** When it was posted, falling back to when it was first collected for feeds without a date. */
export const postedAt = (j: Job): number => Date.parse(j.posted) || j.first_seen || 0;

export interface Query { include: string[]; exclude: string[] }

/** Splits a search box value into words to require and `-words` to exclude. */
export function parseQuery(q: string): Query {
  const include: string[] = [], exclude: string[] = [];
  for (const w of q.trim().toLowerCase().split(/\s+/).filter(Boolean)) {
    if (w.length > 1 && w.startsWith("-")) exclude.push(w.slice(1));
    else if (w !== "-") include.push(w);
  }
  return { include, exclude };
}

const hay = (j: Job) => [j.title, j.org, j.location, j.source, ...j.tags].join(" ").toLowerCase();

/** Every filter except tags and the seen toggle, so the tag chips can show live counts. */
export function baseFilter(jobs: Job[], f: Filters, q: Query, grants: boolean, now = Date.now()): Job[] {
  const since = f.days ? now - f.days * 864e5 : 0;
  return jobs.filter((j) => {
    if (!grants && f.matching && !((j.score ?? 0) > 0 || j.tags.includes("relocation"))) return false;
    if (f.hideRestricted && j.tags.includes("restricted")) return false;
    if (f.source && j.source !== f.source) return false;
    if (since && postedAt(j) < since) return false;
    if (q.include.length || q.exclude.length) {
      const h = hay(j);
      if (!q.include.every((w) => h.includes(w)) || q.exclude.some((w) => h.includes(w))) return false;
    }
    return true;
  });
}

const deadlineAt = (j: Job): number => Date.parse(j.deadline ?? "") || Infinity;

export function sortJobs(jobs: Job[], sort: SortKey): Job[] {
  const byNew = (a: Job, b: Job) => postedAt(b) - postedAt(a);
  const cmp = sort === "match" ? (a: Job, b: Job) => (b.score ?? 0) - (a.score ?? 0) || byNew(a, b)
    : sort === "deadline" ? (a: Job, b: Job) => deadlineAt(a) - deadlineAt(b) || byNew(a, b)
    : sort === "added" ? (a: Job, b: Job) => (b.interested_ts ?? 0) - (a.interested_ts ?? 0) || byNew(a, b)
    : byNew;
  return [...jobs].sort(cmp);
}

/** The full pipeline. `base` is returned too, for facet counts. */
export function applyFilters(jobs: Job[], f: Filters, q: string, grants: boolean, now = Date.now()) {
  const base = baseFilter(jobs, f, parseQuery(q), grants, now);
  const tagged = base.filter((j) => f.tags.every((t) => j.tags.includes(t)));
  const shown = sortJobs(tagged, f.sort);
  const visible = f.hideSeen ? shown.filter((j) => !j.seen) : shown;
  return { base, shown, visible };
}

/** Tag counts among `jobs`, most common first. Active tags are always kept so they can be turned off. */
export function tagCounts(jobs: Job[], active: string[]): [string, number][] {
  const counts = new Map<string, number>(active.map((t) => [t, 0]));
  for (const j of jobs) if (active.every((t) => j.tags.includes(t))) for (const t of j.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Sources present in the list, most listings first. */
export function sourceCounts(jobs: Job[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const j of jobs) counts.set(j.source, (counts.get(j.source) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Reads saved filters, keeping only well-typed fields so an old or corrupt save cannot break the list. */
export function restoreFilters(raw: unknown, fallback: Filters): Filters {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<Record<keyof Filters, unknown>>;
  const bool = (v: unknown, d: boolean) => typeof v === "boolean" ? v : d;
  return {
    tags: Array.isArray(r.tags) && r.tags.every((t) => typeof t === "string") ? r.tags as string[] : fallback.tags,
    source: typeof r.source === "string" ? r.source : fallback.source,
    days: (POSTED_WITHIN_DAYS as readonly number[]).includes(r.days as number) ? r.days as number : fallback.days,
    matching: bool(r.matching, fallback.matching),
    hideRestricted: bool(r.hideRestricted, fallback.hideRestricted),
    hideSeen: bool(r.hideSeen, fallback.hideSeen),
    sort: r.sort === "newest" || r.sort === "match" || r.sort === "deadline" || r.sort === "added" ? r.sort : fallback.sort,
  };
}
