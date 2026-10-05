const ATS_HOSTS = {
  'job-boards.greenhouse.io': 'greenhouse', 'boards.greenhouse.io': 'greenhouse',
  'jobs.lever.co': 'lever', 'jobs.ashbyhq.com': 'ashby',
};

function sourceFromUrl(value) {
  const url = new URL(value.trim());
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Use an HTTP or HTTPS feed URL');
  const kind = ATS_HOSTS[url.hostname];
  const slug = url.pathname.split('/').filter(Boolean)[0];
  if (kind && slug && /^[\w.-]+$/.test(slug)) {
    const board = `${kind}:${slug}`;
    return { name: board, type: 'ats', boards: [board] };
  }
  if (url.hostname === 'www.arbeitnow.com' && url.pathname === '/api/job-board-api') return { name: 'Arbeitnow', type: 'arbeitnow' };
  if (url.hostname === 'himalayas.app' && /^\/jobs\/api(?:\/search)?\/?$/.test(url.pathname)) {
    return { name: 'Himalayas API', type: 'himalayas', url: url.href };
  }
  if (url.hostname === 'jobicy.com' && url.pathname === '/api/v2/remote-jobs') return { name: 'Jobicy API', type: 'jobicy', url: url.href };
  // Different feeds on the same host must have independent source health.
  return { name: url.hostname + url.pathname + url.search, type: 'rss', url: url.href };
}

function units(sources) {
  const seen = new Set();
  return sources.flatMap(s => s.type === 'ats'
    ? (s.boards || []).map(board => ({ ...s, name: board, board })) : [s])
    .filter(s => {
      if (s.enabled === false) return false;
      const key = s.type === 'ats' ? s.board.toLowerCase() : s.url || `${s.type}:${s.category || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

module.exports = { sourceFromUrl, units };
