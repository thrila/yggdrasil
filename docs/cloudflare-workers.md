# Cloudflare Workers opportunity index

Live app: https://yggdrasil-web.davidopuene8.workers.dev

This deploys the React UI and the collected public opportunity index with Workers Static Assets using the `cf` CLI. The browser loads real jobs, grants, hackathons and fellowships from `/data/opportunities.json`; it displays source health, original posting links, required credits and collection time. Browser interests remain local to each visitor. Raw descriptions, private source lists, settings and raw collector data are excluded.

## Build and deploy

Use Node 22.18 or later and the tested CLI version:

```sh
npm install --global cf@1.0.0-beta.12
npm ci
npm test
npm run build:cloudflare
cf deploy --prebuilt --mode production --dry-run
cf auth login
cf deploy --prebuilt --mode production
```

Alternatively authenticate with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in your environment, using a token scoped to the intended account with Workers deployment permissions. Do not put credentials in the repository or in `VITE_*` variables. `npm run deploy:web` builds and deploys in one command once authentication is configured.

`cloudflare.config.ts` defines the `yggdrasil-web` resource and its workers.dev hostname. The build script copies only `dist/` into the CLI's `.cloudflare/output/v0/` Build Output, validates it, and excludes hidden files, symbolic links and source maps. Vite copies the public index alongside the UI assets. The output is gitignored. It uses pinned Cloudflare Build Output utilities so React's existing Vite build and Electron asset paths remain intact. Use `--prebuilt --mode production` to deploy that artifact; running bare `cf deploy` does not run the preparation script.

## Refresh the opportunity index

```sh
npm run web:update
npm run deploy:web
```

The updater collects the committed job and bonus catalogs plus Arbeitnow, with three concurrent requests. It respects the existing Himalayas daily and Jobicy hourly polling intervals, maintains closed ATS postings, and saves the private working database in `.cache/opportunities.json`. It then exports an allowlist of posting metadata to `public/data/opportunities.json`, omitting closed, expired and out-of-scope records. Only entries from the committed public catalog are exported; personal sources and desktop settings are excluded.

The public snapshot is committed to the repository so builds do not depend on an untracked desktop database. Use `npm run web:export` to regenerate it from existing collection data without polling. Browser **Reload Index** reloads the published file, while **View Sources** shows status for all configured sources. Collection is manual; no automatic scheduler or server collector is deployed. The UI shows collection time so the age of the snapshot is visible. Validate availability and deadlines on the original posting page.

The installed `cf` beta does not upload legacy Pages projects through `cf pages deploy`; it directs static deployment to Workers. [Pages Git integration](cloudflare-pages.md) remains an alternative setup, but it is not the deployed resource and no Pages project was created. The current deployment is manual; merging the PR does not automatically redeploy it.

## Deployment record

- First deployment: 2026-10-05, using `cf` 1.0.0-beta.12.
- Worker: `yggdrasil-web`; static assets only, no application bindings or custom domains.
- First preview version: `f1bf1b27-55c2-4866-8ce9-42c17b69ab9a`.
- First version verification: HTTPS homepage and assets match the Vite build; nonexistent assets return 404. All 13 local tests and the deployment dry run passed.
- Indexed web version: `5b58340f-ac7a-4b15-aa42-22e94eb014c2`, deployed 2026-10-05.
- Published collection: 167 healthy sources; 4,449 worldwide roles, 334 Nigeria-eligible roles and 332 grants, hackathons or fellowships. Last collection timestamp: `2026-10-05T09:25:09.294Z`.
- Indexed version verification: all 15 local tests passed; the live JSON matches the exported snapshot. Headless Chromium verified the worldwide/Nigeria/grants views, pagination, all 167 source rows, reload, saved interests and search, with no browser errors.

For recovery, rebuild a known-good commit and redeploy with the commands above. Alternatively, restore an earlier version from the Worker's deployment history in the Cloudflare dashboard. Restoring the first preview version removes the real index from the web app; prefer a known-good indexed version.

References: [cf project deployment and prebuilt mode](https://developers.cloudflare.com/cf/projects/), [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).
