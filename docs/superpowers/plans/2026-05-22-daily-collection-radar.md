# Daily Collection Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Daily Collection Radar by enriching CLZ collection data, selecting weighted recommendations, rendering collection signals, and preserving current fallback behavior.

**Architecture:** Add pure JavaScript modules for CLZ contract logic, recommendation logic, and sync metadata extraction, then wire them into the existing static dashboard and Node sync script. Keep browser rendering in `dashboard.js`, but move testable logic into shared files loaded by `index.html` and imported by Node tests.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, Node.js built-in `node:test` and `assert`, existing Node sync script, no new runtime dependencies.

---

## File Structure

- Create `clz-radar.js`: shared browser/Node module for album normalization, collection summary, weighted recommendation, reasons, radar signals, and history helpers. It exposes `window.CLZRadar` in the browser and `module.exports` in Node.
- Create `clz-sync-metadata.js`: Node-only helpers for parsing public CLZ detail HTML, selecting albums for bounded enrichment, and merging detail metadata with existing cached metadata.
- Create `tests/clz-radar.contract.test.js`: tests collection normalization, metadata quality, and summary output.
- Create `tests/clz-sync-metadata.test.js`: tests CLZ detail HTML extraction and bounded enrichment selection.
- Create `tests/clz-radar.recommendation.test.js`: tests weighted recommendation, reasons, radar signals, and history filtering.
- Modify `package.json`: add `test` and extend `check` to cover the new modules.
- Modify `sync-collection.js`: use `clz-radar.js` for normalized output and summary, then use `clz-sync-metadata.js` for bounded detail enrichment.
- Modify `index.html`: load `clz-radar.js` before `dashboard.js` and update the CLZ card initial title.
- Modify `dashboard.js`: replace random CLZ selection with `CLZRadar.selectDailyRadar`, store recommendation history, and render Daily Collection Radar.
- Modify `styles.css`: add compact styles for reason text and radar signals.
- Modify `README.md`: document Daily Collection Radar and the CLZ enrichment environment variables.

## Scope Notes

The first implementation should keep detail enrichment safe: enabled by default, capped per sync run, sequential, and cache-aware using metadata already stored in `music-collection.json`. This gives the dashboard useful behavior immediately while the collection becomes richer over multiple sync runs.

---

### Task 1: Add Test Harness And CLZ Data Contract Module

**Files:**
- Create: `clz-radar.js`
- Create: `tests/clz-radar.contract.test.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing contract tests**

Create `tests/clz-radar.contract.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeAlbum,
  normalizeCollection,
  inferMetadataQuality,
  buildCollectionSummary,
} = require('../clz-radar');

test('normalizeAlbum preserves basic CLZ fields and marks basic quality', () => {
  const album = normalizeAlbum({
    id: 11785514,
    title: "Don't Give Up",
    artist: 'The Maureens',
    year: 2026,
    cover: 'https://example.test/cover.jpg',
  });

  assert.equal(album.id, '11785514');
  assert.equal(album.title, "Don't Give Up");
  assert.equal(album.artist, 'The Maureens');
  assert.equal(album.year, '2026');
  assert.equal(album.cover, 'https://example.test/cover.jpg');
  assert.deepEqual(album.genres, []);
  assert.deepEqual(album.styles, []);
  assert.deepEqual(album.moods, []);
  assert.equal(album.format, null);
  assert.equal(album.edition, null);
  assert.equal(album.addedAt, null);
  assert.deepEqual(album.metadataQuality, {
    level: 'basic',
    missing: ['genres', 'styles', 'moods', 'format', 'edition', 'addedAt'],
  });
});

test('inferMetadataQuality marks partial and enriched albums', () => {
  assert.deepEqual(inferMetadataQuality({
    genres: ['Jazz'],
    styles: ['Hard Bop'],
    format: 'CD',
  }), {
    level: 'partial',
    missing: ['moods', 'edition', 'addedAt'],
  });

  assert.deepEqual(inferMetadataQuality({
    genres: ['Jazz'],
    styles: ['Hard Bop'],
    moods: ['Late night'],
    format: 'CD',
    edition: 'Blue Note',
    addedAt: '2024-01-20',
  }), {
    level: 'enriched',
    missing: [],
  });
});

test('normalizeCollection keeps current top-level contract and adds summary', () => {
  const collection = normalizeCollection({
    username: 'cesarmejias',
    syncedAt: '2026-05-22T10:00:00.000Z',
    total: 2,
    albums: [
      { id: '1', title: 'One', artist: 'A', year: '1994', genres: ['Jazz'], format: 'CD' },
      { id: '2', title: 'Two', artist: 'B', year: '2001', styles: ['Indie Rock'], format: 'Vinyl' },
    ],
  });

  assert.equal(collection.username, 'cesarmejias');
  assert.equal(collection.syncedAt, '2026-05-22T10:00:00.000Z');
  assert.equal(collection.total, 2);
  assert.equal(collection.albums.length, 2);
  assert.deepEqual(collection.summary.genres, [{ name: 'Jazz', count: 1 }]);
  assert.deepEqual(collection.summary.styles, [{ name: 'Indie Rock', count: 1 }]);
  assert.deepEqual(collection.summary.formats, [
    { name: 'CD', count: 1 },
    { name: 'Vinyl', count: 1 },
  ]);
  assert.deepEqual(collection.summary.decades, [
    { name: '1990s', count: 1 },
    { name: '2000s', count: 1 },
  ]);
  assert.deepEqual(collection.summary.metadataQuality, {
    basic: 0,
    partial: 2,
    enriched: 0,
  });
});

test('buildCollectionSummary returns empty arrays for empty input', () => {
  assert.deepEqual(buildCollectionSummary([]), {
    genres: [],
    styles: [],
    formats: [],
    decades: [],
    metadataQuality: {
      basic: 0,
      partial: 0,
      enriched: 0,
    },
  });
});
```

- [ ] **Step 2: Run the contract tests and verify they fail**

Run:

```bash
node --test tests/clz-radar.contract.test.js
```

Expected result: fails with `Cannot find module '../clz-radar'`.

- [ ] **Step 3: Create the shared CLZ radar module**

Create `clz-radar.js`:

```js
(function initCLZRadar(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CLZRadar = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : null, function createCLZRadar() {
  const QUALITY_FIELDS = ['genres', 'styles', 'moods', 'format', 'edition', 'addedAt'];
  const HISTORY_LIMIT = 50;
  const HISTORY_MAX_AGE_DAYS = 45;

  function cleanText(value) {
    const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    return text || null;
  }

  function cleanArray(value) {
    const source = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(source.map(cleanText).filter(Boolean))];
  }

  function cleanYear(value) {
    const text = cleanText(value);
    return text;
  }

  function inferMetadataQuality(album) {
    const missing = [];
    const hasGenres = cleanArray(album.genres).length > 0;
    const hasStyles = cleanArray(album.styles).length > 0;
    const hasMoods = cleanArray(album.moods).length > 0;
    const hasFormat = Boolean(cleanText(album.format));
    const hasEdition = Boolean(cleanText(album.edition));
    const hasAddedAt = Boolean(cleanText(album.addedAt));

    if (!hasGenres) missing.push('genres');
    if (!hasStyles) missing.push('styles');
    if (!hasMoods) missing.push('moods');
    if (!hasFormat) missing.push('format');
    if (!hasEdition) missing.push('edition');
    if (!hasAddedAt) missing.push('addedAt');

    return {
      level: missing.length === QUALITY_FIELDS.length ? 'basic' : (missing.length === 0 ? 'enriched' : 'partial'),
      missing,
    };
  }

  function normalizeAlbum(album) {
    const normalized = {
      id: cleanText(album && album.id) || '',
      title: cleanText(album && album.title) || 'Unknown Title',
      artist: cleanText(album && album.artist) || 'Unknown Artist',
      year: cleanYear(album && album.year),
      cover: cleanText(album && album.cover),
      genres: cleanArray(album && album.genres),
      styles: cleanArray(album && album.styles),
      moods: cleanArray(album && album.moods),
      format: cleanText(album && album.format),
      edition: cleanText(album && album.edition),
      addedAt: cleanText(album && album.addedAt),
      detailCheckedAt: cleanText(album && album.detailCheckedAt),
    };
    normalized.metadataQuality = inferMetadataQuality(normalized);
    return normalized;
  }

  function decadeFromYear(year) {
    const match = String(year == null ? '' : year).match(/\b(18|19|20)\d{2}\b/);
    if (!match) return null;
    const numeric = Number(match[0]);
    return `${Math.floor(numeric / 10) * 10}s`;
  }

  function increment(map, name) {
    if (!name) return;
    map.set(name, (map.get(name) || 0) + 1);
  }

  function topCounts(map) {
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  function buildCollectionSummary(albums) {
    const genres = new Map();
    const styles = new Map();
    const formats = new Map();
    const decades = new Map();
    const metadataQuality = { basic: 0, partial: 0, enriched: 0 };

    albums.map(normalizeAlbum).forEach(album => {
      album.genres.forEach(name => increment(genres, name));
      album.styles.forEach(name => increment(styles, name));
      increment(formats, album.format);
      increment(decades, decadeFromYear(album.year));
      metadataQuality[album.metadataQuality.level] += 1;
    });

    return {
      genres: topCounts(genres),
      styles: topCounts(styles),
      formats: topCounts(formats),
      decades: topCounts(decades),
      metadataQuality,
    };
  }

  function normalizeCollection(payload) {
    const albums = Array.isArray(payload && payload.albums)
      ? payload.albums.map(normalizeAlbum).filter(album => album.id)
      : [];

    return {
      username: cleanText(payload && payload.username) || '',
      syncedAt: cleanText(payload && payload.syncedAt),
      total: Number(payload && payload.total) || albums.length,
      albums,
      summary: buildCollectionSummary(albums),
    };
  }

  return {
    HISTORY_LIMIT,
    HISTORY_MAX_AGE_DAYS,
    normalizeAlbum,
    normalizeCollection,
    inferMetadataQuality,
    buildCollectionSummary,
    decadeFromYear,
  };
}));
```

- [ ] **Step 4: Run the contract tests and verify they pass**

Run:

```bash
node --test tests/clz-radar.contract.test.js
```

Expected result: all 4 tests pass.

- [ ] **Step 5: Update package scripts**

Modify `package.json` scripts to:

```json
"scripts": {
  "dev": "node server.js",
  "clz:refresh": "node refresh-clz.js",
  "test": "node --test tests/*.test.js",
  "check": "node --check dashboard.js && node --check clz-radar.js && node --check clz-sync-metadata.js && node --check sync-collection.js && node --check refresh-clz.js && node --check server.js && npm test"
}
```

If `clz-sync-metadata.js` does not exist yet, use this temporary `check` script until Task 3 creates it:

```json
"check": "node --check dashboard.js && node --check clz-radar.js && node --check sync-collection.js && node --check refresh-clz.js && node --check server.js && npm test"
```

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add package.json clz-radar.js tests/clz-radar.contract.test.js
git commit -m "Add CLZ radar data contract"
```

---

### Task 2: Wire Normalized Contract And Summary Into CLZ Sync

**Files:**
- Modify: `sync-collection.js`
- Create: `tests/sync-collection-payload.test.js`

- [ ] **Step 1: Write the failing sync payload test**

Create `tests/sync-collection-payload.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCollectionPayload } = require('../sync-collection');

test('buildCollectionPayload preserves top-level fields and adds summary', () => {
  const payload = buildCollectionPayload({
    username: 'cesarmejias',
    syncedAt: '2026-05-22T12:00:00.000Z',
    albums: [
      { id: '1', title: 'A', artist: 'Artist A', year: '1988', genres: ['Pop'], format: 'CD' },
      { id: '2', title: 'B', artist: 'Artist B', year: '1991', styles: ['Indie Rock'], format: 'Vinyl' },
    ],
  });

  assert.equal(payload.username, 'cesarmejias');
  assert.equal(payload.syncedAt, '2026-05-22T12:00:00.000Z');
  assert.equal(payload.total, 2);
  assert.equal(payload.albums.length, 2);
  assert.deepEqual(payload.summary.formats, [
    { name: 'CD', count: 1 },
    { name: 'Vinyl', count: 1 },
  ]);
});
```

- [ ] **Step 2: Run the sync payload test and verify it fails**

Run:

```bash
node --test tests/sync-collection-payload.test.js
```

Expected result: fails because `buildCollectionPayload` is not exported.

- [ ] **Step 3: Import the shared contract helper**

In `sync-collection.js`, add this near the existing `require` calls:

```js
const { normalizeCollection } = require('./clz-radar');
```

- [ ] **Step 4: Add `buildCollectionPayload`**

Add this below `comparableCollection`:

```js
function buildCollectionPayload({ username, syncedAt, albums }) {
  return normalizeCollection({
    username,
    syncedAt,
    total: Array.isArray(albums) ? albums.length : 0,
    albums,
  });
}
```

- [ ] **Step 5: Include summary in comparisons**

Replace `comparableCollection` with:

```js
function comparableCollection(collection) {
  return JSON.stringify({
    username: collection.username,
    total: collection.total,
    albums: collection.albums,
    summary: collection.summary,
  });
}
```

- [ ] **Step 6: Use the payload builder in `run`**

Replace the current payload literal in `run` with:

```js
const payload = buildCollectionPayload({
  username: CLZ_USERNAME,
  syncedAt: new Date().toISOString(),
  albums: allItems,
});
```

- [ ] **Step 7: Export `buildCollectionPayload`**

Replace the `module.exports` block with:

```js
module.exports = {
  run,
  parseItems,
  decodeHtml,
  buildCollectionPayload,
};
```

- [ ] **Step 8: Run tests and syntax checks**

Run:

```bash
npm test
npm run check
```

Expected result: both commands pass.

- [ ] **Step 9: Commit Task 2**

Run:

```bash
git add sync-collection.js tests/sync-collection-payload.test.js
git commit -m "Add CLZ collection summary output"
```

---

### Task 3: Add Safe Detail Metadata Enrichment

**Files:**
- Create: `clz-sync-metadata.js`
- Create: `tests/clz-sync-metadata.test.js`
- Modify: `sync-collection.js`
- Modify: `package.json`

- [ ] **Step 1: Write failing metadata extraction tests**

Create `tests/clz-sync-metadata.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseDetailMetadata,
  mergeAlbumMetadata,
  selectAlbumsForEnrichment,
} = require('../clz-sync-metadata');

test('parseDetailMetadata extracts public detail fields from label/value markup', () => {
  const html = `
    <dl>
      <dt>Genres</dt><dd>Jazz, Soul</dd>
      <dt>Styles</dt><dd>Hard Bop / Vocal Jazz</dd>
      <dt>Format</dt><dd>CD</dd>
      <dt>Edition</dt><dd>Blue Note 80</dd>
      <dt>Added</dt><dd>2024-02-18</dd>
    </dl>
  `;

  assert.deepEqual(parseDetailMetadata(html), {
    genres: ['Jazz', 'Soul'],
    styles: ['Hard Bop', 'Vocal Jazz'],
    moods: [],
    format: 'CD',
    edition: 'Blue Note 80',
    addedAt: '2024-02-18',
  });
});

test('mergeAlbumMetadata preserves listing fields and adds detail quality', () => {
  const merged = mergeAlbumMetadata(
    { id: '1', title: 'One', artist: 'A', year: '1994', cover: 'https://example.test/a.jpg' },
    { genres: ['Jazz'], format: 'CD' },
    '2026-05-22T12:00:00.000Z'
  );

  assert.equal(merged.id, '1');
  assert.equal(merged.title, 'One');
  assert.deepEqual(merged.genres, ['Jazz']);
  assert.equal(merged.format, 'CD');
  assert.equal(merged.detailCheckedAt, '2026-05-22T12:00:00.000Z');
  assert.equal(merged.metadataQuality.level, 'partial');
});

test('selectAlbumsForEnrichment prefers albums without checked metadata', () => {
  const albums = [
    { id: '1', title: 'One' },
    { id: '2', title: 'Two' },
    { id: '3', title: 'Three' },
  ];
  const existing = [
    { id: '2', title: 'Two', detailCheckedAt: '2026-05-01T10:00:00.000Z' },
  ];

  assert.deepEqual(selectAlbumsForEnrichment(albums, existing, 2).map(album => album.id), ['1', '3']);
});
```

- [ ] **Step 2: Run the metadata tests and verify they fail**

Run:

```bash
node --test tests/clz-sync-metadata.test.js
```

Expected result: fails with `Cannot find module '../clz-sync-metadata'`.

- [ ] **Step 3: Create the metadata helper module**

Create `clz-sync-metadata.js`:

```js
const { normalizeAlbum } = require('./clz-radar');

function decodeHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, token) => {
      const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
      const lower = token.toLowerCase();
      if (named[lower]) return named[lower];
      if (lower.startsWith('#x')) {
        const codePoint = parseInt(lower.slice(2), 16);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
      }
      if (lower.startsWith('#')) {
        const codePoint = parseInt(lower.slice(1), 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
      }
      return entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function splitList(value) {
  return [...new Set(decodeHtml(value)
    .split(/\s*(?:,|\/|\|)\s*/g)
    .map(item => item.trim())
    .filter(Boolean))];
}

function findField(html, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`<dt[^>]*>\\s*${escaped}\\s*<\\/dt>\\s*<dd[^>]*>([\\s\\S]*?)<\\/dd>`, 'i'),
      new RegExp(`<[^>]+class="[^"]*(?:label|field-name)[^"]*"[^>]*>\\s*${escaped}\\s*<\\/[^>]+>\\s*<[^>]+class="[^"]*(?:value|field-value)[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = String(html || '').match(pattern);
      if (match) return decodeHtml(match[1]);
    }
  }
  return '';
}

function parseDetailMetadata(html) {
  const genres = splitList(findField(html, ['Genres', 'Genre']));
  const styles = splitList(findField(html, ['Styles', 'Style']));
  const moods = splitList(findField(html, ['Moods', 'Mood']));
  const format = decodeHtml(findField(html, ['Format', 'Formats'])) || null;
  const edition = decodeHtml(findField(html, ['Edition', 'Release', 'Label'])) || null;
  const addedAt = decodeHtml(findField(html, ['Added', 'Date Added', 'Added Date'])) || null;

  return {
    genres,
    styles,
    moods,
    format,
    edition,
    addedAt,
  };
}

function mergeAlbumMetadata(album, metadata, checkedAt) {
  return normalizeAlbum({
    ...album,
    genres: metadata.genres && metadata.genres.length ? metadata.genres : album.genres,
    styles: metadata.styles && metadata.styles.length ? metadata.styles : album.styles,
    moods: metadata.moods && metadata.moods.length ? metadata.moods : album.moods,
    format: metadata.format || album.format,
    edition: metadata.edition || album.edition,
    addedAt: metadata.addedAt || album.addedAt,
    detailCheckedAt: checkedAt || album.detailCheckedAt,
  });
}

function mergeExistingMetadata(album, existingAlbum) {
  if (!existingAlbum) return normalizeAlbum(album);
  return normalizeAlbum({
    ...album,
    genres: existingAlbum.genres,
    styles: existingAlbum.styles,
    moods: existingAlbum.moods,
    format: existingAlbum.format,
    edition: existingAlbum.edition,
    addedAt: existingAlbum.addedAt,
    detailCheckedAt: existingAlbum.detailCheckedAt,
  });
}

function selectAlbumsForEnrichment(albums, existingAlbums, limit) {
  const existingById = new Map((existingAlbums || []).map(album => [String(album.id), album]));
  return albums
    .filter(album => {
      const existing = existingById.get(String(album.id));
      return !existing || !existing.detailCheckedAt;
    })
    .slice(0, Math.max(0, Number(limit) || 0));
}

module.exports = {
  decodeHtml,
  parseDetailMetadata,
  mergeAlbumMetadata,
  mergeExistingMetadata,
  selectAlbumsForEnrichment,
};
```

- [ ] **Step 4: Wire enrichment into `sync-collection.js` imports and config**

Add near the imports:

```js
const {
  parseDetailMetadata,
  mergeAlbumMetadata,
  mergeExistingMetadata,
  selectAlbumsForEnrichment,
} = require('./clz-sync-metadata');
```

Add below the existing constants:

```js
const ENRICH_DETAILS = process.env.CLZ_ENRICH_DETAILS !== 'false';
const CLZ_ENRICH_LIMIT = Math.max(0, Number(process.env.CLZ_ENRICH_LIMIT || 60));
const CLZ_DETAIL_DELAY_MS = Math.max(100, Number(process.env.CLZ_DETAIL_DELAY_MS || 350));
```

- [ ] **Step 5: Add detail page fetch and enrichment helpers**

Add these functions below `fetchLazyLoad`:

```js
function fetchDetailPage(albumId, cookies) {
  return httpsGet({
    hostname: 'cloud.clz.com',
    port: 443,
    path: `/${encodeURIComponent(CLZ_USERNAME)}/music/detail/${encodeURIComponent(albumId)}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Cookie: cookies.join('; '),
    },
  });
}

async function enrichAlbums(albums, existingCollection, cookies) {
  const existingAlbums = existingCollection && Array.isArray(existingCollection.albums)
    ? existingCollection.albums
    : [];
  const existingById = new Map(existingAlbums.map(album => [String(album.id), album]));
  const merged = albums.map(album => mergeExistingMetadata(album, existingById.get(String(album.id))));

  if (!ENRICH_DETAILS || CLZ_ENRICH_LIMIT === 0) {
    return merged;
  }

  const targets = selectAlbumsForEnrichment(merged, existingAlbums, CLZ_ENRICH_LIMIT);
  const targetIds = new Set(targets.map(album => String(album.id)));
  const enrichedById = new Map();
  const checkedAt = new Date().toISOString();

  for (const album of targets) {
    process.stdout.write(`  -> Enriching ${album.id} ${album.title}... `);
    try {
      const res = await fetchDetailPage(album.id, cookies);
      if (res.status === 200) {
        const metadata = parseDetailMetadata(res.body);
        enrichedById.set(String(album.id), mergeAlbumMetadata(album, metadata, checkedAt));
        console.log('ok.');
      } else {
        enrichedById.set(String(album.id), mergeAlbumMetadata(album, {}, checkedAt));
        console.log(`skipped HTTP ${res.status}.`);
      }
    } catch (err) {
      enrichedById.set(String(album.id), mergeAlbumMetadata(album, {}, checkedAt));
      console.log(`skipped ${err.message}.`);
    }
    await delay(CLZ_DETAIL_DELAY_MS);
  }

  return merged.map(album => targetIds.has(String(album.id))
    ? enrichedById.get(String(album.id)) || album
    : album);
}
```

- [ ] **Step 6: Use existing collection cache and enriched albums in `run`**

Add this after session initialization succeeds:

```js
const existingCollection = readExistingCollection();
```

Replace the payload creation block with:

```js
console.log('\n[4/5] Enriching album metadata...');
const enrichedItems = await enrichAlbums(allItems, existingCollection, cookies);

console.log('\n[5/5] Writing database...');
const payload = buildCollectionPayload({
  username: CLZ_USERNAME,
  syncedAt: new Date().toISOString(),
  albums: enrichedItems,
});
```

Update the earlier writing log from `[4/4] Writing database...` by removing it so the sync does not print duplicate step numbers.

- [ ] **Step 7: Update exports**

Add `enrichAlbums` to `module.exports`:

```js
module.exports = {
  run,
  parseItems,
  decodeHtml,
  buildCollectionPayload,
  enrichAlbums,
};
```

- [ ] **Step 8: Update the final `check` script if it still uses the temporary version**

Set `package.json` scripts to:

```json
"scripts": {
  "dev": "node server.js",
  "clz:refresh": "node refresh-clz.js",
  "test": "node --test tests/*.test.js",
  "check": "node --check dashboard.js && node --check clz-radar.js && node --check clz-sync-metadata.js && node --check sync-collection.js && node --check refresh-clz.js && node --check server.js && npm test"
}
```

- [ ] **Step 9: Run tests and syntax checks**

Run:

```bash
npm test
npm run check
```

Expected result: both commands pass.

- [ ] **Step 10: Commit Task 3**

Run:

```bash
git add package.json sync-collection.js clz-sync-metadata.js tests/clz-sync-metadata.test.js
git commit -m "Add bounded CLZ detail enrichment"
```

---

### Task 4: Add Recommendation, Reason, Radar Signal, And History Logic

**Files:**
- Modify: `clz-radar.js`
- Create: `tests/clz-radar.recommendation.test.js`

- [ ] **Step 1: Write failing recommendation tests**

Create `tests/clz-radar.recommendation.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  selectDailyRadar,
  buildRadarSignals,
  generateRecommendationReason,
  pruneHistory,
  recordHistoryEntry,
} = require('../clz-radar');

const collection = {
  total: 3,
  syncedAt: '2026-05-22T12:00:00.000Z',
  albums: [
    { id: '1', title: 'Recent Artist', artist: 'Seen', year: '2020', genres: ['Rock'], format: 'CD' },
    { id: '2', title: 'Old Jazz', artist: 'Fresh', year: '1964', genres: ['Jazz'], styles: ['Hard Bop'], format: 'Vinyl', addedAt: '2020-01-01' },
    { id: '3', title: 'Ambient Morning', artist: 'Clouds', year: '1998', moods: ['Calm'], format: 'Cassette' },
  ],
  summary: {
    genres: [{ name: 'Rock', count: 1 }, { name: 'Jazz', count: 1 }],
    styles: [{ name: 'Hard Bop', count: 1 }],
    formats: [{ name: 'CD', count: 1 }, { name: 'Vinyl', count: 1 }, { name: 'Cassette', count: 1 }],
    decades: [{ name: '1960s', count: 1 }, { name: '1990s', count: 1 }, { name: '2020s', count: 1 }],
    metadataQuality: { basic: 0, partial: 3, enriched: 0 },
  },
};

test('selectDailyRadar avoids recently seen artists and returns reason and signals', () => {
  const result = selectDailyRadar(collection, {
    history: [{ id: '1', artist: 'Seen', shownAt: '2026-05-21T12:00:00.000Z' }],
    now: new Date('2026-05-22T12:00:00.000Z'),
    random: () => 0,
  });

  assert.equal(result.id, '2');
  assert.equal(result.title, 'Old Jazz');
  assert.match(result.reason, /Jazz|rediscover|Vinyl|1960s/);
  assert.ok(result.signals.length >= 2);
});

test('generateRecommendationReason falls back to basic recommendation text', () => {
  const reason = generateRecommendationReason({ title: 'Plain', artist: 'A' }, []);
  assert.equal(reason, 'A fresh pick from your CLZ collection.');
});

test('buildRadarSignals uses metadata and summary without throwing', () => {
  const album = collection.albums[1];
  const signals = buildRadarSignals(album, collection, []);
  assert.ok(signals.some(signal => signal.label === 'Genre'));
  assert.ok(signals.some(signal => signal.label === 'Decade'));
});

test('history helpers prune old entries and prepend the current recommendation', () => {
  const now = new Date('2026-05-22T12:00:00.000Z');
  const history = pruneHistory([
    { id: 'old', artist: 'Old', shownAt: '2025-01-01T12:00:00.000Z' },
    { id: 'new', artist: 'New', shownAt: '2026-05-21T12:00:00.000Z' },
  ], now);

  assert.deepEqual(history.map(entry => entry.id), ['new']);

  const recorded = recordHistoryEntry(history, {
    id: '2',
    artist: 'Fresh',
    genres: ['Jazz'],
    styles: ['Hard Bop'],
  }, now);

  assert.equal(recorded[0].id, '2');
  assert.deepEqual(recorded[0].signals, ['Jazz', 'Hard Bop']);
});
```

- [ ] **Step 2: Run recommendation tests and verify they fail**

Run:

```bash
node --test tests/clz-radar.recommendation.test.js
```

Expected result: fails because recommendation functions are not exported.

- [ ] **Step 3: Add history and scoring helpers to `clz-radar.js`**

Add these functions before the final `return` in `clz-radar.js`:

```js
function daysBetween(a, b) {
  const start = a instanceof Date ? a : new Date(a);
  const end = b instanceof Date ? b : new Date(b);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return Number.POSITIVE_INFINITY;
  return Math.abs(end.getTime() - start.getTime()) / 86400000;
}

function pruneHistory(history, now = new Date()) {
  return (Array.isArray(history) ? history : [])
    .filter(entry => entry && entry.id && entry.shownAt && daysBetween(entry.shownAt, now) <= HISTORY_MAX_AGE_DAYS)
    .slice(0, HISTORY_LIMIT);
}

function recordHistoryEntry(history, album, now = new Date()) {
  const normalized = normalizeAlbum(album);
  const entry = {
    id: normalized.id,
    artist: normalized.artist,
    shownAt: now.toISOString(),
    signals: [...normalized.genres, ...normalized.styles, ...normalized.moods].slice(0, 6),
  };
  return [entry, ...pruneHistory(history, now).filter(item => item.id !== entry.id)].slice(0, HISTORY_LIMIT);
}

function readHistory(storage, key) {
  try {
    const raw = storage.getItem(key);
    return pruneHistory(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function writeHistory(storage, key, history) {
  try {
    storage.setItem(key, JSON.stringify(pruneHistory(history)));
  } catch {
    return false;
  }
  return true;
}

function seenSet(history, key) {
  return new Set(pruneHistory(history).map(entry => String(entry[key] || '').toLowerCase()).filter(Boolean));
}

function scoreAlbum(album, collection, history, random) {
  const normalized = normalizeAlbum(album);
  const recentIds = seenSet(history, 'id');
  const recentArtists = seenSet(history, 'artist');
  let score = 10 + random();

  if (recentIds.has(normalized.id.toLowerCase())) score -= 100;
  if (recentArtists.has(normalized.artist.toLowerCase())) score -= 20;
  if (normalized.addedAt && daysBetween(normalized.addedAt, new Date()) > 365) score += 8;
  if (normalized.genres.length > 0 || normalized.styles.length > 0 || normalized.moods.length > 0) score += 6;
  if (normalized.format) score += 3;
  if (normalized.edition) score += 2;
  if (decadeFromYear(normalized.year)) score += 2;
  if (collection.summary && collection.summary.metadataQuality && collection.summary.metadataQuality.basic > 0 && normalized.metadataQuality.level === 'basic') score -= 2;

  return score;
}

function buildRadarSignals(album, collection, history) {
  const normalized = normalizeAlbum(album);
  const signals = [];
  const recentSignals = new Set(pruneHistory(history).flatMap(entry => entry.signals || []).map(value => value.toLowerCase()));
  const decade = decadeFromYear(normalized.year);

  const genre = normalized.genres.find(name => !recentSignals.has(name.toLowerCase())) || normalized.genres[0];
  if (genre) signals.push({ label: 'Genre', value: genre });

  const style = normalized.styles.find(name => !recentSignals.has(name.toLowerCase())) || normalized.styles[0];
  if (style) signals.push({ label: 'Style', value: style });

  if (normalized.format) signals.push({ label: 'Format', value: normalized.format });
  if (decade) signals.push({ label: 'Decade', value: decade });
  if (normalized.addedAt && daysBetween(normalized.addedAt, new Date()) > 365) {
    signals.push({ label: 'Rediscovery', value: 'Added over a year ago' });
  }
  if (normalized.metadataQuality.level === 'basic') {
    signals.push({ label: 'Metadata', value: 'Basic CLZ data' });
  }

  return signals.slice(0, 3);
}

function generateRecommendationReason(album, signals) {
  const normalized = normalizeAlbum(album);
  const genre = signals.find(signal => signal.label === 'Genre');
  const style = signals.find(signal => signal.label === 'Style');
  const format = signals.find(signal => signal.label === 'Format');
  const decade = signals.find(signal => signal.label === 'Decade');

  if (genre) return `A ${genre.value} record from your collection rotation.`;
  if (style) return `A ${style.value} corner of the collection worth revisiting.`;
  if (format) return `A ${format.value} edition surfaced for today's listen.`;
  if (decade) return `A ${decade.value} pick from a different shelf of the collection.`;
  if (normalized.metadataQuality.level === 'basic') return 'A fresh pick from your CLZ collection.';
  return 'A fresh pick from your CLZ collection.';
}

function selectDailyRadar(collectionPayload, options = {}) {
  const collection = normalizeCollection(collectionPayload);
  const history = pruneHistory(options.history || [], options.now || new Date());
  const random = typeof options.random === 'function' ? options.random : Math.random;
  const candidates = collection.albums.length > 0 ? collection.albums : [];
  if (candidates.length === 0) {
    throw new Error('CLZ collection is empty.');
  }

  const scored = candidates
    .map(album => ({ album, score: scoreAlbum(album, collection, history, random) }))
    .sort((a, b) => b.score - a.score);
  const selected = scored[0].album;
  const signals = buildRadarSignals(selected, collection, history);
  const reason = generateRecommendationReason(selected, signals);

  return {
    ...selected,
    total: collection.total || collection.albums.length,
    syncedAt: collection.syncedAt,
    reason,
    signals,
  };
}
```

- [ ] **Step 4: Export the new functions**

Add these names to the returned API object in `clz-radar.js`:

```js
selectDailyRadar,
buildRadarSignals,
generateRecommendationReason,
pruneHistory,
recordHistoryEntry,
readHistory,
writeHistory,
```

- [ ] **Step 5: Run all tests**

Run:

```bash
npm test
```

Expected result: all tests pass.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add clz-radar.js tests/clz-radar.recommendation.test.js
git commit -m "Add Daily Collection Radar recommendation logic"
```

---

### Task 5: Wire Daily Collection Radar Into The Dashboard

**Files:**
- Modify: `index.html`
- Modify: `dashboard.js`

- [ ] **Step 1: Load the shared browser module**

In `index.html`, replace the CLZ card comment and title with:

```html
  <!-- Daily Collection Radar -->
  <div class="card full-width record-card" id="clz-card">
    <div class="card-title">Daily Collection Radar</div>
    <div class="sync-status">Scanning your CLZ collection&hellip;</div>
  </div>
```

Add `clz-radar.js` before `dashboard.js`:

```html
<script src="./clz-radar.js?v=20260522-radar"></script>
<script src="./dashboard.js?v=20260522-radar"></script>
```

- [ ] **Step 2: Add CLZ history storage key**

In `dashboard.js`, extend `STORAGE`:

```js
const STORAGE = {
  accent: 'morning_dashboard_accent_color',
  clocks: 'morning_dashboard_clocks',
  weather: 'morning_dashboard_weather',
  clzRadarHistory: 'morning_dashboard_clz_radar_history',
};
```

- [ ] **Step 3: Add CLZ radar helper functions**

Replace `pickCLZRecord` with:

```js
function getCLZRadarApi() {
  if (!window.CLZRadar) {
    throw new Error('Daily Collection Radar module did not load.');
  }
  return window.CLZRadar;
}

function readCLZRadarHistory() {
  return getCLZRadarApi().readHistory(localStorage, STORAGE.clzRadarHistory);
}

function writeCLZRadarHistory(history) {
  getCLZRadarApi().writeHistory(localStorage, STORAGE.clzRadarHistory, history);
}

function pickCLZRecord(data) {
  const radar = getCLZRadarApi();
  const collection = radar.normalizeCollection(data);
  const history = readCLZRadarHistory();
  const rec = radar.selectDailyRadar(collection, { history, now: new Date() });
  writeCLZRadarHistory(radar.recordHistoryEntry(history, rec, new Date()));
  return rec;
}
```

- [ ] **Step 4: Normalize the fetched collection**

In `fetchCLZCollection`, replace:

```js
window.CLZ_MUSIC_COLLECTION = data;
return data;
```

with:

```js
const collection = getCLZRadarApi().normalizeCollection(data);
window.CLZ_MUSIC_COLLECTION = collection;
return collection;
```

- [ ] **Step 5: Render enriched CLZ tags, reason, and radar signals**

Replace `renderCLZRecord` with:

```js
function renderCLZRecord(rec, syncMessage = '') {
  const detailUrl = safeUrl(`${CLZ_URL}/detail/${encodeURIComponent(rec.id)}`);
  const coverHTML = recordCoverHtml(rec.cover, rec.title);
  const tags = [
    rec.year,
    rec.format,
    rec.edition,
    ...(rec.genres || []).slice(0, 2),
    ...(rec.styles || []).slice(0, 1),
  ].filter(Boolean)
    .map(t => `<span class="record-tag">${escapeHtml(t)}</span>`).join('');
  const signals = Array.isArray(rec.signals) ? rec.signals : [];
  const signalHtml = signals.map(signal => `
    <div class="radar-signal">
      <span class="radar-signal-label">${escapeHtml(signal.label)}</span>
      <span class="radar-signal-value">${escapeHtml(signal.value)}</span>
    </div>`).join('');

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(rec.artist + ' ' + rec.title)}`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.artist + ' ' + rec.title + ' album')}`;

  byId('clz-card').innerHTML = `
    ${recordBgHtml(rec.cover)}
    <div class="card-header">
      <span class="card-title tight">
        <span>&#9679; Daily Collection Radar &mdash; ${rec.total.toLocaleString()} releases</span>
        ${rec.syncedAt ? `<span class="sync-status">Last synced: ${escapeHtml(new Date(rec.syncedAt).toLocaleString())}</span>` : ''}
      </span>
      <div class="record-header-actions">
        <button type="button" class="record-action-btn" data-action="refresh-clz" title="Sync CLZ collection now">Sync CLZ</button>
      </div>
    </div>
    <div class="record-body record-roll-wrapper" id="clz-roll-wrapper">
      ${coverHTML}
      <div class="record-info">
        <div class="record-title">${escapeHtml(rec.title)}</div>
        <div class="record-artist">${escapeHtml(rec.artist)}</div>
        ${tags ? `<div class="record-tags">${tags}</div>` : ''}
        ${rec.reason ? `<div class="record-reason">${escapeHtml(rec.reason)}</div>` : ''}
        ${signalHtml ? `<div class="radar-signals">${signalHtml}</div>` : ''}
        <div class="record-actions">
          <button type="button" class="record-link" data-action="roll-clz">Roll</button>
          <a class="record-link secondary spotify-link" href="${safeUrl(spotifySearchUrl)}" target="_blank" rel="noopener">Spotify</a>
          <a class="record-link secondary youtube-link" href="${safeUrl(youtubeSearchUrl)}" target="_blank" rel="noopener">YouTube</a>
          <a class="record-link secondary" href="${detailUrl}" target="_blank" rel="noopener">View on CLZ &#8599;</a>
          <a class="record-link secondary" href="${CLZ_URL}" target="_blank" rel="noopener">My CLZ Collection &#8599;</a>
          <a class="record-link secondary" href="${GITHUB_ACTIONS_URL}" target="_blank" rel="noopener">Actions &#8599;</a>
        </div>
        <div class="sync-status" id="clz-sync-status">${escapeHtml(syncMessage)}</div>
      </div>
    </div>`;
}
```

- [ ] **Step 6: Update CLZ setup and error copy**

In `renderCLZSetup`, change the card title line to:

```js
<div class="card-title">Daily Collection Radar &mdash; Setup needed</div>
```

In `refresh`, replace CLZ skeleton and error titles:

```js
renderRecordSkeleton('clz-card', 'Daily Collection Radar');
```

and:

```js
`<div class="card-title">Daily Collection Radar</div>
```

- [ ] **Step 7: Run checks**

Run:

```bash
npm run check
```

Expected result: command passes.

- [ ] **Step 8: Commit Task 5**

Run:

```bash
git add index.html dashboard.js
git commit -m "Render Daily Collection Radar"
```

---

### Task 6: Add Radar UI Styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add reason and radar signal styles**

Add this after the existing `.record-tags` and `.record-tag` rules:

```css
    .record-reason {
      color: var(--text);
      font-size: 0.84rem;
      line-height: 1.45;
      margin: -4px 0 12px;
      max-width: 720px;
    }

    .radar-signals {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin: 0 0 14px;
      max-width: 720px;
    }

    .radar-signal {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      min-width: 0;
      padding: 8px 10px;
    }

    .radar-signal-label {
      color: var(--muted);
      display: block;
      font-size: 0.64rem;
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1.2;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    .radar-signal-value {
      color: var(--text);
      display: block;
      font-size: 0.78rem;
      font-weight: 650;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }
```

- [ ] **Step 2: Add responsive behavior**

Inside the existing `@media (max-width: 680px)` block, add:

```css
      .record-body {
        align-items: flex-start;
      }

      .radar-signals {
        grid-template-columns: 1fr;
      }

      .record-reason {
        font-size: 0.8rem;
      }
```

- [ ] **Step 3: Run syntax checks**

Run:

```bash
npm run check
```

Expected result: command passes.

- [ ] **Step 4: Commit Task 6**

Run:

```bash
git add styles.css
git commit -m "Style Daily Collection Radar signals"
```

---

### Task 7: Document And Verify End To End

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README music controls section**

Replace the CLZ bullets under "Music Controls" with:

```markdown
- **Daily Collection Radar** picks a weighted recommendation from `music-collection.json`, shows a short reason, and adds compact collection signals when metadata is available.
- **Roll** in the Daily Collection Radar card picks another weighted CLZ recommendation and stores a small local history to avoid immediate repeats.
- **Roll** in the Discogs card picks another random public Discogs release.
- **Sync CLZ** opens the GitHub Actions workflow page. The workflow refreshes `music-collection.json` and commits it back to `main`.
- The dashboard fetches `music-collection.json` with cache-busting so recently synced totals show up without stale browser cache.
```

- [ ] **Step 2: Add CLZ enrichment notes**

Under "CLI Sync", add:

```markdown
### CLZ Enrichment

The sync preserves the current listing fields and gradually enriches album records when public CLZ detail pages expose more metadata.

```bash
CLZ_ENRICH_DETAILS=true CLZ_ENRICH_LIMIT=60 npm run clz:refresh
```

Set `CLZ_ENRICH_DETAILS=false` to skip detail pages and keep the faster listing-only sync. `CLZ_ENRICH_LIMIT` caps how many unchecked albums are enriched per run.
```

- [ ] **Step 3: Run the full local verification**

Run:

```bash
npm run check
```

Expected result: command passes.

- [ ] **Step 4: Run a fast listing-only sync smoke test**

Run:

```bash
$env:CLZ_ENRICH_DETAILS='false'; npm run clz:refresh
```

Expected result: sync completes and `music-collection.json` still contains `username`, `syncedAt`, `total`, `albums`, and `summary`.

- [ ] **Step 5: Start the local server**

Run:

```bash
npm run dev
```

Expected result: server prints a local URL, usually `http://127.0.0.1:4173/`.

- [ ] **Step 6: Manual browser verification**

Open the local URL and verify:

- the CLZ card title says "Daily Collection Radar";
- the card shows a cover or microphone fallback, title, artist, and actions;
- Roll changes the CLZ recommendation;
- Sync CLZ opens the GitHub Actions workflow;
- Spotify, YouTube, View on CLZ, My CLZ Collection, and Actions links open valid URLs;
- the page is usable at desktop width and at a mobile width under 680px;
- if `music-collection.json` is temporarily unavailable, the setup/error state still shows Sync CLZ and CLZ links.

- [ ] **Step 7: Commit Task 7**

Run:

```bash
git add README.md music-collection.json
git commit -m "Document Daily Collection Radar sync flow"
```

If the listing-only sync did not change album data, do not include `music-collection.json` in the commit:

```bash
git add README.md
git commit -m "Document Daily Collection Radar sync flow"
```

---

## Final Verification

Run:

```bash
npm run check
git status --short
```

Expected result:

- `npm run check` passes.
- `git status --short` shows only intentional local files, such as `.gitignore` if it was already modified before this implementation.

## Self-Review Checklist

- Spec coverage: data contract, sync enrichment, weighted recommendation, local history, radar signals, fallbacks, tests, docs, and manual verification are covered by Tasks 1-7.
- Red flag scan: each task includes concrete files, code blocks, commands, and expected results.
- Type consistency: album fields use `id`, `title`, `artist`, `year`, `cover`, `genres`, `styles`, `moods`, `format`, `edition`, `addedAt`, `detailCheckedAt`, and `metadataQuality` consistently across sync, module, and dashboard tasks.
