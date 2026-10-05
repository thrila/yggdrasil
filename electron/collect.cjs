// Fetches every source, tags postings, keeps them in a JSON store. Runs in Electron's main process (Node 18+).
const fs = require("fs"), crypto = require("crypto");
const { XMLParser, XMLValidator } = require("fast-xml-parser");
const { tag } = require("./tags.cjs");
const { opportunityKind } = require("./opportunities.cjs");
const { units } = require("./source-config.cjs");

const UA = { "User-Agent": "opportunity-dashboard/0.1 (personal use)" };
const get = async (url, opt = {}) => {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000), ...opt });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r;
};
const getJ = async (u, opt) => (await get(u, opt)).json();
const clean = (s) => String(s || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/<[^>]+>/g, " ").replace(/&amp;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
// Default entity limits (1000 expansions) abort on legit feeds like We Work Remotely. Raise them, keep them bounded.
const XML_OPTS = { ignoreAttributes: false, processEntities: { enabled: true, maxEntitySize: 50000, maxExpansionDepth: 20,
  maxTotalExpansions: 200000, maxExpandedLength: 20000000, maxEntityCount: 5000 } };
const txt = (x) => (x && typeof x === "object" ? x["#text"] ?? "" : x ?? "");
const isoDate = x => {
  if (!x) return '';
  const date = new Date(typeof x === 'number' && x < 1e12 ? x * 1000 : x);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

function attributionFor(source) {
  const host = source.url ? new URL(source.url).hostname : source.type;
  if (host.endsWith('himalayas.app') || source.type === 'himalayas') return { label: 'Data from Himalayas', url: 'https://himalayas.app/' };
  if (host.endsWith('jobicy.com') || source.type === 'jobicy') return { label: 'Data from Jobicy', url: 'https://jobicy.com/' };
  if (host.endsWith('yubhub.co')) return { label: 'Data by YubHub', url: 'https://yubhub.co/' };
  if (host.endsWith('jobscollider.com')) return { label: 'Data from JobsCollider', url: 'https://jobscollider.com/' };
  if (host.endsWith('hireweb3.io')) return { label: 'Data from HireWeb3', url: 'https://www.hireweb3.io/' };
  if (source.type === 'remotive') return { label: 'Data from Remotive', url: 'https://remotive.com/' };
  if (source.type === 'remoteok') return { label: 'Data from Remote OK', url: 'https://remoteok.com/' };
  return null;
}

function parseFeed(xml, source) {
  if (XMLValidator.validate(xml) !== true) throw new Error('Invalid RSS/Atom XML');
  const x = new XMLParser(XML_OPTS).parse(xml);
  const channel = x.rss?.channel || x['rdf:RDF'];
  if (!channel && !x.feed) throw new Error('Expected RSS or Atom, received another document');
  return arr(channel?.item).concat(arr(x.feed?.entry)).map(i => {
    const link = typeof i.link === 'object'
      ? arr(i.link).find(l => !l['@_rel'] || l['@_rel'] === 'alternate')?.['@_href'] : i.link;
    let location = arr(i['himalayasJobs:locationRestriction']).map(txt).filter(Boolean)
      .concat(arr(i.region || i.location || i['job:location'] || i['hireweb3Jobs:location']).map(txt).filter(Boolean)).join('; ');
    if (x.rss && i['himalayasJobs:companyName']) location = `${location || 'Worldwide'} Remote`;
    else if (/remote jobs|remote opportunities|work from anywhere/i.test(txt(channel?.title || x.feed?.title))) location = `${location} Remote`.trim();
    const target = link || (/^https?:\/\//.test(txt(i.guid)) ? txt(i.guid) : '');
    let url = '';
    try { if (target) url = new URL(target, x.feed?.['@_xml:base'] || source.url).href; } catch {}
    const content = clean(txt(i['content:encoded']) || txt(i.content) || txt(i.description) || txt(i.summary));
    if (/remote/i.test(txt(i['hireweb3Jobs:locationType']))) location = `${location} Remote`.trim();
    return { title: clean(txt(i.title)), org: clean(txt(i['himalayasJobs:companyName'] || i['hireweb3Jobs:companyName'] || i['dc:creator'])) || source.name,
      location, url,
      posted: isoDate(txt(i.pubDate || i.published || i.updated || i['dc:date'])),
      deadline: isoDate(txt(i['himalayasJobs:expiryDate'] || i['hireweb3Jobs:expiryDate'])),
      deadlineLabel: content.match(/\bdeadline:\s*([^;.\n]{1,60})/i)?.[1]?.trim() || '',
      text: content };
  });
}

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
    return parseFeed(await (await get(u.url)).text(), u);
  },
  async arbeitnow() {
    // Bounded discovery pages; not a complete snapshot of all listings.
    const r = await getJ('https://www.arbeitnow.com/api/job-board-api');
    if (!Array.isArray(r.data)) throw new Error('Expected Arbeitnow data array');
    return r.data.map(j => ({ title: j.title, org: j.company_name, location: `${j.location || ''}${j.remote ? ' Remote' : ''}`,
      url: j.url, posted: isoDate(j.created_at), text: clean(j.description) }));
  },
  async himalayas(u) {
    const r = await getJ(u.url || 'https://himalayas.app/jobs/api?limit=20&offset=0');
    if (!Array.isArray(r.jobs)) throw new Error('Expected Himalayas jobs array');
    return r.jobs.map(j => ({ title: j.title, org: j.companyName,
      location: `${arr(j.locationRestrictions).join('; ') || 'Worldwide'} Remote`,
      url: j.applicationLink || j.guid, posted: isoDate(j.pubDate), deadline: isoDate(j.expiryDate), text: clean(j.description) }));
  },
  async jobicy(u) {
    const r = await getJ(u.url || 'https://jobicy.com/api/v2/remote-jobs?count=20');
    if (!Array.isArray(r.jobs)) throw new Error('Expected Jobicy jobs array');
    return r.jobs.map(j => ({ title: j.jobTitle, org: j.companyName, location: `${j.jobGeo || ''} Remote`,
      url: j.url, posted: isoDate(j.pubDate), text: clean(j.jobDescription) }));
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
  const host = u.url ? new URL(u.url).hostname : u.type;
  const minHours = host.endsWith('himalayas.app') || u.type === 'himalayas' ? 24
    : host.endsWith('jobicy.com') || u.type === 'jobicy' ? 1 : 0;
  const pollKey = minHours ? host : u.name;
  const lastPoll = store.d.meta.polls?.[pollKey];
  if (lastPoll && start - lastPoll < Math.max(minHours, u.min_interval_hours || 0) * 3600e3) return;
  let n = 0;
  try {
    if (!ADAPTERS[u.type]) throw new Error('Unknown source type ' + u.type);
    store.d.meta.polls ||= {};
    store.d.meta.polls[pollKey] = start;
    let items = await ADAPTERS[u.type](u, cfg, store);
    if (!Array.isArray(items)) throw new Error('Expected a list of opportunities');
    if (u.include?.length) items = items.filter((j) => u.include.some((k) => j.title.toLowerCase().includes(k.toLowerCase())));
    for (const j of items) {
      if (!j.title || !/^https?:\/\//.test(j.url || '')) continue;
      const id = crypto.createHash("sha1").update(j.url).digest("hex");
      const kind = opportunityKind(j, u);
      // Funding feeds can include years of news archives. Keep recent announcements, not historical awards.
      if (u.type === 'rss' && kind !== 'job' && isoDate(j.posted) && start - Date.parse(isoDate(j.posted)) > 180 * 86400e3) continue;
      const tags = tag(j.title, j.location || '', j.text || '', u.force_tags || []).filter(t =>
        kind !== 'job' || !['grant', 'hackathon', 'fellowship'].includes(t));
      if (kind !== 'job' && !tags.includes(kind)) tags.push(kind);
      const previous = store.d.jobs[id];
      const seenBy = { ...(previous?.seen_by || (previous ? { [previous.source]: { active: previous.active, ts: previous.last_seen } } : {})),
        [u.name]: { active: true, ts: start, type: u.type } };
      // Lightweight feeds can repeat an ATS URL with just its title. Preserve the employer's country restrictions and richer tags.
      if (previous && kind === 'job' && u.type !== 'ats' && (previous.source_type === 'ats' || /^(greenhouse|lever|ashby):/.test(previous.source))) {
        store.d.jobs[id] = { ...previous, last_seen: start, seen_by: seenBy, attribution: previous.attribution || attributionFor(u) };
        n++;
        continue;
      }
      const deadline = isoDate(j.deadline);
      store.d.jobs[id] = { id, title: j.title, org: j.org || "", location: j.location || "", url: j.url, source: u.name, source_type: u.type,
        posted: isoDate(j.posted), kind, deadline, tags: tags.sort(), seen_by: seenBy,
        deadline_label: j.deadlineLabel || '',
        attribution: attributionFor(u) || previous?.attribution || null,
        first_seen: previous?.first_seen || start, last_seen: start, active: !deadline || Date.parse(deadline) > start };
      n++;
    }
    // Only ATS responses enumerate all currently open positions. RSS and paginated APIs are rolling windows.
    if (u.type === 'ats') for (const j of Object.values(store.d.jobs)) {
      if (!j.seen_by && j.source === u.name) j.seen_by = { [u.name]: { active: j.active, ts: j.last_seen } };
      if (j.seen_by?.[u.name] && j.seen_by[u.name].ts < start) {
        j.seen_by[u.name].active = false;
        const observations = Object.entries(j.seen_by);
        const snapshots = observations.filter(([source, observation]) => observation.type === 'ats' || /^(greenhouse|lever|ashby):/.test(source));
        j.active = (snapshots.length ? snapshots : observations).some(([, observation]) => observation.active);
      }
    }
    for (const j of Object.values(store.d.jobs)) if (j.deadline && Date.parse(j.deadline) <= start) j.active = false;
    store.d.runs[u.name] = { ok: true, count: n, error: "", ts: Date.now() };
  } catch (e) { // one broken source never stops the rest
    store.d.runs[u.name] = { ok: false, count: n, error: String(e.message || e).slice(0, 200), ts: Date.now() };
  }
}

async function runAll(store, cfg, sources) {
  for (const u of units(sources)) { await runUnit(store, u, cfg); store.save(); }
}
module.exports = { createStore, runAll, runUnit, parseFeed, ADAPTERS };
