/// <reference types="vite/client" />
import type { YggdrasilApi } from "../shared/types";

declare global {
  interface Window {
    /** Present only when running inside Electron; see electron/preload.cts. */
    api?: YggdrasilApi;
  }
}

export {};