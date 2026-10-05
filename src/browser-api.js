// Synthetic opportunities for the static preview. Live collection uses Electron.
const storageKey = "yggdrasil.preview.interests";
const defaults = ["rust", "python", "typescript", "backend", "fullstack", "systems", "zk", "cryptography", "compiler", "low-latency", "ml-infra", "blockchain"];
const samples = [
  { id: "sample-rust", title: "Rust Engineer, ZK proofs", location: "Worldwide", kind: "job", tags: ["africa-ok", "remote", "rust", "zk"] },
  { id: "sample-backend", title: "Python Backend Engineer", location: "Lagos, Nigeria", kind: "job", tags: ["backend", "python", "hybrid", "nigeria"] },
  { id: "sample-grant", title: "Open-source cryptography grant", location: "Worldwide", kind: "grant", tags: ["grant", "cryptography", "worldwide"] },
  { id: "sample-hackathon", title: "Blockchain developer hackathon", location: "Online", kind: "hackathon", tags: ["hackathon", "blockchain", "remote"] },
];

export function createBrowserApi(storage) {
  let interests = [...defaults];
  try {
    const saved = JSON.parse(storage?.getItem(storageKey) ?? "null");
    if (Array.isArray(saved) && saved.every((item) => typeof item === "string")) interests = saved;
  } catch { /* Use defaults if browser storage is unavailable or malformed. */ }
  const listeners = new Set();
  const posted = new Date().toISOString();
  const unavailable = async () => { throw new Error("Live source collection is available in the desktop app."); };
  return {
    jobs: async (tab) => samples.filter((job) => tab === "grants" ? job.kind !== "job"
      : job.kind === "job" && (tab === "nigeria" ? job.tags.includes("nigeria") || job.tags.includes("africa-ok") : job.tags.includes("remote")))
      .map((job) => ({ ...job, tags: [...job.tags], sample: true, org: "Sample organization", source: "Sample data", url: null, posted,
        first_seen: 0, score: interests.filter((term) => [job.title, ...job.tags].join(" ").toLowerCase().includes(term)).length })),
    getSettings: async () => ({ interests: [...interests], xaiKeySet: false, xQueries: [], xHandles: [], xCallsPerDay: 0 }),
    setSettings: async (settings) => {
      if (settings.xaiKey) throw new Error("API keys belong in the desktop app, not the web preview.");
      if (!Array.isArray(settings.interests) || settings.interests.some((item) => typeof item !== "string")) throw new Error("Interests must be a list of words.");
      const next = [...new Set(settings.interests.map((item) => item.trim().toLowerCase()).filter(Boolean))];
      // Persist only interests, never desktop search configuration or API keys.
      storage?.setItem(storageKey, JSON.stringify(next));
      interests = next;
      listeners.forEach((listener) => listener());
      return true;
    },
    health: async () => [],
    addSource: unavailable,
    refresh: unavailable,
    onUpdated: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
