const { test } = require('node:test');
const assert = require('node:assert/strict');

const factory = () => import('../src/browser-api.js');
const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};

test('preview separates jobs from funding and labels every synthetic item', async () => {
  const { createBrowserApi } = await factory();
  const api = createBrowserApi(storage());
  const worldwide = await api.jobs('worldwide');
  const nigeria = await api.jobs('nigeria');
  const funding = await api.jobs('grants');
  assert.ok(worldwide.length > 0 && nigeria.length > 0 && funding.length > 0);
  assert.ok([...worldwide, ...nigeria].every((item) => item.kind === 'job'));
  assert.deepEqual(new Set(funding.map((item) => item.kind)), new Set(['grant', 'hackathon']));
  assert.ok([...worldwide, ...nigeria, ...funding].every((item) => item.sample && item.url === null));
});

test('interest preferences persist and update scores without storing secrets', async () => {
  const { createBrowserApi } = await factory();
  const saved = storage();
  const api = createBrowserApi(saved);
  let updates = 0;
  const off = api.onUpdated(() => updates++);
  await api.setSettings({ interests: [' PYTHON ', 'python'], xQueries: ['private query'] });
  assert.equal(updates, 1);
  off();
  const restored = createBrowserApi(saved);
  assert.deepEqual((await restored.getSettings()).interests, ['python']);
  assert.equal((await restored.jobs('worldwide'))[0].score, 0);
  assert.equal((await restored.jobs('nigeria')).find((item) => item.tags.includes('python')).score, 1);
  await assert.rejects(api.setSettings({ interests: ['rust'], xaiKey: 'secret' }), /API keys/);
  assert.deepEqual([...saved.values.values()], ['["python"]']);
  await api.setSettings({ interests: [] });
  assert.equal(updates, 1);
});

test('desktop operations fail explicitly and malformed storage preserves defaults', async () => {
  const { createBrowserApi } = await factory();
  const api = createBrowserApi({ getItem: () => '{broken', setItem() {} });
  assert.ok((await api.getSettings()).interests.includes('rust'));
  await assert.rejects(api.addSource('https://example.com/feed'), /desktop app/);
  await assert.rejects(api.refresh(), /desktop app/);
  assert.ok((await createBrowserApi().jobs('worldwide')).length > 0);
});
