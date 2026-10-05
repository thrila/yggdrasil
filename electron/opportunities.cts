// Decides what a listing is, and which tab it belongs in. Kept separate from the
// collectors so the classification can be tested without touching the network.
import type { OpportunityKind } from "../shared/types";

const FUNDING_KINDS = new Set<OpportunityKind>(["grant", "hackathon", "fellowship"]);

/** Classifies a listing. `source` supplies force_tags and the source's own type. */
export function opportunityKind(item: { title?: string; kind?: string }, source: { force_tags?: string[] } = {}): OpportunityKind {
  if (FUNDING_KINDS.has(item.kind as OpportunityKind)) return item.kind as OpportunityKind;
  const forced = source.force_tags || [];
  for (const kind of ["hackathon", "grant", "fellowship"] as const) if (forced.includes(kind)) return kind;
  const title = item.title || "";
  // Hiring a grants manager or an engineer who attends hackathons is still a job.
  if (/\b(engineer|developer|manager|director|officer|recruiter|coordinator)\b/i.test(title)) return "job";
  if (/hackathon|buildathon|datathon|codefest|ideathon/i.test(title)) return "hackathon";
  if (/\bgrants?\b|funding opportunit|call for (proposals|applications)|request for proposals/i.test(title)) return "grant";
  if (/fellowship|scholarship/i.test(title)) return "fellowship";
  return "job";
}

/** True when the listing belongs in the given tab. */
export function inTab(item: { active: boolean; kind?: OpportunityKind; tags?: string[] }, tab: string): boolean {
  if (!item.active) return false;
  const kind = item.kind || opportunityKind(item, { force_tags: item.tags });
  if (tab === "grants") return FUNDING_KINDS.has(kind);
  if (kind !== "job") return false;
  const tags = item.tags || [];
  if (tab === "nigeria") return tags.includes("nigeria") || (tags.includes("remote") && tags.includes("africa-ok") && !tags.includes("restricted"));
  return tags.includes("remote") || tags.includes("relocation");
}

/** Apply the "hide seen" filter. Seen is reader state, so it must not change tab membership. */
export function hideSeen<T extends { seen?: boolean }>(items: T[], hide: boolean): T[] {
  return hide ? items.filter((j) => !j.seen) : items;
}