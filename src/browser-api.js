// Read the published index from the same origin. Collection runs before publishing.
const storageKey = "yggdrasil.preview.interests";
const defaults = ["rust", "python", "typescript", "backend", "fullstack", "systems", "zk", "cryptography", "compiler", "low-latency", "ml-infra", "blockchain"];

export function createBrowserApi(storage, { fetcher = globalThis.fetch, now = () => Date.now() } = {}) {
  let interests = [...defaults];
  try {
    const saved = JSON.parse(storage?.getItem(storageKey) ?? "null");
    if (Array.isArray(saved) && saved.every((item) => typeof item === "string")) interests = saved;
  } catch { /* Use defaults if browser storage is unavailable or malformed. */ }
  const listeners = new Set();
  let snapshot, pending;
  const load = async (force = false) => {
    if (pending) return pending;
    if (snapshot && !force) return snapshot;
    pending = (async () => {
      const response = await fetcher('/data/opportunities.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Could not load the collected index (HTTP ${response.status}).`);
      const data = await response.json();
      if (data.version !== 1 || !Array.isArray(data.jobs) || !Array.isArray(data.health)
        || data.jobs.some(job => !job.id || typeof job.title !== 'string' || !/^https?:\/\//.test(job.url || '')
          || !Array.isArray(job.tags) || !Array.isArray(job.tabs))) throw new Error('The published opportunity index is invalid.');
      snapshot = data;
      return data;
    })();
    try { return await pending; } finally { pending = undefined; }
  };
  const currentJobs = data => data.jobs.filter(job => !job.deadline || Date.parse(job.deadline) > now());
  const unavailable = async () => { throw new Error("Source management is available in the desktop app."); };
  return {
    jobs: async (tab) => currentJobs(await load()).filter(job => job.tabs.includes(tab)).map(job => {
      const words = new Set(job.title.toLowerCase().match(/[a-z+#]+/g) || []);
      const terms = new Set(interests);
      const score = job.tags.filter(tag => terms.has(tag)).length + [...words].filter(word => terms.has(word) && !job.tags.includes(word)).length;
      return { ...job, tags: [...job.tags], score };
    }),
    indexInfo: async () => {
      const data = await load();
      const jobs = currentJobs(data);
      return { collectedAt: data.collectedAt, sourceCount: data.health.length,
        healthySources: data.health.filter(source => source.ok).length,
        counts: Object.fromEntries(['worldwide', 'nigeria', 'grants'].map(tab => [tab, jobs.filter(job => job.tabs.includes(tab)).length])) };
    },
    getSettings: async () => ({ interests: [...interests], xaiKeySet: false, xQueries: [], xHandles: [], xCallsPerDay: 0 }),
    setSettings: async (settings) => {
      if (settings.xaiKey) throw new Error("API keys belong in the desktop app.");
      if (!Array.isArray(settings.interests) || settings.interests.some((item) => typeof item !== "string")) throw new Error("Interests must be a list of words.");
      const next = [...new Set(settings.interests.map((item) => item.trim().toLowerCase()).filter(Boolean))];
      // Persist only interests, never desktop search configuration or API keys.
      storage?.setItem(storageKey, JSON.stringify(next));
      interests = next;
      listeners.forEach((listener) => listener());
      return true;
    },
    health: async () => [...(await load()).health].sort((a, b) => Number(a.ok) - Number(b.ok) || a.source.localeCompare(b.source)),
    addSource: unavailable,
    refresh: async () => { await load(true); listeners.forEach(listener => listener()); return true; },
    onUpdated: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
