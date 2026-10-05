// Account and authentication come from cf's profile or environment variables.
export default {
  worker: {
    name: "yggdrasil-web",
    compatibilityDate: "2026-10-05",
    workersDev: true,
    previewUrls: false,
    assets: { notFoundHandling: "none" },
  },
};
