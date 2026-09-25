const fs = require('fs');
const path = require('path');
const https = require('https');
const { parseDetailMetadata, mergeAlbumMetadata } = require('../clz-sync-metadata');
const { normalizeCollection } = require('../clz-radar');

const COLLECTION_FILE = path.join(__dirname, '..', 'music-collection.json');
const CLZ_USERNAME = process.env.CLZ_USERNAME || 'cesarmejias';
const BASE_URL = `https://cloud.clz.com/${encodeURIComponent(CLZ_USERNAME)}/music`;

const agent = new https.Agent({ keepAlive: true, maxSockets: 5 });

function httpsGet(urlOrOptions) {
  return new Promise((resolve, reject) => {
    const isString = typeof urlOrOptions === 'string';
    const opts = isString ? { agent } : { agent, ...urlOrOptions };
    const getFn = isString ? (url, cb) => https.get(url, opts, cb) : (cb) => https.get(opts, cb);

    const req = isString ? getFn(urlOrOptions, onResponse) : getFn(onResponse);

    function onResponse(res) {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }

    req.setTimeout(25000, () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCookies() {
  const res = await httpsGet({
    hostname: 'cloud.clz.com',
    port: 443,
    path: `/${encodeURIComponent(CLZ_USERNAME)}/music`,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  return (res.headers['set-cookie'] || []).map(c => c.split(';')[0]);
}

async function fetchDetail(albumId, cookies) {
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

async function main() {
  const args = process.argv.slice(2);
  let limit = 150;
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10) || 150;
  }
  if (args.includes('--all')) limit = Infinity;

  console.log(`[1] Reading ${COLLECTION_FILE}...`);
  const raw = fs.readFileSync(COLLECTION_FILE, 'utf8');
  const collection = JSON.parse(raw);
  const albums = collection.albums || [];

  const targets = albums.filter(a => !a.format);
  console.log(`Total albums: ${albums.length}. Albums without format: ${targets.length}`);

  const toProcess = targets.slice(0, limit);
  console.log(`Enriching up to ${toProcess.length} albums...`);

  console.log('[2] Initializing CLZ session...');
  const cookies = await getCookies();
  console.log('Session initialized.');

  let enrichedCount = 0;
  const formatCounts = {};
  const checkedAt = new Date().toISOString();

  const chunkSize = 5;
  for (let i = 0; i < toProcess.length; i += chunkSize) {
    const chunk = toProcess.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(async album => {
        try {
          const res = await fetchDetail(album.id, cookies);
          if (res.status === 200) {
            const meta = parseDetailMetadata(res.body);
            return { album, meta, ok: true };
          }
          return { album, meta: {}, ok: false };
        } catch (err) {
          return { album, meta: {}, ok: false };
        }
      })
    );

    chunkResults.forEach(({ album, meta, ok }) => {
      const merged = mergeAlbumMetadata(album, meta, checkedAt);
      Object.assign(album, merged);
      if (album.format) {
        formatCounts[album.format] = (formatCounts[album.format] || 0) + 1;
      }
      enrichedCount++;
    });

    const progress = Math.min(i + chunkSize, toProcess.length);
    process.stdout.write(`\rProgress: ${progress}/${toProcess.length} (${Object.entries(formatCounts).map(([k, v]) => `${k}:${v}`).join(', ') || 'processing...'})`);

    // Save every 50 albums
    if (progress % 50 === 0 || progress === toProcess.length) {
      const normalized = normalizeCollection({
        ...collection,
        syncedAt: checkedAt,
        albums,
      });
      fs.writeFileSync(COLLECTION_FILE, JSON.stringify(normalized, null, 2) + '\n');
    }

    await delay(100);
  }

  console.log('\n\nEnrichment finished!');
  console.log('Format summary of enriched batch:');
  console.table(formatCounts);
}

main().catch(err => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});
