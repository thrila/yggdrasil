// In Electron, window.api comes from electron/preload.cjs. In a plain browser (npm run dev) this demo data is used so the UI still runs.
const demo = [
  { id: "1", title: "Senior Rust Engineer, ZK proofs", org: "demo", location: "Worldwide", url: "#", source: "demo", posted: new Date().toISOString(), first_seen: Date.now(), score: 3, tags: ["africa-ok", "remote", "rust", "senior", "zk"] },
  { id: "2", title: "Backend Engineer", org: "demo", location: "Lagos, Nigeria", url: "#", source: "demo", posted: new Date().toISOString(), first_seen: Date.now(), score: 1, tags: ["backend", "hybrid", "nigeria"] },
];
export const api = window.api ?? {
  jobs: async (t) => demo.filter((j) => t === "nigeria" ? j.tags.includes("nigeria") || j.tags.includes("africa-ok")
    : t === "grants" ? j.tags.includes("grant")
    : j.tags.includes("remote")),
  getSettings: async () => ({ interests: ["rust", "zk"], xaiKeySet: false, xQueries: [], xHandles: [], xCallsPerDay: 20 }),
  setSettings: async () => true, addSource: async () => ({}), health: async () => [], refresh: async () => true, onUpdated: () => () => {},
};
