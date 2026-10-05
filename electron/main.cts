import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, safeStorage } from "electron";
import path from "node:path";
import fs from "node:fs";
import { createStore, runAll } from "./collect.cjs";
import { inTab } from "./opportunities.cjs";
import { sourceFromUrl, units } from "./source-config.cjs";
import type { Job, JobStore, PublicSettings, Settings, Source } from "../shared/types";

// Electron has no close-to-tray flag, so we keep our own.
let quitting = false;

const DEFAULTS: Settings = {
  interests: ["rust", "python", "typescript", "backend", "fullstack", "systems", "zk", "cryptography", "compilers", "low-latency", "ml-infra", "blockchain"],
  refreshHours: 3, xaiKey: "", xModel: "grok-4-1-fast-non-reasoning", xCallsPerDay: 20, xHandles: [],
  xQueries: ["hiring Rust engineer remote", "hiring zero-knowledge engineer", "tech jobs Nigeria hiring"],
};

let win: BrowserWindow | null = null;
let store: JobStore;
let running = false;
let tray: Tray | null = null;

// Resolved next to the compiled main process, so the asset copy step must land it there.
const ICON = path.join(__dirname, "icon.png");
const dir = (f: string) => path.join(app.getPath("userData"), f);

const readJ = <T,>(f: string, d: T): T => { try { return JSON.parse(fs.readFileSync(f, "utf8")) as T; } catch { return d; } };

const settings = (): Settings => ({ ...DEFAULTS, ...readJ<Partial<Settings>>(dir("settings.json"), {}) });

// sources.json ships with the repo (small demo list). sources.private.json is gitignored and merged on top.
// Anything added in Settings lands in user_sources.json in userData, which is outside the repo.
const sources = (): Source[] => {
  const files = ["sources.json", "sources.private.json"].map((f) => readJ<Source[]>(path.join(__dirname, f), []));
  const user = readJ<Source[]>(dir("user_sources.json"), []);
  return units([...files.flat(), ...user]);
};

const xKey = (): string => {
  const k = settings().xaiKey || process.env.XAI_API_KEY || "";
  return k.startsWith("enc:") ? safeStorage.decryptString(Buffer.from(k.slice(4), "base64")) : k.replace(/^raw:/, "");
};

async function refresh(): Promise<void> {
  if (running) return;
  running = true;
  try { await runAll(store, { ...settings(), xaiKey: xKey() }, sources()); }
  finally { running = false; win?.webContents.send("updated"); }
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
  fs.writeFileSync(dir("settings.json"), JSON.stringify(next));
  return true;
});
ipcMain.handle("sources:add", (_e, url: string) => addSource(url));
ipcMain.handle("health", () => Object.values(store.d.runs).sort((a, b) => Number(a.ok) - Number(b.ok)));
ipcMain.handle("refresh", () => { refresh(); return true; });

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
  tray.setToolTip("Yggdrasil");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Open Yggdrasil", click: showWin },
    { label: "Refresh Now", click: () => { refresh(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]));
  tray.on("click", () => (win!.isVisible() && !win!.isMinimized() ? win!.hide() : showWin()));

  win.on("close", (e) => { if (!quitting) { e.preventDefault(); win!.hide(); } });
  win.on("closed", () => { win = null; });

  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  if (process.argv.includes("--dev")) win.loadURL("http://localhost:5173");
  else win.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"));
  refresh();
  setInterval(() => { refresh(); }, Math.max(1, settings().refreshHours) * 3600e3);
});
app.on("before-quit", () => { quitting = true; });
app.on("window-all-closed", () => app.quit());