// Fetches every source, tags postings, keeps them in a JSON store. Runs in Electron's main process (Node 18+).
const fs = require("fs"), crypto = require("crypto");
const { XMLParser } = require("fast-xml-parser");
const { tag } = require("./tags.cjs");

const UA = { "User-Agent": "opportunity-dashboard/0.1 (personal use)" };
const get = async (url, opt = {}) => {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000), ...opt });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r;
};
const getJ = async (u) => (await get(u)).json();
const clean = (s) => String(s || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/<[^>]+>/g, " ").replace(/&amp;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
// Default entity limits (1000 expansions) abort on legit feeds like We Work Remotely. Raise them, keep them bounded.
const XML_OPTS = { ignoreAttributes: false, processEntities: { enabled: true, maxEntitySize: 50000, maxExpansionDepth: 20,
  maxTotalExpansions: 200000, maxExpandedLength: 20000000, maxEntityCount: 5000 } };
const txt = (x) => (x && typeof x === "object" ? x["#text"] ?? "" : x ?? "");

function createStore(file) {
  let d = { jobs: {}, runs: {}, meta: {} };
  try { d = { ...d, ...JSON.parse(fs.readFileSync(file, "utf8")) }; } catch {}
  return { d, save: () => fs.writeFileSync(file, JSON.stringify(d)) };
}

const ADAPTERS = {
  async remotive(u) {
    const r = await getJ(`https://remotive.com/api/remote-jobs?category=${u.category || "software-dev"}`);
    return r.jobs.map((j) => ({ title: j.title, org: j.company_name, location: j.candidate_required_location || "", url: j.url,
      posted: j.publication_date || "", text: clean(j.description) }));
  },
  async remoteok() {
    return (await getJ("https://remoteok.com/api")).slice(1).map((j) => ({ title: j.position, org: j.company,
      location: j.location || "Worldwide", url: j.url, posted: j.date || "", text: (j.tags || []).join(" ") + " " + clean(j.description) }));
  },
  async ats(u) {
    const [kind, slug] = u.board.split(":");
    if (kind === "greenhouse")
      return (await getJ(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`)).jobs.map((j) => ({ title: j.title, org: slug,
        location: j.location?.name || "", url: j.absolute_url, posted: j.updated_at || "", text: clean(j.content) }));
    if (kind === "lever")
      return (await getJ(`https://api.lever.co/v0/postings/${slug}?mode=json`)).map((j) => ({ title: j.text, org: slug,
        location: `${j.categories?.location || ""} ${j.workplaceType || ""}`, url: j.hostedUrl,
        posted: j.createdAt ? new Date(j.createdAt).toISOString() : "", text: j.descriptionPlain || "" }));
    if (kind === "ashby")
      return (await getJ(`https://api.ashbyhq.com/posting-api/job-board/${slug}`)).jobs.map((j) => ({ title: j.title, org: slug,
        location: (j.location || "") + (j.isRemote ? " Remote" : ""), url: j.jobUrl, posted: j.publishedAt || "", text: j.descriptionPlain || "" }));
    throw new Error("Unknown board type " + kind);
  },
  async rss(u) {
    const x = new XMLParser(XML_OPTS).parse(await (await get(u.url)).text());
    const items = arr(x.rss?.channel?.item).concat(arr(x.feed?.entry));
    return items.map((i) => ({ title: clean(txt(i.title)), org: u.name, location: "",
      url: typeof i.link === "object" ? arr(i.link)[0]?.["@_href"] : i.link, posted: i.pubDate || i.updated || "",
      text: clean(txt(i.description) || txt(i.summary)) }));
  },
  // Asks Grok's X Search tool for leads. Needs an xAI key. Results are pointers, verify each link.
  async xsearch(u, cfg, store) {
    if (!cfg.xaiKey) throw new Error("skipped: add an xAI key in Settings");
    const day = new Date().toISOString().slice(0, 10), m = store.d.meta;
    if (m.xDay !== day) { m.xDay = day; m.xCalls = 0; }
    const out = [];
    for (const q of cfg.xQueries || []) {
      if (m.xCalls >= (cfg.xCallsPerDay || 20)) break;
      m.xCalls++;
      const tool = { type: "x_search", ...(cfg.xHandles?.length ? { allowed_x_handles: cfg.xHandles.slice(0, 10) } : {}) };
      const r = await getJ("https://api.x.ai/v1/responses", { method: "POST",
        headers: { ...UA, "Content-Type": "application/json", Authorization: `Bearer ${cfg.xaiKey}` },
        body: JSON.stringify({ model: cfg.xModel, tools: [tool], input:
          `Search X for posts from the last 7 days about: ${q}. Return ONLY a JSON array of up to 10 objects ` +
          `{"title","org","location","url"} where url is the x.com link of the post. No other text.` }) }).catch((e) => { throw e; });
      const text = arr(r.output).flatMap((o) => arr(o.content)).filter((c) => c.type === "output_text").map((c) => c.text).join("");
      let list = [];
      try { list = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || "[]"); } catch {}
      for (const j of list) if (/^https:\/\/(x|twitter)\.com\//.test(j.url || "")) out.push({ ...j, posted: "", text: j.title });
    }
    return out;
  },
};

async function runUnit(store, u, cfg) {
  const start = Date.now();
  let n = 0;
  try {
    let items = await ADAPTERS[u.type](u, cfg, store);
    if (u.include?.length) items = items.filter((j) => u.include.some((k) => j.title.toLowerCase().includes(k.toLowerCase())));
    for (const j of items) {
      if (!j.title || !j.url) continue;
      const id = crypto.createHash("sha1").update(j.url).digest("hex");
      store.d.jobs[id] = { id, title: j.title, org: j.org || "", location: j.location || "", url: j.url, source: u.name,
        posted: j.posted || "", tags: tag(j.title, j.location || "", j.text || "", u.force_tags || []),
        first_seen: store.d.jobs[id]?.first_seen || start, last_seen: start, active: true };
      n++;
    }
    if (n) for (const j of Object.values(store.d.jobs)) if (j.source === u.name && j.last_seen < start) j.active = false; // closed listings
    store.d.runs[u.name] = { ok: true, count: n, error: "", ts: Date.now() };
  } catch (e) { // one broken source never stops the rest
    store.d.runs[u.name] = { ok: false, count: n, error: String(e.message || e).slice(0, 200), ts: Date.now() };
  }
}

const units = (sources) => sources.flatMap((s) => s.type === "ats"
  ? s.boards.map((b) => ({ name: b, type: "ats", board: b, force_tags: s.force_tags, include: s.include })) : [s]);

async function runAll(store, cfg, sources) {
  for (const u of units(sources)) { await runUnit(store, u, cfg); store.save(); }
}
module.exports = { createStore, runAll };
