# Cloudflare Workers web preview

Live preview: https://yggdrasil-web.davidopuene8.workers.dev

This deploys the React UI with Workers Static Assets using the `cf` CLI. It shows synthetic jobs, grants and hackathons; the Electron collectors and private database are not deployed. Browser interests remain local to each visitor.

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

`cloudflare.config.ts` defines the `yggdrasil-web` resource and its workers.dev hostname. The build script copies only `dist/` into the CLI's `.cloudflare/output/v0/` Build Output, validates it, and excludes hidden files, symbolic links and source maps. The output is gitignored. It uses pinned Cloudflare Build Output utilities so React's existing Vite build and Electron asset paths remain intact. Use `--prebuilt --mode production` to deploy that artifact; running bare `cf deploy` does not run the preparation script.

The installed `cf` beta does not upload legacy Pages projects through `cf pages deploy`; it directs static deployment to Workers. [Pages Git integration](cloudflare-pages.md) remains an alternative setup, but it is not the deployed resource and no Pages project was created. The current deployment is manual; merging the PR does not automatically redeploy it.

## Deployment record

- First deployment: 2026-10-05, using `cf` 1.0.0-beta.12.
- Worker: `yggdrasil-web`; static assets only, no application bindings or custom domains.
- Version: `f1bf1b27-55c2-4866-8ce9-42c17b69ab9a`.
- Verification: HTTPS homepage and assets match the Vite build; nonexistent assets return 404. All 13 local tests and the deployment dry run passed.

For recovery, rebuild a known-good commit and redeploy with the commands above. Alternatively, restore an earlier version from the Worker's deployment history in the Cloudflare dashboard. This is the first version; there is no earlier deployment to restore yet.

References: [cf project deployment and prebuilt mode](https://developers.cloudflare.com/cf/projects/), [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).
