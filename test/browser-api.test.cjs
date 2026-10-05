const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPublicIndex } = require('../scripts/web-index.cjs');
const factory = () => import('../src/browser-api.js');
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};
const job = (id, extra = {}) => ({ id, title: 'Rust Backend Engineer', org: 'Company', location: 'Worldwide',
  url: `https://example.com/jobs/${id}`, source: 'Company', active: true, tags: ['rust', 'remote', 'africa-ok'], kind: 'job', ...extra });
const sources = [{ name: 'Company', type: 'rss', url: 'https://example.com/feed' }];
const fixture = () => buildPublicIndex({
  jobs: { rust: job('rust'), python: job('python', { title: 'Python Backend Engineer', tags: ['python', 'nigeria'] }),
    grant: job('grant', { title: 'Open-source grant', kind: 'grant', tags: ['grant'] }),
    hack: job('hack', { title: 'Developer hackathon', kind: 'hackathon', tags: ['hackathon', 'remote'] }) },
  runs: { Company: { ok: true, count: 4, ts: 1 } },
}, sources);
const ok = data => ({ ok: true, json: async () => data });

test('browser reads the published index and shares one fetch across jobs, health and status', async () => {
  const { createBrowserApi } = await factory();
  let calls = 0;
  const api = createBrowserApi(storage(), { fetcher: async (url, options) => {
    calls++; assert.equal(url, '/data/opportunities.json'); assert.equal(options.cache, 'no-cache'); return ok(fixture());
  } });
  const [worldwide, nigeria, funding, health, status] = await Promise.all([
    api.jobs('worldwide'), api.jobs('nigeria'), api.jobs('grants'), api.health(), api.indexInfo(),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(worldwide.map(item => item.id), ['rust']);
  assert.deepEqual(new Set(nigeria.map(item => item.id)), new Set(['rust', 'python']));
  assert.deepEqual(new Set(funding.map(item => item.kind)), new Set(['grant', 'hackathon']));
  assert.ok([...worldwide, ...nigeria, ...funding].every(item => item.url.startsWith('https://') && !item.sample));
  assert.equal(health[0].count, 4);
  assert.equal(status.sourceCount, 1);
});

test('interest preferences persist and affect real index scores without storing secrets', async () => {
  const { createBrowserApi } = await factory();
  const saved = storage();
  const options = { fetcher: async () => ok(fixture()) };
  const api = createBrowserApi(saved, options);
  let updates = 0;
  const off = api.onUpdated(() => updates++);
  await api.setSettings({ interests: [' PYTHON ', 'python'], xQueries: ['private query'] });
  assert.equal(updates, 1); off();
  const restored = createBrowserApi(saved, options);
  assert.deepEqual((await restored.getSettings()).interests, ['python']);
  assert.equal((await restored.jobs('worldwide'))[0].score, 0);
  assert.equal((await restored.jobs('nigeria')).find(item => item.id === 'python').score, 1);
  await assert.rejects(api.setSettings({ interests: ['rust'], xaiKey: 'secret' }), /API keys/);
  assert.deepEqual([...saved.values.values()], ['["python"]']);
  await api.setSettings({ interests: [] }); assert.equal(updates, 1);
});

test('missing or invalid indexes fail explicitly rather than falling back to sample listings', async () => {
  const { createBrowserApi } = await factory();
  const missing = createBrowserApi(undefined, { fetcher: async () => ({ ok: false, status: 404 }) });
  await assert.rejects(missing.jobs('worldwide'), /HTTP 404/);
  const invalid = createBrowserApi(undefined, { fetcher: async () => ok({ version: 1, jobs: [{ url: 'javascript:alert(1)' }], health: [] }) });
  await assert.rejects(invalid.jobs('worldwide'), /invalid/);
  const api = createBrowserApi({ getItem: () => '{broken' }, { fetcher: async () => ok(fixture()) });
  assert.ok((await api.getSettings()).interests.includes('rust'));
  await assert.rejects(api.addSource('https://example.com/feed'), /desktop app/);
});

test('reload gets the latest published snapshot and excludes newly expired opportunities', async () => {
  const { createBrowserApi } = await factory();
  let data = fixture(), time = 1000, updates = 0;
  data.jobs[0].deadline = new Date(2000).toISOString();
  const api = createBrowserApi(undefined, { fetcher: async () => ok(data), now: () => time });
  const off = api.onUpdated(() => updates++);
  assert.equal((await api.jobs('worldwide')).length, 1);
  time = 3000;
  assert.equal((await api.jobs('worldwide')).length, 0);
  data = fixture(); data.jobs = []; data.health[0].count = 0;
  await api.refresh();
  assert.equal(updates, 1); assert.deepEqual(await api.jobs('nigeria'), []);
  assert.equal((await api.health())[0].count, 0); off();
});

test('public export excludes private sources, closed and expired jobs and raw collector data', () => {
  const now = Date.now();
  const db = { jobs: {
    good: job('good', { text: 'raw description', seen_by: { secret: {} }, xaiKey: 'secret',
      attribution: { label: 'Publisher credit', url: 'https://example.com', private: 'secret' } }),
    private: job('private', { source: 'Private feed' }), closed: job('closed', { active: false }),
    expired: job('expired', { deadline: new Date(now - 1000).toISOString() }),
    unsafe: job('unsafe', { url: 'javascript:alert(1)' }),
  }, runs: { Company: { ok: true, count: 1, ts: now }, 'Private feed': { ok: true, count: 1, ts: now } }, meta: { secret: 'key' } };
  const data = buildPublicIndex(db, sources, now);
  assert.deepEqual(data.jobs.map(item => item.id), ['good']);
  assert.deepEqual(data.health.map(item => item.source), ['Company']);
  assert.deepEqual(data.jobs[0].attribution, { label: 'Publisher credit', url: 'https://example.com' });
  assert.ok(!JSON.stringify(data).includes('secret'));
  assert.equal(data.jobs[0].text, undefined); assert.equal(data.jobs[0].seen_by, undefined);
});
