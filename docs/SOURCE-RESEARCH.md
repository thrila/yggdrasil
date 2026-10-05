# Source Research Prompt

Paste this into a research agent (or hand it to me) to find and verify new sources for
the aggregator. It encodes the adapter schema in `electron/collect.cts` and the failure
modes we hit during the first verification sweep, so we don't repeat them.

---

## The prompt

You are researching new data sources for Yggdrasil, a personal job/grant/hackathon
aggregator. It runs as an Electron app; collectors live in `electron/collect.cts` and
read source definitions from a JSON array. Your job is to **find candidates and prove each
one returns real, fresh items** — then emit a validated JSON block ready to merge into
`electron/sources.private.json`.

### Source types you may emit

Exactly these five shapes. Do not invent fields; the adapter ignores unknown keys.

```json
{ "name": "Remotive", "type": "remotive", "category": "software-dev" }
{ "name": "RemoteOK", "type": "remoteok" }
{ "name": "Company boards", "type": "ats", "boards": ["greenhouse:gitlab", "lever:palantir"] }
{ "name": "Some Blog", "type": "rss", "url": "https://example.com/feed.xml", "force_tags": ["nigeria"] }
{ "name": "X leads", "type": "xsearch", "queries": ["hiring Rust engineer remote"] }
```

Field notes:

- `name` — human label. Becomes the job's `source` and the health key in Settings.
  **Must be unique across all files.** Duplicates silently overwrite each other's health
  row.
- `category` — Remotive only, e.g. `software-dev`, `data`, `devops`.
- `boards` — `greenhouse:<slug>`, `lever:<slug>`, `ashby:<slug>`. The slug is the ATS
  board token, not the company name.
- `force_tags` — pinned onto every item from this source. Use `nigeria` or `africa-ok`
  to route a feed into the Nigeria tab; `grant` to route it into Grants.
- `include` — case-insensitive title substrings; non-matching items are dropped. Useful
  for company blogs that mix non-job posts.
- `xsearch` reads `queries` and `handles` from **Settings**, not from the source entry.
  Requires an xAI key. Never mark these `ok` — the adapter reports `skipped` without a key.

### Hard constraints — reject these without testing

The user's rules for this project: no login walls, no scraping that violates a site's terms,
and no source that requires a paid or personal API key (except the user's own xAI key).

Known-bad, already tested — **do not re-test, just exclude**:

| Source | Result |
| --- | --- |
| LinkedIn | No RSS. `/jobs/rss`, `/jobs/feed`, `jobs-guests` API all 4xx. `/jobs/search` returns HTML, not feed data. Requires login. Excluded. |
| Indeed | No public feed. Excluded. |
| Glassdoor | No public feed, ToS-restricted. Excluded. |
| `devgrantsdaily.com/rss.xml` | 404. Feed is gone. |
| `grants.nih.gov` | 403 to non-browser clients. |
| `nsf.gov` award RSS | DNS does not resolve. |
| `grants.gov` search API | HTTP 200 but **zero items** — looks healthy, returns nothing. Always check item count, not status code. |

### Verification procedure

For every candidate, run all of this. A candidate that fails any step is not reported.

1. **Fetch it for real.** Use Node 18+ `fetch`, matching the app: a descriptive
   `User-Agent`, 30s timeout. Do not trust a browser UA or assume a status code is enough.
2. **Count items.** For RSS, parse with `fast-xml-parser` using the same options as
   `collect.cts` (`XML_OPTS`). Zero items = reject, even on HTTP 200.
3. **Check freshness.** Report the newest `pubDate`/`updated`. Anything whose newest item
   is older than ~30 days is dead — reject and say so.
4. **Sanity-check content.** A handful of real titles, not just a count. If titles are
   navigation junk, error pages, or the site name, reject.
5. **Note rate limits and required headers.** If a feed needs a referer or a specific UA,
   record it — the adapter does not send custom headers.
6. **For ATS slugs**, verify via the board's public API directly and confirm the company
   matches the slug. A wrong slug usually 404s, but some resolve to the wrong company.

Record the failure reason for every rejection. A dead source with a known reason is worth
more than a silent omission.

### Where to look

Prioritize sources that are **unbiased aggregators and official boards**, not
company-specific blogs, which duplicate ATS feeds:

- ATS boards for remote-first and Africa/Nigeria-leaning companies.
- Public RSS/Atom from: government and university job portals, grant and fellowship
  bodies, hackathon and build-platform listings, tech-media job sections, regional
  tech-news outlets (especially Nigerian and pan-African).
- Aggregators with real public APIs: Remotive, RemoteOK, Remote.com, Arbeitnow,
  Jobicy, The Muse, Working Nomads, Himalayas, Jobgether.
- Grant and fellowship bodies with open calls. Check whether the listing is a machine-readable
  feed or an HTML index — HTML-only sources cannot be added without a new adapter, so say so.
- Conference and community job boards (Rust, Python, JS, systems, security, crypto).

### Output format

Two blocks, nothing else.

**1. Verified, ready to merge** — a JSON array using only the shapes above. Ids, hosts and
tags must be correct. This gets written straight into `electron/sources.private.json`.

**2. Rejected** — a markdown table: candidate, URL, failure reason, and whether it is
permanently dead or worth retrying later. Include anything promising that did not pass
verification, so the next sweep does not waste time on it.

Do not modify any files. Emit the blocks; I will merge them.

---

## Notes for the next run

- **`sources.private.json` is gitignored.** Verified sources go there, never into the
  committed `sources.json`. Only add to the committed demo list if a source is broadly
  useful and known-good for everyone.
- **Health rows key on `name`.** Before adding, check the name is not already used across
  `sources.json`, `sources.private.json`, and `user_sources.json` in the app's `userData`.
- **Collection is sequential.** Each unit has a 30s timeout, so a dead feed costs a full
  30s per refresh cycle. Reject aggressively — a dead source slows every refresh for
  everyone.
- **Stale listings persist.** `active: false` is only applied to jobs from a source that
  returned items successfully (`collect.cts`). If a feed dies outright, its old listings
  stay `active: true` forever. Worth a cleanup pass.
- **`store.d.jobs[id]` keys on a SHA-1 of the URL.** The same job across two feeds stays
  as two entries, and whichever source writes last sets `source` and `tags`. Expect
  duplicates when a company is on both an ATS board and a blog feed.