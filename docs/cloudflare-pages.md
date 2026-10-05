# Cloudflare Pages web preview

The current live deployment uses [Workers Static Assets through `cf`](cloudflare-workers.md). This document describes the alternative Pages Git integration setup.

The React UI builds as a static Vite app. In a browser it displays **synthetic sample opportunities**, including grants and hackathons. Search, tags, themes and interest preferences work; interests are saved in that browser. Live collection, source management and X search run in Electron and need a separate backend before they can work on the web.

## Build locally

```sh
npm ci
npm test
npm run build:web
npm run preview:web
```

Open the local address printed by Vite. `dist/` is the complete static artifact; it contains no collector database, source research or desktop API keys.

## Configure Pages Git integration

In Cloudflare **Workers & Pages**, create a Pages application, connect the GitHub repository, and configure:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | React (Vite) |
| Root directory | Repository root |
| Build command | `npm run build:web` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=22` |
| Environment variable | `ELECTRON_SKIP_BINARY_DOWNLOAD=1` |

Apply both variables to production and preview environments. Pages installs npm dependencies from the lockfile; the Electron variable skips the unused desktop binary during that install. Enable preview deployments for feature branches if wanted. The repository's GitHub Actions workflow independently tests and builds the same web artifact.

Connecting the repository and creating the Pages application publishes a website. This change prepares the build and instructions only; it does not create a Cloudflare project or deployment. No Cloudflare token is needed for local builds or GitHub checks. Never put xAI keys into `VITE_*` variables: those are embedded in public browser bundles.

The project uses relative asset paths for Electron and hash navigation for its tabs, which also work on Pages. For manual Cloudflare operations, use the `cf` CLI under the repository instructions; this project has no Wrangler configuration.

Official references: [Vite deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).
