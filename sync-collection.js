/**
 * sync-collection.js
 * 
 * This script crawls your CLZ Cloud Music Collection, parses all of your releases,
 * and saves them to a local JSON file (`music-collection.json`).
 * The Morning Dashboard will load this JSON file to recommend a random album on every refresh.
 * 
 * Usage:
 *   node sync-collection.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CLZ_USERNAME = 'cesarmejias';
const BASE_URL = `https://cloud.clz.com/${CLZ_USERNAME}/music`;
const LAZYLOAD_URL = `https://cloud.clz.com/${CLZ_USERNAME}/music/lazyload`;
const OUTPUT_FILE = path.join(__dirname, 'music-collection.json');

// Helper to make a standard GET request
function getPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

// Helper to make the authenticated/session GET request for lazyloading pages
function fetchLazyLoad(csrfToken, cookies, page = 1) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cloud.clz.com',
      port: 443,
      path: `/${CLZ_USERNAME}/music/lazyload?page=${page}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookies.join('; ')
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

// Robust regex-based HTML parser for album items
function parseItems(html) {
  const items = [];
  // Split the HTML content by card containers
  const parts = html.split('class="item item-card"');
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    // Extract Album ID
    const relMatch = part.match(/^\s*rel="([^"]+)"/);
    if (!relMatch) continue;
    const id = relMatch[1];

    // Extract Title
    const titleMatch = part.match(/<div class="item-title">[\s\S]*?class="detail-link">([\s\S]*?)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim()
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>') : 'Unknown Title';

    // Extract Artist
    const artistMatch = part.match(/<div class="item-artist one-line">([\s\S]*?)<\/div>/);
    const artist = artistMatch ? artistMatch[1].trim()
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>') : 'Unknown Artist';

    // Extract Year
    const yearMatch = part.match(/<span class="item-date">([\s\S]*?)<\/span>/);
    const year = yearMatch ? yearMatch[1].trim() : '';

    // Extract Cover Image URL
    const coverMatch = part.match(/<img[^>]*data-src="([^"]+)"/);
    const cover = coverMatch ? coverMatch[1] : '';

    items.push({ id, title, artist, year, cover });
  }
  return items;
}

async function run() {
  console.log('==================================================');
  console.log('  CLZ CLOUD MUSIC SYNCHRONIZER');
  console.log('==================================================');
  console.log(`Target username : ${CLZ_USERNAME}`);
  console.log(`Target URL      : ${BASE_URL}\n`);

  try {
    console.log('[1/4] Connecting to CLZ Cloud to initialize session...');
    const mainPage = await getPage(BASE_URL);
    
    if (mainPage.status !== 200) {
      throw new Error(`Failed to reach CLZ Cloud (HTTP status ${mainPage.status})`);
    }

    // Extract session cookies
    const rawCookies = mainPage.headers['set-cookie'] || [];
    const cookies = rawCookies.map(c => c.split(';')[0]);
    if (cookies.length === 0) {
      throw new Error('No session cookies received from CLZ Cloud.');
    }

    // Extract CSRF Token
    const csrfMatch = mainPage.body.match(/<meta name="csrf_token" content="([^"]+)"/);
    if (!csrfMatch) {
      throw new Error('Could not find CSRF security token in CLZ Cloud page.');
    }
    const csrfToken = csrfMatch[1];
    
    console.log('✔ Session initialized successfully.');

    console.log('\n[2/4] Fetching collection metadata...');
    const page1Res = await fetchLazyLoad(csrfToken, cookies, 1);
    
    if (page1Res.status !== 200) {
      throw new Error(`Failed to fetch lazyload page 1 (HTTP status ${page1Res.status})`);
    }
    
    const initialJson = JSON.parse(page1Res.body);
    const totalCount = initialJson.count;
    
    if (!totalCount || totalCount <= 0) {
      throw new Error('Collection count is 0 or collection is set to private in your CLZ Cloud settings.');
    }
    
    const itemsPerPage = 100;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    console.log(`✔ Found ${totalCount.toLocaleString()} albums across ${totalPages} pages.`);

    console.log('\n[3/4] Crawling collection pages (100 albums per request)...');
    const allItems = [];
    
    for (let page = 1; page <= totalPages; page++) {
      process.stdout.write(`  → Fetching page ${page}/${totalPages}... `);
      
      let attempts = 0;
      let res;
      while (attempts < 3) {
        try {
          res = await fetchLazyLoad(csrfToken, cookies, page);
          if (res.status === 200) break;
        } catch (e) {
          // Retry
        }
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
      }

      if (!res || res.status !== 200) {
        console.log('❌ Failed after retries.');
        throw new Error(`Failed to fetch page ${page}`);
      }

      const json = JSON.parse(res.body);
      const parsed = parseItems(json.html);
      allItems.push(...parsed);
      
      console.log(`Parsed ${parsed.length} albums. (Total: ${allItems.length}/${totalCount})`);

      // Polite rate limit delay (300ms) between requests to avoid triggering security bans
      if (page < totalPages) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    console.log('\n[4/4] Writing database to files...');
    const payload = {
      username: CLZ_USERNAME,
      syncedAt: new Date().toISOString(),
      total: allItems.length,
      albums: allItems
    };

    // 1. Save as JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`✔ Success! Saved JSON to:`);
    console.log(`  ${OUTPUT_FILE}`);

    // 2. Save as JS to support local file:/// CORS bypassing
    const OUTPUT_JS_FILE = path.join(__dirname, 'music-collection.js');
    const jsPayload = `window.CLZ_MUSIC_COLLECTION = ${JSON.stringify(payload, null, 2)};`;
    fs.writeFileSync(OUTPUT_JS_FILE, jsPayload, 'utf8');
    console.log(`✔ Success! Saved JS to:`);
    console.log(`  ${OUTPUT_JS_FILE}\n`);
    console.log('==================================================');
    console.log('  Sychronization completed! Enjoy your Dashboard.');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ ERROR DURING SYNCHRONIZATION:');
    console.error(err.message || err);
    console.log('\nPlease make sure your collection is set to Public or Partial in CLZ Cloud settings.');
    process.exit(1);
  }
}

run();
