const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function loadDashboardContext() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'dashboard.js'), 'utf8');
  const sandbox = {
    document: {
      getElementById: () => ({ textContent: '', addEventListener: () => {} }),
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
    },
    window: {
      addEventListener: () => {},
      location: { href: 'http://localhost/' },
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    setInterval: () => {},
    navigator: {},
    console: { log: () => {}, error: () => {}, warn: () => {} },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
    Date,
    Array,
    Object,
    String,
    Math,
    JSON,
    URL,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return vm.runInContext('({ isWeatherList, CITIES_DB, DEFAULT_WEATHER })', sandbox);
}

test('isWeatherList accepts between 1 and 4 valid cities from CITIES_DB', () => {
  const ctx = loadDashboardContext();
  const { isWeatherList, CITIES_DB, DEFAULT_WEATHER } = ctx;

  assert.equal(isWeatherList(DEFAULT_WEATHER), true, 'default 2-city configuration is accepted');

  const oneCity = [CITIES_DB[0]];
  assert.equal(isWeatherList(oneCity), true, '1 city is accepted');

  const threeCities = [CITIES_DB[0], CITIES_DB[1], CITIES_DB[2]];
  assert.equal(isWeatherList(threeCities), true, '3 cities are accepted');

  const fourCities = [CITIES_DB[0], CITIES_DB[1], CITIES_DB[2], CITIES_DB[3]];
  assert.equal(isWeatherList(fourCities), true, '4 cities are accepted');
});

test('isWeatherList rejects 0 cities or more than 4 cities', () => {
  const ctx = loadDashboardContext();
  const { isWeatherList, CITIES_DB } = ctx;

  assert.equal(isWeatherList([]), false, '0 cities should be rejected');

  const fiveCities = [CITIES_DB[0], CITIES_DB[1], CITIES_DB[2], CITIES_DB[3], CITIES_DB[4]];
  assert.equal(isWeatherList(fiveCities), false, '5 cities should be rejected');
});

test('isWeatherList rejects non-array or invalid city objects', () => {
  const ctx = loadDashboardContext();
  const { isWeatherList } = ctx;

  assert.equal(isWeatherList(null), false, 'null should be rejected');
  assert.equal(isWeatherList(undefined), false, 'undefined should be rejected');
  assert.equal(isWeatherList('Madrid'), false, 'string should be rejected');
  assert.equal(isWeatherList([{ name: 'Atlantis' }]), false, 'unknown city name should be rejected');
  assert.equal(isWeatherList([{ name: 'Madrid' }, null]), false, 'list with null entry should be rejected');
});

test('index.html specifies up to 4 weather cities in drawer title and counter', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(html, /Choose up to 4 Weather Cities/, 'drawer title should indicate up to 4 cities');
  assert.match(html, /id="weather-limit-info">Selected: \d\/4</, 'limit counter should show /4');
});
