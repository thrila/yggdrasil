// Verify only discovered URLs. No slug guessing, HTML scraping, or login bypass.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { repoRoot } from "./repo-root.cjs";

/** One candidate source, as listed in research/candidates.json. */
interface Candidate {
  name?: string;
  type: "ats" | "rss" | string;
  url?: string;
  board?: string;
  itemsPath?: string;
}

/** HTTP evidence for a single request, kept so the report can be re-checked later. */
interface Evidence {
  url: string;
  finalUrl: string;
  status: number;
  contentType: string | null;
  sha256: string;
  bodyFile: string;
}

/** A verification record: the candidate, plus what the request actually returned. */
interface Record_ extends Candidate {
  checkedAt: string;
  verified: boolean;
  count: number;
  keyNeeded: string;
  requests: Evidence[];
  endpoint?: string;
  samples?: unknown[];
  copyright?: string;
  jobItems?: number;
  opportunityItems?: number;
  responseFields?: string[];
  itemFields?: string[];
  matchingRoles?: number;
  nigeriaRoles?: number;
  africaRoles?: number;
  locations?: string[];
  boardPageOpened?: boolean;
  error?: string;
}

const root = repoRoot();
const cache = path.join(root, ".cache/source-verification");
const input = process.argv[2] || path.join(root, "research/candidates.json");
const output = process.argv[3] || path.join(root, "research/verification.json");
const list: Candidate[] = JSON.parse(fs.readFileSync(input, "utf8"));

fs.mkdirSync(cache, { recursive: true });

const arr = <T,>(x: T | T[] | null | undefined): T[] => (x == null ? [] : Array.isArray(x) ? x : [x]);
const text = (x: unknown): string => (typeof x === "object" && x !== null ? (x as Record<string, unknown>)["#text"] as string || "" : (x as string) || "");

const engineering = /engineer|developer|programmer|research scientist|researcher|architect/i;
const remote = /\bremote\b|worldwide|work from anywhere|distributed team/i;
const relocation = /(?:offer|provide|support|assist|available|package).{0,65}(?:relocation|visa sponsorship)|(?:relocation|visa sponsorship).{0,65}(?:offer|provide|support|assist|available|package)/i;

async function open(url: string) {
  const r = await fetch(url, {
    headers: { "User-Agent": "Yggdrasil/0.1 (personal opportunity feed verification)" },
    signal: AbortSignal.timeout(25000),
  });
  const body = await r.text();
  const file = crypto.createHash("sha256").update(url).digest("hex") + ".txt";
  fs.writeFileSync(path.join(cache, file), body);
  return {
    url, finalUrl: r.url, status: r.status, contentType: r.headers.get("content-type"),
    sha256: crypto.createHash("sha256").update(body).digest("hex"),
    bodyFile: ".cache/source-verification/" + file, body,
  };
}

async function verify(c: Candidate): Promise<Record_> {
  const row: Record_ = { ...c, checkedAt: new Date().toISOString(), verified: false, count: 0, keyNeeded: "no", requests: [] };
  try {
    let endpoint = c.url as string;
    let kind = "", slug = "";
    if (c.type === "ats") {
      [kind, slug] = (c.board as string).split(":");
      endpoint = kind === "greenhouse" ? `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
        : kind === "lever" ? `https://api.lever.co/v0/postings/${slug}?mode=json`
        : `https://api.ashbyhq.com/posting-api/job-board/${slug}`;
    }
    row.endpoint = endpoint;

    const result = await open(endpoint);
    const { body, ...evidence } = result;
    row.requests.push(evidence);
    if (result.status !== 200) throw new Error("HTTP " + result.status);

    let jobs: any[];
    if (c.type === "rss") {
      if (XMLValidator.validate(body) !== true) throw new Error("Invalid XML");
      const x: any = new XMLParser({ ignoreAttributes: false, processEntities: { enabled: true, maxTotalExpansions: 200000, maxExpandedLength: 20000000 } }).parse(body);
      const channel = x.rss?.channel || x["rdf:RDF"];
      jobs = [...arr(channel?.item), ...arr(x.feed?.entry)];
      if (!jobs.length) throw new Error("No feed items");
      row.samples = jobs.slice(0, 5).map((j) => ({ title: text(j.title),
        url: typeof j.link === "object" ? arr(j.link).find((l: any) => !l["@_rel"] || l["@_rel"] === "alternate")?.["@_href"] : j.link,
        posted: j.pubDate || j.published || j.updated || j["dc:date"] || "" }));
      row.copyright = text(channel?.copyright || x.feed?.rights);
      row.jobItems = jobs.filter((j) => engineering.test(text(j.title))).length;
      row.opportunityItems = jobs.filter((j) => /hackathon|grant|funding|fellowship|bount|challenge|call for|scholarship|accelerator/i.test(text(j.title))).length;
    } else {
      const payload = JSON.parse(body);
      jobs = c.type === "ats" ? (kind === "lever" ? payload : payload.jobs)
        : c.itemsPath ? c.itemsPath.split(".").reduce<any>((v, k) => v?.[k], payload) : payload;
      if (!Array.isArray(jobs) || !jobs.length) throw new Error("No jobs in expected response array");
      row.responseFields = Object.keys(payload);
      row.itemFields = Object.keys(jobs[0]);
      if (c.type === "ats") {
        if (kind === "greenhouse") {
          const detail = await open(endpoint + "?content=true");
          const { body: detailBody, ...detailEvidence } = detail;
          row.requests.push(detailEvidence);
          if (detail.status === 200) jobs = JSON.parse(detailBody).jobs;
        }
        const normalized = jobs.map((j) => ({ title: j.title || j.text,
          location: j.location?.name || j.location || j.categories?.location || "",
          url: j.absolute_url || j.hostedUrl || j.jobUrl,
          description: j.content || j.descriptionPlain || "",
          isRemote: j.isRemote || j.workplaceType === "remote" }));
        const matches = normalized.filter((j) => engineering.test(j.title)
          && (j.isRemote || remote.test(j.location + " " + j.description) || relocation.test(j.description)));
        row.matchingRoles = matches.length;
        row.nigeriaRoles = normalized.filter((j) => engineering.test(j.title) && /Nigeria|Lagos|Abuja/i.test(j.location)).length;
        row.africaRoles = normalized.filter((j) => engineering.test(j.title) && /Africa|EMEA|Worldwide|Anywhere/i.test(j.location)).length;
        row.locations = [...new Set(matches.map((j) => j.location))].slice(0, 12);
        row.samples = (matches.length ? matches : normalized).slice(0, 5).map(({ description, ...j }) => j);

        const landing = await open(c.url as string);
        const { body: landingBody, ...landingEvidence } = landing;
        row.requests.push(landingEvidence);
        row.boardPageOpened = landing.status === 200;
      }
    }

    row.count = jobs.length;
    row.verified = true;
  } catch (e) {
    row.error = (e as Error).message;
  }
  return row;
}

(async () => {
  const results: Record_[] = [];
  let index = 0;
  // Limited concurrency; each URL is requested only once per verification pass.
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (index < list.length) {
      const c = list[index++]!;
      const row = await verify(c);
      results.push(row);
      console.log(`${row.verified ? "OK" : "FAIL"} ${c.name || c.board} ${row.count} ${row.error || ""}`);
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, JSON.stringify(results, null, 2) + "\n");
    }
  }));
  console.log(JSON.stringify({ checked: results.length, verified: results.filter((r) => r.verified).length }));
})().catch((e) => { console.error(e); process.exitCode = 1; });