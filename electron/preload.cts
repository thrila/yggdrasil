import { contextBridge, ipcRenderer } from "electron";
import type { YggdrasilApi } from "../shared/types";

const call = <A, R>(channel: string) => (arg?: A): Promise<R> => ipcRenderer.invoke(channel, arg);

const api: YggdrasilApi = {
  jobs: call("jobs"),
  getSettings: call("settings:get"),
  setSettings: call("settings:set"),
  addSource: call("sources:add"),
  health: call("health"),
  refresh: call("refresh"),
  notifyState: call("notify:state"),
  testNotification: call("notify:test"),
  nextPoll: call("nextPoll"),
  onUpdated: (cb) => {
    const h = () => cb();
    ipcRenderer.on("updated", h);
    return () => { ipcRenderer.removeListener("updated", h); };
  },
};

contextBridge.exposeInMainWorld("api", api);