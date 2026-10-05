// Decides whether a refresh should raise a desktop notification. Kept separate from
// Electron so the rules are testable without a display server or a notification server.
import { inTab } from "./opportunities.cjs";
import type { Job } from "../shared/types";

export interface NotifyRules {
  /** Opt-in. Notifications never fire unless the user has enabled them. */
  enabled: boolean;
  /** Hour of day, local time. Stay quiet from this hour until quietTo. */
  quietFrom: number;
  quietTo: number;
  /** Below this, a refresh is not worth interrupting anyone for. */
  minNew: number;
  /** Do not notify when every window is focused: the user is already looking. */
  windowFocused: boolean;
  /** True when the OS reports that notifications are unavailable or blocked. */
  unsupported: boolean;
}

/** Hour-of-day check that handles a quiet window wrapping past midnight. */
export function inQuietHours(now: Date, from: number, to: number): boolean {
  const h = now.getHours();
  return from <= to ? h >= from && h < to : h >= from || h < to;
}

/** True when the OS will actually show a notification right now. */
export function canNotify(rules: NotifyRules, now: Date): boolean {
  if (!rules.enabled || rules.unsupported) return false;
  if (rules.windowFocused) return false;
  return !inQuietHours(now, rules.quietFrom, rules.quietTo);
}

/**
 * The listings worth mentioning: first discovered since the last refresh, still open, and
 * not already marked seen. Jobs are limited to remote or relocation-friendly listings so a
 * notification does not point at a role the user cannot take. Grants and other funding are
 * always included, since eligibility is not location-bound.
 */
export function newSince(jobs: Job[], since: number, limit = 5): Job[] {
  return jobs.filter((j) => j.first_seen > since && !j.seen && (inTab(j, "grants") || inTab(j, "worldwide")))
    .sort((a, b) => b.first_seen - a.first_seen)
    .slice(0, limit);
}

/** One notification body, not one per listing. */
export function notificationBody(items: Job[]): { title: string; body: string } {
  if (items.length === 1) {
    const [only] = items;
    return { title: "1 new listing", body: [only!.title, only!.org].filter(Boolean).join(" · ") };
  }
  const titles = items.slice(0, 3).map((j) => j.title).join("\n");
  const more = items.length > 3 ? `\n+${items.length - 3} more` : "";
  return { title: `${items.length} new listings`, body: titles + more };
}
