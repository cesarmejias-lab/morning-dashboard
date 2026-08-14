const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const SW_SOURCE = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const SCOPE = 'https://cesarmejias-lab.github.io/morning-dashboard/';

// Loads sw.js in a fake ServiceWorkerGlobalScope and reports how one request
// was handled: which store was consulted first, and whether it was cached.
function route(url, mode = 'no-cors') {
  const calls = [];
  const handlers = {};
  const response = { ok: true, clone: () => response };

  const sandbox = {
    URL,
    Promise,
    console,
    Request: class { constructor(u, o) { this.url = u; Object.assign(this, o); } },
    Response: { error: () => ({ networkError: true }) },
    fetch: () => { calls.push('fetch'); return Promise.resolve(response); },
    caches: {
      open: () => Promise.resolve({ put: () => { calls.push('put'); return Promise.resolve(); } }),
      match: () => { calls.push('match'); return Promise.resolve(null); },
      keys: () => Promise.resolve([]),
      delete: () => Promise.resolve(true),
    },
  };
  sandbox.self = {
    addEventListener: (name, fn) => { handlers[name] = fn; },
    location: { origin: new URL(SCOPE).origin },
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve() },
  };

  vm.createContext(sandbox);
  vm.runInContext(SW_SOURCE, sandbox);

  let responded;
  let intercepted = false;
  handlers.fetch({
    request: { url, method: 'GET', mode },
    respondWith: (promise) => { intercepted = true; responded = promise; },
  });

  if (!intercepted) return Promise.resolve({ strategy: 'bypass', calls });
  return Promise.resolve(responded)
    .catch(() => null)
    .then(() => ({ strategy: calls[0] === 'fetch' ? 'network-first' : 'cache-first', calls }));
}

test('Todoist requests bypass the service worker entirely', async () => {
  const result = await route('https://api.todoist.com/api/v1/tasks');
  assert.equal(result.strategy, 'bypass', 'personal task data must not be intercepted');
  assert.deepEqual(result.calls, [], 'and must not touch the cache at all');
});

test('the app shell is served network-first on navigation', async () => {
  for (const url of [SCOPE + 'dashboard.js?v=1', SCOPE + 'styles.css', SCOPE + 'index.html']) {
    const result = await route(url, 'navigate');
    assert.equal(result.strategy, 'network-first', `${url} must not be served from cache first`);
  }
});

// The `navigate` mode alone forces network-first, regardless of APP_SHELL, so
// the previous test cannot tell us whether the pathname regex itself is
// correct. This pins the actual property the task exists to protect: a
// `?v=…` query string must not defeat the APP_SHELL match against
// `url.pathname` when the request is not a navigation.
test('the app shell is served network-first by pathname, independent of query string or navigate mode', async () => {
  for (const url of [SCOPE + 'dashboard.js?v=1', SCOPE + 'styles.css', SCOPE + 'index.html']) {
    const result = await route(url);
    assert.equal(result.strategy, 'network-first', `${url} must not be served from cache first`);
  }
});

test('weather-verdict.js, todoist.js and clz-radar.js are served network-first as app code', async () => {
  for (const file of ['weather-verdict.js', 'todoist.js', 'clz-radar.js']) {
    const result = await route(SCOPE + file);
    assert.equal(result.strategy, 'network-first', `${file} carries code and must stay fresh`);
  }
});

test('static assets stay cache-first', async () => {
  for (const file of ['icon-192.png', 'manifest.json', 'music-collection.json']) {
    const result = await route(SCOPE + file);
    assert.equal(result.strategy, 'cache-first', `${file} should be served from cache first`);
  }
});

test('other APIs remain network-first', async () => {
  const result = await route('https://api.open-meteo.com/v1/forecast?x=1', 'cors');
  assert.equal(result.strategy, 'network-first');
});
