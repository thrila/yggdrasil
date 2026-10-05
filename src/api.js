import { createBrowserApi } from "./browser-api.js";

export const isDesktop = Boolean(window.api);
let storage;
try { storage = window.localStorage; } catch { /* Preview can run without persistent storage. */ }
export const api = window.api ?? createBrowserApi(storage);
