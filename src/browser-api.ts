// Synthetic opportunities for the static preview. Live collection uses Electron.
import type { Job, PublicSettings, Settings, Tab, YggdrasilApi } from "../shared/types";

const storageKey = "yggdrasil.preview.interests";
const defaults = ["rust", "python", "typescript", "backend", "fullstack", "systems", "zk", "cryptography", "compiler", "low-latency", "ml-infra", "blockchain"];

interface Sample { id: string; title: string; location: string; kind: Job["kind"]; tags: string[] }

const samples: Sample[] = [
  { id: "sample-rust", title: "Rust Engineer, ZK proofs", location: "Worldwide", kind: "job", tags: ["africa-ok", "remote", "rust", "zk"] },
  { id: "sample-backend", title: "Python Backend Engineer", location: "Lagos, Nigeria", kind: "job", tags: ["backend", "python", "hybrid", "nigeria"] },
  { id: "sample-grant", title: "Open-source cryptography grant", location: "Worldwide", kind: "grant", tags: ["grant", "cryptography", "worldwide"] },
  { id: "sample-hackathon", title: "Blockchain developer hackathon", location: "Online", kind: "hackathon", tags: ["hackathon", "blockchain", "remote"] },
];

/** The subset of Storage the preview uses. Kept narrow so a throwing shim still type-checks. */
export interface PreviewStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createBrowserApi(storage?: PreviewStorage): YggdrasilApi {
  let interests = [...defaults];
  try {
    const saved = JSON.parse(storage?.getItem(storageKey) ?? "null");
    if (Array.isArray(saved) && saved.every((item) => typeof item === "string")) interests = saved;
  } catch { /* Use defaults if browser storage is unavailable or malformed. */ }

  const listeners = new Set<() => void>();
  const posted = new Date().toISOString();
  const unavailable = async (): Promise<never> => {
    throw new Error("Live source collection is available in the desktop app.");
  };

  return {
    jobs: async (tab: Tab): Promise<Job[]> => samples.filter((job) => tab === "grants" ? job.kind !== "job"
      : job.kind === "job" && (tab === "nigeria" ? job.tags.includes("nigeria") || job.tags.includes("africa-ok") : job.tags.includes("remote")))
      .map((job) => ({ ...job, tags: [...job.tags], sample: true, org: "Sample organization", source: "Sample data", url: "",
        posted, first_seen: 0, last_seen: 0, active: true, score: interests.filter((term) => [job.title, ...job.tags].join(" ").toLowerCase().includes(term)).length })),

    getSettings: async (): Promise<PublicSettings> => ({ interests: [...interests], xaiKeySet: false,
      xQueries: [], xHandles: [], xCallsPerDay: 0, refreshHours: 3, xModel: "", xaiKey: undefined }),

    setSettings: async (settings: Partial<Settings> & { xaiKey?: string }): Promise<boolean> => {
      if (settings.xaiKey) throw new Error("API keys belong in the desktop app, not the web preview.");
      if (!Array.isArray(settings.interests) || settings.interests.some((item) => typeof item !== "string"))
        throw new Error("Interests must be a list of words.");
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
    onUpdated: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}