// Fetches every source, tags postings, keeps them in a JSON store. Runs in Electron's main process (Node 18+).
import fs from "node:fs";
import crypto from "node:crypto";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { tag } from "./tags.cjs";
import { opportunityKind } from "./opportunities.cjs";
import { units } from "./source-config.cjs";
import type {
  AtsSource, Attribution, JobStore, OpportunityKind, RemotiveSource, Run, Settings, Source, Unit,
} from "../shared/types";

const UA = { "User-Agent": "opportunity-dashboard/0.1 (personal use)" };
const get = async (url: string, opt: RequestInit = {}): Promise<Response> => {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000), ...opt });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r;
};
const getJ = async <T,>(u: string, opt?: RequestInit): Promise<T> => (await get(u, opt)).json() as Promise<T>;

const clean = (s: unknown): string =>
  String(s ?? "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ").replace(/&amp;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const arr = <T,>(x: T | T[] | null | undefined): T[] => (x == null ? [] : Array.isArray(x) ? x : [x]);

// Default entity limits (1000 expansions) abort on legit feeds like We Work Remotely. Raise them, keep them bounded.
const XML_OPTS = {
  ignoreAttributes: false,
  processEntities: { enabled: true, maxEntitySize: 50000, maxExpansionDepth: 20,
    maxTotalExpansions: 200000, maxExpandedLength: 20000000, maxEntityCount: 5000 },
};

const txt = (x: unknown): string => (x && typeof x === "object" ? (x as Record<string, unknown>)["#text"] ?? "" : (x ?? "")) as string;

/** Normalises the many date shapes feeds use. Seconds-since-epoch is common enough to special-case. */
const isoDate = (x: unknown): string => {
  if (!x) return "";
  const date = new Date(typeof x === "number" && x < 1e12 ? x * 1000 : (x as string));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

/** A listing as an adapter returns it, before it is normalised into a Job. */
interface Item {
  title: string;
  org: string;
  location: string;
  url: string;
  posted: string;
  text: string;
  deadline?: string;
  deadlineLabel?: string;
}

/** Some publishers require visible credit when their listings are shown. */
function attributionFor(source: Unit): Attribution | null {
  const host = (source as { url?: string }).url ? new URL((source as { url: string }).url).hostname : source.type;
  if (host.endsWith("himalayas.app") || source.type === "himalayas") return { label: "Data from Himalayas", url: "https://himalayas.app/" };
  if (host.endsWith("jobicy.com") || source.type === "jobicy") return { label: "Data from Jobicy", url: "https://jobicy.com/" };
  if (host.endsWith("yubhub.co")) return { label: "Data by YubHub", url: "https://yubhub.co/" };
  if (host.endsWith("jobscollider.com")) return { label: "Data from JobsCollider", url: "https://jobscollider.com/" };
  if (host.endsWith("hireweb3.io")) return { label: "Data from HireWeb3", url: "https://www.hireweb3.io/" };
  if (source.type === "remotive") return { label: "Data from Remotive", url: "https://remotive.com/" };
  if (source.type === "remoteok") return { label: "Data from Remote OK", url: "https://remoteok.com/" };
  return null;
}

/**
 * Parses an RSS 2.0, RSS 1.0 (RDF) or Atom document. Throws when the body is not
 * XML at all, so an HTML login page or captive portal is a source error rather
 * than a silent empty result.
 */
export function parseFeed(xml: string, source: Unit): Item[] {
  if (XMLValidator.validate(xml) !== true) throw new Error("Invalid RSS/Atom XML");
  const x = new XMLParser(XML_OPTS).parse(xml) as any;
  const channel = x.rss?.channel || x["rdf:RDF"];
  if (!channel && !x.feed) throw new Error("Expected RSS or Atom, received another document");

  return [...arr(channel?.item), ...arr(x.feed?.entry)].map((i: any): Item => {
    // Atom lists several links; the alternate one is the listing itself.
    const link = typeof i.link === "object"
      ? arr(i.link).find((l: any) => !l["@_rel"] || l["@_rel"] === "alternate")?.["@_href"] : i.link;
    let location = [...arr(i["himalayasJobs:locationRestriction"]).map(txt).filter(Boolean),
      ...arr(i.region || i.location || i["job:location"] || i["hireweb3Jobs:location"]).map(txt).filter(Boolean)].join("; ");
    if (x.rss && i["himalayasJobs:companyName"]) location = `${location || "Worldwide"} Remote`;
    else if (/remote jobs|remote opportunities|work from anywhere/i.test(txt(channel?.title || x.feed?.title))) location = `${location} Remote`.trim();

    const target = link || (/^https?:\/\//.test(txt(i.guid)) ? txt(i.guid) : "");
    let url = "";
    try { if (target) url = new URL(target, x.feed?.["@_xml:base"] || (source as { url?: string }).url).href; } catch { /* unparseable link */ }

    const content = clean(txt(i["content:encoded"]) || txt(i.content) || txt(i.description) || txt(i.summary));
    if (/remote/i.test(txt(i["hireweb3Jobs:locationType"]))) location = `${location} Remote`.trim();

    return {
      title: clean(txt(i.title)),
      org: clean(txt(i["himalayasJobs:companyName"] || i["hireweb3Jobs:companyName"] || i["dc:creator"])) || source.name,
      location, url,
      posted: isoDate(txt(i.pubDate || i.published || i.updated || i["dc:date"])),
      deadline: isoDate(txt(i["himalayasJobs:expiryDate"] || i["hireweb3Jobs:expiryDate"])),
      // A publisher's own wording is preserved: guessing its timezone would be wrong.
      deadlineLabel: content.match(/\bdeadline:\s*([^;.\n]{1,60})/i)?.[1]?.trim() || "",
      text: content,
    };
  });
}

export function createStore(file: string): JobStore {
  let d: JobStore["d"] = { jobs: {}, runs: {}, meta: {} };
  try { d = { ...d, ...JSON.parse(fs.readFileSync(file, "utf8")) }; } catch { /* first run */ }
  return { d, save: () => fs.writeFileSync(file, JSON.stringify(d)) };
}

type Adapter = (u: Unit, cfg: Settings, store: JobStore) => Promise<Item[]>;

export const ADAPTERS: Record<Source["type"], Adapter> = {
  async remotive(u) {
    const category = (u as RemotiveSource).category || "software-dev";
    const r = await getJ<any>(`https://remotive.com/api/remote-jobs?category=${category}`);
    return r.jobs.map((j: any): Item => ({ title: j.title, org: j.company_name, location: j.candidate_required_location || "", url: j.url,
      posted: j.publication_date || "", text: clean(j.description) }));
  },

  async remoteok() {
    const r = await getJ<any[]>("https://remoteok.com/api");
    return r.slice(1).map((j: any): Item => ({ title: j.position, org: j.company,
      location: j.location || "Worldwide", url: j.url, posted: j.date || "",
      text: (j.tags || []).join(" ") + " " + clean(j.description) }));
  },

  async ats(u) {
    const board = (u as AtsSource).boards[0]!;
    const [kind, slug] = board.split(":");
    if (kind === "greenhouse") {
      const r = await getJ<any>(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
      return r.jobs.map((j: any): Item => ({ title: j.title, org: slug!, location: j.location?.name || "", url: j.absolute_url,
        posted: j.updated_at || "", text: clean(j.content) }));
    }
    if (kind === "lever") {
      const r = await getJ<any[]>(`https://api.lever.co/v0/postings/${slug}?mode=json`);
      return r.map((j: any): Item => ({ title: j.text, org: slug!, location: `${j.categories?.location || ""} ${j.workplaceType || ""}`,
        url: j.hostedUrl, posted: j.createdAt ? new Date(j.createdAt).toISOString() : "", text: j.descriptionPlain || "" }));
    }
    if (kind === "ashby") {
      const r = await getJ<any>(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
      return r.jobs.map((j: any): Item => ({ title: j.title, org: slug!, location: (j.location || "") + (j.isRemote ? " Remote" : ""),
        url: j.jobUrl, posted: j.publishedAt || "", text: j.descriptionPlain || "" }));
    }
    throw new Error("Unknown board type " + kind);
  },

  async rss(u) {
    return parseFeed(await (await get((u as { url: string }).url)).text(), u);
  },

  // Bounded discovery pages; not a complete snapshot of all listings.
  async arbeitnow() {
    const r = await getJ<any>("https://www.arbeitnow.com/api/job-board-api");
    if (!Array.isArray(r.data)) throw new Error("Expected Arbeitnow data array");
    return r.data.map((j: any): Item => ({ title: j.title, org: j.company_name,
      location: `${j.location || ""}${j.remote ? " Remote" : ""}`, url: j.url, posted: isoDate(j.created_at), text: clean(j.description) }));
  },

  async himalayas(u) {
    const r = await getJ<any>((u as { url?: string }).url || "https://himalayas.app/jobs/api?limit=20&offset=0");
    if (!Array.isArray(r.jobs)) throw new Error("Expected Himalayas jobs array");
    return r.jobs.map((j: any): Item => ({ title: j.title, org: j.companyName,
      location: `${arr<string>(j.locationRestrictions).join("; ") || "Worldwide"} Remote`,
      url: j.applicationLink || j.guid, posted: isoDate(j.pubDate), deadline: isoDate(j.expiryDate), text: clean(j.description) }));
  },

  async jobicy(u) {
    const r = await getJ<any>((u as { url?: string }).url || "https://jobicy.com/api/v2/remote-jobs?count=20");
    if (!Array.isArray(r.jobs)) throw new Error("Expected Jobicy jobs array");
    return r.jobs.map((j: any): Item => ({ title: j.jobTitle, org: j.companyName, location: `${j.jobGeo || ""} Remote`,
      url: j.url, posted: isoDate(j.pubDate), text: clean(j.jobDescription) }));
  },

  // Asks Grok's X Search tool for leads. Needs an xAI key. Results are pointers, verify each link.
  async xsearch(_u, cfg, store) {
    if (!cfg.xaiKey) throw new Error("skipped: add an xAI key in Settings");
    const day = new Date().toISOString().slice(0, 10), m = store.d.meta as Record<string, unknown>;
    if (m.xDay !== day) { m.xDay = day; m.xCalls = 0; }
    const out: Item[] = [];
    for (const q of cfg.xQueries || []) {
      if (((m.xCalls as number) ?? 0) >= (cfg.xCallsPerDay || 20)) break;
      m.xCalls = ((m.xCalls as number) ?? 0) + 1;
      const tool = { type: "x_search", ...(cfg.xHandles?.length ? { allowed_x_handles: cfg.xHandles.slice(0, 10) } : {}) };
      const r = await getJ<any>("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: { ...UA, "Content-Type": "application/json", Authorization: `Bearer ${cfg.xaiKey}` },
        body: JSON.stringify({ model: cfg.xModel, tools: [tool], input:
          `Search X for posts from the last 7 days about: ${q}. Return ONLY a JSON array of up to 10 objects ` +
          `{"title","org","location","url"} where url is the x.com link of the post. No other text.` }),
      });
      const text = arr<any>(r.output).flatMap((o: any) => arr<any>(o.content))
        .filter((c: any) => c.type === "output_text").map((c: any) => c.text).join("");
      let list: any[] = [];
      try { list = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || "[]"); } catch { /* model returned prose */ }
      for (const j of list) if (/^https:\/\/(x|twitter)\.com\//.test(j.url || "")) out.push({ ...j, posted: "", text: j.title });
    }
    return out;
  },
};

// Bounded concurrency. Sources are independent, but a sequential loop made a large board
// list take many minutes per refresh. Keep the cap low enough to stay polite to the ATS APIs.
const CONCURRENCY = 8;

/** Publishers whose terms cap how often they may be polled. */
function minPollHours(u: Unit): number {
  const host = (u as { url?: string }).url ? new URL((u as { url: string }).url).hostname : u.type;
  if (host.endsWith("himalayas.app") || u.type === "himalayas") return 24;
  if (host.endsWith("jobicy.com") || u.type === "jobicy") return 1;
  return 0;
}

export async function runUnit(store: JobStore, u: Unit, cfg: Settings): Promise<void> {
  const start = Date.now();
  const minHours = minPollHours(u);
  // Keyed by host for capped publishers, so two entries for the same feed share one timer.
  const pollKey = minHours ? new URL((u as { url: string }).url).hostname : u.name;
  const lastPoll = store.d.meta.polls?.[pollKey];
  if (lastPoll && start - lastPoll < Math.max(minHours, u.min_interval_hours || 0) * 3600e3) return;

  let n = 0;
  try {
    if (!ADAPTERS[u.type]) throw new Error("Unknown source type " + u.type);
    store.d.meta.polls ||= {};
    store.d.meta.polls[pollKey] = start;

    let items = await ADAPTERS[u.type](u, cfg, store);
    if (!Array.isArray(items)) throw new Error("Expected a list of opportunities");
    if (u.include?.length) items = items.filter((j) => u.include!.some((k) => j.title.toLowerCase().includes(k.toLowerCase())));

    for (const j of items) {
      if (!j.title || !/^https?:\/\//.test(j.url || "")) continue;
      const id = crypto.createHash("sha1").update(j.url).digest("hex");
      const kind: OpportunityKind = opportunityKind(j, u);
      // Funding feeds can include years of news archives. Keep recent announcements, not historical awards.
      if (u.type === "rss" && kind !== "job" && isoDate(j.posted) && start - Date.parse(isoDate(j.posted)) > 180 * 86400e3) continue;

      const tags = tag(j.title, j.location || "", j.text || "", u.force_tags || [])
        .filter((t) => kind !== "job" || !["grant", "hackathon", "fellowship"].includes(t));
      if (kind !== "job" && !tags.includes(kind)) tags.push(kind);

      const previous = store.d.jobs[id];
      const seenBy = { ...(previous?.seen_by || (previous ? { [previous.source]: { active: previous.active, ts: previous.last_seen } } : {})),
        [u.name]: { active: true, ts: start, type: u.type } };

      // Lightweight feeds can repeat an ATS URL with just its title. Preserve the employer's country restrictions and richer tags.
      if (previous && kind === "job" && u.type !== "ats"
        && (previous.source_type === "ats" || /^(greenhouse|lever|ashby):/.test(previous.source))) {
        store.d.jobs[id] = { ...previous, last_seen: start, seen_by: seenBy,
          attribution: previous.attribution || attributionFor(u) };
        n++;
        continue;
      }

      const deadline = isoDate(j.deadline);
      store.d.jobs[id] = { id, title: j.title, org: j.org || "", location: j.location || "", url: j.url,
        source: u.name, source_type: u.type, posted: isoDate(j.posted), kind, deadline, tags: tags.sort(),
        seen_by: seenBy, deadline_label: j.deadlineLabel || "",
        attribution: attributionFor(u) || previous?.attribution || null,
        first_seen: previous?.first_seen || start, last_seen: start,
        active: !deadline || Date.parse(deadline) > start };
      n++;
    }

    // Only ATS responses enumerate all currently open positions. RSS and paginated APIs are rolling
    // windows, so absence from their response says nothing about whether a listing is still open.
    if (u.type === "ats") for (const j of Object.values(store.d.jobs)) {
      if (!j.seen_by && j.source === u.name) j.seen_by = { [u.name]: { active: j.active, ts: j.last_seen } };
      if (j.seen_by?.[u.name] && j.seen_by[u.name]!.ts < start) {
        j.seen_by[u.name]!.active = false;
        const observations = Object.entries(j.seen_by);
        // A duplicate posting stays open while any source that can enumerate its board still lists it.
        const snapshots = observations.filter(([source, o]) => o.type === "ats" || /^(greenhouse|lever|ashby):/.test(source));
        j.active = (snapshots.length ? snapshots : observations).some(([, o]) => o.active);
      }
    }
    for (const j of Object.values(store.d.jobs)) if (j.deadline && Date.parse(j.deadline) <= start) j.active = false;

    const run: Run = { source: u.name, ok: true, count: n, error: "", ts: Date.now() };
    store.d.runs[u.name] = run;
  } catch (e) { // one broken source never stops the rest
    const err = String((e as Error)?.message || e).slice(0, 200);
    const run: Run = { source: u.name, ok: false, count: n, error: err, ts: Date.now() };
    store.d.runs[u.name] = run;
  }
}

export async function runAll(store: JobStore, cfg: Settings, sources: Source[]): Promise<void> {
  const all = units(sources);
  for (let i = 0; i < all.length; i += CONCURRENCY) {
    await Promise.all(all.slice(i, i + CONCURRENCY).map((u) => runUnit(store, u, cfg)));
    store.save();
  }
}