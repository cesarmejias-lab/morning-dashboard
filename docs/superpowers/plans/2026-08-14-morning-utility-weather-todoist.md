# Morning Utility: Weather Verdict + Todoist Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dashboard's top row operational — answer "do I need an umbrella today?" inside the existing Weather card, and show today's plus overdue Todoist tasks in the slot freed by Exchange Rates.

**Architecture:** Two new pure-logic modules (`weather-verdict.js`, `todoist.js`) following the existing `clz-radar.js` dual-export pattern, unit-tested with `node:test`. `dashboard.js` gains only network and render layers. Exchange Rates is removed entirely. `api.todoist.com` is excluded from the service worker so personal task data is neither cached to disk nor served stale.

**Tech Stack:** Vanilla JS (no build step, no dependencies), `node:test` for tests, Open-Meteo API, Todoist API v1, GitHub Pages static hosting.

**Spec:** `docs/superpowers/specs/2026-08-14-morning-utility-weather-todoist-design.md`

## Global Constraints

- **No dependencies, no build step.** Plain browser JS loaded via `<script>` tags. Node is used only to run tests.
- **Module pattern:** every new logic module uses the dual-export wrapper from `clz-radar.js` — `module.exports` when CommonJS is present, otherwise a global on `globalThis`.
- **Pure logic modules take no clock and no DOM.** Time references are injected as strings.
- **New UI copy is Spanish, exactly as the spec writes it** (decided by Cesar on 2026-08-14, superseding this plan's original English choice). Every string this plan introduces — the weather verdict line and the whole Todoist card — is Spanish, and follows the spec's examples verbatim where the spec gives one: `☂ Paraguas: sí — 70% entre las 17:00 y las 20:00 · sensación máx 24° · anochece 21:34`, `Sin lluvia hoy · …`, `Tareas — 2 atrasadas · 5 para hoy`. Pre-existing English strings ("Weather", "feels like", "Updated", "Refresh", other card titles) are **not** translated — that is out of scope. The verdict wording stays isolated in the `COPY` constant inside `weather-verdict.js`. Every code block below already carries the Spanish strings; use them verbatim rather than re-translating.
- **Umbrella thresholds:** `yes` at probability ≥ 50, `maybe` at 30–49, `no` below 30. Passed in as a parameter, never hardcoded inside logic branches.
- **Todoist is read-only.** No `POST`, `PUT`, or `DELETE` to `api.todoist.com` anywhere in the codebase.
- **Todoist endpoints:** `https://api.todoist.com/api/v1/tasks` and `/api/v1/projects`, both GET only. The `rest/v2` API returns `410 Gone` and must not be used.
- **Escaping:** all task content through `escapeHtml()`, all links through `safeUrl()`. Both already exist in `dashboard.js`.
- **The Todoist token is never re-rendered** into the page after being saved, and the input is `type="password"`.
- **Every `sw.js` change bumps `CACHE_NAME`**, otherwise the old cache is not purged.
- **Every `?v=…`-versioned asset bumps its query string in the same commit.** Whenever a file referenced from `index.html` with a cache-busting `?v=…` query string changes, that query string must be bumped in the same commit, or a returning visitor's HTTP cache can serve the old file against new HTML.
- `npm test` and `npm run check` must pass at the end of every task.

---

### Task 1: Remove Exchange Rates

Frees the third slot in the top row and removes the Frankfurter dependency. Nothing new is added yet — the grid intentionally has a gap after this task.

**Files:**
- Modify: `index.html:93-97` (the rates card)
- Modify: `dashboard.js:326-349` (`fetchRates`, `renderRates`), `dashboard.js:911` (skeleton call), `dashboard.js:924-926` (refresh entry), `dashboard.js:1070-1083` (`renderRatesSkeleton`)
- Modify: `sw.js` (remove `frankfurter.dev` from the API host list)
- Modify: `styles.css:202-215` (rates rules)
- Modify: `README.md:3` (feature list)

**Interfaces:**
- Consumes: nothing
- Produces: an empty third slot in the top grid row, which Task 6 fills with the Todoist card

- [ ] **Step 1: Confirm the current suite passes before changing anything**

Run: `npm test`
Expected: PASS, 17 tests. This is the baseline — if it already fails, stop and report.

- [ ] **Step 2: Remove the rates card from the markup**

In `index.html`, delete these five lines:

```html
  <!-- Rates -->
  <div class="card" id="rates-card">
    <div class="card-title">Exchange Rates &mdash; EUR Base</div>
    <div class="placeholder">Fetching rates&hellip;</div>
  </div>
```

- [ ] **Step 3: Remove the rates functions from dashboard.js**

Delete the whole `// ── Exchange rates ──` section (`fetchRates` and `renderRates`, lines 326-349), and delete `renderRatesSkeleton` (lines 1070-1083).

- [ ] **Step 4: Remove the two calls to those functions**

In `refresh()`, delete the skeleton call:

```js
  renderRatesSkeleton();
```

and delete this entry from the `Promise.allSettled([...])` array:

```js
    fetchRates().then(renderRates).catch(() => {
      setCardMessage('rates-card', 'Exchange Rates', 'Failed to load rates.');
    }),
```

- [ ] **Step 5: Remove the Frankfurter host from the service worker**

In `sw.js`, the API host check becomes:

```js
  const isApiRequest = url.hostname.includes('open-meteo.com') ||
                       url.hostname.includes('firebaseio.com') ||
                       url.hostname.includes('discogs.com');
```

- [ ] **Step 6: Bump the cache name**

In `sw.js`:

```js
const CACHE_NAME = 'morning-dashboard-v5';
```

- [ ] **Step 7: Remove the rates CSS**

In `styles.css`, delete the `.rates-grid`, `.rate-item`, `.rate-pair`, and `.rate-value` rules (lines 202-215).

- [ ] **Step 8: Update the README feature list**

`README.md` line 3 becomes:

```markdown
A static morning dashboard with weather, world clocks, Hacker News, Discogs, Todoist tasks, and a Daily Collection Radar recommendation from a CLZ Music collection.
```

- [ ] **Step 9: Verify nothing references rates any more**

Run: `grep -rn "rates\|frankfurter\|Rates" index.html dashboard.js sw.js styles.css README.md`
Expected: no output. Any hit is a leftover — remove it.

- [ ] **Step 10: Verify syntax and tests**

Run: `npm run check`
Expected: PASS, 17 tests.

- [ ] **Step 11: Commit**

```bash
git add index.html dashboard.js sw.js styles.css README.md
git commit -m "Remove Exchange Rates card to free the top-row slot"
```

---

### Task 2: weather-verdict.js module

Pure logic only. No DOM, no network, no `Date`. The Weather card is not touched in this task.

The key design decision: all time comparison is **lexicographic on fixed-width ISO strings** taken from the API response, which is already in the requested city's timezone. Open-Meteo returns `current.time` as `"2026-08-14T13:00"`, `hourly.time[i]` as `"2026-08-14T00:00"`, and `daily.time[0]` as `"2026-08-14"` — all city-local. Using the browser clock instead would produce a wrong rain window whenever the active weather tab is a city in another timezone.

**Files:**
- Create: `weather-verdict.js`
- Create: `tests/weather-verdict.test.js`
- Modify: `package.json` (add the module to the `check` script)

**Interfaces:**
- Consumes: nothing
- Produces: global `WeatherVerdict` in the browser / `require('../weather-verdict')` in tests, exposing:
  - `DEFAULT_THRESHOLDS` → `{ yes: 50, maybe: 30 }`
  - `buildVerdict({ data, nowLocal, thresholds })` → `{ umbrella: 'yes'|'maybe'|'no', maxProbability: number|null, window: { from: string, to: string }|null, sunrise: string|null, sunset: string|null, feelsLike: { max: number|null, min: number|null }, degraded: boolean }`
  - `formatVerdict(verdict)` → `{ headline: string, details: string[] }`

- [ ] **Step 1: Write the failing tests**

Create `tests/weather-verdict.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildVerdict, formatVerdict, DEFAULT_THRESHOLDS } = require('../weather-verdict');

// Helper: a response shaped like Open-Meteo's, with hourly probabilities for today
function fixture(probabilities, overrides = {}) {
  const hours = probabilities.map((_, i) => `2026-08-14T${String(i).padStart(2, '0')}:00`);
  return Object.assign({
    current: { time: '2026-08-14T09:00' },
    daily: {
      time: ['2026-08-14', '2026-08-15'],
      precipitation_probability_max: [Math.max(...probabilities.map(p => Number(p) || 0)), 0],
      sunrise: ['2026-08-14T07:24', '2026-08-15T07:25'],
      sunset: ['2026-08-14T21:14', '2026-08-15T21:13'],
      apparent_temperature_max: [35.6, 34.0],
      apparent_temperature_min: [21.7, 21.0],
    },
    hourly: { time: hours, precipitation_probability: probabilities },
  }, overrides);
}

// 24 hours, all dry
const DRY = Array(24).fill(0);

test('classifies as yes at the exact 50 threshold', () => {
  const probs = DRY.slice();
  probs[15] = 50;
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.umbrella, 'yes');
  assert.equal(verdict.maxProbability, 50);
});

test('classifies as maybe at the exact 30 threshold', () => {
  const probs = DRY.slice();
  probs[15] = 30;
  assert.equal(buildVerdict({ data: fixture(probs) }).umbrella, 'maybe');
});

test('classifies as no just below the maybe threshold', () => {
  const probs = DRY.slice();
  probs[15] = 29;
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.umbrella, 'no');
  assert.equal(verdict.window, null);
});

test('reports the first contiguous window at or above the maybe threshold', () => {
  const probs = DRY.slice();
  probs[17] = 60; probs[18] = 70; probs[19] = 65; probs[20] = 55;
  probs[22] = 80; // a later, separate burst that must be ignored
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.deepEqual(verdict.window, { from: '17:00', to: '20:00' });
});

test('ignores rain that already happened before the reference hour', () => {
  const probs = DRY.slice();
  probs[3] = 90; // rained at 03:00, reference time is 09:00
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.window, null);
  assert.equal(verdict.umbrella, 'no', 'the verdict must reflect the rest of the day, not the whole day');
  assert.equal(verdict.maxProbability, 0);
});

test('handles a window that runs to the end of the day', () => {
  const probs = DRY.slice();
  probs[22] = 55; probs[23] = 60;
  assert.deepEqual(buildVerdict({ data: fixture(probs) }).window, { from: '22:00', to: '23:00' });
});

test('skips non-numeric probabilities without breaking', () => {
  const probs = DRY.slice();
  probs[17] = 60; probs[18] = null; probs[19] = 65;
  const verdict = buildVerdict({ data: fixture(probs) });
  assert.equal(verdict.umbrella, 'yes');
  assert.deepEqual(verdict.window, { from: '17:00', to: '19:00' });
});

test('degrades to the daily maximum when the hourly series is missing', () => {
  const data = fixture(DRY);
  delete data.hourly;
  data.daily.precipitation_probability_max = [70, 0];
  const verdict = buildVerdict({ data });
  assert.equal(verdict.degraded, true);
  assert.equal(verdict.umbrella, 'yes');
  assert.equal(verdict.maxProbability, 70);
  assert.equal(verdict.window, null);
});

test('exposes sunrise, sunset and apparent temperatures as labels and numbers', () => {
  const verdict = buildVerdict({ data: fixture(DRY) });
  assert.equal(verdict.sunrise, '07:24');
  assert.equal(verdict.sunset, '21:14');
  assert.equal(verdict.feelsLike.max, 35.6);
  assert.equal(verdict.feelsLike.min, 21.7);
});

test('omits missing sunrise and sunset instead of throwing', () => {
  const data = fixture(DRY);
  delete data.daily.sunrise;
  delete data.daily.sunset;
  const verdict = buildVerdict({ data });
  assert.equal(verdict.sunrise, null);
  assert.equal(verdict.sunset, null);
});

test('falls back to the injected reference time when current is absent', () => {
  const probs = DRY.slice();
  probs[10] = 80;
  const data = fixture(probs);
  delete data.current;
  const verdict = buildVerdict({ data, nowLocal: '2026-08-14T12:00' });
  assert.equal(verdict.window, null, 'the 10:00 burst is in the past relative to 12:00');
});

test('accepts custom thresholds', () => {
  const probs = DRY.slice();
  probs[15] = 20;
  const verdict = buildVerdict({ data: fixture(probs), thresholds: { yes: 20, maybe: 10 } });
  assert.equal(verdict.umbrella, 'yes');
});

test('survives a completely empty payload', () => {
  const verdict = buildVerdict({ data: {} });
  assert.equal(verdict.umbrella, 'no');
  assert.equal(verdict.maxProbability, null);
  assert.equal(verdict.window, null);
  assert.equal(verdict.degraded, true);
});

test('formatVerdict names the window when there is rain ahead', () => {
  const probs = DRY.slice();
  probs[17] = 70; probs[18] = 70;
  const out = formatVerdict(buildVerdict({ data: fixture(probs) }));
  assert.match(out.headline, /Paraguas: sí/);
  assert.ok(out.details.some(d => d.includes('17:00') && d.includes('18:00')));
});

test('formatVerdict states a dry day without inventing a window', () => {
  const out = formatVerdict(buildVerdict({ data: fixture(DRY) }));
  assert.match(out.headline, /Sin lluvia hoy/);
  assert.ok(out.details.every(d => !d.includes('entre las')));
});

test('DEFAULT_THRESHOLDS are the documented values', () => {
  assert.deepEqual(DEFAULT_THRESHOLDS, { yes: 50, maybe: 30 });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/weather-verdict.test.js`
Expected: FAIL — `Cannot find module '../weather-verdict'`.

- [ ] **Step 3: Write the module**

Create `weather-verdict.js`:

```js
(function initWeatherVerdict(root, factory) {
  const api = factory();
  const isCommonJS = typeof module === 'object' && module.exports;
  if (isCommonJS) {
    module.exports = api;
  } else if (root) {
    root.WeatherVerdict = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : null, function createWeatherVerdict() {
  const DEFAULT_THRESHOLDS = { yes: 50, maybe: 30 };

  // Spanish, per the spec's UX examples. The only place the verdict wording lives.
  const COPY = {
    umbrellaYes: '☂ Paraguas: sí',
    umbrellaMaybe: '☂ Paraguas: quizá',
    dry: 'Sin lluvia hoy',
  };

  // "2026-08-14T07:24" -> "07:24"
  function hourLabel(value) {
    return typeof value === 'string' && value.length >= 16 ? value.slice(11, 16) : null;
  }

  function firstLabel(list) {
    return Array.isArray(list) ? hourLabel(list[0]) : null;
  }

  function firstNumber(list) {
    const value = Array.isArray(list) ? Number(list[0]) : NaN;
    return Number.isFinite(value) ? value : null;
  }

  function classify(probability, thresholds) {
    if (!Number.isFinite(probability)) return 'no';
    if (probability >= thresholds.yes) return 'yes';
    if (probability >= thresholds.maybe) return 'maybe';
    return 'no';
  }

  // Single pass over today's remaining hours. Returns the highest probability
  // still ahead of us and the first contiguous run at or above minProbability.
  // All comparisons are lexicographic on fixed-width ISO strings, which are
  // already in the requested city's timezone — no Date, no timezone maths.
  function scanRemainingToday(data, nowLocal, minProbability) {
    const hourly = data && data.hourly;
    const daily = data && data.daily;
    if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.precipitation_probability)) return null;
    if (!daily || !Array.isArray(daily.time) || typeof daily.time[0] !== 'string') return null;

    const today = daily.time[0];
    let remainingMax = null;
    let start = null;
    let end = null;
    let closed = false;

    for (let i = 0; i < hourly.time.length; i++) {
      const time = hourly.time[i];
      if (typeof time !== 'string' || time.slice(0, 10) !== today) continue;
      if (nowLocal && time < nowLocal) continue;

      // Open-Meteo uses null for gaps in the series. Treat it as unknown and
      // skip it — note Number(null) is 0, so coercing first would silently
      // read a gap as "dry" and cut a rain window in half.
      const rawProbability = hourly.precipitation_probability[i];
      if (rawProbability === null || rawProbability === undefined || rawProbability === '') continue;

      const probability = Number(rawProbability);
      if (!Number.isFinite(probability)) continue;

      if (remainingMax === null || probability > remainingMax) remainingMax = probability;

      if (!closed) {
        if (probability >= minProbability) {
          if (start === null) start = time;
          end = time;
        } else if (start !== null) {
          closed = true;
        }
      }
    }

    return {
      remainingMax,
      window: start === null ? null : { from: hourLabel(start), to: hourLabel(end) },
    };
  }

  function buildVerdict(options) {
    const opts = options || {};
    const data = opts.data || {};
    const thresholds = Object.assign({}, DEFAULT_THRESHOLDS, opts.thresholds || {});
    const daily = data.daily || {};
    const nowLocal = opts.nowLocal || (data.current && data.current.time) || null;

    const scan = scanRemainingToday(data, nowLocal, thresholds.maybe);
    const degraded = scan === null;

    const probability = degraded
      ? firstNumber(daily.precipitation_probability_max)
      : scan.remainingMax;

    return {
      umbrella: classify(probability, thresholds),
      maxProbability: Number.isFinite(probability) ? probability : null,
      window: degraded ? null : scan.window,
      sunrise: firstLabel(daily.sunrise),
      sunset: firstLabel(daily.sunset),
      feelsLike: {
        max: firstNumber(daily.apparent_temperature_max),
        min: firstNumber(daily.apparent_temperature_min),
      },
      degraded,
    };
  }

  function formatVerdict(verdict) {
    const v = verdict || {};
    const details = [];

    let headline = COPY.dry;
    if (v.umbrella === 'yes') headline = COPY.umbrellaYes;
    else if (v.umbrella === 'maybe') headline = COPY.umbrellaMaybe;

    if (v.umbrella !== 'no' && Number.isFinite(v.maxProbability)) {
      details.push(v.window
        ? `${v.maxProbability}% entre las ${v.window.from} y las ${v.window.to}`
        : `${v.maxProbability}% de probabilidad hoy`);
    }

    if (v.feelsLike && Number.isFinite(v.feelsLike.max)) {
      details.push(`sensación máx ${Math.round(v.feelsLike.max)}°`);
    }

    if (v.sunset) details.push(`anochece ${v.sunset}`);

    return { headline, details };
  }

  return { DEFAULT_THRESHOLDS, buildVerdict, formatVerdict };
}));
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/weather-verdict.test.js`
Expected: PASS, 16 tests.

- [ ] **Step 5: Add the module to the syntax check**

In `package.json`, the `check` script gains `node --check weather-verdict.js &&` immediately after the `clz-radar.js` check.

- [ ] **Step 6: Run the full gate**

Run: `npm run check`
Expected: PASS, 33 tests.

- [ ] **Step 7: Commit**

```bash
git add weather-verdict.js tests/weather-verdict.test.js package.json
git commit -m "Add weather verdict module: umbrella state and rain window"
```

---

### Task 3: Show the verdict in the Weather card

**Files:**
- Modify: `dashboard.js:181-185` (the Open-Meteo URL), `dashboard.js:260-274` (the render template)
- Modify: `index.html:125` (add the script tag)
- Modify: `styles.css` (add the verdict rules)

**Interfaces:**
- Consumes: `WeatherVerdict.buildVerdict`, `WeatherVerdict.formatVerdict` from Task 2
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Request the extra fields from Open-Meteo**

In `fetchWeather()`, the URL becomes:

```js
    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${city.lat}&longitude=${city.lon}`
      + `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
      + `,sunrise,sunset,apparent_temperature_max,apparent_temperature_min`
      + `&hourly=precipitation_probability`
      + `&timezone=${encodeURIComponent(city.tz)}&forecast_days=5`;
```

`apparent_temperature_max` and `apparent_temperature_min` are required because the existing request only asks for `apparent_temperature` inside `current` — the day's high and low "feels like" cannot be derived from it.

- [ ] **Step 2: Load the module before dashboard.js**

In `index.html`, immediately before the `dashboard.js` script tag:

```html
<script src="./weather-verdict.js?v=20260814-verdict"></script>
```

- [ ] **Step 3: Add a helper that renders the verdict line**

In `dashboard.js`, directly above `renderWeather()`:

```js
function weatherVerdictHtml(data) {
  const api = typeof WeatherVerdict === 'undefined' ? null : WeatherVerdict;
  if (!api) return '';

  // A malformed payload must never stop the current conditions from rendering.
  let parts;
  try {
    parts = api.formatVerdict(api.buildVerdict({ data }));
  } catch (e) {
    console.error('Weather verdict failed:', e);
    return '';
  }

  const detail = parts.details.length
    ? `<span class="w-verdict-detail">${escapeHtml(parts.details.join(' · '))}</span>`
    : '';

  return `<div class="w-verdict">
    <span class="w-verdict-headline">${escapeHtml(parts.headline)}</span>
    ${detail}
  </div>`;
}
```

- [ ] **Step 4: Insert the line into the template**

In `renderWeather()`, the assignment becomes — note `weatherVerdictHtml(data)` as the first child of the wrapper:

```js
  bodyContainer.innerHTML = `
    <div class="weather-fade-wrapper">
      ${weatherVerdictHtml(data)}
      <div class="w-current">
        <div class="w-icon">${escapeHtml(icon)}</div>
        <div>
          <div class="w-temp">${Math.round(c.temperature_2m)}°C</div>
          <div class="w-desc">${escapeHtml(desc)} &mdash; feels like ${Math.round(c.apparent_temperature)}°C</div>
        </div>
      </div>
      <div class="w-stats">
        <span>💧 Humidity ${c.relativehumidity_2m}%</span>
        <span>💨 Wind ${Math.round(c.windspeed_10m)} km/h</span>
      </div>
      <div class="forecast">${forecastHTML}</div>
    </div>`;
```

- [ ] **Step 5: Style the line**

In `styles.css`, next to the other `.w-` rules (after `.w-stats`, around line 122):

```css
    .w-verdict {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px;
      padding: 8px 10px;
      margin-bottom: 12px;
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: 4px;
      background: var(--surface2);
    }
    .w-verdict-headline { font-size: 0.9rem; font-weight: 600; }
    .w-verdict-detail   { font-size: 0.78rem; color: var(--muted); }
```

- [ ] **Step 6: Verify the gate still passes**

Run: `npm run check`
Expected: PASS, 33 tests. No test covers the DOM, so this only confirms nothing was broken syntactically.

- [ ] **Step 7: Verify in the browser**

Run: `npm run dev`, open `http://127.0.0.1:4173/`, and hard-refresh twice (the first reload activates the new service worker, the second serves fresh files).

Check all of the following:
- The verdict line appears above the current conditions.
- Switching the weather tab to the other city updates the line.
- With DevTools open, the Open-Meteo request URL contains `hourly=precipitation_probability`.
- The current conditions and the 5-day forecast still render exactly as before.

- [ ] **Step 8: Commit**

```bash
git add dashboard.js index.html styles.css
git commit -m "Show umbrella verdict and rain window in the Weather card"
```

---

### Task 4: todoist.js module

Pure logic only. No network. Written before any fetch code exists, so the response shape is pinned down by tests first.

**Files:**
- Create: `todoist.js`
- Create: `tests/todoist.test.js`
- Modify: `package.json` (add the module to the `check` script)

**Interfaces:**
- Consumes: nothing
- Produces: global `TodoistTasks` / `require('../todoist')`, exposing:
  - `normalizeTask(raw)` → `{ id: string, content: string, date: string, time: string|null, priority: number, projectId: string|null, url: string|null }` or `null` when unusable
  - `partitionTasks(tasks, todayISO)` → `{ overdue: task[], dueToday: task[] }`, each already sorted
  - `sortForMorning(tasks)` → sorted copy (does not mutate)
  - `buildProjectNames(payload)` → `{ [projectId: string]: string }`, always an object. A task carries only a `project_id`; the card shows a name, so this builds the lookup from the projects endpoint.

Note on Todoist priority: `4` is urgent and `1` is normal, so descending priority means highest first.

- [ ] **Step 1: Write the failing tests**

Create `tests/todoist.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeTask, partitionTasks, sortForMorning, buildProjectNames } = require('../todoist');

const TODAY = '2026-08-14';

function raw(overrides = {}) {
  return Object.assign({
    id: '7001',
    content: 'Review the framework contract',
    due: { date: TODAY, datetime: null },
    priority: 1,
    project_id: '220',
    url: 'https://app.todoist.com/app/task/7001',
  }, overrides);
}

test('normalizeTask projects the fields the card needs', () => {
  const task = normalizeTask(raw({ due: { date: TODAY, datetime: `${TODAY}T09:30:00` } }));
  assert.equal(task.id, '7001');
  assert.equal(task.content, 'Review the framework contract');
  assert.equal(task.date, TODAY);
  assert.equal(task.time, '09:30');
  assert.equal(task.priority, 1);
  assert.equal(task.projectId, '220');
  assert.equal(task.url, 'https://app.todoist.com/app/task/7001');
});

test('normalizeTask coerces a numeric id to a string', () => {
  assert.equal(normalizeTask(raw({ id: 7001 })).id, '7001');
});

test('normalizeTask leaves time null when the task has no clock time', () => {
  assert.equal(normalizeTask(raw()).time, null);
});

test('normalizeTask rejects a task with no due date', () => {
  assert.equal(normalizeTask(raw({ due: null })), null);
});

test('normalizeTask rejects a task with empty content', () => {
  assert.equal(normalizeTask(raw({ content: '   ' })), null);
});

test('normalizeTask rejects junk without throwing', () => {
  assert.equal(normalizeTask(null), null);
  assert.equal(normalizeTask('nope'), null);
  assert.equal(normalizeTask({}), null);
  assert.equal(normalizeTask(raw({ due: { date: 42 } })), null);
});

test('normalizeTask defaults an unusable priority to 1', () => {
  assert.equal(normalizeTask(raw({ priority: 'high' })).priority, 1);
});

test('normalizeTask tolerates a missing project and url', () => {
  const task = normalizeTask(raw({ project_id: undefined, url: undefined }));
  assert.equal(task.projectId, null);
  assert.equal(task.url, null);
});

test('partitionTasks splits overdue from due today', () => {
  const groups = partitionTasks([
    raw({ id: '1', due: { date: '2026-08-12' } }),
    raw({ id: '2', due: { date: TODAY } }),
  ], TODAY);
  assert.deepEqual(groups.overdue.map(t => t.id), ['1']);
  assert.deepEqual(groups.dueToday.map(t => t.id), ['2']);
});

test('partitionTasks excludes future tasks entirely', () => {
  const groups = partitionTasks([raw({ id: '9', due: { date: '2026-08-20' } })], TODAY);
  assert.deepEqual(groups.overdue, []);
  assert.deepEqual(groups.dueToday, []);
});

test('partitionTasks drops unusable entries and keeps the rest', () => {
  const groups = partitionTasks([null, raw({ id: '2' }), { nope: true }], TODAY);
  assert.deepEqual(groups.dueToday.map(t => t.id), ['2']);
});

test('partitionTasks returns empty groups for a non-array input', () => {
  assert.deepEqual(partitionTasks(undefined, TODAY), { overdue: [], dueToday: [] });
});

test('partitionTasks orders overdue oldest first', () => {
  const groups = partitionTasks([
    raw({ id: 'recent', due: { date: '2026-08-13' } }),
    raw({ id: 'old', due: { date: '2026-08-01' } }),
  ], TODAY);
  assert.deepEqual(groups.overdue.map(t => t.id), ['old', 'recent']);
});

test('sortForMorning orders by time, then by priority descending', () => {
  const tasks = [
    normalizeTask(raw({ id: 'noon', due: { date: TODAY, datetime: `${TODAY}T12:00:00` } })),
    normalizeTask(raw({ id: 'early', due: { date: TODAY, datetime: `${TODAY}T09:00:00` } })),
    normalizeTask(raw({ id: 'untimed-urgent', priority: 4 })),
    normalizeTask(raw({ id: 'untimed-normal', priority: 1 })),
  ];
  assert.deepEqual(
    sortForMorning(tasks).map(t => t.id),
    ['early', 'noon', 'untimed-urgent', 'untimed-normal'],
    'timed tasks come first in clock order; untimed tasks follow, most urgent first'
  );
});

test('sortForMorning does not mutate its input', () => {
  const tasks = [
    normalizeTask(raw({ id: 'b', due: { date: TODAY, datetime: `${TODAY}T12:00:00` } })),
    normalizeTask(raw({ id: 'a', due: { date: TODAY, datetime: `${TODAY}T09:00:00` } })),
  ];
  sortForMorning(tasks);
  assert.deepEqual(tasks.map(t => t.id), ['b', 'a']);
});

test('buildProjectNames maps ids to names from either payload shape', () => {
  const expected = { '220': 'Client matters', '221': 'Personal' };
  const list = [{ id: 220, name: 'Client matters' }, { id: '221', name: 'Personal' }];
  assert.deepEqual(buildProjectNames(list), expected);
  assert.deepEqual(buildProjectNames({ results: list }), expected);
});

test('buildProjectNames skips entries without a usable id or name', () => {
  const names = buildProjectNames([
    { id: '1', name: 'Keep' },
    { id: null, name: 'No id' },
    { id: '2' },
    null,
    'nope',
  ]);
  assert.deepEqual(names, { '1': 'Keep' });
});

test('buildProjectNames returns an empty object for junk input', () => {
  assert.deepEqual(buildProjectNames(undefined), {});
  assert.deepEqual(buildProjectNames({ nope: true }), {});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/todoist.test.js`
Expected: FAIL — `Cannot find module '../todoist'`.

- [ ] **Step 3: Write the module**

Create `todoist.js`:

```js
(function initTodoistTasks(root, factory) {
  const api = factory();
  const isCommonJS = typeof module === 'object' && module.exports;
  if (isCommonJS) {
    module.exports = api;
  } else if (root) {
    root.TodoistTasks = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : null, function createTodoistTasks() {
  // Todoist priority: 4 = urgent, 1 = normal. Untimed tasks sort after timed ones.
  const NO_TIME = '99:99';
  const DEFAULT_PRIORITY = 1;

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeTask(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const id = raw.id == null ? '' : String(raw.id);
    const content = text(raw.content);
    if (!id || !content) return null;

    const due = raw.due && typeof raw.due === 'object' ? raw.due : null;
    const date = due && typeof due.date === 'string' ? due.date.slice(0, 10) : null;
    if (!date) return null;

    const datetime = due && typeof due.datetime === 'string' ? due.datetime : null;
    const priority = Number(raw.priority);

    return {
      id,
      content,
      date,
      time: datetime && datetime.length >= 16 ? datetime.slice(11, 16) : null,
      priority: Number.isFinite(priority) ? priority : DEFAULT_PRIORITY,
      projectId: raw.project_id == null ? null : String(raw.project_id),
      url: typeof raw.url === 'string' ? raw.url : null,
    };
  }

  function sortForMorning(tasks) {
    return (Array.isArray(tasks) ? tasks.slice() : []).sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      const aTime = a.time || NO_TIME;
      const bTime = b.time || NO_TIME;
      if (aTime !== bTime) return aTime < bTime ? -1 : 1;
      return b.priority - a.priority;
    });
  }

  function partitionTasks(tasks, todayISO) {
    const overdue = [];
    const dueToday = [];

    (Array.isArray(tasks) ? tasks : []).forEach(raw => {
      const task = normalizeTask(raw);
      if (!task) return;
      if (task.date < todayISO) overdue.push(task);
      else if (task.date === todayISO) dueToday.push(task);
    });

    return { overdue: sortForMorning(overdue), dueToday: sortForMorning(dueToday) };
  }

  // Tasks reference a project by id; the card shows a name. Accepts a bare
  // array or an object wrapping `results`, and never throws on junk — a
  // missing project name should degrade the label, not fail the card.
  function buildProjectNames(payload) {
    const list = Array.isArray(payload)
      ? payload
      : (payload && Array.isArray(payload.results) ? payload.results : []);

    const names = {};
    list.forEach(project => {
      if (!project || typeof project !== 'object') return;
      if (project.id == null) return;
      const name = text(project.name);
      if (!name) return;
      names[String(project.id)] = name;
    });
    return names;
  }

  return { normalizeTask, partitionTasks, sortForMorning, buildProjectNames };
}));
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/todoist.test.js`
Expected: PASS, 18 tests.

- [ ] **Step 5: Add the module to the syntax check**

In `package.json`, the `check` script gains `node --check todoist.js &&` after the `weather-verdict.js` check.

- [ ] **Step 6: Run the full gate**

Run: `npm run check`
Expected: PASS, 51 tests.

- [ ] **Step 7: Commit**

```bash
git add todoist.js tests/todoist.test.js package.json
git commit -m "Add Todoist task module: normalize, partition and morning order"
```

---

### Task 5: Exclude Todoist from the service worker

This must land **before** the card exists. If the card is built while the service worker still intercepts `api.todoist.com`, the first response gets cached and every later change is masked by a stale copy — the exact failure mode that hit `dashboard.js` in this repo on 2026-08-14.

The test in this task is a harness that loads `sw.js` in a fake worker scope and asserts which strategy each request class gets. The repo has no service worker tests yet; this adds the first, and it locks in both the Todoist bypass and the network-first app shell.

**Files:**
- Modify: `sw.js` (add the bypass, bump `CACHE_NAME`)
- Create: `tests/sw-routing.test.js`
- Modify: `package.json` (add `sw.js` to the `check` script)

**Interfaces:**
- Consumes: nothing
- Produces: the guarantee that `fetch` to `api.todoist.com` reaches the network untouched and is never cached

- [ ] **Step 1: Write the failing test**

Create `tests/sw-routing.test.js`:

```js
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

test('the app shell is served network-first', async () => {
  for (const url of [SCOPE + 'dashboard.js?v=1', SCOPE + 'styles.css', SCOPE + 'index.html']) {
    const result = await route(url, 'navigate');
    assert.equal(result.strategy, 'network-first', `${url} must not be served from cache first`);
  }
});

test('weather-verdict.js and todoist.js are served network-first as app code', async () => {
  for (const file of ['weather-verdict.js', 'todoist.js']) {
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/sw-routing.test.js`
Expected: FAIL on the Todoist case — it currently resolves to `cache-first`, because `api.todoist.com` matches neither the API host list nor the app shell. Two other cases also fail: `weather-verdict.js` and `todoist.js` are not yet in the app shell pattern.

- [ ] **Step 3: Add the bypass**

In `sw.js`, inside the `fetch` listener, immediately after the non-GET guard:

```js
  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Personal data: never intercepted, never cached. Two reasons — a cached copy
  // would serve stale tasks, and task content should not sit in Cache Storage
  // in the clear. See docs/superpowers/specs/2026-08-14-morning-utility-weather-todoist-design.md
  if (url.hostname === 'api.todoist.com') return;
```

- [ ] **Step 4: Add the new modules to the app shell pattern**

Both new files carry code, so they belong in the network-first group:

```js
const APP_SHELL = /(^|\/)(index\.html|dashboard\.js|clz-radar\.js|weather-verdict\.js|todoist\.js|styles\.css)$/;
```

`clz-radar.js` is included for the same reason: it is application code that was previously served cache-first, so a deploy took two loads to reach the browser.

- [ ] **Step 5: Precache the new modules**

In `STATIC_ASSETS`, after `'./dashboard.js'`:

```js
  './clz-radar.js',
  './weather-verdict.js',
  './todoist.js',
```

- [ ] **Step 6: Bump the cache name**

```js
const CACHE_NAME = 'morning-dashboard-v6';
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `node --test tests/sw-routing.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 8: Add sw.js to the syntax check and run the gate**

In `package.json`, add `node --check sw.js &&` to the `check` script.

Run: `npm run check`
Expected: PASS, 56 tests.

- [ ] **Step 9: Commit**

```bash
git add sw.js tests/sw-routing.test.js package.json
git commit -m "Keep Todoist out of the service worker and pin routing with tests"
```

---

### Task 6: Todoist token storage and setup state

The card appears in the freed grid slot and asks for a token. No network calls yet, so this task is verifiable on its own: with no token stored the setup state shows, and after saving, the token is in `localStorage` and never visible in the DOM.

**Files:**
- Modify: `index.html` (add the card where rates used to be, add the script tag)
- Modify: `dashboard.js` (`STORAGE`, setup render, save handler, `bindEvents`)
- Modify: `styles.css` (token form and task list rules)

**Interfaces:**
- Consumes: nothing from Task 4 yet
- Produces:
  - `STORAGE.todoistToken` → `'morning_dashboard_todoist_token'`
  - `readTodoistToken()` → `string` (empty string when unset)
  - `renderTodoistSetup(message)` → void, `message` optional and already plain text
  - `saveTodoistToken()` → void, called from the `save-todoist` action

- [ ] **Step 1: Add the card markup**

In `index.html`, in the position the rates card occupied (after the Clocks card, before Quote):

```html
  <!-- Todoist -->
  <div class="card" id="todoist-card">
    <div class="card-title">Tareas</div>
    <div class="placeholder">Cargando tareas&hellip;</div>
  </div>
```

- [ ] **Step 2: Load the module**

In `index.html`, next to the other module script tags:

```html
<script src="./todoist.js?v=20260814-todoist"></script>
```

- [ ] **Step 3: Add the storage key**

In `dashboard.js`, the `STORAGE` object gains a key:

```js
const STORAGE = {
  accent: 'morning_dashboard_accent_color',
  clocks: 'morning_dashboard_clocks',
  weather: 'morning_dashboard_weather',
  clzRadarHistory: 'morning_dashboard_clz_radar_history',
  todoistToken: 'morning_dashboard_todoist_token',
};
```

- [ ] **Step 4: Add the token helpers and the setup render**

In `dashboard.js`, add a new section immediately before `// ── Main refresh ──`:

```js
// ── Todoist ───────────────────────────────────────────────────────────────────
const TODOIST_API = 'https://api.todoist.com/api/v1/tasks';
const TODOIST_TOKEN_HELP = 'https://app.todoist.com/app/settings/integrations/developer';

function readTodoistToken() {
  try {
    return (localStorage.getItem(STORAGE.todoistToken) || '').trim();
  } catch (e) {
    console.error('Todoist token unreadable:', e);
    return '';
  }
}

// The token is written once and never rendered back into the page.
function saveTodoistToken() {
  const input = byId('todoist-token-input');
  if (!input) return;
  const token = input.value.trim();
  if (!token) {
    renderTodoistSetup('Pega un token primero.');
    return;
  }
  try {
    localStorage.setItem(STORAGE.todoistToken, token);
  } catch (e) {
    console.error('Todoist token not persisted:', e);
    renderTodoistSetup('No se pudo guardar el token en este navegador.');
    return;
  }
  input.value = '';
  loadTodoistTasks();
}

function renderTodoistSetup(message = '') {
  const note = message
    ? `<div class="err">${escapeHtml(message)}</div>`
    : '';

  byId('todoist-card').innerHTML = `
    <div class="card-title">Tareas &mdash; Falta configurar</div>
    <div class="todoist-setup">
      <div class="todoist-setup-text">
        Pega un token de la API de Todoist para ver las tareas de hoy y las
        vencidas. Se guarda solo en este navegador y se usa solo para leer.
      </div>
      ${note}
      <div class="todoist-token-row">
        <input type="password" id="todoist-token-input" class="todoist-token-input"
               placeholder="Token de la API de Todoist" autocomplete="off" spellcheck="false"
               aria-label="Token de la API de Todoist">
        <button type="button" class="record-link" data-action="save-todoist">Guardar</button>
      </div>
      <a class="record-link secondary" href="${TODOIST_TOKEN_HELP}" target="_blank" rel="noopener">Consigue un token &#8599;</a>
    </div>`;
}
```

- [ ] **Step 5: Add a temporary loader so the save button has somewhere to go**

Task 7 replaces this with the real fetch. It exists now only so this task is independently runnable:

```js
function loadTodoistTasks() {
  if (!readTodoistToken()) { renderTodoistSetup(); return; }
  byId('todoist-card').innerHTML =
    `<div class="card-title">Tareas</div>
     <div class="placeholder">Token guardado. La carga de tareas llega en el paso siguiente.</div>`;
}
```

- [ ] **Step 6: Wire the action and the initial render**

In `bindEvents()`, next to the other actions:

```js
    if (action === 'save-todoist') saveTodoistToken();
```

In `refresh()`, add `loadTodoistTasks();` immediately after `renderQuote();`.

- [ ] **Step 7: Style the setup form**

In `styles.css`, after the `.w-verdict` rules:

```css
    .todoist-setup      { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
    .todoist-setup-text { font-size: 0.8rem; color: var(--muted); line-height: 1.45; }
    .todoist-token-row  { display: flex; gap: 8px; }
    .todoist-token-input {
      flex: 1;
      min-width: 0;
      padding: 7px 9px;
      font-size: 0.8rem;
      color: var(--text);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
    }
    .todoist-token-input:focus { outline: none; border-color: var(--accent); }
```

- [ ] **Step 8: Verify the gate**

Run: `npm run check`
Expected: PASS, 56 tests.

- [ ] **Step 9: Verify in the browser**

Run `npm run dev` and reload twice. Then:
- With no token stored, the card shows the setup state in the third top-row slot.
- Clicking Guardar with an empty field shows "Pega un token primero."
- Saving any non-empty string shows the placeholder message from Step 5.
- In DevTools → Application → Local Storage, `morning_dashboard_todoist_token` holds the value.
- Search the rendered DOM for the token string: it must not appear anywhere.
- Clear the key and reload: the setup state returns.

- [ ] **Step 10: Commit**

```bash
git add index.html dashboard.js styles.css
git commit -m "Add Todoist card with browser-only token setup state"
```

---

### Task 7: Fetch and render Todoist tasks

**Files:**
- Modify: `dashboard.js` (replace `loadTodoistTasks`, add `fetchTodoistTasks` and `renderTodoistCard`)
- Modify: `styles.css` (task list rules)

**Interfaces:**
- Consumes: `TodoistTasks.partitionTasks` from Task 4; `readTodoistToken`, `renderTodoistSetup` from Task 6
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Add the fetch layer**

In `dashboard.js`, in the Todoist section, above `loadTodoistTasks`:

```js
// Read-only. Never issues POST, PUT or DELETE.
async function fetchTodoistTasks(token) {
  const response = await fetch(TODOIST_API, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) throw new Error('TOKEN_INVALID');
  if (response.status === 403) throw new Error('TOKEN_FORBIDDEN');
  if (response.status === 429) throw new Error('RATE_LIMITED');
  if (!response.ok) throw new Error(`Todoist API error: HTTP ${response.status}`);

  const payload = await response.json();
  // The v1 endpoint may return a bare array or wrap it; accept either.
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  throw new Error('UNEXPECTED_SHAPE');
}

// Project names are a label, never a reason to fail: any error yields {}.
async function fetchTodoistProjectNames(token) {
  try {
    const response = await fetch(TODOIST_PROJECTS_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return {};
    return TodoistTasks.buildProjectNames(await response.json());
  } catch (e) {
    console.error('Todoist project names unavailable:', e);
    return {};
  }
}
```

The projects constant goes next to `TODOIST_API` in the Todoist section from Task 6:

```js
const TODOIST_PROJECTS_API = 'https://api.todoist.com/api/v1/projects';
```

- [ ] **Step 2: Add the local date helper**

`todayISO` must be the user's local date, not UTC, or tasks flip a day either side of midnight:

```js
function localTodayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

- [ ] **Step 3: Add the render**

```js
function todoistTaskHtml(task, overdue, projectNames) {
  const urgent = task.priority >= 3 ? ' urgent' : '';
  const meta = [];

  const project = task.projectId ? projectNames[task.projectId] : null;
  if (project) meta.push(project);

  if (overdue) meta.push(`vencía ${task.date}`);
  else if (task.time) meta.push(task.time);

  const link = task.url
    ? `<a class="todoist-content" href="${safeUrl(task.url)}" target="_blank" rel="noopener">${escapeHtml(task.content)}</a>`
    : `<span class="todoist-content">${escapeHtml(task.content)}</span>`;

  return `<li class="todoist-task${urgent}">
    ${link}
    ${meta.length ? `<span class="todoist-meta">${escapeHtml(meta.join(' · '))}</span>` : ''}
  </li>`;
}

function renderTodoistCard(groups, projectNames = {}) {
  const total = groups.overdue.length + groups.dueToday.length;

  if (!total) {
    byId('todoist-card').innerHTML = `
      <div class="card-title">Tareas</div>
      <div class="todoist-empty">Nada para hoy.</div>`;
    return;
  }

  // Spec wording: "Tareas — 2 atrasadas · 5 para hoy". Singular when there is one.
  const summary = [];
  if (groups.overdue.length) {
    summary.push(`${groups.overdue.length} ${groups.overdue.length === 1 ? 'atrasada' : 'atrasadas'}`);
  }
  if (groups.dueToday.length) summary.push(`${groups.dueToday.length} para hoy`);

  const items = groups.overdue.map(t => todoistTaskHtml(t, true, projectNames))
    .concat(groups.dueToday.map(t => todoistTaskHtml(t, false, projectNames)))
    .join('');

  byId('todoist-card').innerHTML = `
    <div class="card-title">Tareas &mdash; ${escapeHtml(summary.join(' · '))}</div>
    <ul class="todoist-list">${items}</ul>`;
}
```

- [ ] **Step 4: Replace the temporary loader**

Delete the placeholder `loadTodoistTasks` from Task 6 Step 5 and put this in its place:

```js
async function loadTodoistTasks() {
  const token = readTodoistToken();
  if (!token) { renderTodoistSetup(); return; }

  const MESSAGES = {
    TOKEN_INVALID: 'Todoist ha rechazado el token. Puede estar revocado — pega uno nuevo.',
    TOKEN_FORBIDDEN: 'Ese token no tiene permiso para leer tareas.',
    RATE_LIMITED: 'Todoist está limitando las peticiones. Prueba de nuevo en unos minutos.',
    UNEXPECTED_SHAPE: 'Todoist ha devuelto una respuesta que este dashboard no reconoce.',
  };

  try {
    // Tasks decide success; names only decorate, so a failed lookup yields {}.
    const [raw, projectNames] = await Promise.all([
      fetchTodoistTasks(token),
      fetchTodoistProjectNames(token),
    ]);
    renderTodoistCard(TodoistTasks.partitionTasks(raw, localTodayISO()), projectNames);
  } catch (e) {
    console.error('Todoist load failed:', e);
    if (e.message === 'TOKEN_INVALID' || e.message === 'TOKEN_FORBIDDEN') {
      // Keep the stored token: the user decides whether to replace it.
      renderTodoistSetup(MESSAGES[e.message]);
      return;
    }
    setCardMessage('todoist-card', 'Tareas', MESSAGES[e.message] || 'No se pudieron cargar las tareas.');
  }
}
```

- [ ] **Step 5: Style the list**

In `styles.css`, after the token form rules:

```css
    .todoist-list  { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
    .todoist-task  {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
      padding-left: 9px;
      border-left: 2px solid var(--border);
    }
    .todoist-task.urgent  { border-left-color: var(--red); }
    .todoist-content      { font-size: 0.84rem; color: var(--text); text-decoration: none; }
    a.todoist-content:hover { color: var(--accent); }
    .todoist-meta         { font-size: 0.72rem; color: var(--muted); white-space: nowrap; }
    .todoist-empty        { font-size: 0.84rem; color: var(--green); padding: 12px 0; }
```

- [ ] **Step 6: Verify the gate**

Run: `npm run check`
Expected: PASS, 56 tests.

- [ ] **Step 7: Confirm the response shape against the real API**

This is the one part of the design that was not verified up front. With a real token:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.todoist.com/api/v1/tasks" | head -c 600
```

Check three things and adjust only `fetchTodoistTasks` and `TodoistTasks.normalizeTask` if reality differs:
- whether the body is a bare array or an object wrapping `results`;
- the field names for due date, priority, project and url;
- whether a `next_cursor` or similar pagination field is present. If it is, and the account has enough tasks to paginate, note it and stop — pagination is a follow-up, not a silent truncation.

If `normalizeTask` needs changing, update `tests/todoist.test.js` first, watch it fail, then fix the module.

- [ ] **Step 8: Verify in the browser**

Reload twice, then check:
- Tasks appear with overdue first, then today's in clock order.
- Each task shows its project name, not a numeric id. Block the `/projects`
  request in DevTools and reload: tasks must still render, just without names.
- A task with priority 3 or 4 shows the red left border.
- DevTools → Network: the request to `api.todoist.com` is **not** served from the service worker (no "(ServiceWorker)" in the Size column).
- DevTools → Application → Cache Storage: **no** entry for `api.todoist.com` under any cache.
- Corrupt the stored token and reload: the setup state returns with the rejection message, and the stored value is still there.
- With every task completed in Todoist, the card shows "Nada pendiente para hoy."

- [ ] **Step 9: Commit**

```bash
git add dashboard.js styles.css
git commit -m "Load and render today's and overdue Todoist tasks"
```

---

## Verification After All Tasks

- [ ] `npm run check` passes (59 tests).
- [ ] The top row is Weather, World Clocks, Tasks, Inspiration — no gap, no Exchange Rates.
- [ ] No new cards and no new grid rows: the top band is still four cards in the existing two-column grid (two rows), with Todoist occupying the slot Exchange Rates vacated.
- [ ] `grep -rn "frankfurter\|rates-card" .` returns nothing outside `docs/`.
- [ ] `grep -rn "rest/v2" .` returns nothing: the retired Todoist API is not referenced.
- [ ] `grep -rn "method: *'POST'\|method: *'PUT'\|method: *'DELETE'" dashboard.js` returns nothing for Todoist.
- [ ] The Todoist token appears only in Local Storage — not in Cache Storage, not in the DOM, not in any committed file.
- [ ] Offline (DevTools → Network → Offline): weather, clocks and music still render from cache; the Tasks card reports a load failure rather than showing stale tasks.
