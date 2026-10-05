// In Electron, window.api comes from electron/preload.cts. In a plain browser (npm run dev)
// or the Cloudflare Pages preview, synthetic data is used so the UI still runs.
import { createBrowserApi } from "./browser-api";
import type { YggdrasilApi } from "../shared/types";

export const isDesktop = Boolean(window.api);

let storage;
try { storage = window.localStorage; } catch { /* Preview can run without persistent storage. */ }

export const api: YggdrasilApi = window.api ?? createBrowserApi(storage);