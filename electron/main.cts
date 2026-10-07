import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, safeStorage, Notification } from "electron";
import path from "node:path";
import fs from "node:fs";
import { createStore, runAll } from "./collect.cjs";
import { inTab } from "./opportunities.cjs";
import { sourceFromUrl, units } from "./source-config.cjs";
import { canNotify, newSince, notificationBody, type NotifyRules } from "./notify.cjs";
import { REFRESH_MINUTE_DEFAULT, clampRefreshMinutes, refreshIntervalMs } from "../shared/types.js";
import type { Job, JobStore, PublicSettings, SeenPatch, Settings, Source } from "../shared/types";

// Electron has no close-to-tray flag, so we keep our own.
let quitting = false;

const DEFAULTS: Settings = {
  interests: ["rust", "python", "typescript", "backend", "fullstack", "systems", "zk", "cryptography", "compilers", "low-latency", "ml-infra", "blockchain"],
  // Notifications are opt-in. Nothing is shown until the user turns them on in Settings.
  notifications: false,
  refreshHours: 3, refreshMinutes: REFRESH_MINUTE_DEFAULT, quietFrom: 22, quietTo: 8,
  xaiKey: "", xModel: "grok-4-1-fast-non-reasoning", xCallsPerDay: 20, xHandles: [],
  xQueries: ["hiring Rust engineer remote", "hiring zero-knowledge engineer", "tech jobs Nigeria hiring"],
};

let win: BrowserWindow | null = null;
let store: JobStore;
let running = false;
let tray: Tray | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let nextPollAt = 0;

// Resolved next to the compiled main process, so the asset copy step must land it there.
const ICON = path.join(__dirname, "icon.png");
const dir = (f: string) => path.join(app.getPath("userData"), f);

const readJ = <T,>(f: string, d: T): T => { try { return JSON.parse(fs.readFileSync(f, "utf8")) as T; } catch { return d; } };

const settings = (): Settings => {
  const saved = readJ<Partial<Settings>>(dir("settings.json"), {});
  // A settings file written before the interval became minute-based carries refreshHours only.
  const merged: Settings = { ...DEFAULTS, ...saved, refreshMinutes: saved.refreshMinutes ?? DEFAULTS.refreshMinutes };
  if (!saved.refreshMinutes && saved.refreshHours) merged.refreshMinutes = clampRefreshMinutes(saved.refreshHours * 60);
  return merged;
};

// sources.json ships with the repo (small demo list). sources.private.json is gitignored and merged on top.
// Anything added in Settings lands in user_sources.json in userData, which is outside the repo.
const sources = (): Source[] => {
  const files = ["sources.json", "sources.private.json"].map((f) => readJ<Source[]>(path.join(__dirname, f), []));
  const user = readJ<Source[]>(dir("user_sources.json"), []);
  // An installed build does not carry the private list, so a local copy in userData stands in.
  const priv = readJ<Source[]>(dir("sources.private.json"), []);
  return units([...files.flat(), ...user, ...priv]);
};

const xKey = (): string => {
  const k = settings().xaiKey || process.env.XAI_API_KEY || "";
  return k.startsWith("enc:") ? safeStorage.decryptString(Buffer.from(k.slice(4), "base64")) : k.replace(/^raw:/, "");
};

/** Why the OS would refuse a notification, so Settings can say something useful. */
const notifyUnavailable = (): string => {
  if (!Notification.isSupported()) return "This system does not support notifications.";
  if (process.platform === "linux") return "On Linux the notification server must be running for alerts to appear.";
  return "";
};

const notifyRules = (): NotifyRules => ({
  enabled: settings().notifications,
  quietFrom: settings().quietFrom,
  quietTo: settings().quietTo,
  minNew: 1,
  windowFocused: Boolean(win?.isFocused()),
  unsupported: !!notifyUnavailable(),
});

function notify(items: Job[]): void {
  if (!canNotify(notifyRules(), new Date()) || !items.length) return;
  const { title, body } = notificationBody(items);
  const n = new Notification({ title, body, icon: ICON, silent: false });
  n.on("click", () => showWin());
  n.show();
}

async function refresh(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const before = Date.now();
    await runAll(store, { ...settings(), xaiKey: xKey() }, sources());
    // Only listings first seen during this run are news. Anything older has been offered before.
    notify(newSince(Object.values(store.d.jobs), before));
  } finally { running = false; win?.webContents.send("updated"); }
}

function jobs(tab: string): Job[] {
  const interests = new Set(settings().interests);
  return Object.values(store.d.jobs).filter((j) => inTab(j, tab))
    .map((j) => {
      const words = new Set(j.title.toLowerCase().match(/[a-z+#]+/g) || []);
      return { ...j, score: j.tags.filter((t) => interests.has(t)).length
        + [...words].filter((w) => interests.has(w) && !j.tags.includes(w)).length };
    })
    .sort((a, b) => b.score - a.score || b.first_seen - a.first_seen)
    .slice(0, 600);
}

function addSource(url: string): Source {
  const s = sourceFromUrl(url);
  // A board or feed already covered needs no new entry, and its health must not be split.
  const before = sources().length;
  if (units(sources().concat(s)).length === before) return s;
  fs.writeFileSync(dir("user_sources.json"),
    JSON.stringify(readJ<Source[]>(dir("user_sources.json"), []).concat(s), null, 1));
  refresh();
  return s;
}

ipcMain.handle("jobs", (_e, tab: string) => jobs(tab));
ipcMain.handle("settings:get", (): PublicSettings => {
  const { xaiKey: _omit, ...rest } = { ...settings(), xaiKey: undefined };
  return { ...rest, xaiKeySet: !!xKey() };
});
ipcMain.handle("settings:set", (_e, body: Partial<Settings> & { xaiKey?: string }) => {
  const { xaiKey, ...rest } = body;
  const next: Settings = { ...settings(), ...rest };
  if (xaiKey) next.xaiKey = safeStorage.isEncryptionAvailable()
    ? "enc:" + safeStorage.encryptString(xaiKey).toString("base64") : "raw:" + xaiKey;
  if (rest.refreshMinutes !== undefined) next.refreshMinutes = clampRefreshMinutes(rest.refreshMinutes);
  // Quiet hours wrap past midnight when quietFrom is later than quietTo.
  const hour = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(23, Math.max(0, Math.round(n))) : fallback;
  };
  next.quietFrom = hour(rest.quietFrom, settings().quietFrom);
  next.quietTo = hour(rest.quietTo, settings().quietTo);
  next.notifications = rest.notifications !== undefined ? !!rest.notifications : settings().notifications;
  fs.writeFileSync(dir("settings.json"), JSON.stringify(next));
  // The search interval is user-settable, so apply a change immediately rather than at restart.
  if (rest.refreshMinutes !== undefined) scheduleRefresh();
  return true;
});

/** "Next search in 2h 55m", for the tray menu and the Settings panel. */
function nextPollLabel(now = Date.now()): string {
  if (!nextPollAt) return "Next search: starting…";
  let mins = Math.max(0, Math.round((nextPollAt - now) / 60e3));
  const h = Math.floor(mins / 60);
  mins -= h * 60;
  const left = h ? `${h}h ${mins}m` : `${mins}m`;
  return `Next search in ${left}`;
}

/**
 * Restarts the poll timer. Cleared and recreated so a new interval takes effect at once.
 * setInterval keeps a fixed period rather than counting from the end of a slow run, so
 * nextPollAt advances by exactly one period per tick to keep the countdown honest.
 */
function scheduleRefresh(): void {
  if (pollTimer) clearInterval(pollTimer);
  const every = refreshIntervalMs(settings());
  pollTimer = setInterval(() => {
    nextPollAt += every;
    // A long run can push past this; jump to the next future tick instead of showing a past time.
    if (nextPollAt <= Date.now()) nextPollAt = Date.now() + every;
    refresh();
    tray?.setContextMenu(Menu.buildFromTemplate(buildTrayMenu()));
    tray?.setToolTip(`Yggdrasil · ${nextPollLabel()}`);
  }, every);
  nextPollAt = Date.now() + every;
  tray?.setContextMenu(Menu.buildFromTemplate(buildTrayMenu()));
  tray?.setToolTip(`Yggdrasil · ${nextPollLabel()}`);
}

function buildTrayMenu(): Electron.MenuItemConstructorOptions[] {
  return [
    { label: "Open Yggdrasil", click: showWin },
    { label: "Refresh Now", click: () => { refresh(); } },
    { label: nextPollLabel(), enabled: false },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ];
}

ipcMain.handle("nextPoll", () => ({ at: nextPollAt, minutes: settings().refreshMinutes }));
ipcMain.handle("sources:add", (_e, url: string) => addSource(url));
// Reader state, so it is written straight to the store rather than passed through the collectors.
ipcMain.handle("markSeen", (_e, ids: string[], patch: SeenPatch) => {
  const set = Array.isArray(ids) ? new Set(ids) : new Set<string>();
  for (const id of set) {
    const j = store.d.jobs[id];
    if (!j) continue;
    j.seen = !!patch?.seen;
    j.seen_ts = j.seen ? patch?.seen_ts ?? Date.now() : undefined;
  }
  store.save();
  win?.webContents.send("updated");
  return true;
});
ipcMain.handle("clearSeen", () => {
  for (const j of Object.values(store.d.jobs)) { j.seen = false; j.seen_ts = undefined; }
  store.save();
  win?.webContents.send("updated");
  return true;
});
ipcMain.handle("health", () => Object.values(store.d.runs).sort((a, b) => Number(a.ok) - Number(b.ok)));
ipcMain.handle("refresh", () => { refresh(); return true; });
ipcMain.handle("notify:state", () => ({ supported: !notifyUnavailable(), reason: notifyUnavailable() }));
ipcMain.handle("notify:test", () => {
  if (!Notification.isSupported()) throw new Error(notifyUnavailable() || "Notifications are unavailable.");
  const n = new Notification({ title: "Yggdrasil", body: "Notifications are working.", icon: ICON });
  n.on("click", () => showWin());
  n.show();
  return true;
});

function showWin(): void {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

app.whenReady().then(() => {
  if (process.platform === "win32") app.setAppUserModelId("dev.local.yggdrasil");
  Menu.setApplicationMenu(null);
  store = createStore(dir("jobs.json"));
  win = new BrowserWindow({ width: 1100, height: 800, backgroundColor: "#F5F5F7", icon: nativeImage.createFromPath(ICON),
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false } });

  tray = new Tray(nativeImage.createFromPath(ICON).resize({ width: 16, height: 16, quality: "best" }));
  tray.setContextMenu(Menu.buildFromTemplate(buildTrayMenu()));
  tray.on("click", () => (win!.isVisible() && !win!.isMinimized() ? win!.hide() : showWin()));

  win.on("close", (e) => { if (!quitting) { e.preventDefault(); win!.hide(); } });
  win.on("closed", () => { win = null; });

  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  if (process.argv.includes("--dev")) win.loadURL("http://localhost:5173");
  else win.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"));
  refresh();
  scheduleRefresh();
});
app.on("before-quit", () => { quitting = true; });
app.on("window-all-closed", () => app.quit());