/**
 * Crawls a public CLZ Cloud music collection and writes music-collection.json.
 *
 * Usage:
 *   node sync-collection.js
 *   CLZ_USERNAME=your-user node sync-collection.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { normalizeCollection } = require('./clz-radar');

const CLZ_USERNAME = process.env.CLZ_USERNAME || process.argv[2] || 'cesarmejias';
const BASE_URL = `https://cloud.clz.com/${encodeURIComponent(CLZ_USERNAME)}/music`;
const OUTPUT_FILE = path.join(__dirname, 'music-collection.json');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpsGet(urlOrOptions) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlOrOptions, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.setTimeout(30000, () => {
      req.destroy(new Error('Request timed out'));
    });
    req.on('error', reject);
  });
}

function getPage(url) {
  const parsed = new URL(url);
  return httpsGet({
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    path: `${parsed.pathname}${parsed.search}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
}

function fetchLazyLoad(csrfToken, cookies, page = 1) {
  return httpsGet({
    hostname: 'cloud.clz.com',
    port: 443,
    path: `/${encodeURIComponent(CLZ_USERNAME)}/music/lazyload?page=${page}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'X-CSRF-TOKEN': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookies.join('; '),
    },
  });
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, token) => {
      const named = {
        amp: '&',
        quot: '"',
        apos: "'",
        lt: '<',
        gt: '>',
        nbsp: ' ',
      };
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

function parseItems(html) {
  const items = [];
  const parts = String(html || '').split('class="item item-card"');

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const relMatch = part.match(/^\s*rel="([^"]+)"/);
    if (!relMatch) continue;

    const titleMatch = part.match(/<div class="item-title">[\s\S]*?class="detail-link">([\s\S]*?)<\/a>/);
    const artistMatch = part.match(/<div class="item-artist one-line">([\s\S]*?)<\/div>/);
    const yearMatch = part.match(/<span class="item-date">([\s\S]*?)<\/span>/);
    const dataSrcMatch = part.match(/<img[^>]*data-src="([^"]+)"/);
    const srcMatch = part.match(/<img[^>]*src="([^"]+)"/);
    const coverMatch = dataSrcMatch || srcMatch;

    items.push({
      id: decodeHtml(relMatch[1]),
      title: titleMatch ? decodeHtml(titleMatch[1]) : 'Unknown Title',
      artist: artistMatch ? decodeHtml(artistMatch[1]) : 'Unknown Artist',
      year: yearMatch ? decodeHtml(yearMatch[1]) : '',
      cover: coverMatch ? decodeHtml(coverMatch[1]) : '',
    });
  }

  return items;
}

function parseJsonBody(body, label) {
  try {
    return JSON.parse(body);
  } catch (err) {
    throw new Error(`Could not parse ${label} JSON: ${err.message}`);
  }
}

function readExistingCollection() {
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function comparableCollection(collection) {
  return JSON.stringify({
    username: collection.username,
    total: collection.total,
    albums: collection.albums,
    summary: collection.summary,
  });
}

function buildCollectionPayload({ username, syncedAt, albums }) {
  return normalizeCollection({
    username,
    syncedAt,
    total: Array.isArray(albums) ? albums.length : 0,
    albums,
  });
}

function writeAtomic(filePath, content) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function writeCollection(payload) {
  const existing = readExistingCollection();
  if (existing && comparableCollection(existing) === comparableCollection(payload)) {
    console.log('[OK] Collection unchanged; existing JSON left untouched.');
    return { changed: false, collection: existing };
  }

  writeAtomic(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log('[OK] Saved JSON to:');
  console.log(`  ${OUTPUT_FILE}`);
  return { changed: true, collection: payload };
}

async function run() {
  console.log('==================================================');
  console.log('  CLZ CLOUD MUSIC SYNCHRONIZER');
  console.log('==================================================');
  console.log(`Target username : ${CLZ_USERNAME}`);
  console.log(`Target URL      : ${BASE_URL}\n`);

  console.log('[1/4] Connecting to CLZ Cloud to initialize session...');
  const mainPage = await getPage(BASE_URL);

  if (mainPage.status !== 200) {
    throw new Error(`Failed to reach CLZ Cloud (HTTP status ${mainPage.status})`);
  }

  const rawCookies = Array.isArray(mainPage.headers['set-cookie'])
    ? mainPage.headers['set-cookie']
    : [];
  const cookies = rawCookies.map(cookie => cookie.split(';')[0]);
  if (cookies.length === 0) {
    throw new Error('No session cookies received from CLZ Cloud.');
  }

  const csrfMatch = mainPage.body.match(/<meta name="csrf_token" content="([^"]+)"/);
  if (!csrfMatch) {
    throw new Error('Could not find CSRF security token in CLZ Cloud page.');
  }

  const csrfToken = csrfMatch[1];
  console.log('[OK] Session initialized successfully.');

  console.log('\n[2/4] Fetching collection metadata...');
  const page1Res = await fetchLazyLoad(csrfToken, cookies, 1);

  if (page1Res.status !== 200) {
    throw new Error(`Failed to fetch lazyload page 1 (HTTP status ${page1Res.status})`);
  }

  const initialJson = parseJsonBody(page1Res.body, 'page 1');
  const totalCount = Number(initialJson.count);

  if (!totalCount || totalCount <= 0) {
    throw new Error('Collection count is 0 or collection is set to private in your CLZ Cloud settings.');
  }

  const itemsPerPage = 100;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  console.log(`[OK] Found ${totalCount.toLocaleString()} albums across ${totalPages} pages.`);

  console.log('\n[3/4] Crawling collection pages (100 albums per request)...');
  const allItems = [];

  for (let page = 1; page <= totalPages; page++) {
    process.stdout.write(`  -> Fetching page ${page}/${totalPages}... `);

    let res;
    for (let attempts = 1; attempts <= 3; attempts++) {
      try {
        res = await fetchLazyLoad(csrfToken, cookies, page);
        if (res.status === 200) break;
      } catch {
        // Retry below.
      }
      if (attempts < 3) await delay(1000);
    }

    if (!res || res.status !== 200) {
      console.log('failed.');
      throw new Error(`Failed to fetch page ${page}`);
    }

    const json = parseJsonBody(res.body, `page ${page}`);
    const parsed = parseItems(json.html);
    allItems.push(...parsed);

    console.log(`Parsed ${parsed.length} albums. (Total: ${allItems.length}/${totalCount})`);

    if (page < totalPages) {
      await delay(300);
    }
  }

  console.log('\n[4/4] Writing database...');
  const payload = buildCollectionPayload({
    username: CLZ_USERNAME,
    syncedAt: new Date().toISOString(),
    albums: allItems,
  });

  const result = writeCollection(payload);

  console.log('==================================================');
  console.log('  Synchronization completed.');
  console.log('==================================================');
  return result;
}

if (require.main === module) {
  run().catch(err => {
    console.error('\nERROR DURING SYNCHRONIZATION:');
    console.error(err.message || err);
    console.log('\nPlease make sure your collection is set to Public or Partial in CLZ Cloud settings.');
    process.exitCode = 1;
  });
}

module.exports = {
  run,
  parseItems,
  decodeHtml,
  buildCollectionPayload,
};
