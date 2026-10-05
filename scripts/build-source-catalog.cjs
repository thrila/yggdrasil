// Build pasteable configs and the report only from successful live verification records.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const records = read('research/verification.json');
const selection = read('research/selection.json');
const byId = new Map(records.map(r => [r.board || r.url, r]));
const get = id => {
  const row = byId.get(id);
  assert(row?.verified && row.count > 0, `Source not verified with items: ${id}`);
  assert(row.requests.some(q => q.url === row.endpoint && q.status === 200), `No successful endpoint evidence: ${id}`);
  if (row.type === 'ats') assert(row.matchingRoles > 0 && row.boardPageOpened, `Missing eligibility/landing evidence: ${id}`);
  return row;
};
const boards = selection.boards.map(get), feeds = selection.feeds.map(get), bonus = selection.bonus.map(get), adapters = selection.adapters.map(get);
const excluded = new Set(['greenhouse:stripe', 'lever:palantir', 'ashby:ramp', 'greenhouse:gitlab', 'greenhouse:cloudflare']);
boards.forEach(r => assert(!excluded.has(r.board.toLowerCase())));
assert.equal(new Set([...boards, ...feeds, ...bonus].map(r => r.board || r.url)).size, boards.length + feeds.length + bonus.length);
const include = ['engineer', 'developer', 'software', 'backend', 'fullstack', 'full stack', 'research', 'scientist', 'technical staff', 'devops', 'rust', 'python', 'typescript', 'ingénieur', 'informatique', 'développeur'];
const pretty = {
  canonical: 'Canonical', offchainlabs: 'Offchain Labs', provable: 'Provable', 'matter-labs': 'Matter Labs', alpenlabs: 'Alpen Labs',
  whetstoneresearch: 'Whetstone Research', 'trust-wallet': 'Trust Wallet', lightning: 'Lightning Labs', projecteleven: 'Project Eleven',
  gensyn: 'Gensyn', ritual: 'Ritual', consensys: 'Consensys', certik: 'CertiK', ondofinance: 'Ondo Finance', alpaca: 'Alpaca',
  Keyrock: 'Keyrock', luxor: 'Luxor', eqvilentjobs: 'Eqvilent', supabase: 'Supabase', grafanalabs: 'Grafana Labs',
  enchargeai36: 'EnCharge AI', lemurianlabs: 'Lemurian Labs', jetbrains: 'JetBrains', stackblitz: 'StackBlitz', honeycomb: 'Honeycomb',
  moniepoint: 'Moniepoint', sandtechholdingslimited: 'Sand Technologies', 'm-kopa': 'M-KOPA', xai: 'xAI', scaleai: 'Scale AI',
  tenstorrent: 'Tenstorrent', anthropic: 'Anthropic', databricks: 'Databricks', lightningai: 'Lightning AI', togetherai: 'Together AI',
  coreweave: 'CoreWeave', nebius: 'Nebius', cursor: 'Cursor', anyscale: 'Anyscale', baseten: 'Baseten', character: 'Character.AI',
  lambda: 'Lambda', primeintellect: 'Prime Intellect', cartesia: 'Cartesia', etched: 'Etched', perplexity: 'Perplexity',
  fluidstack: 'FluidStack', cohere: 'Cohere', 'Liquid-AI': 'Liquid AI', 'd-matrix': 'd-Matrix', friendliai: 'FriendliAI',
  cognition: 'Cognition', featherlessai: 'Featherless AI', openai: 'OpenAI', 'inworld-ai': 'Inworld AI', poolside: 'Poolside',
  tensorwave: 'TensorWave', 'runway-ml': 'Runway', reka: 'Reka AI', crusoe: 'Crusoe', pulumicorporation: 'Pulumi', mariadbplc: 'MariaDB',
};
const name = r => r.board ? pretty[r.board.split(':')[1]] || r.name : r.name;
const config = r => {
  const c = { name: name(r), type: 'rss', url: r.url };
  if (r.region === 'Nigeria') c.force_tags = ['nigeria'];
  if (r.bucket !== 'bonus') c.include = include;
  else if (r.url.includes('hackathons.rss') || r.url.includes('brabble.ai')) c.force_tags = ['hackathon'];
  else if (r.url.includes('tensorhack.com/data/opportunities.rss')) c.force_tags = ['grant'];
  else if (r.url.includes('nlnet.nl')) { c.force_tags = ['grant']; c.include = ['funding', 'call for', 'grant']; }
  else if (r.url.includes('ethereum.org')) { c.force_tags = ['grant']; c.include = ['grant', 'funding']; }
  else c.include = ['hackathon', 'grant', 'computer', 'engineering', 'digital', 'technology', 'fellowship', 'scholarship'];
  return c;
};
const jobs = [];
for (let i = 0; i < boards.length; i += 25) jobs.push({ name: 'Company boards: batch ' + (Math.floor(i / 25) + 1), type: 'ats', boards: boards.slice(i, i + 25).map(r => r.board) });
jobs.push(...feeds.map(config));
const bonusConfig = bonus.map(config);
const implemented = [
  { name: 'Arbeitnow', type: 'arbeitnow', include },
  { name: 'Himalayas API', type: 'himalayas', url: 'https://himalayas.app/jobs/api?limit=20&offset=0', include },
  { name: 'Jobicy API', type: 'jobicy', url: 'https://jobicy.com/api/v2/remote-jobs?count=20', include },
];
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const json = value => JSON.stringify(value, null, 2) + '\n';
write('research/sources.jobs.json', json(jobs));
write('research/sources.bonus.json', json(bonusConfig));
write('research/sources.adapters.json', json(implemented));
const urls = [...boards, ...feeds].map(r => r.url);
write('research/sources.urls.txt', urls.join('\n') + '\n');
write('research/bonus.urls.txt', bonus.map(r => r.url).join('\n') + '\n');
const unknown = 'Reuse licence not established; keep original links; personal reader only until terms are checked.';
function restrictions(r) {
  if (r.url.includes('himalayas.app')) return 'Credit/link Himalayas; daily sync; keep job links; no onward submission to third-party job aggregators.';
  if (r.url.includes('jobicy.com')) return 'Credit Jobicy; canonical job links; sync at most hourly; cache responses.';
  if (r.url.includes('yubhub.co')) return 'Redistribution allowed with a visible Data by YubHub attribution link.';
  if (r.url.includes('hireweb3.io')) return 'Credit/backlink HireWeb3; keep supplied job URLs; no submission to third-party job aggregators.';
  if (r.url.includes('jobscollider.com')) return 'Credit/link JobsCollider; keep supplied job URLs; no submission to third-party job aggregators.';
  if (r.url.includes('myjobmag')) return 'Service alerts may be redistributed under MyJobMag terms; expired posts can remain in feeds.';
  if (r.url.includes('remotefirstjobs.com')) return 'Publisher expressly permits aggregators; preserve original links; feed is a rolling 100-item window.';
  if (r.url.includes('tensorhack.com')) return 'Exports expressly provided for readers and personal tools; preserve source links; hourly cache; broad redistribution licence not established.';
  return unknown;
}
const region = r => r.board?.includes('moniepoint') ? 'Nigeria' : r.board && /sandtech|m-kopa/.test(r.board) ? 'Africa' : r.region || 'worldwide';
const note = r => {
  if (r.type === 'ats') {
    const evidence = r.eligibilityEvidence || [];
    const relocation = evidence.some(e => /relocat|visa sponsor/i.test(e.evidence));
    const location = (r.locations?.[0] || '').slice(0, 70);
    return `${r.matchingRoles} relevant remote/relocation matches; ${location}${relocation ? '; relocation/sponsorship mentioned in sampled role' : '; remote geography varies, sponsorship unconfirmed'}. Employer content licence unconfirmed; preserve links.`;
  }
  let n = restrictions(r);
  if (r.region === 'Africa') n = 'Country-specific or mixed regional listings; Nigeria access is not implied. ' + n;
  if (r.url.includes('alouadifa')) n = 'Morocco; French/Arabic jobs plus advice; title filter applied. ' + n;
  if (r.url.includes('tensorhack.com')) n = 'Feed lacks per-item publication timestamps; job RSS lacks location/details. ' + n;
  if (r.bucket === 'bonus') n = 'Announcement feed; includes awards/recaps or non-developer opportunities; check current application deadline. ' + n;
  return n;
};
const escape = s => String(s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ');
const table = rows => [
  '| Name | Type | Verified (yes/no) | Open roles (approx.) | Region (worldwide/Nigeria/Africa) | Key needed | Notes or restrictions |',
  '|---|---|---|---:|---|---|---|',
  ...rows.map(r => `| [${escape(name(r))}](${r.type === 'ats' ? r.endpoint : r.url}) | ${r.type === 'ats' ? 'ATS / ' + r.board.split(':')[0] : r.type.toUpperCase()} | ${r.verified ? 'yes' : 'no'} | ${r.count} | ${region(r)} | ${r.keyNeeded} | ${escape(note(r))} |`),
].join('\n');
write('research/sources.table.md', table([...boards, ...feeds, ...adapters]) + '\n');
write('research/bonus.table.md', table(bonus) + '\n');
const selected = [...boards, ...feeds, ...bonus, ...adapters].map(r => ({ ...r, displayName: name(r), restrictions: restrictions(r), catalogRegion: region(r) }));
write('research/source-metadata.json', json(selected));
const failed = records.filter(r => !r.verified);
write('research/unverified.json', json(failed));
const notSelected = records.filter(r => r.verified && !new Set([...selection.boards, ...selection.feeds, ...selection.bonus, ...selection.adapters]).has(r.board || r.url));
write('research/not-selected.json', json(notSelected));
const adapterTable = [
  '| Source | Endpoint | Auth | Key response fields | Reuse / adapter status |',
  '|---|---|---|---|---|',
  ...adapters.map(r => `| ${r.name} | ${r.url} | No key on tested GET | ${r.itemsPath || 'root array'}: ${r.itemFields.slice(0, 18).join(', ')} | ${restrictions(r)} ${implemented.some(c => c.name === r.name) || r.name === 'Himalayas API' || r.name === 'Jobicy API' ? 'Implemented; first bounded page only.' : 'Not installed; undocumented reuse terms.'} |`),
].join('\n');
write('research/adapters.table.md', adapterTable + '\n');
const devpost = records.find(r => r.name === 'Devpost');
const worldRss = feeds.filter(r => r.region === 'worldwide').length;
const africaRss = feeds.filter(r => r.region === 'Nigeria' || r.region === 'Africa').length;
const intro = `Checked live on 2026-10-05: **${boards.length} company boards, ${worldRss} worldwide RSS feeds, ${africaRss} Nigeria/Africa RSS feeds, ${adapters.length} public JSON job endpoints, and ${bonus.length} bonus feeds.** The JSON endpoints include two publishers already represented by RSS, so there are ${worldRss + adapters.length - 2} distinct worldwide job-board publishers. The African count is endpoints, including country feeds from MyJobMag.\n\nEach selected ATS endpoint returned a nonempty jobs array. Every selected board landing URL was opened. Every selected RSS URL returned parseable XML with items, and titles were inspected to exclude news-only, poisoned and duplicate feeds. The verifier's counts are snapshot totals across all departments, or feed-window item counts, before title filters. They are **not** promises that every item is relevant, still open, fully remote, or available from Nigeria. “worldwide” is the worldwide bucket; some remote listings are country restricted, while others offer relocation. Check the role's explicit country/visa conditions. EMEA or a compatible timezone does not establish Nigeria eligibility.\n\nExisting Remotive, RemoteOK, Stripe, Palantir, Ramp and Google News sources are excluded. GitLab, Cloudflare, We Work Remotely and HN Jobs shipped in this checkout and are also omitted from the additional catalog. Public access is not a blanket copyright/republication licence; unknown reuse permissions are explicitly labelled.\n\nVerification requests, status codes, timestamps, sampled roles and SHA-256 response hashes are in [verification.json](research/verification.json); raw response bodies are retained locally in the gitignored .cache/source-verification directory. Failed checks are in [unverified.json](research/unverified.json).\n\n`;
const terms = `Provider rules: [Greenhouse GET/auth docs](https://docs.greenhouse.io/job-board.html), [Lever public postings API](https://github.com/lever/postings-api), [Ashby public postings API](https://developers.ashbyhq.com/docs/public-job-posting-api), [Himalayas RSS attribution](https://himalayas.app/docs/remote-jobs-rss), [Himalayas API rules](https://github.com/Himalayas-App/remote-jobs-api), [Jobicy fair use](https://github.com/Jobicy/remote-jobs-api), [MyJobMag terms](https://www.myjobmag.com/terms), [RemoteFirstJobs aggregator use](https://remotefirstjobs.com/rss), [YubHub attribution](https://yubhub.co/free-job-feeds/), [HireWeb3 rules](https://www.hireweb3.io/rss), [JobsCollider rules](https://github.com/JobsCollider/remote-jobs-rss), [TensorHack exports](https://tensorhack.com/data), [TensorHack terms](https://tensorhack.com/terms). No claim of an employer-content licence follows from ATS API documentation.\n\n`;
const unverified = '| Name | Attempted endpoint | Result |\n|---|---|---|\n' + failed.map(r => `| ${escape(r.name)} | ${r.endpoint || r.url} | ${escape(r.error)} |`).join('\n');
const report = intro + '### 1. Ready-to-paste JSON\n\n' + '```json\n' + json(jobs) + '```\n\n### 2. Plain URL list\n\n```text\n' + urls.join('\n') + '\n```\n\n### 3. Table\n\n' + terms + table([...boards, ...feeds, ...adapters]) + '\n\n### 4. Needs a custom adapter\n\n' + adapterTable + '\n\nHimalayas and Jobicy RSS feeds are sufficient for the basic catalog. Their JSON adapters preserve company, country and expiry fields; avoid polling both forms for the same publisher. Arbeitnow, Himalayas and Jobicy adapters are implemented. Their adapter-specific config is in research/sources.adapters.json, separate from the exact-shape pasteable file above. The Muse and Working Nomads endpoints returned data without authentication, but an explicit redistribution licence was not established; they are not enabled. Pagination is described by links/meta (Arbeitnow), limit/offset (Himalayas) and page/page_count (The Muse).\n\n### 5. Bonus: grants and hackathons\n\n```json\n' + json(bonusConfig) + '```\n\n```text\n' + bonus.map(r => r.url).join('\n') + '\n```\n\n' + table(bonus) + `\n\nBonus custom adapter: ${devpost.endpoint} returned ${devpost.count} hackathons without an API key. Response: hackathons[] with ${devpost.itemFields.slice(0, 18).join(', ')}; meta includes total_count/per_page. This endpoint is undocumented and reuse permission is unconfirmed, so it is not enabled. The verified XML feeds are handled by the installed grants/hackathon indexer. Funding announcements older than 180 days are skipped; awards and recaps are still leads, not proof of an open call.\n\n**Unverified — excluded from imports**\n\n` + unverified + '\n\n**Working payloads omitted from imports**\n\nAngular Jobs and NTEN returned news, rather than job postings. CareerHub returned a mixed advice/global feed. Jobweb Ethiopia’s general feed contained casino spam; only its job-listing feed is selected. MyJobMag Ghana returned job items but showed stale dates. Duplicate category/all-job feeds and feeds already in the checkout were not counted again. Other nonempty ATS boards without sufficient role/location evidence are kept in research/not-selected.json for review.\n';
write('SOURCE_REPORT.md', report + '\nDirectory lead: no relevant jobs/grants directory associated with the supplied @micheal_chomsky handle was verified, so no directory URL is included.\n');
console.log(JSON.stringify({ boards: boards.length, worldwideRss: worldRss, africaRss, customJobApis: adapters.length, bonusRss: bonus.length, unverified: failed.length }));
