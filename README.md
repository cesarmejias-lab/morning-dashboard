# Morning Dashboard

A static morning dashboard with weather, world clocks, Hacker News, Discogs, Todoist tasks, and a Daily Collection Radar recommendation from a CLZ Music collection.

## Run Locally

```bash
npm run dev
```

Open the URL printed by the server, usually:

```text
http://127.0.0.1:4173/
```

The local server only serves the same static files you publish to GitHub Pages.

## Refresh CLZ On Demand

The **Sync CLZ** button uses the same solution locally and on GitHub Pages: it opens the existing GitHub Actions workflow.

```text
https://cesarmejias-lab.github.io/morning-dashboard/
```

No token is requested or stored by the dashboard. Press **Sync CLZ**, click **Run workflow** in GitHub, then refresh the dashboard after the workflow finishes.

## Music Controls

- **Daily Collection Radar** picks a weighted recommendation from `music-collection.json`, shows a short reason, and adds compact collection signals when metadata is available.
- **Roll** in the Daily Collection Radar card picks another weighted CLZ recommendation and stores a small local history to avoid immediate repeats.
- **Roll** in the Discogs card picks another random public Discogs release.
- **Sync CLZ** opens the GitHub Actions workflow page. The workflow refreshes `music-collection.json` and commits it back to `main`.
- The dashboard fetches `music-collection.json` with cache-busting so recently synced totals show up without stale browser cache.

## CLI Sync

```bash
npm run clz:refresh
```

By default it syncs the `cesarmejias` CLZ user. Override with:

```bash
CLZ_USERNAME=your-clz-user npm run clz:refresh
```

On Windows PowerShell:

```powershell
$env:CLZ_USERNAME='your-clz-user'; npm run clz:refresh
```

### CLZ Enrichment

The sync preserves the current listing fields and gradually enriches album records when public CLZ detail pages expose more metadata.

```bash
CLZ_ENRICH_DETAILS=true CLZ_ENRICH_LIMIT=60 npm run clz:refresh
```

Set `CLZ_ENRICH_DETAILS=false` to skip detail pages and keep the faster listing-only sync. `CLZ_ENRICH_LIMIT` caps how many unchecked albums are enriched per run.

## GitHub Actions

`.github/workflows/clz-sync.yml` refreshes `music-collection.json` every 4 hours and can also be run manually from the Actions tab.

The sync script compares the actual collection payload before writing, so the workflow only commits when album data changes.

## Project Shape

- `index.html`: dashboard markup
- `styles.css`: dashboard styling
- `dashboard.js`: browser behavior and API rendering
- `server.js`: local static server
- `sync-collection.js`: CLZ crawler and JSON writer
- `music-collection.json`: generated CLZ collection data
