# Yggdrasil

A personal job, grant and hackathon dashboard. Electron shell, React + Vite UI, collectors run in the main process.
Needs Node 18+.

- `npm install`
- `npm run dev`: UI in the browser with demo data (no collectors).
- `npm run electron:dev`: the real app (React UI + collectors in Electron's main process).
- `npm run build`: production renderer into `dist/`.
- `npm run dist`: builds installers into `release/` with electron-builder.

## Sources

Collectors read three files, merged in order:

1. `electron/sources.json` — committed, small demo list so a fresh clone works.
2. `electron/sources.private.json` — **gitignored**. Your curated boards and feeds go here.
3. `user_sources.json` in Electron's `userData` — anything you paste into Settings.

Copy the demo file to start your own list:

```sh
cp electron/sources.json electron/sources.private.json
```

Source types: `remotive`, `remoteok`, `ats` (`greenhouse:`/`lever:`/`ashby:` board slugs), `rss`, `xsearch`.
Add `"force_tags": ["nigeria"]` to pin tags onto everything a feed returns.

## Tabs

- **Worldwide** — remote or relocation roles.
- **Nigeria** — Nigeria-based or open-to-Africa roles.
- **Grants** — funding opportunities and hackathons.
- **Settings** — interests, X search, sources, and per-source health.

Job list is sorted newest first and searchable (`/` or `Cmd/Ctrl+K` focuses the search box).

## Where things live

- `electron/collect.cjs` — source adapters and the XML/RSS parsing.
- `electron/tags.cjs` — all tagging rules. Edit these to tune tags.
- `electron/main.cjs` — windows, tray, IPC, and the collectors' entry point.
- `src/App.jsx`, `src/styles.css` — UI.

Data is stored as JSON in Electron's `userData` folder, outside the repo. The xAI key is
encrypted with the OS keychain when available.

## Status

Built and wired against live sources. Not built yet: push notifications, saved searches.