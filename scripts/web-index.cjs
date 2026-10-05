const fs = require('node:fs');
const path = require('node:path');
const { units } = require('../electron/source-config.cjs');
const { inTab } = require('../electron/opportunities.cjs');

const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const publicSources = () => [...read('research/sources.jobs.json'), ...read('research/sources.bonus.json'), read('research/sources.adapters.json')[0]];
const tabs = ['worldwide', 'nigeria', 'grants'];
const http = value => typeof value === 'string' && /^https?:\/\//.test(value);

function buildPublicIndex(db, sources, now = Date.now()) {
  const configured = units(sources);
  const allowed = new Set(configured.map(source => source.name));
  const jobs = Object.values(db.jobs).flatMap(job => {
    if (!allowed.has(job.source) || !http(job.url) || (job.deadline && Date.parse(job.deadline) <= now)) return [];
    const views = tabs.filter(tab => inTab(job, tab));
    if (!views.length) return [];
    // Export posting metadata and original links only. No descriptions, private sources,
    // collector bookkeeping, user settings, API keys, or raw response bodies.
    const result = { id: job.id, title: job.title, org: job.org || '', location: job.location || '', url: job.url,
      source: job.source, posted: job.posted || '', first_seen: job.first_seen || 0,
      kind: job.kind || 'job', tags: job.tags || [], tabs: views, deadline: job.deadline || '', deadline_label: job.deadline_label || '' };
    if (job.attribution && http(job.attribution.url)) result.attribution = { label: job.attribution.label, url: job.attribution.url };
    return [result];
  });
  const health = configured.map(source => {
    const run = db.runs[source.name];
    const board = source.board?.split(':');
    const url = board ? ({ greenhouse: 'https://job-boards.greenhouse.io/', lever: 'https://jobs.lever.co/', ashby: 'https://jobs.ashbyhq.com/' }[board[0]] + board[1])
      : source.url || (source.type === 'arbeitnow' ? 'https://www.arbeitnow.com/api/job-board-api' : '');
    return { source: source.name, type: source.type, url,
      ok: run?.ok ?? false, count: run?.count ?? 0, error: run?.error || (run ? '' : 'Not collected yet'), ts: run?.ts ?? 0 };
  });
  const collectedAt = Math.max(0, ...health.map(source => source.ts));
  return { version: 1, generatedAt: new Date(now).toISOString(), collectedAt: collectedAt ? new Date(collectedAt).toISOString() : null,
    counts: Object.fromEntries(tabs.map(tab => [tab, jobs.filter(job => job.tabs.includes(tab)).length])),
    sourceCount: health.length, jobs, health };
}

async function main() {
  const sources = publicSources();
  const file = path.join(root, '.cache/opportunities.json');
  if (process.argv.includes('--refresh')) {
    const { createStore, runUnit } = require('../electron/collect.cjs');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const store = createStore(file);
    const queue = [...units(sources)];
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (queue.length) {
        const source = queue.shift();
        await runUnit(store, source, {});
        const run = store.d.runs[source.name];
        console.error(`${source.name}: ${run?.ok ? 'OK ' + run.count : run?.error || 'cached'}`);
      }
    }));
    store.save();
  }
  const snapshot = buildPublicIndex(read('.cache/opportunities.json'), sources);
  if (!snapshot.jobs.length) throw new Error('No collected opportunities to publish. Run npm run web:update first.');
  const target = path.join(root, 'public/data/opportunities.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(snapshot) + '\n');
  console.log(JSON.stringify({ file: target, ...snapshot.counts, sources: snapshot.sourceCount,
    healthy: snapshot.health.filter(source => source.ok).length, collectedAt: snapshot.collectedAt }, null, 2));
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { buildPublicIndex, publicSources };
