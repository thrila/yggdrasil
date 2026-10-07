// Synthetic opportunities for the static preview. Live collection uses Electron.
import type { Job, PublicSettings, SeenPatch, Settings, Tab, YggdrasilApi } from "../shared/types";

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

/**
 * The browser can show notifications, so report honestly rather than claiming the desktop app
 * is required. There is no collector behind the preview, so only a manual test fires one here.
 */
export function browserNotifyState(): { supported: boolean; reason: string } {
  if (typeof Notification === "undefined") return { supported: false, reason: "This browser has no notification support." };
  if (typeof window !== "undefined" && !window.isSecureContext)
    return { supported: false, reason: "Notifications need HTTPS or localhost." };
  if (Notification.permission === "denied")
    return { supported: false, reason: "Notifications are blocked for this site in your browser settings." };
  if (Notification.permission === "default")
    return { supported: true, reason: "Permission not granted yet. Use Test notifications to ask." };
  return { supported: true, reason: "Ready." };
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

  // The preview has no store, so seen state lives in browser storage to demonstrate the UI.
  const seenKey = "yggdrasil.preview.seen";
  let seen: Record<string, number> = {};
  try { seen = JSON.parse(storage?.getItem(seenKey) ?? "{}") as Record<string, number>; } catch { seen = {}; }
  const persistSeen = () => storage?.setItem(seenKey, JSON.stringify(seen));

  return {
    jobs: async (tab: Tab): Promise<Job[]> => samples.filter((job) => tab === "grants" ? job.kind !== "job"
      : job.kind === "job" && (tab === "nigeria" ? job.tags.includes("nigeria") || job.tags.includes("africa-ok") : job.tags.includes("remote")))
      .map((job) => ({ ...job, tags: [...job.tags], sample: true, org: "Sample organization", source: "Sample data", url: "",
        posted, first_seen: 0, last_seen: 0, active: true,
        seen: job.id in seen, seen_ts: seen[job.id],
        score: interests.filter((term) => [job.title, ...job.tags].join(" ").toLowerCase().includes(term)).length })),

    getSettings: async (): Promise<PublicSettings> => ({ interests: [...interests], xaiKeySet: false,
      xQueries: [], xHandles: [], xCallsPerDay: 0, refreshHours: 3, refreshMinutes: 180,
      notifications: false, quietFrom: 22, quietTo: 8, xModel: "", xaiKey: undefined }),

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

    notifyState: async () => browserNotifyState(),
    testNotification: async (): Promise<boolean> => {
      const state = browserNotifyState();
      if (!state.supported) throw new Error(state.reason);
      // Permission must be requested from a user gesture, which is why this button exists.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");
      new Notification("Yggdrasil", {
        body: "Notifications are working. The preview runs no collector, so live alerts need the desktop app.",
      });
      return true;
    },
    markSeen: async (ids: string[], patch: SeenPatch): Promise<boolean> => {
      for (const id of ids || []) {
        if (patch?.seen) seen[id] = patch.seen_ts ?? Date.now();
        else delete seen[id];
      }
      persistSeen();
      listeners.forEach((listener) => listener());
      return true;
    },
    clearSeen: async (): Promise<boolean> => {
      seen = {};
      persistSeen();
      listeners.forEach((listener) => listener());
      return true;
    },
    onUpdated: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}