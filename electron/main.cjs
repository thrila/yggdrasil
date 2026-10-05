const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, safeStorage } = require("electron");
const path = require("path"), fs = require("fs");
const { createStore, runAll } = require("./collect.cjs");
const { inTab } = require('./opportunities.cjs');
const { sourceFromUrl, units } = require('./source-config.cjs');

const DEFAULTS = {
  interests: ["rust", "python", "typescript", "backend", "fullstack", "systems", "zk", "cryptography", "compilers", "low-latency", "ml-infra", "blockchain"],
  refreshHours: 3, xaiKey: "", xModel: "grok-4-1-fast-non-reasoning", xCallsPerDay: 20, xHandles: [],
  xQueries: ["hiring Rust engineer remote", "hiring zero-knowledge engineer", "tech jobs Nigeria hiring"],
};
let win, store, running = false, tray;
const ICON = path.join(__dirname, "icon.png");
const dir = (f) => path.join(app.getPath("userData"), f);
const readJ = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const settings = () => ({ ...DEFAULTS, ...readJ(dir("settings.json"), {}) });
// sources.json ships with the repo (small demo list). sources.private.json is gitignored and merged on top.
// Anything added in Settings lands in user_sources.json in userData, which is outside the repo.
const sources = () => ["sources.json", "sources.private.json"].flatMap((f) => readJ(path.join(__dirname, f), []))
  .concat(readJ(dir("user_sources.json"), []));
const xKey = () => {
  const k = settings().xaiKey || process.env.XAI_API_KEY || "";
  return k.startsWith("enc:") ? safeStorage.decryptString(Buffer.from(k.slice(4), "base64")) : k.replace(/^raw:/, "");
};

async function refresh() {
  if (running) return;
  running = true;
  try { await runAll(store, { ...settings(), xaiKey: xKey() }, sources()); }
  finally { running = false; win?.webContents.send("updated"); }
}

function jobs(tab) {
  const interests = new Set(settings().interests);
  return Object.values(store.d.jobs).filter((j) => inTab(j, tab))
    .map((j) => {
      const words = new Set(j.title.toLowerCase().match(/[a-z+#]+/g) || []);
      return { ...j, score: j.tags.filter((t) => interests.has(t)).length + [...words].filter((w) => interests.has(w) && !j.tags.includes(w)).length };
    }).sort((a, b) => b.score - a.score || b.first_seen - a.first_seen).slice(0, 600);
}

function addSource(url) {
  const s = sourceFromUrl(url);
  if (units(sources().concat(s)).length === units(sources()).length) return s;
  fs.writeFileSync(dir("user_sources.json"), JSON.stringify(readJ(dir("user_sources.json"), []).concat(s), null, 1));
  refresh();
  return s;
}

ipcMain.handle("jobs", (e, tab) => jobs(tab));
ipcMain.handle("settings:get", () => ({ ...settings(), xaiKey: undefined, xaiKeySet: !!xKey() }));
ipcMain.handle("settings:set", (e, body) => {
  const { xaiKey, ...rest } = body;
  const next = { ...settings(), ...rest };
  if (xaiKey) next.xaiKey = safeStorage.isEncryptionAvailable() ? "enc:" + safeStorage.encryptString(xaiKey).toString("base64") : "raw:" + xaiKey;
  fs.writeFileSync(dir("settings.json"), JSON.stringify(next));
  return true;
});
ipcMain.handle("sources:add", (e, url) => addSource(url));
ipcMain.handle("health", () => Object.entries(store.d.runs).map(([source, r]) => ({ source, ...r })).sort((a, b) => a.ok - b.ok));
ipcMain.handle("refresh", () => { refresh(); return true; });

function showWin() {
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
    { label: "Refresh Now", click: () => refresh() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]));
  tray.on("click", () => (win.isVisible() && !win.isMinimized() ? win.hide() : showWin()));

  win.on("close", (e) => { if (!app.isQuitting) { e.preventDefault(); win.hide(); } });
  win.on("closed", () => { win = null; });

  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  if (process.argv.includes("--dev")) win.loadURL("http://localhost:5173");
  else win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  refresh();
  setInterval(refresh, Math.max(1, settings().refreshHours) * 3600e3);
});
app.on("before-quit", () => { app.isQuitting = true; });
app.on("window-all-closed", () => app.quit());
