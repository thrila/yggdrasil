# Yggdrasil

A personal job, grant and hackathon dashboard. Electron shell, React + Vite UI, collectors run in the main process.
Needs Node 18+.

- `npm ci`
- `npm run sources:install`: install the verified job, grants and hackathon catalog into your local sources override.
- `npm run collect`: index sources without requiring Electron or a display; writes `.cache/opportunities.json`.
- `npm test`: verify feed parsing, classification, geography and listing closure behavior.
- `npm run dev`: UI in the browser with demo data (no collectors).
- `npm run electron:dev`: the real app (React UI + collectors in Electron's main process).
- `npm run build`: production renderer into `dist/`.
- `npm run dist`: builds installers into `release/` with electron-builder.

## Sources

Collectors read three files, merged in order:

1. `electron/sources.json` — committed, small demo list so a fresh clone works.
2. `electron/sources.private.json` — **gitignored**. Your curated boards and feeds go here.
3. `user_sources.json` in Electron's `userData` — anything you paste into Settings.

Install the curated catalog:

```sh
npm run sources:install
```

Source types: `remotive`, `remoteok`, `ats` (`greenhouse:`/`lever:`/`ashby:` board slugs), `rss`, `arbeitnow`, `himalayas`, `jobicy`, `xsearch`.
Add `"force_tags": ["nigeria"]` to pin tags onto everything a feed returns.

[SOURCE_REPORT.md](SOURCE_REPORT.md) contains the full five-section research report, direct URLs, source counts, reuse restrictions and failed checks. The importable files are `research/sources.jobs.json` and `research/sources.bonus.json`. The separate `research/sources.adapters.json` config contains the three implemented JSON adapters. Installation chooses RSS for Himalayas and Jobicy and enables Arbeitnow, so it does not duplicate those publishers.

Every selected source was opened and its payload checked on 2026-10-05. `research/verification.json` retains status codes, timestamps, sampled titles/locations and response hashes. These counts describe the current API snapshot or feed window, before title filtering; RSS publishers can retain expired jobs. A feed being nonempty does not prove that every role is available from Nigeria or that a grant application is still open.

To refresh the evidence and rebuild the catalog:

```sh
npm run sources:verify
python3 scripts/audit-eligibility.py
npm run sources:catalog
```

The builder rejects selected sources that fail validation. Review `research/selection.json` if a source closes or stops responding. Raw downloaded bodies are cached locally under `.cache/source-verification/` and excluded from Git.

Himalayas is polled at most daily and Jobicy at most hourly. Their required source credits are displayed on job cards, alongside original posting links. Employer content and feeds without a clear reuse licence are labelled in the report; a public endpoint alone does not establish permission for redistribution.

## Cloudflare web preview

Run `npm run build:web` to produce the static React app in `dist/`, then `npm run preview:web` to view it locally. [Cloudflare Pages setup](docs/cloudflare-pages.md) documents the Git integration build settings. GitHub Actions runs the tests and web build on pushes and pull requests.

The browser preview uses clearly labelled synthetic jobs, grants and hackathons. It supports searching and saving interests locally. Live source collection and X search require the desktop app; publishing this preview does not deploy the Electron collectors.

## Views

- **Worldwide** — remote or relocation roles.
- **Nigeria** — Nigeria-based roles, plus remote roles explicitly worldwide or open to Africa. EMEA/timezone labels alone do not establish eligibility.
- **Grants** — grants, hackathons and fellowships. Funding-feed announcements older than 180 days are skipped; check deadlines on the original page.
- **Settings** — interests, X search, sources, and per-source health.

Job list is sorted newest first and searchable (`/` or `Cmd/Ctrl+K` focuses the search box).

## Where things live

- `electron/collect.cjs` — source adapters and the XML/RSS parsing.
- `electron/tags.cjs` — all tagging rules. Edit these to tune tags.
- `electron/main.cjs` — windows, tray, IPC, and the collectors' entry point.
- `src/App.jsx`, `src/styles.css` — UI.

Data is stored as JSON in Electron's `userData` folder, outside the repo. The headless collector uses its own `.cache/opportunities.json` file; it does not replace the desktop database. The xAI key is
encrypted with the OS keychain when available.

## Linux desktop requirements

Electron needs a graphical session and a usable Chromium sandbox. This workspace has no `DISPLAY`, and the installed `chrome-sandbox` helper is not configured for the host's sandbox policy; launching Electron fails here before the application opens. Configure the Linux sandbox through your system administrator or package installation, then run `npm run electron:dev` in your desktop session. The build and headless indexer work in this environment. Sandbox protection is kept enabled by default.

## Status

Built and wired against live sources. Not built yet: push notifications, saved searches.

The existing lockfile's dependency audit reports 17 findings, including a critical finding in the transitive build dependency `tar`. Review the build-tool dependency updates before producing installers.
