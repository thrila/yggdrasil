// Matches the user's interest keywords against a listing. Shared by the desktop app and the preview.
import type { Job } from "./types";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * One matcher per keyword. A keyword is a whole word or phrase, so "go" does not match "google"
 * and "product manager" matches as a phrase. Spaces, hyphens and dots are interchangeable, so
 * "full stack", "full-stack" and "fullstack" are one interest, as are "node.js" and "nodejs".
 */
export function interestMatchers(interests: string[]): [string, RegExp][] {
  return [...new Set(interests.map((t) => t.trim().toLowerCase()).filter(Boolean))].map((t) => {
    const body = t.split(/[\s\-.]+/).filter(Boolean).map(esc).join("[\\s\\-.]*");
    return [t, new RegExp(`(?:^|[^a-z0-9])${body}(?![a-z0-9])`, "i")];
  });
}

/** Which interests a listing hits, by tag or by text in its title, company or location. */
export function matchInterests(j: Pick<Job, "title" | "org" | "location" | "tags">, matchers: [string, RegExp][]): string[] {
  const text = `${j.title} ${j.org} ${j.location} ${j.tags.join(" ")}`;
  return matchers.filter(([t, re]) => j.tags.includes(t) || re.test(text)).map(([t]) => t);
}
