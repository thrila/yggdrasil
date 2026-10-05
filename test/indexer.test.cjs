const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseFeed, runAll, ADAPTERS } = require('../electron/collect.cjs');
const { sourceFromUrl, units } = require('../electron/source-config.cjs');
const { opportunityKind, inTab } = require('../electron/opportunities.cjs');
const { tag } = require('../electron/tags.cjs');

test('Atom chooses alternate links, resolves relative URLs, and indexes funding announcements', () => {
  const source = { name: 'Funding', type: 'rss', url: 'https://fund.example/feed.atom', force_tags: ['grant'] };
  const [item] = parseFeed('<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Call for Rust project proposals</title><link rel="self" href="/entry/1"/><link rel="alternate" href="/apply"/><published>2026-10-01T00:00:00Z</published><content type="html">Funding for open source Rust tools</content></entry></feed>', source);
  assert.equal(item.url, 'https://fund.example/apply');
  assert.match(item.text, /Rust/);
  assert.equal(item.posted, '2026-10-01T00:00:00.000Z');
  assert.equal(opportunityKind(item, source), 'grant');
});

test('rejects HTML feed responses and supports RSS 1.0 items', () => {
  assert.throws(() => parseFeed('<html><body>Sign in</body></html>', { name: 'Example' }), /Expected RSS/);
  const [item] = parseFeed('<rdf:RDF xmlns:rdf="urn:rdf"><item><title>Rust Engineer</title><link>https://jobs.example/1</link><dc:date>2026-10-01</dc:date></item></rdf:RDF>', { name: 'Jobs', url: 'https://jobs.example/feed' });
  assert.equal(item.title, 'Rust Engineer');
});

test('hackathon feed preserves an explicit deadline label without guessing its timezone', () => {
  const [item] = parseFeed('<rss><channel><item><title>Build with Rust</title><link>https://events.example/hack</link><description>Online hackathon; deadline: 2026-10-16; prize: TBA</description></item></channel></rss>', { name: 'Hackathons' });
  assert.equal(item.deadlineLabel, '2026-10-16');
  assert.equal(item.deadline, '');
  assert.equal(opportunityKind(item, { force_tags: ['hackathon'] }), 'hackathon');
});

test('Himalayas feed preserves country restrictions and expiry', () => {
  const [item] = parseFeed('<rss><channel><item><title>Backend Engineer</title><link>https://himalayas.app/jobs/1</link><himalayasJobs:companyName>Acme</himalayasJobs:companyName><himalayasJobs:locationRestriction>United States</himalayasJobs:locationRestriction><himalayasJobs:locationRestriction>Canada</himalayasJobs:locationRestriction><himalayasJobs:expiryDate>2026-11-01</himalayasJobs:expiryDate><content:encoded><![CDATA[<p>Python backend</p>]]></content:encoded></item></channel></rss>', { name: 'Himalayas' });
  assert.equal(item.location, 'United States; Canada Remote');
  assert.equal(item.org, 'Acme');
  assert.equal(item.deadline, '2026-11-01T00:00:00.000Z');
  assert.match(item.text, /Python/);
});

test('hackathons and grants have separate kinds and appear in the Grants tab', () => {
  for (const kind of ['grant', 'hackathon', 'fellowship']) {
    const item = { title: 'Build something', kind, active: true, tags: ['remote', kind] };
    assert.equal(inTab(item, 'grants'), true);
    assert.equal(inTab(item, 'worldwide'), false);
  }
  assert.equal(opportunityKind({ title: 'Grants Manager' }), 'job');
  assert.equal(opportunityKind({ title: 'Rust Engineer', text: 'Team hackathons and stock grants' }), 'job');
});

test('EMEA and GMT do not establish Nigeria eligibility', () => {
  assert.equal(tag('Global Backend Engineer', 'Remote EMEA; GMT +/- 3').includes('africa-ok'), false);
  assert.equal(tag('Backend Engineer', 'Remote Worldwide').includes('africa-ok'), true);
  assert.equal(tag('Backend Engineer', 'Remote US only').includes('restricted'), true);
  assert.equal(tag('Backend Engineer', 'Lagos, Nigeria').includes('nigeria'), true);
  assert.equal(inTab({ active: true, kind: 'job', tags: ['africa-ok', 'onsite'] }, 'nigeria'), false);
  assert.equal(tag('Backend Engineer', 'London', 'We do not provide visa sponsorship.').includes('relocation'), false);
  assert.equal(tag('Backend Engineer', 'San Francisco', 'Remote and hybrid candidates will not be considered. Relocation assistance and visa sponsorship are not offered.').includes('remote'), false);
  assert.equal(tag('Backend Engineer', 'San Francisco', 'Remote and hybrid candidates will not be considered. Relocation assistance and visa sponsorship are not offered.').includes('relocation'), false);
  assert.equal(tag('Backend Engineer', 'Remote Worldwide', 'United States residents only.').includes('restricted'), true);
  assert.equal(inTab({ active: true, kind: 'job', tags: tag('Backend Engineer', 'Remote EMEA', 'Our company values work from anywhere.') }, 'nigeria'), false);
});

test('ATS import keeps dots in slugs and source identity prevents duplicate polling', () => {
  const source = sourceFromUrl('https://jobs.ashbyhq.com/magic.dev');
  assert.deepEqual(source.boards, ['ashby:magic.dev']);
  assert.equal(units([source, source, { name: 'same', type: 'ats', boards: ['ashby:MAGIC.DEV'] }]).length, 1);
  assert.notEqual(sourceFromUrl('https://feeds.example/backend.rss').name, sourceFromUrl('https://feeds.example/rust.rss').name);
  assert.throws(() => sourceFromUrl('file:///etc/passwd'));
});

test('successful empty ATS snapshots close listings; failures and rolling feeds keep history', async () => {
  const original = ADAPTERS.ats;
  const store = { d: { jobs: {}, runs: {}, meta: {} }, save() {} };
  const source = { name: 'ATS', type: 'ats', boards: ['ashby:sample'] };
  try {
    ADAPTERS.ats = async () => [{ title: 'Rust Engineer', url: 'https://jobs.example/1', location: 'Remote Worldwide', text: 'Python and internal hackathons' }];
    await runAll(store, {}, [source]);
    const entry = Object.values(store.d.jobs)[0];
    assert.equal(entry.kind, 'job');
    assert.equal(entry.tags.includes('hackathon'), false);
    entry.seen_by['ashby:sample'].ts = 0;
    ADAPTERS.ats = async () => { throw new Error('HTTP 503'); };
    await runAll(store, {}, [source]);
    assert.equal(entry.active, true);
    ADAPTERS.ats = async () => [];
    await runAll(store, {}, [source]);
    assert.equal(entry.active, false);
  } finally { ADAPTERS.ats = original; }
});

test('duplicate postings survive closure of one of their sources', async () => {
  const original = ADAPTERS.ats;
  const store = { d: { jobs: {}, runs: {}, meta: {} }, save() {} };
  const sources = [{ name: 'ATS', type: 'ats', boards: ['ashby:first', 'ashby:second'] }];
  try {
    ADAPTERS.ats = async () => [{ title: 'Engineer', url: 'https://jobs.example/1' }];
    await runAll(store, {}, sources);
    const entry = Object.values(store.d.jobs)[0];
    entry.seen_by['ashby:first'].ts = 0;
    ADAPTERS.ats = async u => u.board === 'ashby:first' ? [] : [{ title: 'Engineer', url: 'https://jobs.example/1' }];
    await runAll(store, {}, sources);
    assert.equal(Object.values(store.d.jobs)[0].active, true);
  } finally { ADAPTERS.ats = original; }
});

test('minimal RSS duplicates preserve ATS geography and cannot revive a closed employer posting', async () => {
  const originalAts = ADAPTERS.ats, originalRss = ADAPTERS.rss;
  const store = { d: { jobs: {}, runs: {}, meta: {} }, save() {} };
  const ats = { name: 'ATS', type: 'ats', boards: ['ashby:employer'] };
  const rss = { name: 'Lightweight feed', type: 'rss', url: 'https://feed.example/rss' };
  try {
    ADAPTERS.ats = async () => [{ title: 'Backend Engineer', location: 'Remote US only', url: 'https://employer.example/job', text: 'Rust and Python backend systems' }];
    ADAPTERS.rss = async () => [{ title: 'Backend Engineer', url: 'https://employer.example/job', text: 'Backend Engineer at Employer' }];
    await runAll(store, {}, [ats, rss]);
    let item = Object.values(store.d.jobs)[0];
    assert.equal(item.location, 'Remote US only');
    assert(item.tags.includes('rust'));
    assert(item.tags.includes('restricted'));
    item.seen_by['ashby:employer'].ts = 0;
    ADAPTERS.ats = async () => [];
    await runAll(store, {}, [ats, rss]);
    assert.equal(Object.values(store.d.jobs)[0].active, false);
  } finally { ADAPTERS.ats = originalAts; ADAPTERS.rss = originalRss; }
});
