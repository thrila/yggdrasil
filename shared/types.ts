// Single source of truth for the shapes that cross the main/renderer boundary.
// Kept dependency-free so both tsconfigs can include it.

export type Tab = "worldwide" | "nigeria" | "grants" | "settings";

/** What a listing is. Jobs and funding opportunities share one store and one list. */
export type OpportunityKind = "job" | "grant" | "hackathon" | "fellowship";

/** Credit a publisher requires alongside the original posting link. */
export interface Attribution {
  label: string;
  url: string;
}

/** One source's view of a listing, used to decide whether it is still open. */
export interface Observation {
  active: boolean;
  ts: number;
  type?: SourceType;
}

/** A normalised listing, as stored in the jobs file. */
export interface Job {
  id: string;
  title: string;
  org: string;
  location: string;
  url: string;
  /** Which source entry first produced it. */
  source: string;
  source_type?: SourceType;
  /** ISO, or "" when the feed gave no usable date. */
  posted: string;
  kind: OpportunityKind;
  /** ISO, or "" when the listing states no closing date. */
  deadline?: string;
  /** Deadline exactly as the publisher wrote it, when it could not be parsed. */
  deadline_label?: string;
  attribution?: Attribution | null;
  /** Every source that has returned this listing, and when it last did. */
  seen_by?: Record<string, Observation>;
  tags: string[];
  first_seen: number;
  last_seen: number;
  /** Set by the reader, not the collector: true once the user has marked it seen. */
  seen?: boolean;
  /** When it was marked seen, for the "seen 3d ago" label. */
  seen_ts?: number;
  /** False once the owning source stops returning it, or its deadline passes. */
  active: boolean;
  /** Ranking hint, added by the main process on read. */
  score?: number;
  /** True only for the synthetic rows the web preview renders. */
  sample?: boolean;
}

/** What to do with a seen flag. Bulk actions need a timestamp; a single toggle needs a boolean. */
export type SeenPatch = { seen: boolean; seen_ts?: number };

/** Per-source outcome of the last refresh, surfaced in Settings. */
export interface Run {
  /** Health key. Also the job's `source` when that source produced it. */
  source: string;
  ok: boolean;
  /** Listings kept after filtering. */
  count: number;
  error: string;
  ts: number;
}

/** `greenhouse:<slug>` / `lever:<slug>` / `ashby:<slug>`. */
export type Board = `greenhouse:${string}` | `lever:${string}` | `ashby:${string}`;

export type SourceType = "ats" | "rss" | "remotive" | "remoteok" | "arbeitnow" | "himalayas" | "jobicy" | "xsearch";

interface SourceBase {
  /** Must be unique within its type: it is the health key and the job's `source`. */
  name: string;
  /** Pinned onto every item from this source. */
  force_tags?: string[];
  /** Case-insensitive title substrings. Non-matching items are dropped. */
  include?: string[];
  /** Overrides the per-source polling floor. */
  min_interval_hours?: number;
  enabled?: boolean;
}

export interface AtsSource extends SourceBase {
  type: "ats";
  boards: Board[];
}
export interface RssSource extends SourceBase {
  type: "rss";
  url: string;
}
export interface RemotiveSource extends SourceBase {
  type: "remotive";
  category?: string;
}
export interface RemoteOkSource extends SourceBase {
  type: "remoteok";
}
export interface ArbeitnowSource extends SourceBase {
  type: "arbeitnow";
}
export interface HimalayasSource extends SourceBase {
  type: "himalayas";
  url: string;
}
export interface JobicySource extends SourceBase {
  type: "jobicy";
  url: string;
}
export interface XSearchSource extends SourceBase {
  type: "xsearch";
}

/**
 * A discriminated union, so a typo in sources.json (`"type": "rsss"`, or an `ats`
 * entry with no `boards`) is a compile error rather than a source that silently
 * returns nothing on every refresh.
 */
export type Source =
  | AtsSource | RssSource | RemotiveSource | RemoteOkSource
  | ArbeitnowSource | HimalayasSource | JobicySource | XSearchSource;

/** One ATS board, expanded from its source entry. `name` is the board id. */
export type Unit = Source & { board?: string };

export interface Settings {
  interests: string[];
  refreshHours: number;
  xaiKey: string;
  xModel: string;
  xCallsPerDay: number;
  xHandles: string[];
  xQueries: string[];
}

/** Settings as the renderer sees them: never the key itself, only whether one is set. */
export type PublicSettings = Omit<Settings, "xaiKey"> & { xaiKey?: undefined; xaiKeySet: boolean };

export interface JobStore {
  d: {
    jobs: Record<string, Job>;
    runs: Record<string, Run>;
    meta: { polls?: Record<string, number>; [key: string]: unknown };
  };
  save(): void;
}

/** The surface `preload` exposes on `window.api`. */
export interface YggdrasilApi {
  jobs(tab: Tab): Promise<Job[]>;
  getSettings(): Promise<PublicSettings>;
  setSettings(body: Partial<Settings> & { xaiKey?: string }): Promise<boolean>;
  addSource(url: string): Promise<Source>;
  health(): Promise<Run[]>;
  refresh(): Promise<boolean>;
  /** Marks listings seen or unseen. Ids that no longer exist are ignored. */
  markSeen(ids: string[], patch: SeenPatch): Promise<boolean>;
  /** Clears the seen flag for every listing, so the next refresh is treated as new again. */
  clearSeen(): Promise<boolean>;
  onUpdated(cb: () => void): () => void;
}