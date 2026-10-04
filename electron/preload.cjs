const { contextBridge, ipcRenderer } = require("electron");
const call = (c) => (a) => ipcRenderer.invoke(c, a);
contextBridge.exposeInMainWorld("api", {
  jobs: call("jobs"), getSettings: call("settings:get"), setSettings: call("settings:set"),
  addSource: call("sources:add"), health: call("health"), refresh: call("refresh"),
  onUpdated: (cb) => { const h = () => cb(); ipcRenderer.on("updated", h); return () => ipcRenderer.removeListener("updated", h); },
});
