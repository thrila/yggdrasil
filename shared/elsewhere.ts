// Deep links that run the current search on boards that cannot be collected from.
// LinkedIn and Indeed forbid automated access, and hiring.cafe's API sits behind a
// bot challenge, so these open the user's own browser instead of being scraped.
import type { Tab } from "./types";

export interface ElsewhereLink { label: string; url: string }

export function elsewhereLinks(tab: Tab, keywords: string): ElsewhereLink[] {
  if (tab === "grants" || tab === "settings") return [];
  const kw = keywords.trim();
  const nigeria = tab === "nigeria";
  const li = new URL("https://www.linkedin.com/jobs/search/");
  if (kw) li.searchParams.set("keywords", kw);
  li.searchParams.set("location", nigeria ? "Nigeria" : "Worldwide");
  if (!nigeria) li.searchParams.set("f_WT", "2"); // LinkedIn's remote work-type filter
  li.searchParams.set("f_TPR", "r604800"); // posted in the past week
  const indeed = new URL(nigeria ? "https://ng.indeed.com/jobs" : "https://www.indeed.com/jobs");
  if (kw) indeed.searchParams.set("q", kw);
  indeed.searchParams.set("l", nigeria ? "Nigeria" : "Remote");
  indeed.searchParams.set("fromage", "7");
  return [
    { label: "LinkedIn", url: li.toString() },
    { label: "Indeed", url: indeed.toString() },
    { label: "hiring.cafe", url: "https://hiring.cafe/" },
  ];
}
